from django.urls import path

from engagement.views import (
    FavoriteDestroyView,
    FavoriteListCreateView,
    FavoriteNotificationsView,
)
from engagement.views_notifications import (
    NotificationListView,
    NotificationMarkAllReadView,
    NotificationMarkReadView,
    NotificationUnreadCountView,
)
from engagement.views_reviews import StoreReviewListCreateView, StoreReviewMeView

urlpatterns = [
    path(
        "favorites/",
        FavoriteListCreateView.as_view(),
        name="favorite-list-create",
    ),
    path(
        "favorites/<uuid:store_id>/",
        FavoriteDestroyView.as_view(),
        name="favorite-destroy",
    ),
    path(
        "favorites/<uuid:store_id>/notifications/",
        FavoriteNotificationsView.as_view(),
        name="favorite-notifications",
    ),
    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notification-list",
    ),
    path(
        "notifications/unread-count/",
        NotificationUnreadCountView.as_view(),
        name="notification-unread-count",
    ),
    path(
        "notifications/mark-all-read/",
        NotificationMarkAllReadView.as_view(),
        name="notification-mark-all-read",
    ),
    path(
        "notifications/<uuid:pk>/read/",
        NotificationMarkReadView.as_view(),
        name="notification-mark-read",
    ),
    path(
        "stores/<uuid:store_id>/reviews/",
        StoreReviewListCreateView.as_view(),
        name="store-review-list-create",
    ),
    path(
        "stores/<uuid:store_id>/reviews/me/",
        StoreReviewMeView.as_view(),
        name="store-review-me",
    ),
]
