from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from stores.models import Address, Category, Store, StoreStatus
from stores.permissions import IsStaffUser, IsStoreOwner
from stores.serializers import (
    AdminStoreDetailSerializer,
    AdminStoreListSerializer,
    CategoryDetailSerializer,
    CategorySerializer,
    CreateStoreSerializer,
    GeocodeQuerySerializer,
    PublicStoreListSerializer,
    RejectStoreSerializer,
    SearchResultSerializer,
    StoreDetailSerializer,
    UpdateMerchantStoreSerializer,
)
from stores.services.geocoding import geocode_address
from stores.services.merchant_stats import RANGE_DAYS, get_merchant_stats
from stores.services.merchant_store import update_merchant_store
from stores.services.store_access import get_user_store
from stores.services.store_registration import register_store
from stores.services.store_review import (
    activate_store,
    approve_store,
    deactivate_store,
    reject_store,
)
from stores.serializers_merchant_stats import MerchantStatsSerializer


class CategoryQuerySetMixin:
    def get_queryset(self):
        return Category.objects.filter(parent__isnull=True).prefetch_related("children")


class CategoryListView(CategoryQuerySetMixin, ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None


class CategoryDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategoryDetailSerializer
    queryset = Category.objects.select_related("parent").prefetch_related("children")


@extend_schema(request=CreateStoreSerializer, responses=StoreDetailSerializer, tags=['Lojas'])
class StoreCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = CreateStoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        store = register_store(
            user=request.user,
            validated_data=serializer.validated_data,
        )
        store = (
            Store.objects.select_related("category", "address")
            .prefetch_related("business_hours")
            .get(pk=store.pk)
        )

        return Response(
            StoreDetailSerializer(store).data,
            status=status.HTTP_201_CREATED,
        )


def _merchant_store_queryset():
    return (
        Store.objects.select_related("category", "address", "user")
        .prefetch_related("business_hours")
    )


@extend_schema_view(
    get=extend_schema(responses=StoreDetailSerializer, tags=['Lojas']),
    patch=extend_schema(
        request=UpdateMerchantStoreSerializer,
        responses=StoreDetailSerializer,
        tags=['Lojas'],
    ),
)
class MerchantStoreDetailView(APIView):
    permission_classes = [IsStoreOwner]

    def get(self, request: Request, pk) -> Response:
        store = get_object_or_404(
            _merchant_store_queryset().filter(user=request.user),
            pk=pk,
        )
        return Response(StoreDetailSerializer(store).data)

    def patch(self, request: Request, pk) -> Response:
        store = get_object_or_404(
            _merchant_store_queryset().filter(user=request.user),
            pk=pk,
        )
        serializer = UpdateMerchantStoreSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        store = update_merchant_store(
            store=store,
            validated_data=serializer.validated_data,
        )
        store = _merchant_store_queryset().get(pk=store.pk)
        return Response(StoreDetailSerializer(store).data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='range', type=str, location=OpenApiParameter.QUERY, description='7d, 30d ou 3m'),
        OpenApiParameter(name='store_id', type=str, location=OpenApiParameter.QUERY),
    ],
    responses=MerchantStatsSerializer,
    tags=['Lojas'],
)
class MerchantStatsView(APIView):
    permission_classes = [IsStoreOwner]

    def get(self, request: Request) -> Response:
        range_key = request.query_params.get("range", "30d")
        if range_key not in RANGE_DAYS:
            return Response(
                {"range": "Período inválido. Use 7d, 30d ou 3m."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        store = get_user_store(user=request.user, store_id=request.query_params.get("store_id"))
        stats = get_merchant_stats(store=store, range_key=range_key)
        serializer = MerchantStatsSerializer(stats)
        return Response(serializer.data)


def _admin_store_queryset():
    return (
        Store.objects.select_related("category", "address", "user")
        .prefetch_related("business_hours")
        .order_by("-created_at")
    )


@extend_schema(tags=['Administração'])
class AdminStoreSummaryView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request: Request) -> Response:
        return Response(
            {
                "pending": Store.objects.filter(status=StoreStatus.PENDING).count(),
                "active": Store.objects.filter(status=StoreStatus.ACTIVE).count(),
                "inactive": Store.objects.filter(status=StoreStatus.INACTIVE).count(),
                "rejected": Store.objects.filter(status=StoreStatus.REJECTED).count(),
            }
        )


class AdminStoreListView(ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminStoreListSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Store.objects.select_related("category", "address").order_by(
            "-created_at"
        )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        return queryset


class AdminStoreDetailView(RetrieveAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminStoreDetailSerializer
    queryset = _admin_store_queryset()


@extend_schema(responses=AdminStoreDetailSerializer, tags=['Administração'])
class AdminStoreApproveView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request: Request, pk) -> Response:
        store = get_object_or_404(_admin_store_queryset(), pk=pk)
        store = approve_store(store=store, reviewer=request.user)
        return Response(AdminStoreDetailSerializer(store).data)


@extend_schema(responses=AdminStoreDetailSerializer, tags=['Administração'])
class AdminStoreDeactivateView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request: Request, pk) -> Response:
        store = get_object_or_404(_admin_store_queryset(), pk=pk)
        store = deactivate_store(store=store, reviewer=request.user)
        return Response(AdminStoreDetailSerializer(store).data)


@extend_schema(responses=AdminStoreDetailSerializer, tags=['Administração'])
class AdminStoreActivateView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request: Request, pk) -> Response:
        store = get_object_or_404(_admin_store_queryset(), pk=pk)
        store = activate_store(store=store, reviewer=request.user)
        return Response(AdminStoreDetailSerializer(store).data)


