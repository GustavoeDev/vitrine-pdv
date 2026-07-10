from django.contrib.auth import get_user_model
from django.db import transaction

from stores.models import Address, BusinessHour, Store, StoreStatus
from stores.services.address_coordinates import ensure_address_coordinates

User = get_user_model()


@transaction.atomic
def register_store(*, user: User, validated_data: dict) -> Store:
    address_data = validated_data.pop("address")
    business_hours_data = validated_data.pop("business_hours")
    category_id = validated_data.pop("category_id")

    address = Address.objects.create(**address_data)
    if address.latitude is None or address.longitude is None:
        ensure_address_coordinates(address)

    store = Store.objects.create(
        user=user,
        address=address,
        category_id=category_id,
        status=StoreStatus.PENDING,
        **validated_data,
    )

    BusinessHour.objects.bulk_create(
        [
            BusinessHour(
                store=store,
                weekday=hour["weekday"],
                opens_at=hour["opens_at"],
                closes_at=hour["closes_at"],
            )
            for hour in business_hours_data
        ]
    )

    return store
