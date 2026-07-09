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
