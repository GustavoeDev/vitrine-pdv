from django.db import transaction

from accounts.models import User


@transaction.atomic
def register_user(*, name: str, email: str, password: str) -> User:
    return User.objects.create_user(
        email=email.lower(),
        name=name.strip(),
        password=password,
    )
