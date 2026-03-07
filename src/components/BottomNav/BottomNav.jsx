import React from "react";
import { Link } from "react-router-dom";

/*
BottomNav.jsx
Ekran küçüldüğünde veya mobil bir cihaz olduğunu fark ettiğimizde sidebar yerine kullanacağımız komponent.
*/

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-800 text-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
      <ul className="flex justify-around items-center h-16">
        
        <li className="flex-1 h-full">
          <Link 
            to="/" 
            className="flex flex-col items-center justify-center h-full w-full hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1 font-medium">Ana Sayfa</span>
          </Link>
        </li>

        <li className="flex-1 h-full">
          <Link 
            to="/profile" 
            className="flex flex-col items-center justify-center h-full w-full hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1 font-medium">Profilim</span>
          </Link>
        </li>

        <li className="flex-1 h-full">
          <Link 
            to="/settings" 
            className="flex flex-col items-center justify-center h-full w-full hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1 font-medium">Ayarlar</span>
          </Link>
        </li>

      </ul>
    </nav>
  );
};

export default BottomNav;