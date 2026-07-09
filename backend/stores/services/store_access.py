from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from stores.models import Store, StoreStatus


def get_user_store(*, user, store_id=None) -> Store:
    queryset = Store.objects.filter(user=user)

    if store_id is not None:
        return get_object_or_404(queryset, pk=store_id)

    active_store = queryset.filter(status=StoreStatus.ACTIVE).order_by('-created_at').first()
    if active_store:
        return active_store

    store = queryset.order_by('-created_at').first()
    if store is None:
        raise PermissionDenied('Você ainda não possui um estabelecimento cadastrado.')

    return store
