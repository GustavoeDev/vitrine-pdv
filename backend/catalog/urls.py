from django.urls import path

from catalog.views import (
    MerchantProductDetailView,
    MerchantProductListCreateView,
    ProductDetailView,
    ProductViewCreateView,
    StoreProductListView,
)

urlpatterns = [
    path("products/<uuid:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path(
        "products/<uuid:pk>/views/",
        ProductViewCreateView.as_view(),
        name="product-view-create",
    ),
    path(
        "merchant/products/",
        MerchantProductListCreateView.as_view(),
        name="merchant-product-list-create",
    ),
    path(
        "merchant/products/<uuid:pk>/",
        MerchantProductDetailView.as_view(),
        name="merchant-product-detail",
    ),
    path(
        "stores/<uuid:store_id>/products/",
        StoreProductListView.as_view(),
        name="store-product-list",
    ),
]
