import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Plus, Users, Loader2, ChevronRight } from "lucide-react";
// Servis dosyanı nerede oluşturduysan yolu ona göre ayarla
import { fetchGoals } from "../../services/goalService";

const MyGoal = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getGoalsData = async () => {
      try {
        const data = await fetchGoals();
        setGoals(data);
      } catch (error) {
        console.error("Veriler çekilirken hata oluştu", error);
      } finally {
        setLoading(false);
      }
    };

    getGoalsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#007AFF] mb-4" size={40} />
        <p className="text-gray-500 font-medium">Hedeflerin yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Üst Kısım: Başlık ve Ekleme Butonu */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="text-[#007AFF]" size={32} />
            Hedeflerim
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Hayallerin için birikim yap, hedefini gözünün önünde tut.
          </p>
        </div>

        <button className="bg-[#007AFF] hover:bg-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-[0_4px_15px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.4)]">
          <Plus size={20} strokeWidth={2.5} />
          <span className="hidden md:inline">Yeni Hedef</span>
        </button>
      </div>

      {/* Hedef Kartları Grid Yapısı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map((goal) => {
          const progressPercentage = Math.min(
            (goal.currentAmount / goal.targetAmount) * 100,
            100,
          ).toFixed(1);

          return (
            <div
              key={goal.id}
              onClick={() => navigate(`/my-goal/${goal.id}`)}
              className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_40px_rgba(0,122,255,0.15)] transition-all duration-300 cursor-pointer group flex flex-col border border-gray-100 overflow-hidden"
            >
              {/* VİTRİN: Resim Tam Üstte ve Geniş */}
              <div className="w-full h-48 sm:h-52 relative overflow-hidden bg-gray-100">
                <img
                  src={goal.image}
                  alt={goal.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#007AFF] shadow-sm">
                  %{progressPercentage} Tamamlandı
                </div>
              </div>

              {/* ALT KISIM: Bilgiler ve Bar */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-1">
                    {goal.title}
                  </h3>
                  <div className="text-[#007AFF] font-bold text-lg">
                    {goal.currentAmount.toLocaleString("tr-TR")} ₺
                    <span className="text-gray-400 text-sm font-medium ml-1">
                      / {goal.targetAmount.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                </div>

                {/* İlerleme Çubuğu */}
                <div className="mt-auto">
                  <div className="w-full bg-blue-50 rounded-full h-3 overflow-hidden mb-4">
                    <div
                      className="bg-[#007AFF] h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 rounded-full"></div>
                    </div>
                  </div>

                  {/* Katılımcılar */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                      <Users size={16} className="text-gray-400" />
                      <span>{goal.contributors.length} Katılımcı</span>
                    </div>

                    <div className="flex -space-x-2">
                      {goal.contributors.slice(0, 3).map((user, index) => (
                        <div
                          key={index}
                          className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${user.avatarColor || "bg-blue-100 text-[#007AFF]"}`}
                        >
                          {user.name.charAt(0)}
                        </div>
                      ))}
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

export default MyGoal;
