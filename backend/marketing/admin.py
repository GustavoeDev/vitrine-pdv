from django.contrib import admin

from marketing.models import ProductDiscount, Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ("title", "store", "status", "start_date", "end_date")
    list_filter = ("status",)


@admin.register(ProductDiscount)
class ProductDiscountAdmin(admin.ModelAdmin):
    list_display = ("product", "discounted_price", "is_active", "start_date", "end_date")
    list_filter = ("is_active",)
