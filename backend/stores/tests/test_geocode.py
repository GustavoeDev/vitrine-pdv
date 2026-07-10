from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from stores.models import Category, Store

User = get_user_model()


@pytest.fixture
def food_category(db):
    return Category.objects.create(name="Alimentação")


@pytest.mark.django_db
def test_geocode_address_returns_coordinates(api_client: APIClient) -> None:
    with patch(
        "stores.views.geocode_address",
        return_value=(-6.126128, -38.208882),
    ):
        response = api_client.get(
            reverse("geocode-address"),
            {
                "street": "Rua Portugal",
                "number": "111",
                "district": "Centro",
                "city": "Pau dos Ferros",
                "state": "RN",
                "zipcode": "59900000",
            },
        )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["latitude"] == -6.126128
    assert response.data["longitude"] == -38.208882


@pytest.mark.django_db
def test_create_store_persists_client_coordinates(
    api_client: APIClient,
    food_category,
) -> None:
    user = User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )
    api_client.force_authenticate(user=user)

    payload = {
        "category_id": str(food_category.id),
        "name": "Padaria São José",
        "subcategory": "Padaria",
        "phone_number": "11987654321",
        "address": {
            "street": "Rua das Flores",
            "number": "123",
            "complement": "",
            "district": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "zipcode": "01001000",
            "latitude": -23.550520,
            "longitude": -46.633308,
        },
        "business_hours": [
            {"weekday": "MONDAY", "opens_at": "08:00", "closes_at": "18:00"},
        ],
    }

    with patch("stores.services.store_registration.ensure_address_coordinates") as geocode_mock:
        response = api_client.post(reverse("store-create"), payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    geocode_mock.assert_not_called()

    store = Store.objects.get(name="Padaria São José")
    assert float(store.address.latitude) == -23.55052
    assert float(store.address.longitude) == -46.633308


@pytest.mark.django_db
def test_create_store_rejects_coordinates_with_too_many_decimal_places(
    api_client: APIClient,
    food_category,
) -> None:
    user = User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )
    api_client.force_authenticate(user=user)

    payload = {
        "category_id": str(food_category.id),
        "name": "Padaria São José",
        "subcategory": "Padaria",
        "phone_number": "11987654321",
        "address": {
            "street": "Rua das Flores",
            "number": "123",
            "complement": "",
            "district": "Centro",
            "city": "Pau dos Ferros",
            "state": "RN",
            "zipcode": "59900000",
            "latitude": -6.1463062,
            "longitude": -38.2044744,
        },
        "business_hours": [
            {"weekday": "MONDAY", "opens_at": "08:00", "closes_at": "18:00"},
        ],
    }

    response = api_client.post(reverse("store-create"), payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "latitude" in response.data["address"]
    assert "longitude" in response.data["address"]


@pytest.mark.django_db
def test_create_store_accepts_coordinates_rounded_to_six_decimal_places(
    api_client: APIClient,
    food_category,
) -> None:
    user = User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )
    api_client.force_authenticate(user=user)

    payload = {
        "category_id": str(food_category.id),
        "name": "Padaria São José",
        "subcategory": "Padaria",
        "phone_number": "11987654321",
        "address": {
            "street": "Rua das Flores",
            "number": "123",
            "complement": "",
            "district": "Centro",
            "city": "Pau dos Ferros",
            "state": "RN",
            "zipcode": "59900000",
            "latitude": -6.146306,
            "longitude": -38.204474,
        },
        "business_hours": [
            {"weekday": "MONDAY", "opens_at": "08:00", "closes_at": "18:00"},
        ],
    }

    with patch("stores.services.store_registration.ensure_address_coordinates"):
        response = api_client.post(reverse("store-create"), payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
