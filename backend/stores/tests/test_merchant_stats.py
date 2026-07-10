from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Product, ProductView
from engagement.models import Favorite, Review
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
    approve_store(store=store, reviewer=staff)
    return store


@pytest.fixture
def owner_client(active_store):
    client = APIClient()
    client.force_authenticate(user=active_store.user)
    return client


@pytest.fixture
def product(active_store):
    return Product.objects.create(
        store=active_store,
        name="Pão caseiro",
        description="Pão artesanal",
        price="12.00",
        is_active=True,
    )


@pytest.mark.django_db
def test_merchant_stats_returns_metrics(owner_client, active_store, product):
    now = timezone.now()

    ProductView.objects.create(product=product, viewed_at=now - timedelta(days=1))
    ProductView.objects.create(product=product, viewed_at=now - timedelta(days=2))

    consumer = User.objects.create_user(
        email="cliente@example.com",
        name="Cliente",
        password="senha1234",
    )
    Favorite.objects.create(user=consumer, store=active_store)
    Review.objects.create(user=consumer, store=active_store, rating=5, comment="Ótimo!")

    url = reverse("merchant-stats")
    response = owner_client.get(url, {"range": "30d", "store_id": active_store.id})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["range"] == "30d"
    assert response.data["views"] == 2
    assert response.data["favorites"] == 1
    assert response.data["reviews_count"] == 1
    assert float(response.data["average_rating"]) == 5.0
    assert response.data["active_products"] == 1
    assert response.data["total_products"] == 1
    assert len(response.data["top_products"]) == 1
    assert response.data["top_products"][0]["name"] == "Pão caseiro"
    assert response.data["top_products"][0]["view_count"] == 2


@pytest.mark.django_db
def test_merchant_stats_rejects_invalid_range(owner_client, active_store):
    url = reverse("merchant-stats")
    response = owner_client.get(url, {"range": "1y", "store_id": active_store.id})

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_merchant_stats_requires_authentication(active_store):
    url = reverse("merchant-stats")
    client = APIClient()
    response = client.get(url, {"store_id": active_store.id})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
