from django.urls import path
from .views import LoginOrRegisterView

urlpatterns = [
    path("auth/", LoginOrRegisterView.as_view(), name="auth"),
]
