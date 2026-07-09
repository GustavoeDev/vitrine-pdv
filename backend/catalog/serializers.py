from decimal import Decimal

from rest_framework import serializers

from catalog.models import Product
from marketing.models import ProductDiscount


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


class ProductDiscountSerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(source="product.id", read_only=True)

    class Meta:
        model = ProductDiscount
        fields = (
            "id",
            "product_id",
            "original_price",
            "discounted_price",
            "start_date",
            "end_date",
            "is_active",
        )


class MerchantProductSerializer(serializers.ModelSerializer):
    store_id = serializers.UUIDField(source="store.id", read_only=True)
    view_count = serializers.IntegerField(read_only=True, default=0)
    active_discount = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "store_id",
            "name",
            "description",
            "price",
            "photo_url",
            "is_active",
            "created_at",
            "view_count",
            "active_discount",
        )

    def get_active_discount(self, product: Product) -> dict | None:
        discounts = getattr(product, "active_discounts", None)
        if discounts is not None:
            discount = discounts[0] if discounts else None
        else:
            discount = (
                product.discounts.filter(is_active=True).order_by("-start_date").first()
            )

        if discount is None:
            return None

        return ProductDiscountSerializer(discount).data


class CreateMerchantProductSerializer(serializers.ModelSerializer):
    discounted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = Product
        fields = (
            "name",
            "description",
            "price",
            "photo_url",
            "is_active",
            "discounted_price",
        )

    def validate_discounted_price(self, value):
        if value is None:
            return value

        price = self.initial_data.get("price")
        if price is not None and value >= Decimal(str(price)):
            raise serializers.ValidationError(
                "O preço com desconto deve ser menor que o preço original."
            )

        return value


class UpdateMerchantProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "name",
            "description",
            "price",
            "photo_url",
            "is_active",
        )
