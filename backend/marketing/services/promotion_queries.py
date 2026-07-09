from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from django.db.models import Q
from django.utils import timezone

from catalog.models import Product
from marketing.models import ProductDiscount, Promotion, PromotionStatus
from stores.models import Store, StoreStatus


def resolve_promotion_status(*, start_date: datetime, end_date: datetime, now: datetime | None = None) -> str:
    current = now or timezone.now()

    if current < start_date:
        return PromotionStatus.SCHEDULED

    if current > end_date:
        return PromotionStatus.ENDED

    return PromotionStatus.ACTIVE


def active_daily_promotions_queryset():
    now = timezone.now()

    return Promotion.objects.filter(
        store__status=StoreStatus.ACTIVE,
        status=PromotionStatus.ACTIVE,
        start_date__lte=now,
        end_date__gte=now,
    ).select_related("store", "store__category")


def active_product_discounts_queryset():
    now = timezone.now()

    return ProductDiscount.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gte=now,
        product__is_active=True,
        product__store__status=StoreStatus.ACTIVE,
    ).select_related(
        "product",
        "product__store",
        "product__store__category",
    )


def get_featured_promotion() -> Promotion | None:
    return active_daily_promotions_queryset().order_by("-start_date").first()


def get_favorite_product_promotions(*, user) -> list[ProductDiscount]:
    if user is None or not user.is_authenticated:
        return []

    favorite_store_ids = user.favorites.values_list("store_id", flat=True)

    return list(
        active_product_discounts_queryset()
        .filter(product__store_id__in=favorite_store_ids)
        .order_by("-start_date")
    )


def store_has_active_promotion(*, store_id) -> bool:
    now = timezone.now()

    has_daily = Promotion.objects.filter(
        store_id=store_id,
        status=PromotionStatus.ACTIVE,
        start_date__lte=now,
        end_date__gte=now,
    ).exists()

    if has_daily:
        return True

    return ProductDiscount.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gte=now,
        product__is_active=True,
        product__store_id=store_id,
    ).exists()


def resolve_product_discount_status(*, discount: ProductDiscount) -> str:
    return resolve_promotion_status(
        start_date=discount.start_date,
        end_date=discount.end_date,
    ) if discount.is_active else PromotionStatus.ENDED
