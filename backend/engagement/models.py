import uuid

from django.conf import settings
from django.db import models

from stores.models import Store


class Favorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "favorites"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "store"],
                name="unique_user_store_favorite",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} -> {self.store_id}"


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="store_reviews",
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "store_reviews"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "store"],
                name="unique_user_store_review",
            ),
            models.CheckConstraint(
                condition=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name="store_review_rating_between_1_and_5",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} -> {self.store_id} ({self.rating})"
