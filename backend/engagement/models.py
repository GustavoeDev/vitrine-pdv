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
    notifications_enabled = models.BooleanField(default=True)
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


class NotificationAudience(models.TextChoices):
    CONSUMER = "consumer", "Consumer"
    MERCHANT = "merchant", "Merchant"


class NotificationType(models.TextChoices):
    DAILY_PROMOTION = "daily_promotion", "Daily promotion"
    STORE_REVIEW = "store_review", "Store review"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    audience = models.CharField(max_length=20, choices=NotificationAudience.choices)
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    promotion = models.ForeignKey(
        "marketing.Promotion",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "promotion", "notification_type"],
                condition=models.Q(promotion__isnull=False),
                name="unique_user_promotion_notification",
            ),
            models.UniqueConstraint(
                fields=["user", "review"],
                condition=models.Q(review__isnull=False),
                name="unique_user_review_notification",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} <- {self.notification_type}"
