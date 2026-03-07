import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import SidebarToggleButton from "../Sidebar/SidebarToggleButton";
import BottomNav from "../BottomNav/BottomNav";

/* 
AppLayout.jsx
Sitenin ana komponenti. Sidebar'ı konumlandırır ve 
içine pass edilen {children}'ı siderbar'a göre konumlandırır.
*/

const AppLayout = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // ekran küçüldüğünde navbarları değiştir
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) setIsOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex min-h-screen">
            {isMobile ? (
                    <BottomNav />
            ) : (
                <>
                    <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
                    <SidebarToggleButton toggleSidebar={toggleSidebar} isOpen={isOpen} />
                </>
            )}

            <main className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-0"}`}>
                {children}
            </main>
        </div>
    );
};

export default AppLayout;
