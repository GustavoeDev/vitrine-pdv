from django.contrib import admin

from engagement.models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "store", "created_at")
