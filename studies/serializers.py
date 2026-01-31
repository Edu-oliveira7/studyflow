from rest_framework import serializers
from .models import StudyPlan, Subject, StudySession


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = "__all__"


class StudyPlanSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True, read_only=True)
    sessions = StudySessionSerializer(many=True, read_only=True)

    class Meta:
        model = StudyPlan
        fields = "__all__"

class CreateStudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = ["id", "title", "daily_time"]

    def create(self, validated_data):
        plan = super().create(validated_data)
        return plan
