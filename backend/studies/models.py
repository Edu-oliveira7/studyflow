from django.db import models
from django.contrib.auth.models import User


class StudyPlan(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="study_plans"
    )
    title = models.CharField(max_length=100)
    daily_time = models.PositiveIntegerField(
        help_text="Minutos disponíveis por dia"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Subject(models.Model):
    plan = models.ForeignKey(
        StudyPlan,
        on_delete=models.CASCADE,
        related_name="subjects"
    )
    name = models.CharField(max_length=100)
    priority = models.PositiveSmallIntegerField(
        help_text="1 = baixa | 5 = alta"
    )

    def __str__(self):
        return f"{self.name} (P{self.priority})"


class StudySession(models.Model):
    plan = models.ForeignKey(
        StudyPlan,
        on_delete=models.CASCADE,
        related_name="sessions"
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE
    )
    day_of_week = models.PositiveSmallIntegerField(
        help_text="0 = Segunda | 6 = Domingo"
    )
    duration = models.PositiveIntegerField(
        help_text="Minutos"
    )

    def __str__(self):
        return f"{self.subject.name} - {self.duration}min"
