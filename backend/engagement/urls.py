from django.urls import path

from engagement.views import FavoriteDestroyView, FavoriteListCreateView

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
]
