from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from core.views import health_check, MediaUploadView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", health_check, name="health"),
    path("api/v1/media/uploads/", MediaUploadView.as_view(), name="media-upload"),
    path("api/v1/", include("accounts.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
