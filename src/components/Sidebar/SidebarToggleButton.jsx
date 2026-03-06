import React from "react";

/*
SidebarToggleButton.jsx
Ekranda sabit duran ve haraket etmeyen sidebar tuşu 
*/

const SidebarToggleButton = ({ toggleSidebar, isOpen }) => (
  !isOpen && (
    <button
      onClick={toggleSidebar}
      className="fixed z-60 m-6 p-2 bg-gray-800 text-white rounded-md shadow-md"
    >
      ☰
    </button>
  )
);


export default SidebarToggleButton;