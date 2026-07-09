from django.urls import path

from stores.views import (
    AdminStoreApproveView,
    AdminStoreDetailView,
    AdminStoreListView,
    AdminStoreRejectView,
    AdminStoreSummaryView,
    CategoryDetailView,
    CategoryListView,
    StoreCreateView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<uuid:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path("stores/", StoreCreateView.as_view(), name="store-create"),
    path("admin/stores/summary/", AdminStoreSummaryView.as_view(), name="admin-store-summary"),
    path("admin/stores/", AdminStoreListView.as_view(), name="admin-store-list"),
    path("admin/stores/<uuid:pk>/", AdminStoreDetailView.as_view(), name="admin-store-detail"),
    path(
        "admin/stores/<uuid:pk>/approve/",
        AdminStoreApproveView.as_view(),
        name="admin-store-approve",
    ),
    path(
        "admin/stores/<uuid:pk>/reject/",
        AdminStoreRejectView.as_view(),
        name="admin-store-reject",
    ),
]
