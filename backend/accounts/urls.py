from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import ChangePasswordView, EmailTokenObtainPairView, MeView, RegisterView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("users/me/", MeView.as_view(), name="users-me"),
    path("users/me/change-password/", ChangePasswordView.as_view(), name="users-change-password"),
]
