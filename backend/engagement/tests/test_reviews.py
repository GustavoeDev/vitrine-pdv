import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from engagement.models import Review
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
def test_consumer_can_create_store_review(
    api_client: APIClient,
    active_store,
    consumer_user,
) -> None:
    api_client.force_authenticate(user=consumer_user)

    response = api_client.post(
        reverse("store-review-list-create", kwargs={"store_id": active_store.id}),
        {"rating": 5, "comment": "Excelente atendimento"},
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["author_name"] == "Cliente"
    assert response.data["rating"] == 5
    assert Review.objects.filter(store=active_store).count() == 1


@pytest.mark.django_db
def test_store_owner_cannot_review_own_store(
    api_client: APIClient,
    active_store,
) -> None:
    api_client.force_authenticate(user=active_store.user)

    response = api_client.post(
        reverse("store-review-list-create", kwargs={"store_id": active_store.id}),
        {"rating": 5, "comment": "Minha loja é ótima"},
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert Review.objects.filter(store=active_store).count() == 0


@pytest.mark.django_db
def test_consumer_cannot_review_same_store_twice(
    api_client: APIClient,
    active_store,
    consumer_user,
) -> None:
    api_client.force_authenticate(user=consumer_user)

    first_response = api_client.post(
        reverse("store-review-list-create", kwargs={"store_id": active_store.id}),
        {"rating": 4, "comment": "Boa loja"},
        format="json",
    )
    second_response = api_client.post(
        reverse("store-review-list-create", kwargs={"store_id": active_store.id}),
        {"rating": 5, "comment": "Mudei de ideia"},
        format="json",
    )

    assert first_response.status_code == status.HTTP_201_CREATED
    assert second_response.status_code == status.HTTP_400_BAD_REQUEST
    assert Review.objects.filter(store=active_store, user=consumer_user).count() == 1


@pytest.mark.django_db
def test_store_detail_includes_review_summary(
    api_client: APIClient,
    active_store,
    consumer_user,
) -> None:
    Review.objects.create(
        user=consumer_user,
        store=active_store,
        rating=4,
        comment="Muito boa",
    )

    response = api_client.get(
        reverse("public-store-detail", kwargs={"pk": active_store.id}),
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["reviews_count"] == 1
    assert float(response.data["average_rating"]) == 4.0
