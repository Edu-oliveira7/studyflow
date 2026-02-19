from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from .models import StudyPlan, Subject, StudySession, DailyProgress
from .serializers import (
    StudyPlanSerializer,
    CreateStudyPlanSerializer,
    SubjectSerializer,
    StudySessionSerializer,
    DailyProgressSerializer
)
from .services import generate_study_sessions, get_dashboard_data


class StudyPlanViewSet(ModelViewSet):
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CreateStudyPlanView(APIView):
    """
    POST: Criar ou atualizar plano de estudos
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateStudyPlanSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            plan = serializer.save()
            # Gera as sessions de estudo
            generate_study_sessions(plan)
            output_serializer = StudyPlanSerializer(plan)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyStudyPlanView(APIView):
    """
    GET: Obter meu plano de estudos com sessions formatadas
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            plan = StudyPlan.objects.prefetch_related('sessions__subject').get(user=request.user)
            
            # Formata as sessions com questões
            sessions = []
            for session in plan.sessions.all():
                sessions.append({
                    'id': session.id,
                    'day_of_week': session.day_of_week,
                    'subject': session.subject.name,
                    'duration_minutes': session.duration,
                    'question_list': session.question_list,
                    'order': session.order,
                })
            
            # Formata subjects_difficulties se existir
            # Prefer subject_difficulties; se ausente, constrói a partir de Subject objects
            if plan.subject_difficulties:
                subjects = plan.subject_difficulties
            else:
                subjects = []
                for subj in plan.subject_details.all():
                    subjects.append({
                        'name': subj.name,
                        'difficulty': subj.priority or 3
                    })
            
            # Resposta customizada
            data = {
                'id': plan.id,
                'subjects': subjects,
                'priority': plan.priority,
                'difficulty': plan.difficulty,
                'daily_time': plan.daily_time,
                'study_days': plan.study_days,
                'sessions': sessions,
                'created_at': plan.created_at,
                'updated_at': plan.updated_at,
            }
            
            return Response(data)
        except StudyPlan.DoesNotExist:
            return Response(
                {"detail": "Plano de estudos não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )


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
        return Response(data, status=status.HTTP_200_OK)


class DailyProgressView(APIView):
    """
    POST: Marcar/desmarcar um dia como completo
    GET: Obter progresso do usuário
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from datetime import datetime
        try:
            plan = StudyPlan.objects.get(user=request.user)
            date = request.data.get('date')  # formato: YYYY-MM-DD
            completed = request.data.get('completed', True)
            day_of_week = request.data.get('day_of_week', 0)
            
            if not date:
                return Response(
                    {"error": "Data é obrigatória"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            progress, created = DailyProgress.objects.update_or_create(
                plan=plan,
                date=date,
                defaults={'completed': completed, 'day_of_week': day_of_week}
            )
            
            return Response(
                DailyProgressSerializer(progress).data,
                status=status.HTTP_200_OK
            )
        except StudyPlan.DoesNotExist:
            return Response(
                {"error": "Plano de estudos não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

    def get(self, request):
        try:
            plan = StudyPlan.objects.get(user=request.user)
            progress = DailyProgress.objects.filter(plan=plan).order_by('-date')
            
            return Response(
                DailyProgressSerializer(progress, many=True).data,
                status=status.HTTP_200_OK
            )
        except StudyPlan.DoesNotExist:
            return Response(
                {"error": "Plano de estudos não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )