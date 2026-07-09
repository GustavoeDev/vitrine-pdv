import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Product, ProductView
from marketing.models import ProductDiscount
from stores.models import Category, StoreStatus
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


@pytest.fixture
def active_product(active_store):
    return Product.objects.create(
        store=active_store,
        name="Pão caseiro",
        description="Pão fresquinho",
        price="12.50",
        photo_url="https://example.com/pao.jpg",
    )


@pytest.mark.django_db
def test_store_product_list_returns_only_active_products(
    api_client: APIClient,
    active_store,
    active_product,
) -> None:
    Product.objects.create(
        store=active_store,
        name="Bolo inativo",
        price="20.00",
        is_active=False,
    )

    response = api_client.get(
        reverse("store-product-list", kwargs={"store_id": active_store.id}),
    )

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Pão caseiro"
    assert response.data[0]["store_name"] == "Padaria São José"


@pytest.mark.django_db
def test_store_product_list_includes_active_discount(
    api_client: APIClient,
    active_store,
    active_product,
) -> None:
    from django.utils import timezone
    from datetime import timedelta

    now = timezone.now()
    ProductDiscount.objects.create(
        product=active_product,
        original_price=active_product.price,
        discounted_price="9.90",
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=7),
        is_active=True,
    )

    response = api_client.get(
        reverse("store-product-list", kwargs={"store_id": active_store.id}),
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]["active_discount"] is not None
    assert response.data[0]["active_discount"]["discounted_price"] == "9.90"


@pytest.mark.django_db
def test_store_product_list_hides_products_from_inactive_store(
    api_client: APIClient,
    active_store,
    active_product,
) -> None:
    active_store.status = StoreStatus.INACTIVE
    active_store.save(update_fields=["status"])

    response = api_client.get(
        reverse("store-product-list", kwargs={"store_id": active_store.id}),
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data == []


@pytest.mark.django_db
def test_product_detail_returns_active_product(
    api_client: APIClient,
    active_product,
) -> None:
    response = api_client.get(
        reverse("product-detail", kwargs={"pk": active_product.id}),
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Pão caseiro"
    assert response.data["category_name"] == "Alimentação"
    assert response.data["description"] == "Pão fresquinho"


@pytest.mark.django_db
def test_product_detail_hides_inactive_product(
    api_client: APIClient,
    active_product,
) -> None:
    active_product.is_active = False
    active_product.save(update_fields=["is_active"])

    response = api_client.get(
        reverse("product-detail", kwargs={"pk": active_product.id}),
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_product_detail_hides_product_from_inactive_store(
    api_client: APIClient,
    active_store,
    active_product,
) -> None:
    active_store.status = StoreStatus.INACTIVE
    active_store.save(update_fields=["status"])

    response = api_client.get(
        reverse("product-detail", kwargs={"pk": active_product.id}),
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_record_product_view_creates_analytics_row(
    api_client: APIClient,
    active_product,
) -> None:
    response = api_client.post(
        reverse("product-view-create", kwargs={"pk": active_product.id}),
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert ProductView.objects.filter(product=active_product).count() == 1


@pytest.mark.django_db
def test_record_product_view_rejects_inactive_product(
    api_client: APIClient,
    active_product,
) -> None:
    active_product.is_active = False
    active_product.save(update_fields=["is_active"])

    response = api_client.post(
        reverse("product-view-create", kwargs={"pk": active_product.id}),
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert ProductView.objects.count() == 0
