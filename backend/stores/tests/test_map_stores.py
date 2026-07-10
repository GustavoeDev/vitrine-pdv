import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from stores.models import Category, StoreStatus
from stores.services.store_registration import register_store
from stores.services.store_review import approve_store

User = get_user_model()


@pytest.fixture
def food_category(db):
    return Category.objects.create(name="Alimentação")


@pytest.fixture
def active_store_with_location(food_category, db):
    user = User.objects.create_user(
        email="loja@example.com",
        name="Loja Owner",
        password="senha1234",
    )
    store = register_store(
        user=user,
        validated_data={
            "category_id": food_category.id,
            "name": "Padaria São José",
            "subcategory": "Padaria",
            "phone_number": "84999999999",
            "address": {
                "street": "Rua Principal",
                "number": "123",
                "complement": "",
                "district": "Centro",
                "city": "Natal",
                "state": "RN",
                "zipcode": "59000000",
            },
            "business_hours": [
                {"weekday": "MONDAY", "opens_at": "08:00", "closes_at": "18:00"},
            ],
        },
    )
    store.address.latitude = -5.794500
    store.address.longitude = -35.211000
    store.address.save(update_fields=["latitude", "longitude"])

    staff = User.objects.create_user(
        email="admin@example.com",
        name="Admin",
        password="senha1234",
        is_staff=True,
    )
    return approve_store(store=store, reviewer=staff)


@pytest.mark.django_db
def test_public_store_list_with_location_returns_coordinates(
    api_client: APIClient,
    active_store_with_location,
) -> None:
    response = api_client.get(
        reverse("public-store-list"),
        {"with_location": "true"},
    )

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["latitude"] == "-5.794500"
    assert response.data[0]["longitude"] == "-35.211000"


@pytest.mark.django_db
def test_public_store_list_sorts_by_distance_when_lat_lng_provided(
    api_client: APIClient,
    food_category,
    active_store_with_location,
) -> None:
    user = User.objects.create_user(
        email="far@example.com",
        name="Far Owner",
        password="senha1234",
    )
    far_store = register_store(
        user=user,
        validated_data={
            "category_id": food_category.id,
            "name": "Loja Distante",
            "subcategory": "Mercado",
            "phone_number": "84999999998",
            "address": {
                "street": "Rua B",
                "number": "2",
                "complement": "",
                "district": "Centro",
                "city": "Natal",
                "state": "RN",
                "zipcode": "59000000",
            },
            "business_hours": [
                {"weekday": "MONDAY", "opens_at": "08:00", "closes_at": "18:00"},
            ],
        },
    )
    far_store.address.latitude = -5.900000
    far_store.address.longitude = -35.300000
    far_store.address.save(update_fields=["latitude", "longitude"])

    staff = User.objects.create_user(
        email="admin2@example.com",
        name="Admin",
        password="senha1234",
        is_staff=True,
    )
    approve_store(store=far_store, reviewer=staff)

    response = api_client.get(
        reverse("public-store-list"),
        {
            "with_location": "true",
            "lat": "-5.795000",
            "lng": "-35.212000",
        },
    )

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2
    assert response.data[0]["name"] == "Padaria São José"
    assert response.data[0]["distance_km"] is not None
    assert response.data[1]["name"] == "Loja Distante"
