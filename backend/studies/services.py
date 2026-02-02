from datetime import datetime
from django.db import models
from .models import StudyPlan, StudySession, Subject


DAYS = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
]


def generate_study_sessions(plan):
    subjects = Subject.objects.filter(plan=plan)

    if not subjects.exists():
        return

    total_priority = sum(s.priority for s in subjects)

    StudySession.objects.filter(plan=plan).delete()

    for day in range(5):  # Segunda a Sexta
        for subject in subjects:
            proportion = subject.priority / total_priority
            duration = int(plan.daily_time * proportion)

            if duration > 0:
                StudySession.objects.create(
                    plan=plan,
                    subject=subject,
                    day_of_week=day,
                    duration=duration
                )


def get_dashboard_data():
    today_index = datetime.today().weekday()

    return {
        "stats": {
            "total_plans": StudyPlan.objects.count(),
            "total_subjects": Subject.objects.count(),
            "total_sessions": StudySession.objects.count(),
        },

        "today": {
            "day_index": today_index,
            "day_name": DAYS[today_index] if today_index < 5 else None,
            "sessions": list(
                StudySession.objects.filter(day_of_week=today_index).values(
                    "id",
                    "duration",
                    plan_title=models.F("plan__title"),
                    subject_name=models.F("subject__name"),
                )
            )
        },

        "week": [
            {
                "day_index": day,
                "day_name": DAYS[day],
                "sessions": list(
                    StudySession.objects.filter(day_of_week=day).values(
                        "id",
                        "duration",
                        plan_title=models.F("plan__title"),
                        subject_name=models.F("subject__name"),
                    )
                )
            }
            for day in range(5)
        ]
    }
