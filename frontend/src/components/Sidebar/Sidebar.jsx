import React from "react";
import { Link, useLocation } from "react-router-dom";
// Assets klasöründen logonu çekiyoruz
import Logo from "../../assets/logo.png";
// History (Saat) ikonunu Lucide'den ekledik
import {
  Home,
  Search,
  BarChart2,
  User,
  ChevronRight,
  History,
  LogOut,
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const handleLogout = () => {
    localStorage.removeItem("token"); // Token'ı sil
    window.location.href = "/"; // Karşılama veya Login sayfasına fırlat
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#04009A] text-white 
        transition-all duration-300 ease-in-out z-50 shadow-2xl
        ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* --- LOGO ALANI --- */}
      <div
        className={`flex items-center h-20 border-b border-white/10 mb-6 px-4
        ${isOpen ? "justify-start" : "justify-center"}`}
      >
        <div className="bg-white p-1.5 rounded-xl flex items-center justify-center shadow-lg min-w-[44px] h-[44px]">
          <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div
          className={`ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap
          ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
        >
          <h1 className="text-xl font-bold tracking-tight">
            Finance<span className="text-blue-400">App</span>
          </h1>
        </div>
      </div>

      {/* Menü Linkleri */}
      <nav className="px-3">
        <ul className="space-y-2">
          <NavItem
            to="/"
            icon={<Home size={22} />}
            label="Ana Sayfa"
            isOpen={isOpen}
            isActive={isActive("/")}
          />
          <NavItem
            to="/search"
            icon={<Search size={22} />}
            label="Search"
            isOpen={isOpen}
            isActive={isActive("/Search")}
          />

          {/* GÜNLÜK (HISTORY) - Masaüstüne yeni eklendi */}
          <NavItem
            to="/history"
            icon={<History size={22} />}
            label="Günlük"
            isOpen={isOpen}
            isActive={isActive("/history")}
          />

          <NavItem
            to="/finance"
            icon={<BarChart2 size={22} />}
            label="Finance"
            isOpen={isOpen}
            isActive={isActive("/finance")}
          />
          <NavItem
            to="/profile"
            icon={<User size={22} />}
            label="Profile"
            isOpen={isOpen}
            isActive={isActive("/profile")}
          />

          {/* --- ÇIKIŞ YAP BUTONU --- */}
          <li className="relative group pt-4 mt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center h-12 rounded-xl transition-all duration-200 px-3 text-red-400 hover:bg-red-500/20 hover:text-red-300`}
            >
              <div className="min-w-[32px] flex justify-center">
                <LogOut size={22} />
              </div>
              <span
                className={`ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
              >
                Çıkış Yap
              </span>
              {!isOpen && (
                <div className="absolute left-16 bg-white text-red-600 px-3 py-2 rounded-lg hidden group-hover:block text-xs font-bold shadow-xl z-50 whitespace-nowrap">
                  Çıkış Yap
                </div>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* Menü Açma/Kapama Butonu */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-1/2 -right-4 transform -translate-y-1/2 
          bg-white text-[#04009A] w-8 h-10 rounded-xl flex items-center justify-center 
          shadow-lg transition-all duration-300 hover:scale-110 group
          ${isOpen ? "rotate-180" : "rotate-0"}`}
      >
        <ChevronRight
          size={20}
          strokeWidth={3}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </button>
    </div>
  );
};

// Yardımcı NavItem Bileşeni (Aynı kalıyor)
const NavItem = ({ to, icon, label, isOpen, isActive }) => (
  <li className="relative group">
    <Link
      to={to}
      className={`flex items-center h-12 rounded-xl transition-all duration-200 px-3
        ${
          isActive
            ? "bg-white text-[#04009A] shadow-md font-bold"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
    >
      <div className="min-w-[32px] flex justify-center">{icon}</div>
      <span
        className={`ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap
        ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
      >
        {label}
      </span>
      {!isOpen && (
        <div className="absolute left-16 bg-white text-[#04009A] px-3 py-2 rounded-lg hidden group-hover:block text-xs font-bold shadow-xl z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </Link>
  </li>
);

export default Sidebar;
