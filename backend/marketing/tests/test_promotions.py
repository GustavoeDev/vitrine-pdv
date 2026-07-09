import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Product
from engagement.models import Favorite
from marketing.models import Promotion, PromotionStatus
from marketing.serializers import serialize_daily_promotion
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
def test_featured_promotion_returns_active_daily_promotion(
    api_client: APIClient,
    active_store,
) -> None:
    now = timezone.now()
    promotion = Promotion.objects.create(
        store=active_store,
        title="Café da manhã especial",
        description="Oferta matinal",
        banner_url="https://example.com/banner.jpg",
        start_date=now,
        end_date=now + timezone.timedelta(days=2),
        status=PromotionStatus.ACTIVE,
    )

    response = api_client.get(reverse("promotion-featured"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == str(promotion.id)
    assert response.data["promotion_type"] == "daily"
    assert response.data["title"] == "Café da manhã especial"


@pytest.mark.django_db
def test_valid_until_uses_local_timezone_for_end_of_day(
    active_store,
) -> None:
    fortaleza = timezone.get_current_timezone()
    end_date = timezone.make_aware(
        timezone.datetime(2026, 7, 17, 23, 59, 59),
        fortaleza,
    )

    promotion = Promotion.objects.create(
        store=active_store,
        title="Promoção de verão",
        description="Oferta especial",
        start_date=timezone.make_aware(timezone.datetime(2026, 7, 9, 0, 0, 0), fortaleza),
        end_date=end_date,
        status=PromotionStatus.ACTIVE,
    )

    payload = serialize_daily_promotion(promotion)

    assert payload["valid_until"] == "17/07/2026"


@pytest.mark.django_db
def test_merchant_can_create_daily_and_product_discount_promotions(
    api_client: APIClient,
    active_store,
    active_product,
) -> None:
    api_client.force_authenticate(user=active_store.user)
    now = timezone.now()

    daily_response = api_client.post(
        reverse("merchant-promotion-list-create"),
        {
            "promotion_type": "daily",
            "title": "Promo do dia",
            "description": "Detalhes",
            "start_date": now.isoformat(),
            "end_date": (now + timezone.timedelta(days=3)).isoformat(),
            "notify_favorites": True,
        },
        format="json",
    )

    assert daily_response.status_code == status.HTTP_201_CREATED
    assert daily_response.data["promotion_type"] == "daily"
    assert daily_response.data["status"] == PromotionStatus.ACTIVE

    discount_response = api_client.post(
        reverse("merchant-promotion-list-create"),
        {
            "promotion_type": "product-discount",
            "product_id": str(active_product.id),
            "discount_total": "2.50",
            "start_date": now.isoformat(),
            "end_date": (now + timezone.timedelta(days=5)).isoformat(),
        },
        format="json",
    )

    assert discount_response.status_code == status.HTTP_201_CREATED
    assert discount_response.data["promotion_type"] == "product-discount"
    assert discount_response.data["discounted_price"] == "10.00"


@pytest.mark.django_db
def test_favorite_product_promotions_require_authentication(
    api_client: APIClient,
) -> None:
    response = api_client.get(reverse("promotion-favorites"))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_favorite_product_promotions_return_discounts_from_favorited_stores(
    api_client: APIClient,
    active_store,
    active_product,
    consumer_user,
) -> None:
    Favorite.objects.create(user=consumer_user, store=active_store)
    now = timezone.now()

    api_client.force_authenticate(user=active_store.user)
    api_client.post(
        reverse("merchant-promotion-list-create"),
        {
            "promotion_type": "product-discount",
            "product_id": str(active_product.id),
            "discounted_price": "9.90",
            "start_date": now.isoformat(),
            "end_date": (now + timezone.timedelta(days=4)).isoformat(),
        },
        format="json",
    )

    api_client.force_authenticate(user=consumer_user)
    response = api_client.get(reverse("promotion-favorites"))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["promotion_type"] == "product-discount"
    assert response.data[0]["product_id"] == str(active_product.id)


@pytest.mark.django_db
def test_merchant_can_update_daily_promotion(
    api_client: APIClient,
    active_store,
) -> None:
    api_client.force_authenticate(user=active_store.user)
    now = timezone.now()

    create_response = api_client.post(
        reverse("merchant-promotion-list-create"),
        {
            "promotion_type": "daily",
            "title": "Promo antiga",
            "description": "Detalhes antigos",
            "start_date": now.isoformat(),
            "end_date": (now + timezone.timedelta(days=2)).isoformat(),
            "notify_favorites": False,
        },
        format="json",
    )

    promotion_id = create_response.data["id"]

    update_response = api_client.patch(
        reverse("merchant-promotion-detail", kwargs={"pk": promotion_id}),
        {
            "promotion_type": "daily",
            "title": "Promo atualizada",
            "description": "Novos detalhes",
        },
        format="json",
    )

    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.data["title"] == "Promo atualizada"
    assert update_response.data["description"] == "Novos detalhes"
