import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("engagement", "0002_review"),
        ("marketing", "0002_promotion"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="favorite",
            name="notifications_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name="Notification",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "audience",
                    models.CharField(
                        choices=[("consumer", "Consumer"), ("merchant", "Merchant")],
                        max_length=20,
                    ),
                ),
                (
                    "notification_type",
                    models.CharField(
                        choices=[
                            ("daily_promotion", "Daily promotion"),
                            ("store_review", "Store review"),
                        ],
                        max_length=30,
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("message", models.TextField()),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "promotion",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to="marketing.promotion",
                    ),
                ),
                (
                    "review",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to="engagement.review",
                    ),
                ),
                (
                    "store",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to="stores.store",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "notifications",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="notification",
            constraint=models.UniqueConstraint(
                condition=models.Q(("promotion__isnull", False)),
                fields=("user", "promotion", "notification_type"),
                name="unique_user_promotion_notification",
            ),
        ),
        migrations.AddConstraint(
            model_name="notification",
            constraint=models.UniqueConstraint(
                condition=models.Q(("review__isnull", False)),
                fields=("user", "review"),
                name="unique_user_review_notification",
            ),
        ),
    ]
