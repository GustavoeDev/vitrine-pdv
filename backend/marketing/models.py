import uuid

from django.db import models

from catalog.models import Product
from stores.models import Store


class PromotionStatus(models.TextChoices):
    SCHEDULED = "scheduled", "Scheduled"
    ACTIVE = "active", "Active"
    ENDED = "ended", "Ended"


class Promotion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="promotions",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    banner_url = models.URLField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    notify_favorites = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=PromotionStatus.choices,
        default=PromotionStatus.SCHEDULED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "promotions"
        ordering = ["-start_date"]

    def __str__(self) -> str:
        return self.title


class ProductDiscount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="discounts",
    )
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "product_discounts"
        ordering = ["-start_date"]

    def __str__(self) -> str:
        return f"{self.product.name} ({self.discounted_price})"
