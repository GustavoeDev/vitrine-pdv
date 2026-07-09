from django.contrib import admin

from stores.models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "id")
    list_filter = ("parent",)
    search_fields = ("name",)
