from rest_framework import serializers

from engagement.models import Favorite
from marketing.services.promotion_queries import store_has_active_promotion


class FavoriteStoreSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="store.id", read_only=True)
    name = serializers.CharField(source="store.name", read_only=True)
    status = serializers.CharField(source="store.status", read_only=True)
    category_id = serializers.UUIDField(source="store.category_id", read_only=True)
    category_name = serializers.CharField(source="store.category.name", read_only=True)
    subcategory = serializers.CharField(source="store.subcategory", read_only=True)
    logo_url = serializers.URLField(source="store.logo_url", read_only=True)
    cover_photo_url = serializers.URLField(source="store.cover_photo_url", read_only=True)
    has_active_promotion = serializers.SerializerMethodField()
    favorited_at = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Favorite
        fields = (
            "id",
            "name",
            "status",
            "category_id",
            "category_name",
            "subcategory",
            "logo_url",
            "cover_photo_url",
            "has_active_promotion",
            "favorited_at",
        )

    def get_has_active_promotion(self, favorite: Favorite) -> bool:
        return store_has_active_promotion(store_id=favorite.store_id)


class CreateFavoriteSerializer(serializers.Serializer):
    store_id = serializers.UUIDField()
