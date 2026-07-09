from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from catalog.models import Product
from marketing.models import ProductDiscount
from stores.models import Store


@transaction.atomic
def create_merchant_product(*, store: Store, validated_data: dict) -> Product:
    discounted_price = validated_data.pop("discounted_price", None)

    product = Product.objects.create(store=store, **validated_data)

    if discounted_price is not None:
        now = timezone.now()
        ProductDiscount.objects.create(
            product=product,
            original_price=product.price,
            discounted_price=discounted_price,
            start_date=now,
            end_date=now + timedelta(days=30),
            is_active=True,
        )

    return product


@transaction.atomic
def update_merchant_product(*, product: Product, validated_data: dict) -> Product:
    for field, value in validated_data.items():
        setattr(product, field, value)

    product.save()
    return product


def delete_merchant_product(*, product: Product) -> None:
    product.delete()
