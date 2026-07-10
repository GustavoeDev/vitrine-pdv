from django.db import transaction

from engagement.models import (
    Favorite,
    Notification,
    NotificationAudience,
    NotificationType,
    Review,
)
from marketing.models import Promotion, PromotionStatus
from engagement.services.notification_broadcast import broadcast_notification


def _should_notify_consumer(*, favorite: Favorite, store_owner) -> bool:
    return (
        favorite.notifications_enabled
        and favorite.user.notifications_enabled
        and store_owner.notifications_enabled
    )


@transaction.atomic
def dispatch_daily_promotion_notifications(*, promotion: Promotion) -> int:
    if promotion.status != PromotionStatus.ACTIVE:
        return 0

    if not promotion.notify_favorites:
        return 0

    store = promotion.store
    store_owner = store.user

    if not store_owner.notifications_enabled:
        return 0

    created_count = 0
    favorites = Favorite.objects.filter(store=store).select_related("user")

    for favorite in favorites:
        if not _should_notify_consumer(favorite=favorite, store_owner=store_owner):
            continue

        notification, created = Notification.objects.get_or_create(
            user=favorite.user,
            promotion=promotion,
            notification_type=NotificationType.DAILY_PROMOTION,
            defaults={
                "audience": NotificationAudience.CONSUMER,
                "title": store.name,
                "message": f"Nova promoção do dia: {promotion.title}",
                "store": store,
            },
        )

        if created:
            broadcast_notification(notification=notification)
            created_count += 1

    return created_count


@transaction.atomic
def dispatch_store_review_notification(*, review: Review) -> bool:
    store = review.store
    store_owner = store.user

    if not store_owner.notifications_enabled:
        return False

    stars = "★" * review.rating
    notification, created = Notification.objects.get_or_create(
        user=store_owner,
        review=review,
        defaults={
            "audience": NotificationAudience.MERCHANT,
            "notification_type": NotificationType.STORE_REVIEW,
            "title": store.name,
            "message": f"{review.user.name} avaliou sua loja com {stars} ({review.rating}/5).",
            "store": store,
        },
    )

    if created:
        broadcast_notification(notification=notification)

    return created


def get_unread_notifications_count(*, user, audience: str) -> int:
    return Notification.objects.filter(
        user=user,
        audience=audience,
        is_read=False,
    ).count()


@transaction.atomic
def mark_notification_read(*, user, notification_id) -> Notification | None:
    notification = Notification.objects.filter(user=user, pk=notification_id).first()

    if notification is None:
        return None

    if not notification.is_read:
        notification.is_read = True
        notification.save(update_fields=["is_read"])

    return notification


@transaction.atomic
def mark_all_notifications_read(*, user, audience: str) -> int:
    return Notification.objects.filter(
        user=user,
        audience=audience,
        is_read=False,
    ).update(is_read=True)
