import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Product
from engagement.models import Favorite
from marketing.models import ProductDiscount, PromotionStatus
from stores.models import Category
from stores.services.store_registration import register_store
from stores.services.store_review import approve_store

User = get_user_model()


@pytest.fixture
def food_category(db):
    return Category.objects.create(name="Alimentação")


@pytest.fixture
def active_store(food_category, db):
    owner = User.objects.create_user(
        email="loja@example.com",
        name="Loja Owner",
        password="senha1234",
    )
    store = register_store(
        user=owner,
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


@pytest.fixture
def consumer_user(db):
    return User.objects.create_user(
        email="cliente@example.com",
        name="Cliente",
        password="senha1234",
    )


@pytest.mark.django_db
def test_favorites_list_requires_authentication(api_client: APIClient) -> None:
    response = api_client.get(reverse("favorite-list-create"))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_user_can_add_list_and_remove_favorites(
    api_client: APIClient,
    active_store,
    consumer_user,
) -> None:
    api_client.force_authenticate(user=consumer_user)

    create_response = api_client.post(
        reverse("favorite-list-create"),
        {"store_id": str(active_store.id)},
        format="json",
    )

    assert create_response.status_code == status.HTTP_201_CREATED
    assert create_response.data["id"] == str(active_store.id)
    assert create_response.data["has_active_promotion"] is False

    list_response = api_client.get(reverse("favorite-list-create"))

    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.data) == 1
    assert list_response.data[0]["name"] == "Padaria São José"

    delete_response = api_client.delete(
        reverse("favorite-destroy", kwargs={"store_id": active_store.id}),
    )

    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    assert Favorite.objects.filter(user=consumer_user).count() == 0


@pytest.mark.django_db
def test_favorite_store_reports_active_promotion(
    api_client: APIClient,
    active_store,
    consumer_user,
) -> None:
    now = timezone.now()
    ProductDiscount.objects.create(
        product=Product.objects.create(
            store=active_store,
            name="Bolo",
            price="20.00",
        ),
        original_price="20.00",
        discounted_price="15.00",
        start_date=now,
        end_date=now + timezone.timedelta(days=2),
        is_active=True,
    )

    api_client.force_authenticate(user=consumer_user)
    response = api_client.post(
        reverse("favorite-list-create"),
        {"store_id": str(active_store.id)},
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["has_active_promotion"] is True
