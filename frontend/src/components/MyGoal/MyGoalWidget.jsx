import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target, ChevronRight, Loader2 } from "lucide-react";
import { fetchGoals } from "../../services/goalService";

const MyGoalWidget = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllGoals = async () => {
      try {
        const data = await fetchGoals();
        setGoals(data);
      } catch (error) {
        console.error("Widget verisi çekilemedi", error);
      } finally {
        setLoading(false);
      }
    };

    getAllGoals();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#007AFF]" size={32} />
      </div>
    );
  }

  //if (!goals || goals.length === 0) return null;

  return (
    <div className="bg-white rounded-[32px] p-5 md:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-50">
      {/* Üst Bilgi Başlığı */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="font-bold text-gray-900 flex items-center gap-3 text-xl md:text-2xl tracking-tight">
          <div className="bg-blue-50 p-2.5 rounded-2xl">
            <Target size={22} className="text-[#007AFF]" />
          </div>
          Aktif Hedeflerim
        </h2>

        <button
          onClick={() => navigate("/my-goal")}
          className="text-sm font-semibold text-gray-400 hover:text-[#007AFF] flex items-center transition-colors gap-0.5"
        >
          Tümü <ChevronRight size={18} />
        </button>
      </div>

      {/* Yatay Kaydırılabilir DEV Slider Alanı */}
      {/* Mobilde ekranın %80'i, daha büyük ekranlarda tam %50'si (aradaki boşluk çıkarılarak) */}
      <div className="flex overflow-x-auto gap-5 md:gap-6 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {goals.map((goal) => {
          const progressPercentage = Math.min(
            (goal.currentAmount / goal.targetAmount) * 100,
            100,
          ).toFixed(1);

          return (
            <div
              key={goal.id}
              onClick={() => navigate(`/my-goal/${goal.id}`)}
              className="w-[80%] sm:w-[calc(50%-10px)] md:w-[calc(50%-12px)] shrink-0 bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 cursor-pointer snap-start flex flex-col group"
            >
              {/* Resim Alanı - Kenardan Kenara (Bleed) ve Uzatılmış Yükseklik */}
              <div className="w-full h-64 sm:h-72 md:h-96 shrink-0 relative overflow-hidden bg-gray-50">
                <img
                  src={goal.image}
                  alt={goal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Modern Resim Üzeri Degrade (Yazı okunurluğu ve şıklık için) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 transition-opacity duration-300"></div>

                {/* Yüzde Rozeti - Resim üzerine şık bir şekilde yerleştirildi */}
                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm text-[#007AFF] font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-full shadow-inner">
                  %{progressPercentage}
                </div>
              </div>

              {/* Bilgi Alanı - Alt kısım padding'li */}
              <div className="p-5 md:p-6 flex-1 flex flex-col">
                {/* İsim - Büyütüldü */}
                <h3 className="font-extrabold text-gray-950 text-xl md:text-2xl tracking-tighter line-clamp-1 group-hover:text-[#007AFF] transition-colors">
                  {goal.title}
                </h3>

                {/* Para - Kalın font ve daha okunaklı */}
                <p className="text-sm md:text-base text-gray-600 mt-2 font-semibold tracking-wide">
                  {goal.currentAmount.toLocaleString("tr-TR")} ₺ /{" "}
                  <span className="text-gray-400 font-medium">
                    {goal.targetAmount.toLocaleString("tr-TR")} ₺
                  </span>
                </p>

                {/* İlerleme Çubuğu - En alta sabitlendi */}
                <div className="mt-auto pt-6">
                  <div className="w-full bg-gray-100 rounded-full h-2.5 md:h-3 overflow-hidden">
                    <div
                      className="bg-[#007AFF] h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      {/* Çubuk içi hafif parlama efekti */}
                      <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyGoalWidget;
