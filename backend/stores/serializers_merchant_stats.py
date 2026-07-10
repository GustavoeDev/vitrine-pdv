from rest_framework import serializers


class MerchantStatsTopProductSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    view_count = serializers.IntegerField()


class MerchantStatsSerializer(serializers.Serializer):
    range = serializers.ChoiceField(choices=["7d", "30d", "3m"])
    views = serializers.IntegerField()
    views_delta = serializers.CharField()
    favorites = serializers.IntegerField()
    favorites_delta = serializers.CharField()
    active_products = serializers.IntegerField()
    total_products = serializers.IntegerField()
    average_rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
        allow_null=True,
    )
    reviews_count = serializers.IntegerField()
    top_products = MerchantStatsTopProductSerializer(many=True)
