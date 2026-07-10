import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from stores.models import Category


@pytest.fixture
def seeded_categories(db):
    food = Category.objects.create(name="Alimentação")
    Category.objects.create(parent=food, name="Padarias")
    Category.objects.create(parent=food, name="Mercados")
    Category.objects.create(name="Vestuário")
    return food


@pytest.mark.django_db
def test_category_list_is_public(api_client: APIClient, seeded_categories) -> None:
    response = api_client.get(reverse("category-list"))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2

    food_payload = next(item for item in response.data if item["name"] == "Alimentação")
    assert len(food_payload["children"]) == 2
    assert food_payload["children"][0]["name"] in {"Padarias", "Mercados"}


@pytest.mark.django_db
def test_category_detail_returns_children(api_client: APIClient, seeded_categories) -> None:
    response = api_client.get(reverse("category-detail", kwargs={"pk": seeded_categories.id}))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Alimentação"
    assert len(response.data["children"]) == 2


@pytest.mark.django_db
def test_category_list_does_not_include_subcategories_as_roots(
    api_client: APIClient,
    seeded_categories,
) -> None:
    response = api_client.get(reverse("category-list"))
    root_names = {item["name"] for item in response.data}

    assert "Padarias" not in root_names
    assert "Mercados" not in root_names
