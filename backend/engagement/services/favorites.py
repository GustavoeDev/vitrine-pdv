from django.db import transaction
from rest_framework.exceptions import ValidationError

from engagement.models import Favorite
from stores.models import Store, StoreStatus


@transaction.atomic
def add_favorite(*, user, store: Store) -> Favorite:
    if store.status != StoreStatus.ACTIVE:
        raise ValidationError({"store_id": "Apenas lojas ativas podem ser favoritadas."})

    favorite, _created = Favorite.objects.get_or_create(user=user, store=store)
    return favorite


def remove_favorite(*, user, store_id) -> None:
    Favorite.objects.filter(user=user, store_id=store_id).delete()
