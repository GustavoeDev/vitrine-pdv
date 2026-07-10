from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from engagement.models import Favorite, Notification, NotificationAudience
from engagement.serializers import NotificationSerializer
from engagement.services.notifications import (
    get_unread_notifications_count,
    mark_all_notifications_read,
    mark_notification_read,
)


@extend_schema(
    parameters=[
        OpenApiParameter(
            name='audience',
            type=str,
            location=OpenApiParameter.QUERY,
            description='consumer ou merchant',
        ),
    ],
    responses=NotificationSerializer(many=True),
    tags=['Engajamento'],
)
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        audience = request.query_params.get("audience", NotificationAudience.CONSUMER)

        if audience not in NotificationAudience.values:
            return Response(
                {"audience": "Audiência inválida. Use consumer ou merchant."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notifications = (
            Notification.objects.filter(user=request.user, audience=audience)
            .select_related("store", "promotion", "review")
            .order_by("-created_at")
        )
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


@extend_schema(
    parameters=[
        OpenApiParameter(
            name='audience',
            type=str,
            location=OpenApiParameter.QUERY,
            description='consumer ou merchant',
        ),
    ],
    tags=['Engajamento'],
)
class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        audience = request.query_params.get("audience", NotificationAudience.CONSUMER)

        if audience not in NotificationAudience.values:
            return Response(
                {"audience": "Audiência inválida. Use consumer ou merchant."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"count": get_unread_notifications_count(user=request.user, audience=audience)},
        )


@extend_schema(tags=['Engajamento'])
class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        audience = request.data.get("audience", NotificationAudience.CONSUMER)

        if audience not in NotificationAudience.values:
            return Response(
                {"audience": "Audiência inválida. Use consumer ou merchant."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = mark_all_notifications_read(user=request.user, audience=audience)
        return Response({"updated": updated})


@extend_schema(responses=NotificationSerializer, tags=['Engajamento'])
class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = mark_notification_read(user=request.user, notification_id=pk)

        if notification is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response(NotificationSerializer(notification).data)
