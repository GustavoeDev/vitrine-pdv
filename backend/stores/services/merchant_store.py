from django.db import transaction

from stores.models import BusinessHour
from stores.services.address_coordinates import ensure_address_coordinates


@transaction.atomic
def update_merchant_store(*, store, validated_data: dict):
    address_data = validated_data.pop("address", None)
    business_hours_data = validated_data.pop("business_hours", None)
    category_id = validated_data.pop("category_id", None)

    if category_id is not None:
        store.category_id = category_id

    for field, value in validated_data.items():
        setattr(store, field, value)

    if address_data is not None:
        address = store.address
        for field, value in address_data.items():
            setattr(address, field, value)
        address.save()

        if address.latitude is None or address.longitude is None:
            ensure_address_coordinates(address)

    store.save()

    if business_hours_data is not None:
        store.business_hours.all().delete()
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
