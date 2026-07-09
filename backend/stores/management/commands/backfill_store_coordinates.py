from django.core.management.base import BaseCommand

from stores.models import Address, Store, StoreStatus
from stores.services.address_coordinates import ensure_address_coordinates


class Command(BaseCommand):
    help = "Geocode store addresses that are missing latitude/longitude."

    def add_arguments(self, parser):
        parser.add_argument(
            "--active-only",
            action="store_true",
            help="Only process active stores.",
        )

    def handle(self, *args, **options):
        addresses = Address.objects.filter(
            latitude__isnull=True,
            longitude__isnull=True,
        ).select_related("store")

        if options["active_only"]:
            addresses = addresses.filter(store__status=StoreStatus.ACTIVE)

        updated = 0
        failed = 0

        for address in addresses:
            store_name = getattr(address, "store", None)
            label = store_name.name if isinstance(store_name, Store) else str(address.id)

            if ensure_address_coordinates(address):
                updated += 1
                self.stdout.write(self.style.SUCCESS(f"Geocoded: {label}"))
            else:
                failed += 1
                self.stdout.write(self.style.WARNING(f"Could not geocode: {label}"))

        self.stdout.write(
            self.style.SUCCESS(f"Done. Updated={updated} Failed={failed}")
        )
