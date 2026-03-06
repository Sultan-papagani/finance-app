import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import SidebarToggleButton from "../Sidebar/SidebarToggleButton";

/* 
AppLayout.jsx
Sitenin ana komponenti. Sidebar'ı konumlandırır ve 
içine pass edilen {children}'ı siderbar'a göre konumlandırır.
*/

const AppLayout = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <div className="flex">
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <SidebarToggleButton toggleSidebar={toggleSidebar} isOpen={isOpen} />
        <main className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-0"}`}>
            {children}
        </main>
        </div>
    );
};

export default AppLayout;
