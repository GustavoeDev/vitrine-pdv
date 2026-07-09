from django.utils import timezone as django_timezone
from rest_framework import serializers

from marketing.models import ProductDiscount, Promotion


def format_date_pt_br(value) -> str:
    return django_timezone.localtime(value).strftime("%d/%m/%Y")


class ConsumerPromotionSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    promotion_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    image_url = serializers.CharField(allow_null=True)
    store_id = serializers.UUIDField()
    store_name = serializers.CharField()
    store_subtitle = serializers.CharField()
    store_avatar_url = serializers.CharField(allow_null=True)
    valid_until = serializers.CharField()
    product_id = serializers.UUIDField(allow_null=True, required=False)
    original_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        required=False,
    )
    discounted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        required=False,
    )


class PromotionDetailSerializer(ConsumerPromotionSerializer):
    phone_number = serializers.CharField(allow_blank=True, required=False)


class MerchantPromotionSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    promotion_type = serializers.CharField()
    store_id = serializers.UUIDField()
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    banner_url = serializers.CharField(allow_null=True)
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    notify_favorites = serializers.BooleanField()
    status = serializers.CharField()
    product_id = serializers.UUIDField(allow_null=True, required=False)
    original_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        required=False,
    )
    discounted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        required=False,
    )
    badge_text = serializers.CharField(allow_null=True, required=False)


class CreateDailyPromotionSerializer(serializers.Serializer):
    promotion_type = serializers.ChoiceField(choices=["daily"])
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False, default="")
    banner_url = serializers.URLField(allow_null=True, required=False)
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    notify_favorites = serializers.BooleanField(default=False)
    store_id = serializers.UUIDField(required=False)


class CreateProductDiscountPromotionSerializer(serializers.Serializer):
    promotion_type = serializers.ChoiceField(choices=["product-discount"])
    product_id = serializers.UUIDField()
    discounted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
    )
    discount_total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
    )
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    store_id = serializers.UUIDField(required=False)


class UpdatePromotionStatusSerializer(serializers.Serializer):
    promotion_type = serializers.ChoiceField(choices=["daily", "product-discount"])
    status = serializers.ChoiceField(choices=["scheduled", "active", "ended"])


class UpdateDailyPromotionSerializer(serializers.Serializer):
    promotion_type = serializers.ChoiceField(choices=["daily"])
    title = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    banner_url = serializers.URLField(allow_null=True, required=False)
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
    notify_favorites = serializers.BooleanField(required=False)


class UpdateProductDiscountPromotionSerializer(serializers.Serializer):
    promotion_type = serializers.ChoiceField(choices=["product-discount"])
    discounted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
    )
    discount_total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
    )
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)


def serialize_daily_promotion(promotion: Promotion) -> dict:
    store = promotion.store

    return {
        "id": promotion.id,
        "promotion_type": "daily",
        "title": promotion.title,
        "description": promotion.description,
        "image_url": promotion.banner_url,
        "store_id": store.id,
        "store_name": store.name,
        "store_subtitle": store.subcategory or store.category.name,
        "store_avatar_url": store.logo_url,
        "valid_until": format_date_pt_br(promotion.end_date),
        "product_id": None,
        "original_price": None,
        "discounted_price": None,
    }


def serialize_product_discount(discount: ProductDiscount) -> dict:
    product = discount.product
    store = product.store

    return {
        "id": discount.id,
        "promotion_type": "product-discount",
        "title": product.name,
        "description": f"Promoção em {store.name}",
        "image_url": product.photo_url,
        "store_id": store.id,
        "store_name": store.name,
        "store_subtitle": store.subcategory or store.category.name,
        "store_avatar_url": store.logo_url,
        "valid_until": format_date_pt_br(discount.end_date),
        "product_id": product.id,
        "original_price": discount.original_price,
        "discounted_price": discount.discounted_price,
    }


def serialize_promotion_detail(promotion: Promotion) -> dict:
    payload = serialize_daily_promotion(promotion)
    payload["phone_number"] = promotion.store.phone_number
    return payload


def serialize_product_discount_detail(discount: ProductDiscount) -> dict:
    payload = serialize_product_discount(discount)
    payload["phone_number"] = discount.product.store.phone_number
    return payload


def serialize_merchant_daily_promotion(promotion: Promotion) -> dict:
    return {
        "id": promotion.id,
        "promotion_type": "daily",
        "store_id": promotion.store_id,
        "title": promotion.title,
        "description": promotion.description,
        "banner_url": promotion.banner_url,
        "start_date": promotion.start_date,
        "end_date": promotion.end_date,
        "notify_favorites": promotion.notify_favorites,
        "status": promotion.status,
        "product_id": None,
        "original_price": None,
        "discounted_price": None,
        "badge_text": format_date_pt_br(promotion.end_date),
    }


def serialize_merchant_product_discount(discount: ProductDiscount) -> dict:
    from marketing.services.promotion_queries import resolve_product_discount_status

    return {
        "id": discount.id,
        "promotion_type": "product-discount",
        "store_id": discount.product.store_id,
        "title": discount.product.name,
        "description": discount.product.description,
        "banner_url": discount.product.photo_url,
        "start_date": discount.start_date,
        "end_date": discount.end_date,
        "notify_favorites": False,
        "status": resolve_product_discount_status(discount=discount),
        "product_id": discount.product_id,
        "original_price": discount.original_price,
        "discounted_price": discount.discounted_price,
        "badge_text": format_date_pt_br(discount.end_date),
    }
