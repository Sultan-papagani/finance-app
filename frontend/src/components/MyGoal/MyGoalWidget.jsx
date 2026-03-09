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
        setGoals(data); // Artık sadece ilkini değil, hepsini state'e kaydediyoruz
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
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex justify-center items-center h-32">
        <Loader2 className="animate-spin text-[#007AFF]" size={24} />
      </div>
    );
  }

  if (!goals || goals.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
      {/* Üst Bilgi Başlığı */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 text-base md:text-lg">
          <div className="bg-blue-50 p-1.5 rounded-lg">
            <Target size={18} className="text-[#007AFF]" />
          </div>
          Aktif Hedeflerim
        </h2>

        <button
          onClick={() => navigate("/my-goal")}
          className="text-sm font-medium text-gray-400 hover:text-[#007AFF] flex items-center transition-colors"
        >
          Tümü <ChevronRight size={16} />
        </button>
      </div>

      {/* Tüm Hedefleri Alt Alta Listeleme */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const progressPercentage = Math.min(
            (goal.currentAmount / goal.targetAmount) * 100,
            100,
          ).toFixed(1);

          return (
            <div
              key={goal.id}
              onClick={() => navigate(`/my-goal/${goal.id}`)}
              className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
            >
              {/* Küçük Resim */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 shadow-inner">
                <img
                  src={goal.image}
                  alt={goal.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* İlerleme Bilgileri */}
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="font-semibold text-sm md:text-base text-gray-800 line-clamp-1 group-hover:text-[#007AFF] transition-colors">
                    {goal.title}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-[#007AFF]">
                    %{progressPercentage}
                  </span>
                </div>

                {/* İnce İlerleme Çubuğu */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#007AFF] h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>

                <div className="text-[11px] text-gray-400 mt-1 font-medium tracking-wide">
                  {goal.currentAmount.toLocaleString("tr-TR")} ₺ /{" "}
                  {goal.targetAmount.toLocaleString("tr-TR")} ₺
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
