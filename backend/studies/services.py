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
    """
    Gera sessões de estudo com distribuição inteligente.
    - Máximo 2 matérias por dia
    - Todas as matérias aparecem (proporcional à dificuldade)
    - Matérias com maior dificuldade aparecem mais vezes
    - Distribuição equilibrada ao longo da semana
    """
    StudySession.objects.filter(plan=plan).delete()

    subject_data = plan.subject_difficulties if plan.subject_difficulties else []
    
    if not subject_data:
        if isinstance(plan.subjects, list):
            subject_data = [{"name": s, "difficulty": 3} for s in plan.subjects]
    
    if not subject_data:
        return

    # Ordena matérias por dificuldade (descendente)
    sorted_subjects = sorted(subject_data, key=lambda x: x.get("difficulty", 3), reverse=True)
    
    # Converte nomes de dias para índices
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

    # Calcula dificuldade total
    total_difficulty = sum(int(s.get("difficulty", 3)) for s in sorted_subjects)
    if total_difficulty == 0:
        total_difficulty = num_subjects

    # Calcula quantas vezes cada matéria aparece baseado em dificuldade
    # Garante que cada matéria apareça pelo menos uma vez
    subject_frequencies = []
    total_appearances = 0
    for subject in sorted_subjects:
        difficulty = int(subject.get("difficulty", 3))
        # Proporcional à dificuldade com fator 0.5 para caber nos slots disponíveis
        frequency = max(1, round((difficulty / 5.0) * num_days * 0.5))
        subject_frequencies.append(frequency)
        total_appearances += frequency

    # Cria lista de todas as aparições (scheduling pool)
    scheduling_pool = []
    for subj_idx, frequency in enumerate(subject_frequencies):
        for _ in range(frequency):
            scheduling_pool.append(subj_idx)

    # Distribui as matérias pelos dias de forma equilibrada
    import random
    random.seed(42)  # seed fixo para consistência
    random.shuffle(scheduling_pool)

    # Preenche os dias com máximo 2 matérias cada
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
        sessions_today = sorted(daily_schedule.get(day_index, []))  # Ordena por índice (dificuldade)
        
        for order, subj_idx in enumerate(sessions_today, 1):
            subject_data_item = sorted_subjects[subj_idx]
            subject_name = subject_data_item.get("name")
            difficulty = int(subject_data_item.get("difficulty", 3))
            
            # Calcula duração baseada em dificuldade proporcional
            # Divide o tempo do dia entre as matérias com base na dificuldade relativa
            num_sessions_today = len(sessions_today)
            proportion = difficulty / total_difficulty
            
            # Se houver apenas 1 matéria, usa proporção
            # Se houver 2, distribui mais equilibrado
            if num_sessions_today == 1:
                duration_minutes = int(plan.daily_time * 60)
            else:
                # Para 2 matérias: metade do tempo para cada, ajustado pela dificuldade
                duration_minutes = max(20, int((plan.daily_time * 60) * proportion / num_sessions_today * 1.5))
            
            subject_obj, _ = Subject.objects.get_or_create(
                plan=plan,
                name=subject_name,
                defaults={"priority": difficulty}
            )
            
            # Gera sugestões de questões
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
            "day_name": DAYS[today_index] if today_index < 7 else None,
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
            for day in range(7)
        ]
    }
