import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';
import { setAuthSession } from '../lib/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const navigateAfterAuth = async (token) => {
    try {
      const planResponse = await fetch(apiUrl('/api/study-plans/my-plan/'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (planResponse.ok) {
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      console.error('Erro ao verificar plano:', err);
    }

    navigate('/study-planner');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/users/auth/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthSession({ access: data.access, user: data.user });
        await navigateAfterAuth(data.access);
      } else {
        setError(data.error || 'Falha ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#0B0F0A] pt-20">
      <div className="w-full max-w-md p-8 bg-[#2a2a2a] rounded-lg shadow-lg border border-[#C0F53D]/20">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Bem-vindo de volta</h1>
        <p className="text-center text-white/60 mb-8">Faça login na sua conta StudyFlow</p>
        
        {error && (
          <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-white mb-2 text-sm font-medium">Nome de usuário</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1a1a1a] text-white border border-gray-600 focus:outline-none focus:border-[#C0F53D] transition-colors"
              placeholder="seu_usuario"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-white mb-2 text-sm font-medium">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-[#1a1a1a] text-white border border-gray-600 focus:outline-none focus:border-[#C0F53D] transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-white/60 hover:text-white"
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-[#C0F53D] text-black font-semibold rounded hover:bg-[#a8d629] transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Não tem conta? <Link to="/register" className="text-[#C0F53D] hover:underline font-medium">Criar conta</Link>
        </p>
      </div>

    </div>
  );
}
