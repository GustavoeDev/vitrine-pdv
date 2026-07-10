from django.contrib import admin

from engagement.models import Favorite, Notification, Review


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "store", "notifications_enabled", "created_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("store", "user", "rating", "created_at")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "audience", "notification_type", "title", "is_read", "created_at")
