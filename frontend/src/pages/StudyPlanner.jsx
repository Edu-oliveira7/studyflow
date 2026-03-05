import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import { apiUrl } from '../lib/api';
import { getAccessToken } from '../lib/auth';

export default function StudyPlanner() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjects: [],
    currentSubject: '',
    currentDifficulty: 3,
    priority: 3,
    dailyTime: 2,
    selectedDays: [true, true, true, true, true, false, false],
  });

  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const edit = params.get('edit');
    if (edit === 'true') {
      setIsEditMode(true);
      setLoadingPlan(true);
      (async () => {
        const token = getAccessToken();
        if (!token) {
          setLoadingPlan(false);
          return;
        }
        try {
          const res = await fetch(apiUrl('/api/study-plans/my-plan/'), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            alert('Não foi possível carregar o plano atual.');
            setLoadingPlan(false);
            return;
          }
          const data = await res.json();
          const subjects = (data.subjects || []).map(s => (typeof s === 'string' ? { name: s, difficulty: 3 } : s));
          const finalSubjects = (data.subject_difficulties && data.subject_difficulties.length) ? data.subject_difficulties : subjects;
          const selectedDays = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'].map(d => (data.study_days || []).includes(d));

          setFormData(prev => ({
            ...prev,
            subjects: finalSubjects,
            currentSubject: '',
            currentDifficulty: 3,
            priority: data.priority || prev.priority || 3,
            dailyTime: data.daily_time || prev.dailyTime || 2,
            selectedDays,
          }));
          setStep(1);
        } catch (err) {
          console.error('Erro ao carregar plano existente', err);
          alert('Erro ao carregar o plano. Veja o console.');
        } finally {
          setLoadingPlan(false);
        }
      })();
    } else {
      (async () => {
        const token = getAccessToken();
        if (!token) return;

        try {
          const res = await fetch(apiUrl('/api/study-plans/my-plan/'), {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            navigate('/dashboard', { replace: true });
          }
        } catch (err) {
          console.error('Erro ao verificar plano existente', err);
        }
      })();
    }
  }, [location.search, navigate]);

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const difficultyLabels = ['Muito Fácil', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil'];

  const addSubject = () => {
    if (formData.currentSubject.trim()) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, {
          name: formData.currentSubject,
          difficulty: formData.currentDifficulty
        }],
        currentSubject: '',
        currentDifficulty: 3,
      });
    }
  };

  const removeSubject = (index) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const updateSubjectDifficulty = (index, difficulty) => {
    const updated = [...formData.subjects];
    updated[index].difficulty = difficulty;
    setFormData({ ...formData, subjects: updated });
  };

  const toggleDay = (index) => {
    const newDays = [...formData.selectedDays];
    newDays[index] = !newDays[index];
    setFormData({ ...formData, selectedDays: newDays });
  };

  const handleNext = () => {
    if (step === 1 && formData.subjects.length === 0) {
      alert('Adicione pelo menos uma matéria');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    const selectedDayNames = days.filter((_, i) => formData.selectedDays[i]);
    const token = getAccessToken();

    if (!selectedDayNames.length) {
      alert('Selecione pelo menos um dia de estudo');
      return;
    }

    const payload = {
      subjects: formData.subjects.map(s => s.name),
      priority: formData.priority || (formData.subjects.length ? (formData.subjects.reduce((acc, s) => acc + s.difficulty, 0) / formData.subjects.length) : 3),
      difficulty: formData.subjects.length ? Math.max(...formData.subjects.map(s => s.difficulty)) : formData.difficulty || 3,
      daily_time: formData.dailyTime,
      study_days: selectedDayNames,
      subject_difficulties: formData.subjects,
    };

    console.log('Enviando payload:', payload);

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/study-plans/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.log('Erro no servidor:', data);
        
        // Trata diferentes tipos de erro
        let errorMsg = 'Tente novamente';
        if (data.error) {
          errorMsg = data.error;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (typeof data === 'object') {
          const errors = [];
          for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              errors.push(`${key}: ${value.join(', ')}`);
            } else {
              errors.push(`${key}: ${value}`);
            }
          }
          errorMsg = errors.join(' | ') || 'Erro desconhecido';
        }
        
        alert('Erro ao salvar: ' + errorMsg);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (time % 1 === 0) return `${Math.floor(time)}h`;
    return `${Math.floor(time)}h ${Math.round((time % 1) * 60)}min`;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0B0F0A] to-[#1a1a1a] pt-24">
      <div className="max-w-3xl mx-auto px-6">
        
        <div className="mb-12">
          <div className="flex justify-between mb-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    step === num
                      ? 'bg-[#C0F53D] text-black shadow-lg shadow-[#C0F53D]/50 scale-110'
                      : step > num
                      ? 'bg-[#C0F53D] text-black'
                      : 'bg-[#2a2a2a] text-white'
                  }`}
                >
                  {step > num ? '✓' : num}
                </div>
                <p className="text-white/60 text-xs mt-2 text-center">
                  {num === 1 ? 'Matérias' : num === 2 ? 'Estratégia' : 'Horários'}
                </p>
              </div>
            ))}
          </div>
          <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full  from-[#C0F53D] to-[#a8d629] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-[#C0F53D]/20 shadow-xl">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">Quais são suas matérias?</h2>
              <p className="text-white/60">Adicione suas matérias e indique o nível de dificuldade de cada uma</p>
            </div>

            <div className="space-y-4">
              
              <div className="space-y-3 p-3 rounded-md">
                <input
                  type="text"
                  value={formData.currentSubject}
                  onChange={(e) => setFormData({ ...formData, currentSubject: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                  placeholder="Ex: Matemática, Português..."
                  className="w-full px-4 py-3 rounded-lg bg-[#0B0F0A] text-white border border-gray-600 focus:outline-none focus:border-[#C0F53D] focus:ring-2 focus:ring-[#C0F53D]/20 transition-all"
                />
                
                <div>
                  <label className="text-white/70 text-sm font-medium mb-2 block">
                    Dificuldade: <span className="text-[#C0F53D]">{difficultyLabels[formData.currentDifficulty - 1]}</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setFormData({ ...formData, currentDifficulty: num })}
                        className={`flex-1 py-2 text-xs rounded transition-all ${
                          formData.currentDifficulty === num
                            ? 'bg-[#C0F53D] text-black font-bold'
                            : 'bg-[#2a2a2a] text-white/60 border border-gray-600 hover:border-[#C0F53D]'
                        }`}
                      >
                        {difficultyLabels[num - 1]}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addSubject}
                  className="w-full px-4 py-3 bg-[#C0F53D] text-black font-semibold rounded-lg hover:bg-[#a8d629] transition-all"
                >
                  + Adicionar Matéria
                </button>
              </div>

              
              <div className="space-y-3">
                {formData.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-semibold text-base">{subject.name}</h4>
                      <button
                        onClick={() => removeSubject(index)}
                        className="text-red-400 w-6 h-6 rounded flex items-center justify-center transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => updateSubjectDifficulty(index, num)}
                          className={`flex-1 py-2 text-xs rounded transition-all ${
                            subject.difficulty === num
                              ? 'bg-[#C0F53D] text-black font-semibold'
                              : 'bg-transparent text-white/60 border border-gray-700'
                          }`}
                        >
                          {difficultyLabels[num - 1]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {formData.subjects.length > 0 && (
                <div className="p-4 bg-[#C0F53D]/10 border border-[#C0F53D]/30 rounded-lg">
                  <p className="text-[#C0F53D] font-semibold">
                    ✓ {formData.subjects.length} matéria{formData.subjects.length > 1 ? 's' : ''} adicionada{formData.subjects.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        
        {step === 2 && (
          <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-[#C0F53D]/20 shadow-xl">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">Configure sua estratégia</h2>
              <p className="text-white/60">Tempo diário e prioridade geral</p>
            </div>

            <div className="space-y-10">
              {/* Priority */}
              <div>
                <label className="text-white font-bold text-lg mb-4 block">
                  Prioridade Geral
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setFormData({ ...formData, priority: num })}
                      className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                        formData.priority === num
                          ? 'bg-[#C0F53D] text-black shadow-lg shadow-[#C0F53D]/50 scale-105'
                          : 'bg-[#1a1a1a] text-white border border-gray-600 hover:border-[#C0F53D] hover:bg-[#C0F53D]/10'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-white/50 text-sm mt-2">Sendo 1 = Baixa e 5 = Muito Alta</p>
              </div>

              <div>
                <label className="text-white font-bold text-lg mb-4 block">Tempo diário de estudo</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5].map((time) => (
                    <button
                      key={time}
                      onClick={() => setFormData({ ...formData, dailyTime: time })}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        formData.dailyTime === time
                          ? 'bg-[#C0F53D] text-black shadow-lg shadow-[#C0F53D]/50 scale-105'
                          : 'bg-[#1a1a1a] text-white border border-gray-600 hover:border-[#C0F53D]'
                      }`}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6  from-[#C0F53D]/10 to-[#a8d629]/10 rounded-xl border border-[#C0F53D]/30">
                <h3 className="text-white font-bold text-lg mb-4">Matérias adicionadas:</h3>
                <div className="space-y-2">
                  {formData.subjects.map((subject, idx) => (
                    <div key={idx} className="flex justify-between items-center text-white/90">
                      <span>{subject.name}</span>
                      <span className="text-[#C0F53D] font-semibold">{difficultyLabels[subject.difficulty - 1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        
        {step === 3 && (
          <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-[#C0F53D]/20 shadow-xl">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">Dias de estudo</h2>
              <p className="text-white/60">Configure seus dias de estudo</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-white font-bold text-lg mb-4 block">Dias de estudo</label>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        formData.selectedDays[index]
                          ? 'bg-[#C0F53D] text-black shadow-lg shadow-[#C0F53D]/50 scale-105'
                          : 'bg-[#1a1a1a] text-white border border-gray-600 hover:border-[#C0F53D]'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-6  from-[#C0F53D]/10 to-[#a8d629]/10 rounded-xl border border-[#C0F53D]/30">
                <h3 className="text-white font-bold text-lg mb-4">Resumo do seu plano:</h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-center gap-2">
                    <span className="text-[#C0F53D]">📚</span>
                    <span><strong>Matérias:</strong> {formData.subjects.map(s => s.name).join(', ')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#C0F53D]">⏰</span>
                    <span><strong>Tempo/dia:</strong> {formatTime(formData.dailyTime)}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#C0F53D]">📅</span>
                    <span><strong>Dias:</strong> {days.filter((_, i) => formData.selectedDays[i]).join(', ')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-12">
          {isEditMode && (
            <button
              onClick={() => navigate('/dashboard')}
              className="py-4 px-4 bg-[#2a2a2a] text-white font-bold rounded-lg border border-gray-600 hover:border-[#C0F53D] hover:bg-[#C0F53D]/10 transition-all"
            >
              Cancelar edição
            </button>
          )}
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="flex-1 py-4 bg-[#1a1a1a] text-white font-bold rounded-lg border border-gray-600 hover:border-[#C0F53D] hover:bg-[#C0F53D]/10 transition-all"
            >
              ← Voltar
            </button>
          )}
          {step < 3 && (
            <button
              onClick={handleNext}
              className="flex-1 py-4 bg-[#C0F53D] text-black font-bold rounded-lg hover:bg-[#a8d629] transition-all shadow-lg shadow-[#C0F53D]/30 hover:shadow-[#C0F53D]/50"
            >
              Próximo →
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-4 bg-[#C0F53D] text-black font-bold rounded-lg hover:bg-[#a8d629] transition-all shadow-lg shadow-[#C0F53D]/30 hover:shadow-[#C0F53D]/50 disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Salvando...' : 'Criando plano...') : (isEditMode ? 'Salvar alterações' : 'Criar Plano de Estudos')}
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
