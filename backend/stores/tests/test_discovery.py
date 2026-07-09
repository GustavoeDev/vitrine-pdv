import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Product
from stores.models import Category, Store, StoreStatus
from stores.services.store_registration import register_store
from stores.services.store_review import approve_store

User = get_user_model()


@pytest.fixture
def food_category(db):
    return Category.objects.create(name="Alimentação")


@pytest.fixture
def active_store(food_category, db):
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
    staff = User.objects.create_user(
        email="admin@example.com",
        name="Admin",
        password="senha1234",
        is_staff=True,
    )
    return approve_store(store=store, reviewer=staff)


@pytest.mark.django_db
def test_public_store_list_returns_only_active_stores(
    api_client: APIClient,
    active_store,
    food_category,
) -> None:
    user = User.objects.create_user(
        email="pending@example.com",
        name="Pending",
        password="senha1234",
    )
    register_store(
        user=user,
        validated_data={
            "category_id": food_category.id,
            "name": "Loja Pendente",
            "subcategory": "Padaria",
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

    response = api_client.get(reverse("public-store-list"))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Padaria São José"


@pytest.mark.django_db
def test_search_returns_store_and_product_matches(
    api_client: APIClient,
    active_store,
) -> None:
    Product.objects.create(
        store=active_store,
        name="Pão caseiro",
        price="12.50",
    )

    store_response = api_client.get(reverse("search"), {"q": "Padaria"})
    product_response = api_client.get(reverse("search"), {"q": "Pão"})

    assert store_response.status_code == status.HTTP_200_OK
    assert any(item["type"] == "store" for item in store_response.data)

    assert product_response.status_code == status.HTTP_200_OK
    assert any(item["type"] == "product" for item in product_response.data)
