import React from "react";

/*
Sidebar.jsx
Ana sidebar komponenti 

ileride bu sistem değişebilir şimdilik sorun göremiyorum
*/

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white 
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out z-50 shadow-lg`}
    >
      <div className="p-4 font-bold text-xl border-b border-gray-700 flex justify-between items-center">
        Finance App
        <button onClick={toggleSidebar} className="text-white text-xl">×</button>
      </div>
      <ul className="mt-4 space-y-2">
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Ana Sayfa</li>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Profilim</li>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Ayarlar</li>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Çıkış yap</li>
      </ul>
    </div>
  );
};

export default Sidebar;