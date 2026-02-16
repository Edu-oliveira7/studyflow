import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/users/auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('username', data.user.username || username);
        navigate('/study-planner');
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
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1a1a1a] text-white border border-gray-600 focus:outline-none focus:border-[#C0F53D] transition-colors"
              placeholder="••••••••"
              disabled={loading}
            />
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