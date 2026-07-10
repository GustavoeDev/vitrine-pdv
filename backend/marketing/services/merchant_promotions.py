from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from catalog.models import Product
from engagement.services.notifications import dispatch_daily_promotion_notifications
from marketing.models import ProductDiscount, Promotion, PromotionStatus
from marketing.services.promotion_queries import resolve_promotion_status
from stores.models import Store


@transaction.atomic
def create_daily_promotion(*, store: Store, validated_data: dict) -> Promotion:
    start_date = validated_data["start_date"]
    end_date = validated_data["end_date"]

    if end_date < start_date:
        raise ValidationError({"end_date": "A data final deve ser posterior à data inicial."})

    status = resolve_promotion_status(start_date=start_date, end_date=end_date)

    promotion = Promotion.objects.create(
        store=store,
        status=status,
        **validated_data,
    )
    dispatch_daily_promotion_notifications(promotion=promotion)
    return promotion


@transaction.atomic
def create_product_discount_promotion(
    *,
    store: Store,
    validated_data: dict,
) -> ProductDiscount:
    product = Product.objects.select_related("store").get(pk=validated_data["product_id"])

    if product.store_id != store.id:
        raise ValidationError({"product_id": "Produto não pertence à sua loja."})

    start_date = validated_data["start_date"]
    end_date = validated_data["end_date"]

    if end_date < start_date:
        raise ValidationError({"end_date": "A data final deve ser posterior à data inicial."})

    discounted_price = validated_data.get("discounted_price")
    discount_total = validated_data.get("discount_total")

    if discounted_price is None and discount_total is not None:
        discounted_price = product.price - Decimal(str(discount_total))

    if discounted_price is None:
        raise ValidationError(
            {"discounted_price": "Informe o preço com desconto ou o valor do desconto."},
        )

    if discounted_price <= 0:
        raise ValidationError({"discounted_price": "O preço com desconto deve ser maior que zero."})

    if discounted_price >= product.price:
        raise ValidationError({"discounted_price": "O preço com desconto deve ser menor que o preço original."})

    ProductDiscount.objects.filter(product=product, is_active=True).update(is_active=False)

    return ProductDiscount.objects.create(
        product=product,
        original_price=product.price,
        discounted_price=discounted_price,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
    )


@transaction.atomic
def update_daily_promotion_status(*, promotion: Promotion, status: str) -> Promotion:
    if status not in PromotionStatus.values:
        raise ValidationError({"status": "Status de promoção inválido."})

    promotion.status = status
    promotion.save(update_fields=["status"])
    dispatch_daily_promotion_notifications(promotion=promotion)
    return promotion


@transaction.atomic
def update_product_discount_status(*, discount: ProductDiscount, status: str) -> ProductDiscount:
    if status not in PromotionStatus.values:
        raise ValidationError({"status": "Status de promoção inválido."})

    if status == PromotionStatus.ACTIVE:
        now = timezone.now()
        if discount.start_date > now:
            discount.is_active = False
        elif discount.end_date < now:
            raise ValidationError({"status": "Não é possível reativar uma promoção expirada."})
        else:
            ProductDiscount.objects.filter(
                product_id=discount.product_id,
                is_active=True,
            ).exclude(pk=discount.pk).update(is_active=False)
            discount.is_active = True
    else:
        discount.is_active = False

    discount.save(update_fields=["is_active"])
    return discount


@transaction.atomic
def update_daily_promotion(*, promotion: Promotion, validated_data: dict) -> Promotion:
    start_date = validated_data.get("start_date", promotion.start_date)
    end_date = validated_data.get("end_date", promotion.end_date)

    if end_date < start_date:
        raise ValidationError({"end_date": "A data final deve ser posterior à data inicial."})

    for field, value in validated_data.items():
        setattr(promotion, field, value)

    promotion.status = resolve_promotion_status(start_date=promotion.start_date, end_date=promotion.end_date)
    promotion.save()
    dispatch_daily_promotion_notifications(promotion=promotion)
    return promotion


@transaction.atomic
def update_product_discount_promotion(
    *,
    discount: ProductDiscount,
    validated_data: dict,
) -> ProductDiscount:
    product = discount.product
    start_date = validated_data.get("start_date", discount.start_date)
    end_date = validated_data.get("end_date", discount.end_date)

    if end_date < start_date:
        raise ValidationError({"end_date": "A data final deve ser posterior à data inicial."})

    discounted_price = validated_data.get("discounted_price")
    discount_total = validated_data.get("discount_total")

    if discounted_price is None and discount_total is not None:
        discounted_price = product.price - Decimal(str(discount_total))

    if discounted_price is not None:
        if discounted_price <= 0:
            raise ValidationError({"discounted_price": "O preço com desconto deve ser maior que zero."})

        if discounted_price >= product.price:
            raise ValidationError({"discounted_price": "O preço com desconto deve ser menor que o preço original."})

        discount.discounted_price = discounted_price
        discount.original_price = product.price

    if "start_date" in validated_data:
        discount.start_date = validated_data["start_date"]

    if "end_date" in validated_data:
        discount.end_date = validated_data["end_date"]

    if discount.is_active:
        now = timezone.now()
        discount.is_active = discount.start_date <= now <= discount.end_date

    discount.save()
    return discount
