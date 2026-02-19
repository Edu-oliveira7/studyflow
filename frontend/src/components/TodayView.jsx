import React from 'react';

export default function TodayView({ studyPlan, dailyProgress, toggleDayComplete }) {
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const todayDate = getTodayDate();
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Segunda
  const todaySessions = studyPlan ? studyPlan.sessions.filter(s => s.day_of_week === todayIndex) : [];

  return (
    <div id="today" className="bg-gradient-to-r from-[#C0F53D]/10 to-[#a8d629]/10 rounded-2xl p-6 sm:p-8 border border-[#C0F53D]/30 mb-6 sm:mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Estudos de Hoje 📖</h2>
          <p className="text-white/60 mt-1 text-sm">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={dailyProgress[todayDate] || false}
            onChange={() => toggleDayComplete && toggleDayComplete(todayDate, todayIndex)}
            className="w-6 h-6 rounded border-2 border-[#C0F53D] cursor-pointer accent-[#C0F53D]"
          />
          <span className="text-white font-semibold">Dia Completo!</span>
        </label>
      </div>

      {todaySessions.length > 0 ? (
        <div className="space-y-3">
          {todaySessions.sort((a, b) => a.order - b.order).map((session, idx) => (
            <div key={idx} className="bg-[#0B0F0A]/80 p-3 sm:p-4 rounded-lg border border-[#C0F53D]/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">{session.order}ª - {session.subject}</p>
                  <p className="text-white/50 text-xs sm:text-sm mt-1">⏱️ {formatTime(session.duration_minutes)}</p>
                </div>
                <span className="text-xl sm:text-2xl">📚</span>
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
  );
}
