from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from .models import StudyPlan, Subject, StudySession
from .serializers import (
    StudyPlanSerializer,
    SubjectSerializer,
    StudySessionSerializer
)
from .services import generate_study_sessions, get_dashboard_data


class StudyPlanViewSet(ModelViewSet):
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SubjectViewSet(ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subject.objects.filter(plan__user=self.request.user)

    def perform_create(self, serializer):
        plan = serializer.validated_data["plan"]

        if plan.user != self.request.user:
            raise PermissionDenied("Você não pode adicionar matéria a esse plano.")

        serializer.save()

class StudySessionViewSet(ModelViewSet):
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(plan__user=self.request.user)

    def perform_create(self, serializer):
        plan = serializer.validated_data["plan"]

        if plan.user != self.request.user:
            raise PermissionDenied("Você não pode adicionar sessão a esse plano.")

        serializer.save()

class DashboardView(APIView):
    def get(self, request):
        data = get_dashboard_data()
        return Response(data)

class DashboardView(APIView):
    def get(self, request):
        data = get_dashboard_data()
        return Response(data, status=status.HTTP_200_OK)