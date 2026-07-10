import uuid

from django.conf import settings
from django.db import models


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="children",
    )
    name = models.CharField(max_length=100)
    photo_url = models.URLField(blank=True, null=True)

    class Meta:
        db_table = "categories"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "name"],
                name="unique_category_name_per_parent",
            ),
        ]

    def __str__(self) -> str:
        return self.name


class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    street = models.CharField(max_length=255)
    number = models.CharField(max_length=20)
    complement = models.CharField(max_length=255, blank=True, default="")
    district = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    zipcode = models.CharField(max_length=8)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "addresses"

    def __str__(self) -> str:
        return f"{self.street}, {self.number} - {self.city}/{self.state}"


class StoreStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    ACTIVE = "ACTIVE", "Active"
    INACTIVE = "INACTIVE", "Inactive"
    REJECTED = "REJECTED", "Rejected"


class Store(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stores",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="stores",
    )
    address = models.OneToOneField(
        Address,
        on_delete=models.PROTECT,
        related_name="store",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    subcategory = models.CharField(max_length=100, blank=True, default="")
    phone_number = models.CharField(max_length=20)
    cover_photo_url = models.URLField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=StoreStatus.choices,
        default=StoreStatus.PENDING,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_stores",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "stores"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class BusinessWeekday(models.TextChoices):
    MONDAY = "MONDAY", "Monday"
    TUESDAY = "TUESDAY", "Tuesday"
    WEDNESDAY = "WEDNESDAY", "Wednesday"
    THURSDAY = "THURSDAY", "Thursday"
    FRIDAY = "FRIDAY", "Friday"
    SATURDAY = "SATURDAY", "Saturday"
    SUNDAY = "SUNDAY", "Sunday"


class BusinessHour(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="business_hours",
    )
    weekday = models.CharField(max_length=10, choices=BusinessWeekday.choices)
    opens_at = models.TimeField()
    closes_at = models.TimeField()

    class Meta:
        db_table = "business_hours"
        ordering = ["weekday", "opens_at"]

    def __str__(self) -> str:
        return f"{self.weekday} {self.opens_at}-{self.closes_at}"
