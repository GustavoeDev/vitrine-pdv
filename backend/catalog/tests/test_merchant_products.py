import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Product
from marketing.models import ProductDiscount
from stores.models import Category, StoreStatus
from stores.services.store_registration import register_store
from stores.services.store_review import approve_store

User = get_user_model()


@pytest.fixture
def food_category(db):
    return Category.objects.create(name="Alimentação")


@pytest.fixture
def merchant_user(db, food_category):
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
    approve_store(store=store, reviewer=staff)
    return user


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="outro@example.com",
        name="Outro",
        password="senha1234",
    )


@pytest.mark.django_db
def test_merchant_product_list_requires_authentication(api_client: APIClient) -> None:
    response = api_client.get(reverse("merchant-product-list-create"))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_merchant_can_create_list_update_and_delete_products(
    api_client: APIClient,
    merchant_user,
) -> None:
    api_client.force_authenticate(user=merchant_user)

    create_response = api_client.post(
        reverse("merchant-product-list-create"),
        {
            "name": "Pão caseiro",
            "description": "Pão fresquinho",
            "price": "12.50",
            "photo_url": "https://example.com/pao.jpg",
            "is_active": True,
            "discounted_price": "10.00",
        },
        format="json",
    )

    assert create_response.status_code == status.HTTP_201_CREATED
    assert create_response.data["name"] == "Pão caseiro"
    assert create_response.data["view_count"] == 0
    assert create_response.data["active_discount"]["discounted_price"] == "10.00"

    product_id = create_response.data["id"]

    list_response = api_client.get(reverse("merchant-product-list-create"))
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.data) == 1

    patch_response = api_client.patch(
        reverse("merchant-product-detail", kwargs={"pk": product_id}),
        {"is_active": False},
        format="json",
    )
    assert patch_response.status_code == status.HTTP_200_OK
    assert patch_response.data["is_active"] is False

    delete_response = api_client.delete(
        reverse("merchant-product-detail", kwargs={"pk": product_id}),
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    assert Product.objects.count() == 0
    assert ProductDiscount.objects.count() == 0


@pytest.mark.django_db
def test_merchant_cannot_manage_other_store_products(
    api_client: APIClient,
    merchant_user,
    other_user,
    food_category,
) -> None:
    api_client.force_authenticate(user=merchant_user)
    create_response = api_client.post(
        reverse("merchant-product-list-create"),
        {
            "name": "Pão caseiro",
            "description": "Pão fresquinho",
            "price": "12.50",
            "photo_url": "https://example.com/pao.jpg",
            "is_active": True,
        },
        format="json",
    )
    product_id = create_response.data["id"]

    api_client.force_authenticate(user=other_user)

    patch_response = api_client.patch(
        reverse("merchant-product-detail", kwargs={"pk": product_id}),
        {"name": "Invadido"},
        format="json",
    )
    delete_response = api_client.delete(
        reverse("merchant-product-detail", kwargs={"pk": product_id}),
    )

    assert patch_response.status_code == status.HTTP_404_NOT_FOUND
    assert delete_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_user_without_store_cannot_create_products(
    api_client: APIClient,
    other_user,
) -> None:
    api_client.force_authenticate(user=other_user)

    response = api_client.post(
        reverse("merchant-product-list-create"),
        {
            "name": "Pão caseiro",
            "description": "Pão fresquinho",
            "price": "12.50",
            "photo_url": "https://example.com/pao.jpg",
            "is_active": True,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
