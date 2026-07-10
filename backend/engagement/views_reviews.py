from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from engagement.models import Review
from engagement.serializers import (
    CreateStoreReviewSerializer,
    StoreReviewSerializer,
    UpdateStoreReviewSerializer,
)
from engagement.services.reviews import create_store_review, update_store_review
from stores.models import Store, StoreStatus


def _active_store_or_404(*, store_id):
    return get_object_or_404(
        Store.objects.filter(status=StoreStatus.ACTIVE),
        pk=store_id,
    )


@extend_schema_view(
    get=extend_schema(responses=StoreReviewSerializer(many=True), tags=['Engajamento']),
    post=extend_schema(
        request=CreateStoreReviewSerializer,
        responses=StoreReviewSerializer,
        tags=['Engajamento'],
    ),
)
class StoreReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, store_id):
        store = _active_store_or_404(store_id=store_id)
        reviews = (
            Review.objects.filter(store=store)
            .select_related("user")
            .order_by("-created_at")
        )
        serializer = StoreReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, store_id):
        store = _active_store_or_404(store_id=store_id)
        serializer = CreateStoreReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review = create_store_review(
            user=request.user,
            store=store,
            rating=serializer.validated_data["rating"],
            comment=serializer.validated_data.get("comment", ""),
        )
        review = Review.objects.select_related("user").get(pk=review.pk)
        return Response(
            StoreReviewSerializer(review).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    get=extend_schema(responses=StoreReviewSerializer, tags=['Engajamento']),
    patch=extend_schema(
        request=UpdateStoreReviewSerializer,
        responses=StoreReviewSerializer,
        tags=['Engajamento'],
    ),
)
class StoreReviewMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, store_id):
        store = _active_store_or_404(store_id=store_id)
        review = Review.objects.filter(user=request.user, store=store).select_related("user").first()

        if review is None:
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(StoreReviewSerializer(review).data)

    def patch(self, request, store_id):
        store = _active_store_or_404(store_id=store_id)
        serializer = UpdateStoreReviewSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        review = Review.objects.filter(user=request.user, store=store).first()
        if review is None:
            return Response(
                {"detail": "Você ainda não avaliou esta loja."},
                status=status.HTTP_404_NOT_FOUND,
            )

        review = update_store_review(
            user=request.user,
            store=store,
            rating=serializer.validated_data.get("rating", review.rating),
            comment=serializer.validated_data.get("comment", review.comment),
        )
        review = Review.objects.select_related("user").get(pk=review.pk)
        return Response(StoreReviewSerializer(review).data)
