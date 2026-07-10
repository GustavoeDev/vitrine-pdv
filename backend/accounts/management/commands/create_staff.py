from django.core.management.base import BaseCommand

from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create or update a staff admin user for the mobile admin panel."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--name", default="Administrador")
        parser.add_argument("--password", required=True)

    def handle(self, *args, **options):
        email = options["email"].lower().strip()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "name": options["name"],
                "is_staff": True,
            },
        )

        user.name = options["name"]
        user.is_staff = True
        user.set_password(options["password"])
        user.save()

        action = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"Staff user {action}: {email}"))
