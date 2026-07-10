from datetime import timedelta

from django.db.models import Avg, Count, Q
from django.utils import timezone

from catalog.models import Product, ProductView
from engagement.models import Favorite, Review
from stores.models import Store

RANGE_DAYS = {
    "7d": 7,
    "30d": 30,
    "3m": 90,
}


def _format_delta_label(*, current: int, previous: int) -> str:
    if previous == 0:
        if current == 0:
            return "Sem variacao vs periodo anterior"
        return "Novo no periodo"

    change = ((current - previous) / previous) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.0f}% vs periodo anterior"


def get_merchant_stats(*, store: Store, range_key: str) -> dict:
    days = RANGE_DAYS[range_key]
    now = timezone.now()
    period_start = now - timedelta(days=days)
    previous_start = now - timedelta(days=days * 2)

    views = ProductView.objects.filter(
        product__store=store,
        viewed_at__gte=period_start,
    ).count()
    previous_views = ProductView.objects.filter(
        product__store=store,
        viewed_at__gte=previous_start,
        viewed_at__lt=period_start,
    ).count()

    favorites = Favorite.objects.filter(
        store=store,
        created_at__gte=period_start,
    ).count()
    previous_favorites = Favorite.objects.filter(
        store=store,
        created_at__gte=previous_start,
        created_at__lt=period_start,
    ).count()

    products = Product.objects.filter(store=store)
    active_products = products.filter(is_active=True).count()
    total_products = products.count()

    review_stats = Review.objects.filter(store=store).aggregate(
        average_rating=Avg("rating"),
        reviews_count=Count("id"),
    )

    top_products = (
        products.annotate(
            view_count=Count(
                "views",
                filter=Q(views__viewed_at__gte=period_start),
            ),
        )
        .order_by("-view_count", "name")
        .values("id", "name", "view_count")[:10]
    )

    average_rating = review_stats["average_rating"]

    return {
        "range": range_key,
        "views": views,
        "views_delta": _format_delta_label(current=views, previous=previous_views),
        "favorites": favorites,
        "favorites_delta": _format_delta_label(current=favorites, previous=previous_favorites),
        "active_products": active_products,
        "total_products": total_products,
        "average_rating": round(float(average_rating), 2) if average_rating is not None else None,
        "reviews_count": review_stats["reviews_count"] or 0,
        "top_products": list(top_products),
    }
