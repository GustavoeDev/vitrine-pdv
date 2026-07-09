import re

from rest_framework import serializers

from stores.models import Address, BusinessHour, BusinessWeekday, Category, Store


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "parent_id", "name", "photo_url", "children")

    def get_children(self, category: Category) -> list[dict]:
        if not self.context.get("include_children", True):
            return []

        children = category.children.all()
        serializer = CategorySerializer(
            children,
            many=True,
            context={"include_children": False},
        )
        return serializer.data


class CategoryDetailSerializer(CategorySerializer):
    parent_name = serializers.CharField(source="parent.name", read_only=True, allow_null=True)

    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + ("parent_name",)


class AddressSerializer(serializers.ModelSerializer):
    latitude = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        required=False,
        allow_null=True,
    )
    longitude = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Address
        fields = (
            "street",
            "number",
            "complement",
            "district",
            "city",
            "state",
            "zipcode",
            "latitude",
            "longitude",
        )
        extra_kwargs = {
            "complement": {"required": False, "allow_blank": True},
        }


class AddressReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "street",
            "number",
            "complement",
            "district",
            "city",
            "state",
            "zipcode",
            "latitude",
            "longitude",
        )


class BusinessHourInputSerializer(serializers.Serializer):
    weekday = serializers.ChoiceField(choices=BusinessWeekday.choices)
    opens_at = serializers.TimeField(format="%H:%M", input_formats=["%H:%M", "%H:%M:%S"])
    closes_at = serializers.TimeField(format="%H:%M", input_formats=["%H:%M", "%H:%M:%S"])

    def validate(self, attrs: dict) -> dict:
        if attrs["opens_at"] >= attrs["closes_at"]:
            raise serializers.ValidationError(
                "O horário de abertura deve ser anterior ao de fechamento."
            )
        return attrs


class BusinessHourReadSerializer(serializers.ModelSerializer):
    opens_at = serializers.TimeField(format="%H:%M")
    closes_at = serializers.TimeField(format="%H:%M")

    class Meta:
        model = BusinessHour
        fields = ("id", "weekday", "opens_at", "closes_at")


class CreateStoreSerializer(serializers.Serializer):
    category_id = serializers.UUIDField()
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        default="",
    )
    subcategory = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
        default="",
    )
    phone_number = serializers.CharField(max_length=20)
    cover_photo_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    logo_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    address = AddressSerializer()
    business_hours = BusinessHourInputSerializer(many=True)

    def validate_category_id(self, value):
        if not Category.objects.filter(id=value, parent__isnull=True).exists():
            raise serializers.ValidationError("Categoria inválida.")
        return value

    def validate_phone_number(self, value: str) -> str:
        digits = re.sub(r"\D", "", value)
        if len(digits) < 10:
            raise serializers.ValidationError(
                "Informe um telefone válido com DDD."
            )
        return digits

    def validate_business_hours(self, value: list) -> list:
        if not value:
            raise serializers.ValidationError(
                "Informe pelo menos um horário de funcionamento."
            )
        return value

    def validate(self, attrs: dict) -> dict:
        cover = attrs.get("cover_photo_url")
        logo = attrs.get("logo_url")
        attrs["cover_photo_url"] = cover or None
        attrs["logo_url"] = logo or None
        return attrs


class StoreSummarySerializer(serializers.ModelSerializer):
    category_id = serializers.UUIDField(source="category.id", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Store
        fields = (
            "id",
            "name",
            "status",
            "category_id",
            "category_name",
            "subcategory",
            "logo_url",
            "cover_photo_url",
        )


class PublicStoreListSerializer(StoreSummarySerializer):
    address_summary = serializers.SerializerMethodField()
    latitude = serializers.DecimalField(
        source="address.latitude",
        max_digits=9,
        decimal_places=6,
        read_only=True,
        allow_null=True,
    )
    longitude = serializers.DecimalField(
        source="address.longitude",
        max_digits=9,
        decimal_places=6,
        read_only=True,
        allow_null=True,
    )
    distance_km = serializers.SerializerMethodField()

    class Meta(StoreSummarySerializer.Meta):
        fields = StoreSummarySerializer.Meta.fields + (
            "address_summary",
            "latitude",
            "longitude",
            "distance_km",
        )

    def get_address_summary(self, store: Store) -> str:
        address = store.address
        return f"{address.city}, {address.state}"

    def get_distance_km(self, store: Store) -> float | None:
        user_coords = self.context.get("user_coords")
        if not user_coords:
            return None

        latitude = store.address.latitude
        longitude = store.address.longitude
        if latitude is None or longitude is None:
            return None

        from stores.services.distance import haversine_km

        user_lat, user_lng = user_coords
        return round(
            haversine_km(user_lat, user_lng, float(latitude), float(longitude)),
            1,
        )


class SearchResultSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    type = serializers.ChoiceField(choices=["store", "product"])
    title = serializers.CharField()
    subtitle = serializers.CharField()
    store_id = serializers.UUIDField(required=False, allow_null=True)


class StoreDetailSerializer(serializers.ModelSerializer):
    category_id = serializers.UUIDField(source="category.id", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    address = AddressReadSerializer(read_only=True)
    business_hours = BusinessHourReadSerializer(many=True, read_only=True)

    class Meta:
        model = Store
        fields = (
            "id",
            "name",
            "description",
            "subcategory",
            "phone_number",
            "cover_photo_url",
            "logo_url",
            "status",
            "category_id",
            "category_name",
            "address",
            "business_hours",
            "created_at",
        )


class AdminStoreOwnerSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    avatar_url = serializers.URLField(allow_null=True)


class AdminStoreListSerializer(serializers.ModelSerializer):
    category_id = serializers.UUIDField(source="category.id", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    address_summary = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = (
            "id",
            "name",
            "status",
            "category_id",
            "category_name",
            "subcategory",
            "logo_url",
            "cover_photo_url",
            "address_summary",
            "created_at",
        )

    def get_address_summary(self, store: Store) -> str:
        address = store.address
        return f"{address.street}, {address.number} - {address.city}, {address.state}"


class AdminStoreDetailSerializer(StoreDetailSerializer):
    owner = serializers.SerializerMethodField()
    rejection_reason = serializers.CharField(read_only=True)
    reviewed_at = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta(StoreDetailSerializer.Meta):
        fields = StoreDetailSerializer.Meta.fields + (
            "owner",
            "rejection_reason",
            "reviewed_at",
        )

    def get_owner(self, store: Store) -> dict:
        owner = store.user
        return AdminStoreOwnerSerializer(
            {
                "id": owner.id,
                "name": owner.name,
                "email": owner.email,
                "avatar_url": owner.avatar_url,
            }
        ).data


class RejectStoreSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(max_length=500)


class GeocodeQuerySerializer(serializers.Serializer):
    street = serializers.CharField(max_length=255)
    number = serializers.CharField(max_length=20)
    district = serializers.CharField(max_length=100)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=2)
    zipcode = serializers.CharField(max_length=8)
