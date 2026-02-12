from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.permissions import IsAuthenticated
from django.conf import settings

# Conditional permission for API documentation (public in DEBUG, private in production)
doc_permission = [] if settings.DEBUG else [IsAuthenticated]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/login/", TokenObtainPairView.as_view(), name="login"),
    path("api/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/users/", include("users.urls")),
    path("api/", include("studies.urls")),
    path('api/schema/', SpectacularAPIView.as_view(permission_classes=doc_permission), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=doc_permission), name='swagger-ui'),

]
