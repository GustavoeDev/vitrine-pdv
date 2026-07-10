from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from engagement.models import Review
from engagement.services.notifications import dispatch_store_review_notification
from stores.models import Store, StoreStatus


def _ensure_reviewable_store(*, user, store: Store) -> None:
    if store.status != StoreStatus.ACTIVE:
        raise ValidationError({"store_id": "Apenas lojas ativas podem ser avaliadas."})

    if store.user_id == user.id:
        raise ValidationError({"detail": "Você não pode avaliar sua própria loja."})


@transaction.atomic
def create_store_review(*, user, store: Store, rating: int, comment: str = "") -> Review:
    _ensure_reviewable_store(user=user, store=store)

    if Review.objects.filter(user=user, store=store).exists():
        raise ValidationError({"detail": "Você já avaliou esta loja."})

    review = Review.objects.create(
        user=user,
        store=store,
        rating=rating,
        comment=comment,
    )
    review = Review.objects.select_related("user", "store", "store__user").get(pk=review.pk)
    dispatch_store_review_notification(review=review)
    return review


@transaction.atomic
def update_store_review(*, user, store: Store, rating: int, comment: str = "") -> Review:
    _ensure_reviewable_store(user=user, store=store)

    review = get_object_or_404(Review, user=user, store=store)
    review.rating = rating
    review.comment = comment
    review.save(update_fields=["rating", "comment", "updated_at"])
    return review
