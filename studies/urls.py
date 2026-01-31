from rest_framework.routers import DefaultRouter
from .views import StudyPlanViewSet, SubjectViewSet

router = DefaultRouter()
router.register("plans", StudyPlanViewSet)
router.register("subjects", SubjectViewSet)

urlpatterns = router.urls
