import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from stores.models import Category, Store, StoreStatus
from stores.services.store_registration import register_store

User = get_user_model()


@pytest.fixture
def food_category(db):
    return Category.objects.create(name="Alimentação")


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        email="admin@example.com",
        name="Admin User",
        password="senha1234",
        is_staff=True,
    )


@pytest.fixture
def merchant_user(db):
    return User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )


@pytest.fixture
def pending_store(food_category, merchant_user):
    return register_store(
        user=merchant_user,
        validated_data={
            "category_id": food_category.id,
            "name": "Padaria São José",
            "subcategory": "Padaria",
            "phone_number": "84999999999",
            "cover_photo_url": "https://example.com/cover.jpg",
            "logo_url": "https://example.com/logo.jpg",
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


def build_store_payload(category_id) -> dict:
    return {
        "category_id": str(category_id),
        "name": "Padaria São José",
        "subcategory": "Padaria artesanal",
        "phone_number": "11987654321",
        "address": {
            "street": "Rua das Flores",
            "number": "123",
            "complement": "",
            "district": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "zipcode": "01001000",
        },
        "business_hours": [
            {"weekday": "MONDAY", "opens_at": "08:00", "closes_at": "18:00"},
        ],
    }


@pytest.mark.django_db
def test_admin_summary_requires_staff(
    api_client: APIClient,
    merchant_user,
    pending_store,
) -> None:
    api_client.force_authenticate(user=merchant_user)
    response = api_client.get(reverse("admin-store-summary"))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_admin_summary_returns_counts(
    api_client: APIClient,
    staff_user,
    pending_store,
) -> None:
    api_client.force_authenticate(user=staff_user)
    response = api_client.get(reverse("admin-store-summary"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["pending"] == 1
    assert response.data["active"] == 0


@pytest.mark.django_db
def test_admin_store_list_filters_by_status(
    api_client: APIClient,
    staff_user,
    pending_store,
) -> None:
    api_client.force_authenticate(user=staff_user)
    response = api_client.get(reverse("admin-store-list"), {"status": "PENDING"})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Padaria São José"
    assert "address_summary" in response.data[0]


@pytest.mark.django_db
def test_admin_store_detail_includes_owner(
    api_client: APIClient,
    staff_user,
    pending_store,
    merchant_user,
) -> None:
    api_client.force_authenticate(user=staff_user)
    response = api_client.get(
        reverse("admin-store-detail", kwargs={"pk": pending_store.id})
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["owner"]["email"] == merchant_user.email
    assert len(response.data["business_hours"]) == 1


@pytest.mark.django_db
def test_admin_approve_store(
    api_client: APIClient,
    staff_user,
    pending_store,
) -> None:
    api_client.force_authenticate(user=staff_user)
    response = api_client.post(
        reverse("admin-store-approve", kwargs={"pk": pending_store.id})
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "ACTIVE"

    pending_store.refresh_from_db()
    assert pending_store.status == StoreStatus.ACTIVE
    assert pending_store.reviewed_by == staff_user


@pytest.mark.django_db
def test_admin_reject_store_requires_reason(
    api_client: APIClient,
    staff_user,
    pending_store,
) -> None:
    api_client.force_authenticate(user=staff_user)
    response = api_client.post(
        reverse("admin-store-reject", kwargs={"pk": pending_store.id}),
        {"rejection_reason": "Documentação incompleta"},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "REJECTED"

    pending_store.refresh_from_db()
    assert pending_store.status == StoreStatus.REJECTED
    assert pending_store.rejection_reason == "Documentação incompleta"


@pytest.mark.django_db
def test_admin_deactivate_active_store(
    api_client: APIClient,
    staff_user,
    pending_store,
) -> None:
    from stores.services.store_review import approve_store

    approve_store(store=pending_store, reviewer=staff_user)
    api_client.force_authenticate(user=staff_user)

    response = api_client.post(
        reverse("admin-store-deactivate", kwargs={"pk": pending_store.id})
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "INACTIVE"

    pending_store.refresh_from_db()
    assert pending_store.status == StoreStatus.INACTIVE


@pytest.mark.django_db
def test_admin_activate_inactive_store(
    api_client: APIClient,
    staff_user,
    pending_store,
) -> None:
    from stores.services.store_review import approve_store, deactivate_store

    approve_store(store=pending_store, reviewer=staff_user)
    deactivate_store(store=pending_store, reviewer=staff_user)
    api_client.force_authenticate(user=staff_user)

    response = api_client.post(
        reverse("admin-store-activate", kwargs={"pk": pending_store.id})
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "ACTIVE"

    pending_store.refresh_from_db()
    assert pending_store.status == StoreStatus.ACTIVE
