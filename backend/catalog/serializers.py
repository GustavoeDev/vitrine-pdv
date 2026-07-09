from rest_framework import serializers

from catalog.models import Product


class ProductSummarySerializer(serializers.ModelSerializer):
    store_id = serializers.UUIDField(source="store.id", read_only=True)
    store_name = serializers.CharField(source="store.name", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "store_id",
            "store_name",
            "name",
            "price",
            "photo_url",
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    store_id = serializers.UUIDField(source="store.id", read_only=True)
    store_name = serializers.CharField(source="store.name", read_only=True)
    category_name = serializers.CharField(source="store.category.name", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "store_id",
            "store_name",
            "category_name",
            "name",
            "description",
            "price",
            "photo_url",
            "created_at",
        )
