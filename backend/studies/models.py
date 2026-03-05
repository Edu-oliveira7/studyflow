from django.db import models
from django.contrib.auth.models import User


class StudyPlan(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="study_plan"
    )
    subjects = models.JSONField(default=list, help_text="Lista de matérias")
    priority = models.PositiveSmallIntegerField(
        default=3,
        choices=[(i, f"{i}") for i in range(1, 6)],
        help_text="1 = Muito Baixa | 5 = Muito Alta"
    )
    difficulty = models.PositiveSmallIntegerField(
        default=3,
        choices=[(i, f"{i}") for i in range(1, 6)],
        help_text="1 = Fácil | 5 = Muito Difícil"
    )
    subject_difficulties = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de matérias com dificuldades: [{name: 'Mat', difficulty: 4}, ...]"
    )
    daily_time = models.FloatField(
        help_text="Tempo diário em horas"
    )
    study_days = models.JSONField(
        default=list,
        help_text="Lista de dias da semana (Segunda, Terça, etc)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Plano de {self.user.email}"

    class Meta:
        ordering = ['-created_at']


class Subject(models.Model):
    plan = models.ForeignKey(
        StudyPlan,
        on_delete=models.CASCADE,
        related_name="subject_details"
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
    duration = models.FloatField(
        help_text="Minutos (pode ser fracionado)"
    )
    question_list = models.TextField(
        blank=True,
        default="",
        help_text="Lista de questões sugeridas para o dia"
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Ordem de estudo do dia (1a, 2a, 3a matéria)"
    )

    class Meta:
        ordering = ['day_of_week', 'order']


class DailyProgress(models.Model):
    plan = models.ForeignKey(
        StudyPlan,
        on_delete=models.CASCADE,
        related_name="daily_progress"
    )
    day_of_week = models.PositiveSmallIntegerField(
        help_text="0 = Segunda | 6 = Domingo"
    )
    date = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('plan', 'date')
        ordering = ['date']

    def __str__(self):
        return f"{self.plan.user.username} - {self.date} - {'ok' if self.completed else 'pending'}"
