from .models import StudySession, Subject


def generate_study_sessions(plan):
    """Sessões de estudo baseadas:
    - tempo diário disponível
    - prioridade das matérias
    """

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
