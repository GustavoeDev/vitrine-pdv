from django.shortcuts import get_object_or_404

from catalog.models import Product, ProductView
from stores.models import StoreStatus


def record_product_view(*, product_id) -> ProductView:
    product = get_object_or_404(
        Product.objects.filter(
            is_active=True,
            store__status=StoreStatus.ACTIVE,
        ),
        pk=product_id,
    )
    return ProductView.objects.create(product=product)
