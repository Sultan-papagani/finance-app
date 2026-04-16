import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import BottomNav from "../BottomNav/BottomNav";

/* AppLayout.jsx
Sitenin ana iskeleti. Mobil/Masaüstü ayrımını yapar.
Yeni tasarımda SidebarToggleButton kaldırıldı, tuş Sidebar'ın içine taşındı.
*/

const AppLayout = ({ children }) => {
  // Masaüstünde menü varsayılan olarak açık gelsin
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {isMobile ? (
        <BottomNav />
      ) : (
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* İşin sırrı burada: 
              Mobildeyken alt menü içeriği kapatmasın diye pb-20 (padding-bottom) verdik ve ml-0 yaptık.
              Masaüstünde ise menü açıksa 256px (ml-64), kapalıysa o ince mavi şerit kadar 64px (ml-16) soldan boşluk bırakıyoruz.
            */}
      <main
        className={`flex-1 transition-all duration-300 
                ${isMobile ? "ml-0 pb-20" : isOpen ? "ml-64" : "ml-16"}`}
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
