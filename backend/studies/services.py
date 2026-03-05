from datetime import datetime
from django.db import models
from .models import StudyPlan, StudySession, Subject


DAYS = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
]


def generate_study_sessions(plan):
    """Gera sessões de estudo com distribuição proporcional à dificuldade."""
    StudySession.objects.filter(plan=plan).delete()

    subject_data = plan.subject_difficulties if plan.subject_difficulties else []
    
    if not subject_data:
        if isinstance(plan.subjects, list):
            subject_data = [{"name": s, "difficulty": 3} for s in plan.subjects]
    
    if not subject_data:
        return

    sorted_subjects = sorted(subject_data, key=lambda x: x.get("difficulty", 3), reverse=True)
    
    day_indices = []
    for day_name in (plan.study_days or []):
        try:
            day_indices.append(DAYS.index(day_name))
        except ValueError:
            pass

    if not day_indices:
        day_indices = list(range(5))

    day_indices.sort()
    num_days = len(day_indices)
    num_subjects = len(sorted_subjects)

    total_difficulty = sum(int(s.get("difficulty", 3)) for s in sorted_subjects)
    if total_difficulty == 0:
        total_difficulty = num_subjects

    subject_frequencies = []
    total_appearances = 0
    for subject in sorted_subjects:
        difficulty = int(subject.get("difficulty", 3))
        frequency = max(1, round((difficulty / 5.0) * num_days * 0.5))
        subject_frequencies.append(frequency)
        total_appearances += frequency

    scheduling_pool = []
    for subj_idx, frequency in enumerate(subject_frequencies):
        for _ in range(frequency):
            scheduling_pool.append(subj_idx)

    import random
    random.seed(42)
    random.shuffle(scheduling_pool)

    daily_schedule = {day: [] for day in day_indices}
    pool_idx = 0

    for day in day_indices:
        for slot in range(2):  # máximo 2 slots por dia
            if pool_idx < len(scheduling_pool):
                subj_idx = scheduling_pool[pool_idx]
                daily_schedule[day].append(subj_idx)
                pool_idx += 1
            else:
                break

    # Cria as sessions
    for day_index in day_indices:
        sessions_today = sorted(daily_schedule.get(day_index, []))  # lista de índices para sorted_subjects

        if not sessions_today:
            continue

        daily_minutes = int(plan.daily_time * 60)

        local_difficulties = [int(sorted_subjects[subj_idx].get('difficulty', 3)) for subj_idx in sessions_today]
        local_total = sum(local_difficulties) or len(local_difficulties)

        assigned = []
        min_per_session = 10
        for difficulty in local_difficulties:
            minutes = max(min_per_session, int((difficulty / local_total) * daily_minutes))
            assigned.append(minutes)

        # Ajusta diferenças por arredondamento para que a soma seja exatamente daily_minutes
        current_sum = sum(assigned)
        diff = daily_minutes - current_sum

        order_indices = sorted(range(len(assigned)), key=lambda i: -local_difficulties[i])

        idx = 0
        while diff != 0 and idx < 1000:
            i = order_indices[idx % len(order_indices)]
            if diff > 0:
                assigned[i] += 1
                diff -= 1
            else:
                if assigned[i] > min_per_session:
                    assigned[i] -= 1
                    diff += 1
            idx += 1

        # Cria objetos StudySession com as durações ajustadas
        for order, (pool_subj_idx, duration_minutes) in enumerate(zip(sessions_today, assigned), 1):
            subject_data_item = sorted_subjects[pool_subj_idx]
            subject_name = subject_data_item.get("name")
            difficulty = int(subject_data_item.get("difficulty", 3))

            subject_obj, _ = Subject.objects.get_or_create(
                plan=plan,
                name=subject_name,
                defaults={"priority": difficulty}
            )

            # Sugestões de estudo básicas
            question_list = f"""📋 Questões sobre {subject_name}:
1. Revise os conceitos principais
2. Resolva 5-10 exercícios de prática
3. Faça um resumo dos pontos-chave
4. Tire dúvidas com recursos online
5. Registre dificuldades para revisão"""

            StudySession.objects.create(
                plan=plan,
                subject=subject_obj,
                day_of_week=day_index,
                duration=duration_minutes,
                question_list=question_list,
                order=order
            )


def get_dashboard_data(user):
    today_index = datetime.today().weekday()
    user_plans = StudyPlan.objects.filter(user=user)
    user_subjects = Subject.objects.filter(plan__user=user)
    user_sessions = StudySession.objects.filter(plan__user=user)

    return {
        "stats": {
            "total_plans": user_plans.count(),
            "total_subjects": user_subjects.count(),
            "total_sessions": user_sessions.count(),
        },

        "today": {
            "day_index": today_index,
            "day_name": DAYS[today_index] if today_index < 7 else None,
            "sessions": list(
                user_sessions.filter(day_of_week=today_index).values(
                    "id",
                    "duration",
                    plan_id=models.F("plan__id"),
                    subject_name=models.F("subject__name"),
                )
            )
        },

        "week": [
            {
                "day_index": day,
                "day_name": DAYS[day],
                "sessions": list(
                    user_sessions.filter(day_of_week=day).values(
                        "id",
                        "duration",
                        plan_id=models.F("plan__id"),
                        subject_name=models.F("subject__name"),
                    )
                )
            }
            for day in range(7)
        ]
    }
