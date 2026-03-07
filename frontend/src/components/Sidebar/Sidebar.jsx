import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white 
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out z-50 shadow-lg`}
    >
      <div className="p-4 font-bold text-xl border-b border-gray-700 flex justify-between items-center">
        Finans Uygulaması
        <button onClick={toggleSidebar} className="text-white text-xl">×</button>
      </div>
      <ul className="mt-4 space-y-2">
        <li className="hover:bg-gray-700 cursor-pointer">
          <Link to="/" className="block px-4 py-2" onClick={toggleSidebar}>
            Ana Sayfa
          </Link>
        </li>
        <li className="hover:bg-gray-700 cursor-pointer">
          <Link to="/profile" className="block px-4 py-2" onClick={toggleSidebar}>
            Profilim
          </Link>
        </li>
        <li className="hover:bg-gray-700 cursor-pointer">
          <Link to="/settings" className="block px-4 py-2" onClick={toggleSidebar}>
            Ayarlar
          </Link>
        </li>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => alert("Çıkış yapıldı")}>
          Çıkış yap
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;