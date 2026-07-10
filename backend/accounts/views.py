from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema, extend_schema_view, extend_schema_view
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from stores.models import Store

from accounts.serializers import (
    ChangePasswordSerializer,
    EmailTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from accounts.services import register_user

User = get_user_model()


@extend_schema_view(
    post=extend_schema(request=RegisterSerializer, tags=['Autenticação']),
)
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


@extend_schema_view(
    get=extend_schema(responses=UserSerializer, tags=['Usuários']),
    patch=extend_schema(request=UserUpdateSerializer, responses=UserSerializer, tags=['Usuários']),
)
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


@extend_schema(request=ChangePasswordSerializer, responses={204: None}, tags=['Usuários'])
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])

        return Response(status=status.HTTP_204_NO_CONTENT)
