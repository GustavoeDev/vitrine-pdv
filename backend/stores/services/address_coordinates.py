from stores.models import Address
from stores.services.geocoding import geocode_address


def ensure_address_coordinates(address: Address) -> bool:
    if address.latitude is not None and address.longitude is not None:
        return False

    coordinates = geocode_address(address)
    if not coordinates:
        return False

    address.latitude, address.longitude = coordinates
    address.save(update_fields=["latitude", "longitude"])
    return True
