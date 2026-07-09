from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from stores.serializers import StoreSummarySerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    stores = StoreSummarySerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "avatar_url",
            "notifications_enabled",
            "created_at",
            "is_staff",
            "stores",
        )
        read_only_fields = fields


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("name", "notifications_enabled", "avatar_url")


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value: str) -> str:
        normalized = value.lower().strip()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return normalized

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "As senhas não coincidem."}
            )
        return attrs


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["name"] = user.name
        token["email"] = user.email
        return token
