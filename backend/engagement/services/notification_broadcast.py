from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from engagement.consumers import user_notification_group_name
from engagement.models import Notification
from engagement.serializers import NotificationSerializer


def _serialize_notification(notification: Notification) -> dict:
    notification = (
        Notification.objects.select_related('store', 'promotion', 'review')
        .get(pk=notification.pk)
    )
    return NotificationSerializer(notification).data


def broadcast_notification(*, notification: Notification) -> None:
    channel_layer = get_channel_layer()

    if channel_layer is None:
        return

    payload = {
        'type': 'notification.created',
        'notification': _serialize_notification(notification),
    }

    async_to_sync(channel_layer.group_send)(
        user_notification_group_name(notification.user_id),
        {
            'type': 'notification_created',
            'payload': payload,
        },
    )
