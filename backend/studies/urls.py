from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudyPlanViewSet,
    SubjectViewSet,
    CreateStudyPlanView,
    MyStudyPlanView,
    DailyProgressView
)

router = DefaultRouter()
router.register("plans", StudyPlanViewSet, basename="plans")
router.register("subjects", SubjectViewSet, basename="subjects")

urlpatterns = [
    path("", include(router.urls)),
    path("study-plans/", CreateStudyPlanView.as_view(), name="create-study-plan"),
    path("study-plans/my-plan/", MyStudyPlanView.as_view(), name="my-study-plan"),
    path("daily-progress/", DailyProgressView.as_view(), name="daily-progress"),
]
