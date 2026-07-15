from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from stores.models import Store, StoreStatus
from stores.services.address_coordinates import ensure_address_coordinates

User = get_user_model()


def _ensure_pending(store: Store) -> None:
    if store.status != StoreStatus.PENDING:
        raise ValidationError(
            {"status": "Somente estabelecimentos pendentes podem ser revisados."}
        )


def approve_store(*, store: Store, reviewer: User) -> Store:
    _ensure_pending(store)
    ensure_address_coordinates(store.address)
    store.status = StoreStatus.ACTIVE
    store.reviewed_by = reviewer
    store.reviewed_at = timezone.now()
    store.rejection_reason = ""
    store.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
        ]
    )
    return store


def reject_store(*, store: Store, reviewer: User, rejection_reason: str) -> Store:
    _ensure_pending(store)
    reason = rejection_reason.strip()
    if not reason:
        raise ValidationError(
            {"rejection_reason": "Informe o motivo da recusa."}
        )

    store.status = StoreStatus.REJECTED
    store.reviewed_by = reviewer
    store.reviewed_at = timezone.now()
    store.rejection_reason = reason
    store.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
        ]
    )
    return store


def deactivate_store(*, store: Store, reviewer: User) -> Store:
    if store.status != StoreStatus.ACTIVE:
        raise ValidationError(
            {"status": "Somente estabelecimentos ativos podem ser desativados."}
        )

    store.status = StoreStatus.INACTIVE
    store.reviewed_by = reviewer
    store.reviewed_at = timezone.now()
    store.save(update_fields=["status", "reviewed_by", "reviewed_at"])
    return store


def activate_store(*, store: Store, reviewer: User) -> Store:
    if store.status != StoreStatus.INACTIVE:
        raise ValidationError(
            {"status": "Somente estabelecimentos inativos podem ser reativados."}
        )

    ensure_address_coordinates(store.address)
    store.status = StoreStatus.ACTIVE
    store.reviewed_by = reviewer
    store.reviewed_at = timezone.now()
    store.rejection_reason = ""
    store.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
        ]
    )
    return store
