from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import LoginOrRegisterView

urlpatterns = [
    path("auth/", LoginOrRegisterView.as_view(), name="auth"),
]