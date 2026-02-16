import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username");
    
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
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
        {isLoggedIn ? (
          <div ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C0F53D]/10 border border-[#C0F53D]/30 text-white hover:bg-[#C0F53D]/20 transition-all"
            >
              <span className="text-sm font-medium">👤 {username}</span>
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
                <Link
                  to="/study-planner"
                  onClick={() => setShowMenu(false)}
                  className="block w-full text-left px-4 py-3 text-white/80 hover:bg-[#C0F53D]/20 hover:text-white transition-colors border-b border-[#C0F53D]/10"
                >
                  📚 Plano de Estudos
                </Link>
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
