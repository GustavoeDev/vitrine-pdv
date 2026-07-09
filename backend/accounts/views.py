from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from stores.models import Store

from accounts.serializers import (
    EmailTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from accounts.services import register_user

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        user = register_user(
            name=validated["name"],
            email=validated["email"],
            password=validated["password"],
        )
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_user_with_stores(self, user: User) -> User:
        return (
            User.objects.prefetch_related(
                Prefetch(
                    "stores",
                    queryset=Store.objects.select_related("category"),
                )
            )
            .get(pk=user.pk)
        )

    def get(self, request: Request) -> Response:
        user = self._get_user_with_stores(request.user)
        return Response(UserSerializer(user).data)

    def patch(self, request: Request) -> Response:
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = self._get_user_with_stores(request.user)
        return Response(UserSerializer(user).data)
