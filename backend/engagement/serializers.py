from rest_framework import serializers

from engagement.models import Favorite, Notification, Review
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
            "notifications_enabled",
            "favorited_at",
        )

    def get_has_active_promotion(self, favorite: Favorite) -> bool:
        return store_has_active_promotion(store_id=favorite.store_id)


class UpdateFavoriteNotificationsSerializer(serializers.Serializer):
    notifications_enabled = serializers.BooleanField()


class CreateFavoriteSerializer(serializers.Serializer):
    store_id = serializers.UUIDField()


class NotificationSerializer(serializers.ModelSerializer):
    store_id = serializers.UUIDField(read_only=True, allow_null=True)
    store_name = serializers.CharField(source="store.name", read_only=True, allow_null=True)
    store_logo_url = serializers.URLField(source="store.logo_url", read_only=True, allow_null=True)
    promotion_id = serializers.UUIDField(read_only=True, allow_null=True)
    review_id = serializers.UUIDField(read_only=True, allow_null=True)
    review_rating = serializers.IntegerField(source="review.rating", read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "audience",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
            "store_id",
            "store_name",
            "store_logo_url",
            "promotion_id",
            "review_id",
            "review_rating",
        )


class StoreReviewSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "author_name",
            "rating",
            "comment",
            "created_at",
        )
        read_only_fields = (
            "id",
            "author_name",
            "created_at",
        )


class CreateStoreReviewSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(
        allow_blank=True,
        required=False,
        max_length=500,
        default="",
    )


class UpdateStoreReviewSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(
        allow_blank=True,
        required=False,
        max_length=500,
        default="",
    )
