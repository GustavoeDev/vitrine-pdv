from django.core.management.base import BaseCommand

from stores.models import Category

CATEGORY_TREE: list[dict] = [
    {
        "name": "Alimentação",
        "children": ["Padarias", "Mercados", "Doces", "Fazendas", "Bebidas"],
    },
    {"name": "Vestuário", "children": []},
    {"name": "Saúde", "children": []},
    {"name": "Pet", "children": []},
    {"name": "Casa", "children": []},
]


class Command(BaseCommand):
    help = "Seed default store categories and subcategories."

    def handle(self, *args, **options):
        created_count = 0

        for entry in CATEGORY_TREE:
            parent, parent_created = Category.objects.get_or_create(
                parent=None,
                name=entry["name"],
            )
            if parent_created:
                created_count += 1

            for child_name in entry["children"]:
                _, child_created = Category.objects.get_or_create(
                    parent=parent,
                    name=child_name,
                )
                if child_created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Categories ready. {created_count} new record(s) created."
            )
        )
