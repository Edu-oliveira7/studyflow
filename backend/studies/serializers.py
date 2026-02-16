from rest_framework import serializers
from .models import StudyPlan, Subject, StudySession, DailyProgress


class DailyProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyProgress
        fields = ['id', 'day_of_week', 'date', 'completed', 'created_at', 'updated_at']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class StudySessionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )
    subject = serializers.CharField(
        source="subject.name",
        read_only=True
    )
    duration_minutes = serializers.IntegerField(
        source="duration",
        read_only=True
    )

    class Meta:
        model = StudySession
        fields = ["id", "day_of_week", "subject", "subject_name", "duration", "duration_minutes", "question_list", "order"]



class StudyPlanSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(many=True, read_only=True)
    sessions = StudySessionSerializer(many=True, read_only=True)

    class Meta:
        model = StudyPlan
        fields = [
            "id",
            "user",
            "subjects",
            "priority",
            "difficulty",
            "subject_difficulties",
            "daily_time",
            "study_days",
            "created_at",
            "updated_at",
            "subject_details",
            "sessions"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class CreateStudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = ["subjects", "priority", "difficulty", "daily_time", "study_days", "subject_difficulties"]

    def validate_priority(self, value):
        # Garante que priority está no range 1-5
        value = int(round(value))
        if value < 1 or value > 5:
            raise serializers.ValidationError("Priority deve estar entre 1 e 5")
        return value
    
    def validate_difficulty(self, value):
        # Garante que difficulty está no range 1-5
        value = int(round(value))
        if value < 1 or value > 5:
            raise serializers.ValidationError("Difficulty deve estar entre 1 e 5")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        # Se o usuário já tem um plano, atualiza. Senão, cria um novo
        plan, created = StudyPlan.objects.update_or_create(
            user=user,
            defaults=validated_data
        )
        return plan
