import React from "react";

/*
SidebarToggleButton.jsx
Ekranda sabit duran ve haraket etmeyen sidebar tuşu 
*/

const SidebarToggleButton = ({ toggleSidebar, isOpen }) => (
  !isOpen && (
    <button
      onClick={toggleSidebar}
      className="fixed z-60 m-6 p-2 bg-gray-900 dark:bg-gray-950 border border-gray-700 dark:border-gray-800 text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-blue-400 rounded-lg shadow-md transition-all duration-200"
    >
      ☰
    </button>
  )
);


export default SidebarToggleButton;