def _public_store_queryset():
    from django.db.models import Avg, Count

    return (
        Store.objects.filter(status=StoreStatus.ACTIVE)
        .select_related("category", "address")
        .prefetch_related("business_hours")
        .annotate(
            average_rating=Avg("reviews__rating"),
            reviews_count=Count("reviews", distinct=True),
        )
        .order_by("-created_at")
    )


class PublicStoreListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicStoreListSerializer
    pagination_class = None

    def get_serializer_context(self):
        context = super().get_serializer_context()
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")

        if lat and lng:
            try:
                context["user_coords"] = (float(lat), float(lng))
            except ValueError:
                pass

        return context

    def get_queryset(self):
        queryset = _public_store_queryset()
        category_id = self.request.query_params.get("category_id")
        subcategory = self.request.query_params.get("subcategory")
        with_location = self.request.query_params.get("with_location")

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if subcategory:
            queryset = queryset.filter(subcategory__icontains=subcategory)

        if with_location in {"1", "true", "True"}:
            queryset = queryset.filter(
                address__latitude__isnull=False,
                address__longitude__isnull=False,
            )

        return queryset

    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = list(self.get_queryset())
        user_coords = self.get_serializer_context().get("user_coords")

        if user_coords:
            from stores.services.distance import haversine_km

            user_lat, user_lng = user_coords

            def sort_key(store: Store) -> float:
                latitude = store.address.latitude
                longitude = store.address.longitude
                if latitude is None or longitude is None:
                    return float("inf")
                return haversine_km(user_lat, user_lng, float(latitude), float(longitude))

            queryset.sort(key=sort_key)

        limit = request.query_params.get("limit")
        if limit:
            try:
                queryset = queryset[: int(limit)]
            except ValueError:
                pass

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PublicStoreDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = StoreDetailSerializer
    queryset = _public_store_queryset()


@extend_schema(
    parameters=[
        OpenApiParameter(name='q', type=str, location=OpenApiParameter.QUERY, description='Termo de busca'),
    ],
    responses=SearchResultSerializer(many=True),
    tags=['Lojas'],
)
class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        query = request.query_params.get("q", "").strip()

        if len(query) < 2:
            return Response([])

        stores = (
            Store.objects.filter(status=StoreStatus.ACTIVE, name__icontains=query)
            .select_related("category")
            .order_by("name")[:10]
        )
        products = (
            Product.objects.filter(is_active=True, name__icontains=query)
            .select_related("store", "store__category")
            .filter(store__status=StoreStatus.ACTIVE)
            .order_by("name")[:10]
        )

        results = []

        for store in stores:
            results.append(
                {
                    "id": store.id,
                    "type": "store",
                    "title": store.name,
                    "subtitle": store.subcategory or store.category.name,
                    "store_id": store.id,
                }
            )

        for product in products:
            results.append(
                {
                    "id": product.id,
                    "type": "product",
                    "title": product.name,
                    "subtitle": product.store.name,
                    "store_id": product.store_id,
                }
            )

        serializer = SearchResultSerializer(results, many=True)
        return Response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(name='street', type=str, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='number', type=str, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='neighborhood', type=str, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='city', type=str, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='state', type=str, location=OpenApiParameter.QUERY),
        OpenApiParameter(name='postal_code', type=str, location=OpenApiParameter.QUERY),
    ],
    tags=['Lojas'],
)
class GeocodeAddressView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        serializer = GeocodeQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        address = Address(**serializer.validated_data)
        coordinates = geocode_address(address)

        if not coordinates:
            return Response(
                {"detail": "Não foi possível localizar este endereço no mapa."},
                status=status.HTTP_404_NOT_FOUND,
            )

        latitude, longitude = coordinates
        return Response(
            {
                "latitude": latitude,
                "longitude": longitude,
            }
        )


@extend_schema(
    request=RejectStoreSerializer,
    responses=AdminStoreDetailSerializer,
    tags=['Administração'],
)
class AdminStoreRejectView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request: Request, pk) -> Response:
        store = get_object_or_404(_admin_store_queryset(), pk=pk)
        serializer = RejectStoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        store = reject_store(
            store=store,
            reviewer=request.user,
            rejection_reason=serializer.validated_data["rejection_reason"],
        )
        return Response(AdminStoreDetailSerializer(store).data)
