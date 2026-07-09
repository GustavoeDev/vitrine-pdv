from django.urls import path

from catalog.views import ProductDetailView, StoreProductListView

urlpatterns = [
    path("products/<uuid:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path(
        "stores/<uuid:store_id>/products/",
        StoreProductListView.as_view(),
        name="store-product-list",
    ),
]
