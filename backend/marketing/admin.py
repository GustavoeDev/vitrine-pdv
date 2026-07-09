from django.contrib import admin

from marketing.models import ProductDiscount


@admin.register(ProductDiscount)
class ProductDiscountAdmin(admin.ModelAdmin):
    list_display = ("product", "discounted_price", "is_active", "start_date", "end_date")
    list_filter = ("is_active",)
