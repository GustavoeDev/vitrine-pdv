from django.contrib import admin

from catalog.models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "store", "price", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "store__name")
