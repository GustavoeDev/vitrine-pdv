from django.contrib import admin

from engagement.models import Favorite, Review


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "store", "created_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("store", "user", "rating", "created_at")
