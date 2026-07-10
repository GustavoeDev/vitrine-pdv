from django.urls import path

from marketing.views import (
    FavoritePromotionsView,
    FeaturedPromotionView,
    MerchantPromotionDetailView,
    MerchantPromotionListCreateView,
    MerchantPromotionStatusView,
    PromotionDetailView,
    StoreActivePromotionsView,
)

urlpatterns = [
    path(
        "promotions/featured/",
        FeaturedPromotionView.as_view(),
        name="promotion-featured",
    ),
    path(
        "promotions/favorites/",
        FavoritePromotionsView.as_view(),
        name="promotion-favorites",
    ),
    path(
        "promotions/<uuid:pk>/",
        PromotionDetailView.as_view(),
        name="promotion-detail",
    ),
    path(
        "stores/<uuid:store_id>/promotions/active/",
        StoreActivePromotionsView.as_view(),
        name="store-active-promotions",
    ),
    path(
        "merchant/promotions/",
        MerchantPromotionListCreateView.as_view(),
        name="merchant-promotion-list-create",
    ),
    path(
        "merchant/promotions/<uuid:pk>/",
        MerchantPromotionDetailView.as_view(),
        name="merchant-promotion-detail",
    ),
    path(
        "merchant/promotions/<uuid:pk>/status/",
        MerchantPromotionStatusView.as_view(),
        name="merchant-promotion-status",
    ),
]
