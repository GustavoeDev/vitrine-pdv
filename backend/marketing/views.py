from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from marketing.models import ProductDiscount, Promotion
from marketing.serializers import (
    ConsumerPromotionSerializer,
    CreateDailyPromotionSerializer,
    CreateProductDiscountPromotionSerializer,
    MerchantPromotionSerializer,
    PromotionDetailSerializer,
    UpdateDailyPromotionSerializer,
    UpdateProductDiscountPromotionSerializer,
    UpdatePromotionStatusSerializer,
    serialize_daily_promotion,
    serialize_merchant_daily_promotion,
    serialize_merchant_product_discount,
    serialize_product_discount,
    serialize_product_discount_detail,
    serialize_promotion_detail,
)
from marketing.services.merchant_promotions import (
    create_daily_promotion,
    create_product_discount_promotion,
    update_daily_promotion,
    update_daily_promotion_status,
    update_product_discount_promotion,
    update_product_discount_status,
)
from marketing.services.promotion_queries import (
    active_product_discounts_queryset,
    get_favorite_product_promotions,
    get_featured_promotion,
)
from stores.models import Store
from stores.permissions import IsStoreOwner
from stores.services.store_access import get_user_store


class FeaturedPromotionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        promotion = get_featured_promotion()

        if promotion is None:
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = ConsumerPromotionSerializer(serialize_daily_promotion(promotion))
        return Response(serializer.data)


class FavoritePromotionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        discounts = get_favorite_product_promotions(user=request.user)
        payload = [serialize_product_discount(discount) for discount in discounts]
        serializer = ConsumerPromotionSerializer(payload, many=True)
        return Response(serializer.data)


class PromotionDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        promotion = Promotion.objects.select_related("store", "store__category").filter(pk=pk).first()

        if promotion is not None:
            serializer = PromotionDetailSerializer(serialize_promotion_detail(promotion))
            return Response(serializer.data)

        discount = (
            active_product_discounts_queryset()
            .filter(pk=pk)
            .first()
        )

        if discount is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = PromotionDetailSerializer(serialize_product_discount_detail(discount))
        return Response(serializer.data)


class StoreActivePromotionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, store_id):
        from marketing.models import PromotionStatus
        from django.utils import timezone

        now = timezone.now()
        daily = Promotion.objects.filter(
            store_id=store_id,
            status=PromotionStatus.ACTIVE,
            start_date__lte=now,
            end_date__gte=now,
        ).select_related("store", "store__category")

        discounts = active_product_discounts_queryset().filter(product__store_id=store_id)

        payload = [serialize_daily_promotion(item) for item in daily]
        payload.extend(serialize_product_discount(item) for item in discounts)

        serializer = ConsumerPromotionSerializer(payload, many=True)
        return Response(serializer.data)


class MerchantPromotionListCreateView(APIView):
    permission_classes = [IsStoreOwner]

    def get(self, request):
        store = get_user_store(user=request.user, store_id=request.query_params.get("store_id"))

        daily_promotions = store.promotions.order_by("-start_date")
        product_discounts = (
            ProductDiscount.objects.filter(product__store=store)
            .select_related("product")
            .order_by("-start_date")
        )

        payload = [serialize_merchant_daily_promotion(item) for item in daily_promotions]
        payload.extend(serialize_merchant_product_discount(item) for item in product_discounts)
        payload.sort(key=lambda item: item["start_date"], reverse=True)

        serializer = MerchantPromotionSerializer(payload, many=True)
        return Response(serializer.data)

    def post(self, request):
        promotion_type = request.data.get("promotion_type")
        store = get_user_store(user=request.user, store_id=request.data.get("store_id"))

        if promotion_type == "daily":
            serializer = CreateDailyPromotionSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data.copy()
            payload.pop("promotion_type", None)
            payload.pop("store_id", None)
            promotion = create_daily_promotion(store=store, validated_data=payload)
            return Response(
                MerchantPromotionSerializer(serialize_merchant_daily_promotion(promotion)).data,
                status=status.HTTP_201_CREATED,
            )

        if promotion_type == "product-discount":
            serializer = CreateProductDiscountPromotionSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data.copy()
            payload.pop("promotion_type", None)
            payload.pop("store_id", None)
            discount = create_product_discount_promotion(
                store=store,
                validated_data=payload,
            )
            return Response(
                MerchantPromotionSerializer(serialize_merchant_product_discount(discount)).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"promotion_type": "Tipo de promoção inválido."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class MerchantPromotionDetailView(APIView):
    permission_classes = [IsStoreOwner]

    def patch(self, request, pk):
        promotion_type = request.data.get("promotion_type")

        if promotion_type == "daily":
            promotion = get_object_or_404(
                Promotion.objects.filter(store__user=request.user),
                pk=pk,
            )
            serializer = UpdateDailyPromotionSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data.copy()
            payload.pop("promotion_type", None)
            promotion = update_daily_promotion(promotion=promotion, validated_data=payload)
            return Response(MerchantPromotionSerializer(serialize_merchant_daily_promotion(promotion)).data)

        if promotion_type == "product-discount":
            discount = get_object_or_404(
                ProductDiscount.objects.filter(product__store__user=request.user).select_related("product"),
                pk=pk,
            )
            serializer = UpdateProductDiscountPromotionSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            payload = serializer.validated_data.copy()
            payload.pop("promotion_type", None)
            discount = update_product_discount_promotion(discount=discount, validated_data=payload)
            return Response(MerchantPromotionSerializer(serialize_merchant_product_discount(discount)).data)

        return Response(
            {"promotion_type": "Tipo de promoção inválido."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class MerchantPromotionStatusView(APIView):
    permission_classes = [IsStoreOwner]

    def patch(self, request, pk):
        serializer = UpdatePromotionStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        if validated["promotion_type"] == "daily":
            promotion = get_object_or_404(
                Promotion.objects.filter(store__user=request.user),
                pk=pk,
            )
            promotion = update_daily_promotion_status(
                promotion=promotion,
                status=validated["status"],
            )
            return Response(MerchantPromotionSerializer(serialize_merchant_daily_promotion(promotion)).data)

        discount = get_object_or_404(
            ProductDiscount.objects.filter(product__store__user=request.user),
            pk=pk,
        )
        discount = update_product_discount_status(
            discount=discount,
            status=validated["status"],
        )
        return Response(MerchantPromotionSerializer(serialize_merchant_product_discount(discount)).data)
