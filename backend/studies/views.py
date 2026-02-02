from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import StudyPlan, Subject
from .serializers import (
    StudyPlanSerializer,
    CreateStudyPlanSerializer,
    SubjectSerializer
)
from .services import generate_study_sessions, get_dashboard_data


class StudyPlanViewSet(ModelViewSet):
    queryset = StudyPlan.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return CreateStudyPlanSerializer
        return StudyPlanSerializer

    def perform_create(self, serializer):
        plan = serializer.save()
        generate_study_sessions(plan)

    @action(detail=True, methods=["get"])
    def sessions(self, request, pk=None):
        plan = self.get_object()
        return Response(
            StudyPlanSerializer(plan).data,
            status=status.HTTP_200_OK
        )


class SubjectViewSet(ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class DashboardView(APIView):
    def get(self, request):
        data = get_dashboard_data()
        return Response(data)

class DashboardView(APIView):
    def get(self, request):
        data = get_dashboard_data()
        return Response(data, status=status.HTTP_200_OK)