import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Dashboard() {
  const navigate = useNavigate();
  const [studyPlan, setStudyPlan] = useState(null);
  const [dailyProgress, setDailyProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  useEffect(() => {
    fetchStudyPlan();
    fetchDailyProgress();
  }, []);

  const fetchStudyPlan = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:8000/api/study-plans/my-plan/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStudyPlan(data);
      }
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyProgress = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:8000/api/daily-progress/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const progressMap = {};
        data.forEach(item => {
          progressMap[item.date] = item.completed;
        });
        setDailyProgress(progressMap);
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
    }
  };

  const toggleDayComplete = async (date, dayOfWeek) => {
    const token = localStorage.getItem('access_token');
    const newCompleted = !dailyProgress[date];

    try {
      const response = await fetch('http://localhost:8000/api/daily-progress/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          day_of_week: dayOfWeek,
          completed: newCompleted,
        }),
      });

      if (response.ok) {
        setDailyProgress({
          ...dailyProgress,
          [date]: newCompleted,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#0B0F0A] to-[#1a1a1a] flex items-center justify-center pt-20">
        <Navbar />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C0F53D]/20 border-t-[#C0F53D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#0B0F0A] to-[#1a1a1a] pt-24 pb-12 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="bg-[#2a2a2a] rounded-2xl p-12 border border-[#C0F53D]/20">
              <h2 className="text-4xl font-bold text-white mb-4">Bem-vindo! 👋</h2>
              <p className="text-white/60 mb-8">Ainda não tem um plano de estudos. Vamos criar um agora!</p>
              <button
                onClick={() => navigate('/study-planner')}
                className="px-8 py-4 bg-[#C0F53D] text-black font-bold rounded-lg hover:bg-[#a8d629] transition-all shadow-lg shadow-[#C0F53D]/30"
              >
                Criar Plano de Estudos
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const todayDate = getTodayDate();
  const todaySessions = studyPlan.sessions.filter(s => {
    const dayIndex = new Date().getDay();
    return s.day_of_week === (dayIndex === 0 ? 6 : dayIndex - 1);
  });

  // Organize subjects with their sessions
  const subjectsWithSessions = (studyPlan.subjects || []).map(subject => {
    const subjectName = typeof subject === 'string' ? subject : subject.name;
    const difficulty = typeof subject === 'string' ? 3 : subject.difficulty;
    const sessions = studyPlan.sessions.filter(s => s.subject === subjectName);
    const daysOfWeek = [...new Set(sessions.map(s => s.day_of_week))].sort();
    const totalTime = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);

    return {
      name: subjectName,
      difficulty,
      sessions,
      daysOfWeek,
      totalTime,
      dayNames: daysOfWeek.map(d => days[d])
    };
  });

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0B0F0A] to-[#1a1a1a] pt-24 pb-12 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Dashboard de Estudos</h1>
          <p className="text-white/60">Organize, acompanhe e alcance seus objetivos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#C0F53D]/20">
            <p className="text-white/60 text-sm mb-2">📚 Total de Matérias</p>
            <p className="text-3xl font-bold text-[#C0F53D]">{studyPlan.subjects?.length || 0}</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#C0F53D]/20">
            <p className="text-white/60 text-sm mb-2">📅 Dias de Estudo</p>
            <p className="text-3xl font-bold text-[#C0F53D]">{studyPlan.study_days?.length || 0}</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#C0F53D]/20">
            <p className="text-white/60 text-sm mb-2">⏰ Tempo Diário</p>
            <p className="text-3xl font-bold text-[#C0F53D]">{studyPlan.daily_time}h</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#C0F53D]/20">
            <p className="text-white/60 text-sm mb-2">✅ Sessions Criadas</p>
            <p className="text-3xl font-bold text-[#C0F53D]">{studyPlan.sessions?.length || 0}</p>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-gradient-to-r from-[#C0F53D]/10 to-[#a8d629]/10 rounded-2xl p-8 border border-[#C0F53D]/30 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Estudos de Hoje 📖</h2>
              <p className="text-white/60 mt-1">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyProgress[todayDate] || false}
                onChange={() => toggleDayComplete(todayDate, new Date().getDay())}
                className="w-6 h-6 rounded border-2 border-[#C0F53D] cursor-pointer accent-[#C0F53D]"
              />
              <span className="text-white font-semibold">Dia Completo!</span>
            </label>
          </div>

          {todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.sort((a, b) => a.order - b.order).map((session, idx) => (
                <div key={idx} className="bg-[#0B0F0A]/80 p-4 rounded-lg border border-[#C0F53D]/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">{session.order}ª - {session.subject}</p>
                      <p className="text-white/50 text-sm mt-1">⏱️ {formatTime(session.duration_minutes)}</p>
                    </div>
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60 text-lg">🎉 Parabéns! Dia de descanso!</p>
            </div>
          )}
        </div>

        {/* Weekly Overview - What you'll study each day */}
        <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-[#C0F53D]/20 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Cronograma da Semana 📅</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {days.map((day, idx) => {
              const daySessions = studyPlan.sessions.filter(s => s.day_of_week === idx);
              const dayDate = new Date();
              dayDate.setDate(dayDate.getDate() + (idx - dayDate.getDay()));
              const formattedDate = dayDate.toISOString().split('T')[0];
              const isCompleted = dailyProgress[formattedDate];
              
              return (
                <div
                  key={idx}
                  className={`rounded-xl p-6 border-2 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-[#C0F53D]/20 border-[#C0F53D] shadow-lg shadow-[#C0F53D]/30'
                      : daySessions.length > 0
                      ? 'bg-gradient-to-br from-[#C0F53D]/10 to-[#a8d629]/10 border-[#C0F53D]/40'
                      : 'bg-[#1a1a1a] border-gray-600/30'
                  }`}
                  onClick={() => toggleDayComplete(formattedDate, idx)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{day}</h3>
                    {isCompleted && <span className="text-2xl">✅</span>}
                  </div>
                  
                  {daySessions.length > 0 ? (
                    <div className="space-y-2">
                      {daySessions.sort((a, b) => a.order - b.order).map((session, sidx) => (
                        <div key={sidx} className="text-sm text-white/80">
                          <p className="font-semibold">{session.order}. {session.subject}</p>
                          <p className="text-white/50 text-xs">{formatTime(session.duration_minutes)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 italic text-sm">Dia de descanso</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Subjects Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Suas Matérias 📚</h2>
          
          <div className="space-y-6">
            {subjectsWithSessions.map((subject, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border border-[#C0F53D]/30 overflow-hidden transition-all hover:border-[#C0F53D]/60"
              >
                {/* Subject Header */}
                <div
                  onClick={() => setExpandedSubject(expandedSubject === idx ? null : idx)}
                  className="p-6 cursor-pointer hover:bg-[#C0F53D]/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-4xl">📖</div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{subject.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          {/* Difficulty Stars */}
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                  i < subject.difficulty ? 'bg-[#C0F53D]' : 'bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-white/60 text-sm">Dificuldade {subject.difficulty}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#C0F53D] font-bold text-lg">{formatTime(subject.totalTime)}</p>
                      <p className="text-white/50 text-sm">Tempo Total</p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex gap-4 items-center flex-wrap">
                    <div className="bg-[#C0F53D]/10 px-3 py-1 rounded-lg">
                      <p className="text-[#C0F53D] text-xs font-semibold">{subject.sessions.length} sessions</p>
                    </div>
                    <div className="text-white/60 text-sm">
                      📅 {subject.dayNames.join(', ') || 'Sem agendamentos'}
                    </div>
                    <div className="ml-auto">
                      <span className={`transition-transform ${expandedSubject === idx ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSubject === idx && (
                  <div className="border-t border-[#C0F53D]/20 p-6 bg-[#0B0F0A]/50">
                    <div className="space-y-6">
                      {/* Sessions */}
                      <div>
                        <h4 className="text-lg font-bold text-white mb-4">📑 Sessions Agendadas</h4>
                        <div className="space-y-3">
                          {subject.sessions.map((session, sidx) => (
                            <div key={sidx} className="bg-[#1a1a1a] p-4 rounded-lg border border-[#C0F53D]/20">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="text-white font-semibold">{days[session.day_of_week]} - {session.order}ª Session</p>
                                  <p className="text-white/50 text-sm">⏱️ {formatTime(session.duration_minutes)}</p>
                                </div>
                              </div>
                              
                              {/* Study Tips */}
                              {session.question_list && (
                                <div className="mt-3 pt-3 border-t border-[#C0F53D]/10">
                                  <p className="text-[#C0F53D] text-xs font-semibold mb-2">💡 Sugestões de Estudo:</p>
                                  <div className="bg-[#0B0F0A] p-3 rounded text-white/70 text-xs whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                                    {session.question_list}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Study Days */}
                      <div>
                        <h4 className="text-lg font-bold text-white mb-4">📅 Dias de Estudo</h4>
                        <div className="flex gap-2 flex-wrap">
                          {subject.dayNames.map((dayName, didx) => (
                            <div key={didx} className="bg-[#C0F53D]/20 text-[#C0F53D] px-4 py-2 rounded-lg font-semibold text-sm">
                              {dayName}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#C0F53D]/20">
                          <p className="text-white/60 text-xs mb-1">Total de Sessions</p>
                          <p className="text-2xl font-bold text-[#C0F53D]">{subject.sessions.length}</p>
                        </div>
                        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#C0F53D]/20">
                          <p className="text-white/60 text-xs mb-1">Tempo Total</p>
                          <p className="text-2xl font-bold text-[#C0F53D]">{formatTime(subject.totalTime)}</p>
                        </div>
                        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#C0F53D]/20">
                          <p className="text-white/60 text-xs mb-1">Dificuldade</p>
                          <p className="text-2xl font-bold text-[#C0F53D]">{subject.difficulty}/5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/study-planner')}
            className="px-8 py-4 bg-[#C0F53D] text-black font-bold rounded-lg hover:bg-[#a8d629] transition-all shadow-lg shadow-[#C0F53D]/30 hover:shadow-[#C0F53D]/50"
          >
            Editar Plano de Estudos
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
