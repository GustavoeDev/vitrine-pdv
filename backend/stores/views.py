from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from stores.models import Category, Store, StoreStatus
from stores.permissions import IsStaffUser
from stores.serializers import (
    AdminStoreDetailSerializer,
    AdminStoreListSerializer,
    CategoryDetailSerializer,
    CategorySerializer,
    CreateStoreSerializer,
    RejectStoreSerializer,
    StoreDetailSerializer,
)
from stores.services.store_registration import register_store
from stores.services.store_review import approve_store, reject_store


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


def _admin_store_queryset():
    return (
        Store.objects.select_related("category", "address", "user")
        .prefetch_related("business_hours")
        .order_by("-created_at")
    )


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


class AdminStoreApproveView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request: Request, pk) -> Response:
        store = get_object_or_404(_admin_store_queryset(), pk=pk)
        store = approve_store(store=store, reviewer=request.user)
        return Response(AdminStoreDetailSerializer(store).data)


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
