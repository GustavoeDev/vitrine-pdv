import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_media_upload_requires_authentication(api_client: APIClient) -> None:
    image = SimpleUploadedFile("avatar.jpg", b"fake-image", content_type="image/jpeg")
    response = api_client.post(
        reverse("media-upload"),
        {"file": image, "folder": "avatars"},
        format="multipart",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_media_upload_returns_public_url(api_client: APIClient) -> None:
    user = User.objects.create_user(
        email="maria@example.com",
        name="Maria Clara",
        password="senha1234",
    )
    api_client.force_authenticate(user=user)
    image = SimpleUploadedFile("avatar.jpg", b"fake-image", content_type="image/jpeg")

    response = api_client.post(
        reverse("media-upload"),
        {"file": image, "folder": "avatars"},
        format="multipart",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["url"].endswith(".jpg")
