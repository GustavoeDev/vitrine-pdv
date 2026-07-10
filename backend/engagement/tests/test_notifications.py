import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from engagement.models import Favorite, Notification, NotificationAudience, NotificationType
from marketing.models import PromotionStatus
from stores.models import Category
from stores.services.store_registration import register_store
from stores.services.store_review import approve_store

User = get_user_model()


@pytest.fixture
def food_category(db):
    return Category.objects.create(name="Alimentação")


@pytest.fixture
def active_store(food_category, db):
    owner = User.objects.create_user(
        email="loja@example.com",
        name="Loja Owner",
        password="senha1234",
        notifications_enabled=True,
    )
    store = register_store(
        user=owner,
        validated_data={
            "category_id": food_category.id,
            "name": "Padaria São José",
            "subcategory": "Padaria",
            "phone_number": "84999999999",
            "address": {
                "street": "Rua Principal",
                "number": "123",
                "complement": "",
                "district": "Centro",
                "city": "Natal",
                "state": "RN",
                "zipcode": "59000000",
            },
            "business_hours": [
                {"weekday": "MONDAY", "opens_at": "08:00", "closes_at": "18:00"},
            ],
        },
    )
    staff = User.objects.create_user(
        email="admin@example.com",
        name="Admin",
        password="senha1234",
        is_staff=True,
    )
    approve_store(store=store, reviewer=staff)
    return store


@pytest.fixture
def consumer(db):
    return User.objects.create_user(
        email="cliente@example.com",
        name="Cliente",
        password="senha1234",
        notifications_enabled=True,
    )


@pytest.mark.django_db
def test_daily_promotion_notification_respects_all_preferences(active_store, consumer):
    Favorite.objects.create(user=consumer, store=active_store, notifications_enabled=True)

    from django.utils import timezone
    from datetime import timedelta
    from marketing.services.merchant_promotions import create_daily_promotion

    now = timezone.now()
    promotion = create_daily_promotion(
        store=active_store,
        validated_data={
            "title": "Pão francês",
            "description": "Promo do dia",
            "banner_url": "https://example.com/banner.jpg",
            "start_date": now,
            "end_date": now + timedelta(days=1),
            "notify_favorites": True,
        },
    )
    assert promotion.status == PromotionStatus.ACTIVE

    notification = Notification.objects.get(user=consumer, promotion=promotion)
    assert notification.notification_type == NotificationType.DAILY_PROMOTION
    assert notification.audience == NotificationAudience.CONSUMER


@pytest.mark.django_db
def test_daily_promotion_skips_when_consumer_notifications_disabled(active_store, consumer):
    consumer.notifications_enabled = False
    consumer.save(update_fields=["notifications_enabled"])
    Favorite.objects.create(user=consumer, store=active_store, notifications_enabled=True)

    from django.utils import timezone
    from datetime import timedelta
    from marketing.services.merchant_promotions import create_daily_promotion

    now = timezone.now()
    create_daily_promotion(
        store=active_store,
        validated_data={
            "title": "Pão francês",
            "description": "Promo do dia",
            "banner_url": "https://example.com/banner.jpg",
            "start_date": now,
            "end_date": now + timedelta(days=1),
            "notify_favorites": True,
        },
    )

    assert Notification.objects.filter(user=consumer).count() == 0


@pytest.mark.django_db
def test_daily_promotion_skips_when_favorite_notifications_disabled(active_store, consumer):
    Favorite.objects.create(user=consumer, store=active_store, notifications_enabled=False)

    from django.utils import timezone
    from datetime import timedelta
    from marketing.services.merchant_promotions import create_daily_promotion

    now = timezone.now()
    create_daily_promotion(
        store=active_store,
        validated_data={
            "title": "Pão francês",
            "description": "Promo do dia",
            "banner_url": "https://example.com/banner.jpg",
            "start_date": now,
            "end_date": now + timedelta(days=1),
            "notify_favorites": True,
        },
    )

    assert Notification.objects.filter(user=consumer).count() == 0


@pytest.mark.django_db
def test_store_review_creates_merchant_notification(active_store, consumer):
    client = APIClient()
    client.force_authenticate(user=consumer)

    response = client.post(
        reverse("store-review-list-create", kwargs={"store_id": active_store.id}),
        {"rating": 5, "comment": "Excelente"},
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED

    notification = Notification.objects.get(user=active_store.user)
    assert notification.notification_type == NotificationType.STORE_REVIEW
    assert notification.audience == NotificationAudience.MERCHANT


@pytest.mark.django_db
def test_update_favorite_notifications(active_store, consumer):
    Favorite.objects.create(user=consumer, store=active_store, notifications_enabled=True)
    client = APIClient()
    client.force_authenticate(user=consumer)

    response = client.patch(
        reverse("favorite-notifications", kwargs={"store_id": active_store.id}),
        {"notifications_enabled": False},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["notifications_enabled"] is False


@pytest.mark.django_db
def test_broadcast_notification_sends_group_message(active_store, consumer, monkeypatch):
    from engagement.services.notification_broadcast import broadcast_notification

    sent = {}

    class FakeLayer:
        def group_send(self, group_name, message):
            sent['group_name'] = group_name
            sent['message'] = message

    def fake_async_to_sync(func):
        def sync_wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        return sync_wrapper

    monkeypatch.setattr(
        'engagement.services.notification_broadcast.get_channel_layer',
        lambda: FakeLayer(),
    )
    monkeypatch.setattr(
        'engagement.services.notification_broadcast.async_to_sync',
        fake_async_to_sync,
    )

    notification = Notification.objects.create(
        user=consumer,
        audience=NotificationAudience.CONSUMER,
        notification_type=NotificationType.DAILY_PROMOTION,
        title=active_store.name,
        message="Teste",
        store=active_store,
    )

    broadcast_notification(notification=notification)

    assert sent['group_name'] == f'notifications_{consumer.id}'
    assert sent['message']['type'] == 'notification_created'
    assert sent['message']['payload']['type'] == 'notification.created'

