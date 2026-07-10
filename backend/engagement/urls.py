from django.urls import path

from engagement.views import FavoriteDestroyView, FavoriteListCreateView
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
