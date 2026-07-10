from django.db.models import Count, Prefetch
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from catalog.serializers import (
    CreateMerchantProductSerializer,
    MerchantProductSerializer,
    ProductDetailSerializer,
    ProductSummarySerializer,
    UpdateMerchantProductSerializer,
)
from catalog.services.merchant_products import (
    create_merchant_product,
    delete_merchant_product,
    update_merchant_product,
)
from catalog.services.product_views import record_product_view
from marketing.models import ProductDiscount
from stores.models import StoreStatus
from stores.permissions import IsStoreOwner
from stores.services.store_access import get_user_store


def _public_product_queryset():
    active_discounts = ProductDiscount.objects.filter(is_active=True).order_by("-start_date")

    return Product.objects.prefetch_related(
        Prefetch("discounts", queryset=active_discounts, to_attr="active_discounts"),
    )


class ProductDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer

    def get_queryset(self):
        return (
            _public_product_queryset()
            .filter(
                is_active=True,
                store__status=StoreStatus.ACTIVE,
            )
            .select_related(
                "store",
                "store__category",
            )
        )


class StoreProductListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSummarySerializer
    pagination_class = None

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Product.objects.none()

        return (
            _public_product_queryset()
            .filter(
                is_active=True,
                store_id=self.kwargs["store_id"],
                store__status=StoreStatus.ACTIVE,
            )
            .select_related("store")
            .order_by("name")
        )


@extend_schema(responses={201: None}, tags=['Catálogo'])
class ProductViewCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        record_product_view(product_id=pk)
        return Response(status=status.HTTP_201_CREATED)


def _merchant_product_queryset():
    active_discounts = ProductDiscount.objects.filter(is_active=True).order_by("-start_date")

    return (
        Product.objects.select_related("store")
        .annotate(view_count=Count("views"))
        .prefetch_related(
            Prefetch("discounts", queryset=active_discounts, to_attr="active_discounts"),
        )
        .order_by("-created_at")
    )


@extend_schema_view(
    get=extend_schema(responses=MerchantProductSerializer(many=True), tags=['Catálogo']),
    post=extend_schema(
        request=CreateMerchantProductSerializer,
        responses=MerchantProductSerializer,
        tags=['Catálogo'],
    ),
)
class MerchantProductListCreateView(APIView):
    permission_classes = [IsStoreOwner]

    def get(self, request):
        store = get_user_store(user=request.user, store_id=request.query_params.get("store_id"))
        products = _merchant_product_queryset().filter(store=store)
        serializer = MerchantProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        store = get_user_store(user=request.user, store_id=request.data.get("store_id"))
        serializer = CreateMerchantProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = create_merchant_product(
            store=store,
            validated_data=serializer.validated_data,
        )
        product = _merchant_product_queryset().get(pk=product.pk)
        return Response(
            MerchantProductSerializer(product).data,
            status=status.HTTP_201_CREATED,
        )


class MerchantProductDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    serializer_class = MerchantProductSerializer
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        return _merchant_product_queryset().filter(store__user=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UpdateMerchantProductSerializer
        return MerchantProductSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        product = self.get_object()
        serializer = UpdateMerchantProductSerializer(
            product,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        product = update_merchant_product(
            product=product,
            validated_data=serializer.validated_data,
        )
        product = _merchant_product_queryset().get(pk=product.pk)
        return Response(MerchantProductSerializer(product).data)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        delete_merchant_product(product=product)
        return Response(status=status.HTTP_204_NO_CONTENT)
