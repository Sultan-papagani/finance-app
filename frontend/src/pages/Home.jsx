import React from "react";
// Yeni Header'ımızı import ettik
import HomeHeader from "../components/HomeHeader"; 
import MyGoalsWidget from "../components/MyGoal/MyGoalWidget";
import UpcomingPayments from "../components/UpcomingPayments/UpcomingPayments";

const Home = () => {
  const handleFetch = async () => {
    try {
      const res = await fetch("http://localhost:3000/");
      const data = await res.text();
      alert(data);
    } catch (error) {
      alert("Sunucuyu çalıştırmayı unuttun");
      console.error(error);
    }
  };

  return (
   
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      
  
      <HomeHeader />

      {/* ANA İÇERİK ALANI */}
      <div className="flex justify-center mt-8">
        <div className="max-w-6xl w-full px-6 space-y-6">
          
  
          <div className="bg-white p-6 md:p-8 rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-black text-[#04009A]">Hoş Geldin! 👋</h1>
              <p className="mt-2 text-gray-500 font-medium">
                Bu sayfa kullanıcının siteye girince ilk göreceği ana özet (dashboard) kısmı.
              </p>
              <button
                onClick={handleFetch}
                className="mt-6 px-6 py-3 bg-[#007AFF] text-white font-bold rounded-xl hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgba(0,122,255,0.3)] active:scale-95"
              >
                Backendi Çağır
              </button>
            </div>
  
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          </div>

          {/* HEDEF ÖZET WIDGET'I */}
          <MyGoalsWidget />
          
          {/* YAKLAŞAN ÖDEMELER ALANI */}
          <UpcomingPayments />
          
        </div>
      </div>
    </div>
  );
};

export default Home;