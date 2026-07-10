import json
import urllib.error
import urllib.parse
import urllib.request

from stores.models import Address

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "VitrinePDV/1.0 (contact@vitrinepdv.local)"


def geocode_address(address: Address) -> tuple[float, float] | None:
    query = urllib.parse.urlencode(
        {
            "street": f"{address.street} {address.number}",
            "city": address.city,
            "state": address.state,
            "country": "Brazil",
            "postalcode": address.zipcode,
            "format": "json",
            "limit": 1,
        }
    )

    request = urllib.request.Request(
        f"{NOMINATIM_URL}?{query}",
        headers={"User-Agent": USER_AGENT},
    )

    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None

    if not payload:
        return None

    try:
        latitude = float(payload[0]["lat"])
        longitude = float(payload[0]["lon"])
    except (KeyError, TypeError, ValueError):
        return None

    return latitude, longitude
