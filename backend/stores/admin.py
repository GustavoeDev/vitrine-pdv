from django.contrib import admin

from stores.models import Address, BusinessHour, Category, Store


class CategoryChildInline(admin.TabularInline):
    model = Category
    fk_name = "parent"
    extra = 1
    fields = ("name", "photo_url")
    show_change_link = True


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "children_count", "id")
    list_filter = ("parent",)
    search_fields = ("name",)
    autocomplete_fields = ("parent",)
    fields = ("name", "parent", "photo_url")
    inlines = [CategoryChildInline]

    @admin.display(description="Subcategorias")
    def children_count(self, obj: Category) -> int:
        return obj.children.count()


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("street", "number", "city", "state")
    search_fields = ("street", "city", "district")


class BusinessHourInline(admin.TabularInline):
    model = BusinessHour
    extra = 0


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "category", "status", "created_at")
    list_filter = ("status", "category")
    search_fields = ("name", "user__email")
    inlines = [BusinessHourInline]
