import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import StudyPlanner from './pages/StudyPlanner';
import Dashboard from './pages/Dashboard';

// Protetor de rota para usuários autenticados
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsAuth(false);
      setChecking(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch('http://localhost:8000/api/token/verify/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setIsAuth(true);
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_email');
          localStorage.removeItem('username');
          setIsAuth(false);
        }
      } catch (err) {
        console.error('Erro ao verificar token:', err);
        setIsAuth(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0B0F0A]">
      <div className="text-white">Carregando...</div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuth ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuth ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/" element={isAuth ? <Navigate to="/dashboard" /> : <Home />} />
        <Route 
          path="/study-planner" 
          element={
            <ProtectedRoute>
              <StudyPlanner />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </Router>
  );
}

export default App;