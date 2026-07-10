from django.urls import path

from stores.views import (
    AdminStoreApproveView,
    AdminStoreDetailView,
    AdminStoreListView,
    AdminStoreRejectView,
    AdminStoreSummaryView,
    CategoryDetailView,
    CategoryListView,
    GeocodeAddressView,
    MerchantStatsView,
    MerchantStoreDetailView,
    PublicStoreDetailView,
    PublicStoreListView,
    SearchView,
    StoreCreateView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<uuid:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path("stores/", StoreCreateView.as_view(), name="store-create"),
    path("stores/list/", PublicStoreListView.as_view(), name="public-store-list"),
    path("stores/<uuid:pk>/", PublicStoreDetailView.as_view(), name="public-store-detail"),
    path(
        "merchant/stores/<uuid:pk>/",
        MerchantStoreDetailView.as_view(),
        name="merchant-store-detail",
    ),
    path(
        "merchant/stats/",
        MerchantStatsView.as_view(),
        name="merchant-stats",
    ),
    path("search/", SearchView.as_view(), name="search"),
    path("geocode/", GeocodeAddressView.as_view(), name="geocode-address"),
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
