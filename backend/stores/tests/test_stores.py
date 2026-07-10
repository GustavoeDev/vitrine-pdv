import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from stores.models import Address, BusinessHour, Category, Store

User = get_user_model()


@pytest.fixture
def food_category(db):
    return Category.objects.create(name="Alimentação")


@pytest.fixture
def authenticated_user(api_client: APIClient):
    user = User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )
    api_client.force_authenticate(user=user)
    return user


def build_store_payload(category_id) -> dict:
    return {
        "category_id": str(category_id),
        "name": "Padaria São José",
        "subcategory": "Padaria artesanal",
        "phone_number": "11987654321",
        "cover_photo_url": "https://example.com/cover.jpg",
        "logo_url": "https://example.com/logo.jpg",
        "address": {
            "street": "Rua das Flores",
            "number": "123",
            "complement": "Loja 1",
            "district": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "zipcode": "01001000",
        },
        "business_hours": [
            {"weekday": "MONDAY", "opens_at": "08:00", "closes_at": "18:00"},
            {"weekday": "SATURDAY", "opens_at": "09:00", "closes_at": "13:00"},
        ],
    }


@pytest.mark.django_db
def test_create_store_requires_authentication(
    api_client: APIClient,
    food_category,
) -> None:
    response = api_client.post(
        reverse("store-create"),
        build_store_payload(food_category.id),
        format="json",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_create_store_registers_address_hours_and_pending_status(
    api_client: APIClient,
    authenticated_user,
    food_category,
) -> None:
    payload = build_store_payload(food_category.id)

    response = api_client.post(reverse("store-create"), payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["name"] == "Padaria São José"
    assert response.data["status"] == "PENDING"
    assert response.data["category_name"] == "Alimentação"
    assert len(response.data["business_hours"]) == 2

    store = Store.objects.get(id=response.data["id"])
    assert store.user == authenticated_user
    assert Address.objects.filter(id=store.address_id).exists()
    assert BusinessHour.objects.filter(store=store).count() == 2


@pytest.mark.django_db
def test_create_store_rejects_invalid_category(
    api_client: APIClient,
    authenticated_user,
) -> None:
    payload = build_store_payload("00000000-0000-0000-0000-000000000001")

    response = api_client.post(reverse("store-create"), payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "category_id" in response.data


@pytest.mark.django_db
def test_me_includes_user_stores(
    api_client: APIClient,
    authenticated_user,
    food_category,
) -> None:
    api_client.post(
        reverse("store-create"),
        build_store_payload(food_category.id),
        format="json",
    )

    response = api_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["stores"]) == 1
    assert response.data["stores"][0]["name"] == "Padaria São José"
    assert response.data["stores"][0]["status"] == "PENDING"
