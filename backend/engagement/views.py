from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from engagement.models import Favorite
from engagement.serializers import (
    CreateFavoriteSerializer,
    FavoriteStoreSerializer,
    UpdateFavoriteNotificationsSerializer,
)
from engagement.services.favorites import add_favorite, remove_favorite
from stores.models import Store


class FavoriteListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = (
            Favorite.objects.filter(user=request.user)
            .select_related("store", "store__category")
            .order_by("-created_at")
        )
        serializer = FavoriteStoreSerializer(favorites, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreateFavoriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        store = get_object_or_404(Store, pk=serializer.validated_data["store_id"])
        favorite = add_favorite(user=request.user, store=store)
        favorite = (
            Favorite.objects.select_related("store", "store__category")
            .get(pk=favorite.pk)
        )
        return Response(
            FavoriteStoreSerializer(favorite).data,
            status=status.HTTP_201_CREATED,
        )


class FavoriteDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, store_id):
        remove_favorite(user=request.user, store_id=store_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, store_id):
        favorite = get_object_or_404(
            Favorite.objects.select_related("store", "store__category"),
            user=request.user,
            store_id=store_id,
        )
        serializer = UpdateFavoriteNotificationsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        favorite.notifications_enabled = serializer.validated_data["notifications_enabled"]
        favorite.save(update_fields=["notifications_enabled"])

        return Response(FavoriteStoreSerializer(favorite).data)
