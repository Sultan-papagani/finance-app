import React from "react";

/*
SidebarToggleButtonRelative.jsx
sidebar tuşu, bildiğin dom'da duran buton şeklinde.

şu anda kullanılmıyor, fixed olanın bir iki sorunu var dizayn oturunca sayfaya ait olucak şekilde bunu kullanırız
*/

const SidebarToggleButtonRelative = ({ toggleSidebar, isOpen }) => (
  !isOpen && (
    <button
      onClick={toggleSidebar}
      className="w-10 h-10 flex items-center justify-center bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 transition-colors"
    >
      ☰
    </button>
  )
);

export default SidebarToggleButtonRelative;