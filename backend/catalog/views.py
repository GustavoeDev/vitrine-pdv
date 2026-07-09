from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from catalog.models import Product
from catalog.serializers import ProductDetailSerializer, ProductSummarySerializer
from stores.models import Store, StoreStatus


class ProductDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    queryset = Product.objects.filter(is_active=True).select_related(
        "store",
        "store__category",
    )


class StoreProductListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSummarySerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Product.objects.filter(
                is_active=True,
                store_id=self.kwargs["store_id"],
                store__status=StoreStatus.ACTIVE,
            )
            .select_related("store")
            .order_by("name")
        )
