import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, User, History, Wallet, RotateCcw } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  const isActive = (paths) => {
    if (Array.isArray(paths)) return paths.includes(location.pathname);
    return location.pathname === paths;
  };

  const brandBlue = "#007AFF"; 

  const getNavStyle = (pathOrPaths, isSpecial = false) => {
    const active = isActive(pathOrPaths);
    const baseStyle = "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ease-out";
    
    if (active) {
      // Aktif ikon: Tam mavi daire, beyaz ikon, derin gölge ve hafif büyüme
      return `${baseStyle} bg-[#007AFF] text-white shadow-[0_8px_20px_rgba(0,122,255,0.4)] scale-110`;
    }
    
    // Aktif değilse: İnce mavi çizgili, hafif hover efekti
    return `${baseStyle} text-[#007AFF] ${isSpecial ? 'border-2 border-[#007AFF]' : 'hover:bg-blue-50'}`;
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 transition-colors">
      <ul className="flex justify-around items-center h-16 px-2">
        
        {/* Ana Sayfa */}
        <li className="flex-1 flex justify-center">
          <Link to="/" className={getNavStyle('/')}>
            <Home size={26} strokeWidth={2.5} fill={isActive('/') ? "white" : "none"} />
          </Link>
        </li>

        {/* Arama */}
        <li className="flex-1 flex justify-center">
          <Link to="/search" className={getNavStyle('/search')}>
            <Search size={26} strokeWidth={2.5} />
          </Link>
        </li>

        {/* Ekleme (+) */}
        <li className="flex-1 flex justify-center">
          <Link to="/add-transaction" className={getNavStyle('/add-transaction', true)}>
            <Plus size={28} strokeWidth={3} />
          </Link>
        </li>

        {/* --- FİNANS MENÜSÜ VE BOŞLUK ÇÖZÜMÜ --- */}
        <li className="flex-1 flex justify-center relative group">
          
          {/* GÖRÜNMEZ KÖPRÜ: pb-6 ve h-24 alanı sayesinde fare asla boşluğa düşmez */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-32 flex flex-col justify-end pb-14 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300">
            
            {/* OVAL POP-UP MENÜ */}
            <div className="flex flex-col items-center gap-6 py-6 px-3 bg-[#F8F9FA] border-[2.5px] border-[#007AFF] rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.2)]">
              <Link to="/history" className="text-[#007AFF] hover:scale-125 transition-transform duration-200">
                <History size={26} strokeWidth={2.2} />
              </Link>
              <div className="w-8 h-[1px] bg-blue-200"></div> {/* Küçük bir ayırıcı çizgi efekt için */}
              <Link to="/finance" className="text-[#007AFF] hover:scale-125 transition-transform duration-200">
                <Wallet size={26} strokeWidth={2.2} />
              </Link>
            </div>
          </div>

          {/* ÖZEL GRAFİK İKONU */}
          <div className={getNavStyle(['/finance', '/history'])}>
            <div className="relative flex items-center justify-center">
               <RotateCcw size={28} strokeWidth={2.5} className="absolute" />
               <div className="flex items-end gap-[2px] h-3 mb-1">
                  <div className={`w-[3px] rounded-full ${isActive(['/finance', '/history']) ? 'bg-white' : 'bg-[#007AFF]'} h-2`}></div>
                  <div className={`w-[3px] rounded-full ${isActive(['/finance', '/history']) ? 'bg-white' : 'bg-[#007AFF]'} h-3`}></div>
                  <div className={`w-[3px] rounded-full ${isActive(['/finance', '/history']) ? 'bg-white' : 'bg-[#007AFF]'} h-1`}></div>
               </div>
            </div>
          </div>
        </li>

        {/* Profil */}
        <li className="flex-1 flex justify-center">
          <Link to="/profile" className={getNavStyle('/profile', true)}>
            <User size={24} strokeWidth={2.5} fill={isActive('/profile') ? "white" : "none"} />
          </Link>
        </li>

      </ul>
    </nav>
  );
};

export default BottomNav;