import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
def test_register_creates_user_and_returns_tokens(api_client: APIClient) -> None:
    payload = {
        "name": "Maria Clara",
        "email": "maria@example.com",
        "password": "senha1234",
        "password_confirm": "senha1234",
    }

    response = api_client.post(reverse("auth-register"), payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["email"] == "maria@example.com"
    assert User.objects.filter(email="maria@example.com").exists()


@pytest.mark.django_db
def test_register_rejects_password_mismatch(api_client: APIClient) -> None:
    payload = {
        "name": "Maria Clara",
        "email": "maria@example.com",
        "password": "senha1234",
        "password_confirm": "outra1234",
    }

    response = api_client.post(reverse("auth-register"), payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password_confirm" in response.data


@pytest.mark.django_db
def test_login_returns_tokens(api_client: APIClient) -> None:
    User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )

    response = api_client.post(
        reverse("auth-login"),
        {"email": "maria@example.com", "password": "senha1234"},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_me_requires_authentication(api_client: APIClient) -> None:
    response = api_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_me_returns_current_user(api_client: APIClient) -> None:
    user = User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )
    api_client.force_authenticate(user=user)

    response = api_client.get(reverse("users-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["email"] == "maria@example.com"
    assert response.data["name"] == "Maria Clara"


@pytest.mark.django_db
def test_me_patch_updates_profile(api_client: APIClient) -> None:
    user = User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )
    api_client.force_authenticate(user=user)

    response = api_client.patch(
        reverse("users-me"),
        {"name": "Maria Silva", "notifications_enabled": False},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Maria Silva"
    assert response.data["notifications_enabled"] is False
