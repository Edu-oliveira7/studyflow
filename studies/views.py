from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import StudyPlan, Subject
from .serializers import (
    StudyPlanSerializer,
    SubjectSerializer,
    CreateStudyPlanSerializer,
)
from .services import generate_study_sessions


class StudyPlanViewSet(ModelViewSet):
    queryset = StudyPlan.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return CreateStudyPlanSerializer
        return StudyPlanSerializer

    @action(detail=True, methods=["post"])
    def generate(self, request, pk=None):
        plan = self.get_object()
        generate_study_sessions(plan)
        return Response({"status": "Plano gerado com sucesso 🚀"})


class SubjectViewSet(ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
