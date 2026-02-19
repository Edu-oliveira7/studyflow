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
    duration_minutes = serializers.FloatField(
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
        # Atualiza ou cria o StudyPlan do usuário
        plan, created = StudyPlan.objects.update_or_create(
            user=user,
            defaults={k: v for k, v in validated_data.items() if k in ['subjects', 'priority', 'difficulty', 'daily_time', 'study_days', 'subject_difficulties']}
        )

        # Sincroniza objetos Subject com base em `subject_difficulties` ou `subjects`
        subjects_input = validated_data.get('subject_difficulties') or validated_data.get('subjects') or []

        # Normaliza para lista de dicts: {name, difficulty}
        normalized = []
        for s in subjects_input:
            if isinstance(s, dict):
                name = s.get('name')
                difficulty = int(s.get('difficulty', 3))
            else:
                name = str(s)
                difficulty = 3
            if name:
                normalized.append({'name': name, 'difficulty': difficulty})

        # Atualiza/cria subjects e remove não presentes
        desired_names = [s['name'] for s in normalized]

        # Update or create each subject
        for s in normalized:
            Subject.objects.update_or_create(
                plan=plan,
                name=s['name'],
                defaults={'priority': s.get('difficulty', 3)}
            )

        # Remove subjects that the user deleted
        if desired_names:
            Subject.objects.filter(plan=plan).exclude(name__in=desired_names).delete()

        return plan
