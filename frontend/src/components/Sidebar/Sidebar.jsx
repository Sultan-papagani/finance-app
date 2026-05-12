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
      className={`fixed top-0 left-0 h-full bg-gray-900 dark:bg-gray-950 text-white
        transition-all duration-300 ease-in-out z-50 shadow-2xl
        ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* --- LOGO ALANI --- */}
      <div
        className={`flex items-center h-20 border-b border-gray-700 dark:border-gray-800 mb-6 px-4
        ${isOpen ? "justify-start" : "justify-center"}`}
      >
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg min-w-[44px] h-[44px]">
          <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div
          className={`ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap
          ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
        >
          <h1 className="text-lg font-semibold tracking-wider text-gray-50">
            While<span className="text-blue-400 font-bold">Wallet</span>
          </h1>
        </div>
      </div>

      {/* Menü Linkleri */}
      <nav className="px-3">
        <ul className="space-y-2">
          <NavItem
            to="/home"
            icon={<Home size={22} />}
            label="Ana Sayfa"
            isOpen={isOpen}
            isActive={isActive("/home")}
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
          <li className="relative group pt-4 mt-4 border-t border-gray-700 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center h-12 rounded-lg transition-all duration-200 px-3 text-red-400 hover:bg-red-500/15 hover:text-red-300 border border-transparent hover:border-red-500/30`}
            >
              <div className="min-w-[32px] flex justify-center">
                <LogOut size={22} />
              </div>
              <span
                className={`ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap font-medium ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
              >
                Çıkış Yap
              </span>
              {!isOpen && (
                <div className="absolute left-16 bg-gray-800 dark:bg-gray-900 border border-gray-700 text-red-400 px-3 py-2 rounded-lg hidden group-hover:block text-xs font-semibold shadow-xl z-50 whitespace-nowrap">
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
          bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-800 text-gray-300 dark:text-gray-400 w-8 h-10 rounded-lg flex items-center justify-center
          shadow-lg transition-all duration-300 hover:scale-110 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-blue-400 group
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
      className={`flex items-center h-12 rounded-lg transition-all duration-200 px-3 border-l-2
        ${
          isActive
            ? "bg-gray-800 dark:bg-gray-800/50 border-l-blue-500 text-blue-400 font-semibold shadow-md shadow-blue-500/10"
            : "border-l-transparent text-gray-400 hover:bg-gray-800/40 dark:hover:bg-gray-800/50 hover:text-gray-200"
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
        <div className="absolute left-16 bg-gray-800 dark:bg-gray-900 border border-gray-700 text-gray-100 px-3 py-2 rounded-lg hidden group-hover:block text-xs font-semibold shadow-xl z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </Link>
  </li>
);

export default Sidebar;
