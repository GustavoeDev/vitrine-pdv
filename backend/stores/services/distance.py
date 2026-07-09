from math import asin, cos, radians, sin, sqrt


def haversine_km(
    origin_lat: float,
    origin_lng: float,
    destination_lat: float,
    destination_lng: float,
) -> float:
    radius_km = 6371.0
    lat_delta = radians(destination_lat - origin_lat)
    lng_delta = radians(destination_lng - origin_lng)
    origin_lat_rad = radians(origin_lat)
    destination_lat_rad = radians(destination_lat)

    a = (
        sin(lat_delta / 2) ** 2
        + cos(origin_lat_rad) * cos(destination_lat_rad) * sin(lng_delta / 2) ** 2
    )
    c = 2 * asin(sqrt(a))

    return radius_km * c
