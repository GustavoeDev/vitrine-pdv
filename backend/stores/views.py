from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from stores.models import Category
from stores.serializers import CategoryDetailSerializer, CategorySerializer


class CategoryQuerySetMixin:
    def get_queryset(self):
        return Category.objects.filter(parent__isnull=True).prefetch_related("children")


class CategoryListView(CategoryQuerySetMixin, ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None


class CategoryDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategoryDetailSerializer
    queryset = Category.objects.select_related("parent").prefetch_related("children")
