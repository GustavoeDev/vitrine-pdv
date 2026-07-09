from django.urls import path

from stores.views import CategoryDetailView, CategoryListView

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<uuid:pk>/", CategoryDetailView.as_view(), name="category-detail"),
]
