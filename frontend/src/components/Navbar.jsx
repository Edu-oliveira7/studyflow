import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import { useState, useEffect, useRef } from "react";
import { apiUrl } from "../lib/api";
import { clearAuthSession, getAccessToken, getUsername } from "../lib/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasStudyPlan, setHasStudyPlan] = useState(false);
  const [username, setUsername] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    const token = getAccessToken();
    const storedUsername = getUsername();
    
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
    // busca número de tarefas de hoje para badge
    const fetchPending = async () => {
      if (!token) return;
      try {
        const res = await fetch(apiUrl('/api/study-plans/my-plan/'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          setHasStudyPlan(false);
          return;
        }
        setHasStudyPlan(true);
        const data = await res.json();
        const dayIdx = (new Date().getDay() === 0) ? 6 : (new Date().getDay() - 1);
        const count = (data.sessions || []).filter(s => s.day_of_week === dayIdx).length;
        setPendingCount(count);
      } catch (e) {
        setHasStudyPlan(false);
      }
    };
    fetchPending();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    setHasStudyPlan(false);
    setUsername("");
    setShowMenu(false);
    navigate("/login");
  };

  return (
    <nav className="w-full fixed top-0 z-50 backdrop-blur-md bg-black/30 border-b border-[#C0F53D]/20 px-8 py-4 flex justify-between items-center shadow-lg">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="text-3xl font-bold tracking-tighter">
          <span className="text-white group-hover:text-[#C0F53D] transition-colors duration-300">Study</span>
          <span className="text-[#C0F53D]">Flow</span>
        </div>
        <div className="hidden sm:block w-1 h-6 from-[#C0F53D] to-[#C0F53D]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      
      <div className="flex items-center gap-6 relative">
        {isLoggedIn && hasStudyPlan && (
          <Link to="/dashboard#today" className="hidden sm:inline-block mr-2">
            <button className="px-3 py-2 rounded-md bg-[#C0F53D]/10 border border-[#C0F53D]/20 text-white hover:bg-[#C0F53D]/20 transition-all">
              Hoje
            </button>
          </Link>
        )}
        {isLoggedIn ? (
          <div ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C0F53D]/10 border border-[#C0F53D]/30 text-white hover:bg-[#C0F53D]/20 transition-all"
            >
                <span className="text-sm font-medium">👤 {username}</span>
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6">{pendingCount}</span>
                )}
              <span className={`transition-transform ${showMenu ? "rotate-180" : ""}`}>▼</span>
            </button>

            {showMenu && (
              <div className="absolute top-full right-0 mt-2 bg-[#2a2a2a] border border-[#C0F53D]/30 rounded-lg shadow-xl overflow-hidden min-w-48">
                <Link
                  to="/dashboard"
                  onClick={() => setShowMenu(false)}
                  className="block w-full text-left px-4 py-3 text-white/80 hover:bg-[#C0F53D]/20 hover:text-white transition-colors border-b border-[#C0F53D]/10"
                >
                  📊 Dashboard
                </Link>
                {/* Plano de Estudos removido do menu para manter CTA única no Dashboard */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors font-semibold"
                >
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <Button className="bg-[#C0F53D] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#a8d629] transition-all duration-300 hover:shadow-[0_0_20px_#C0F53D66]">
              Entrar
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
