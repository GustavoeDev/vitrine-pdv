from django.contrib import admin

from catalog.models import Product, ProductView


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "store", "price", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "store__name")


@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ("product", "viewed_at")
    list_filter = ("viewed_at",)
    search_fields = ("product__name",)
