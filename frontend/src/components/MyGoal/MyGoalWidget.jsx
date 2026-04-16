import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target, ChevronRight, Loader2, Users } from "lucide-react";
import { fetchGoals } from "../../services/goalService";
import { apiGet } from "../../services/api";

const MyGoalWidget = () => {
  const navigate = useNavigate();
  const [goals, setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllGoals = async () => {
      try {
        const token = localStorage.getItem("token");

        // Own goals
        const ownGoals = await fetchGoals();

        // Shared goals
        let sharedGoals = [];
        try {
          const headers = token
            ? { Authorization: token, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
          const res = await fetch("http://localhost:3000/api/friends/shared-goals", { headers });
          if (res.ok) {
            const json = await res.json();
            sharedGoals = (json.sharedGoals || []).map((g) => ({ ...g, isShared: true }));
          }
        } catch (e) {}

        setGoals([...ownGoals, ...sharedGoals]);
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
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-[32px] p-6 shadow-sm border border-gray-50 flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#007AFF]" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-[32px] p-5 md:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-50">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-3 text-xl md:text-2xl tracking-tight">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-2xl">
            <Target size={22} className="text-[#007AFF]" />
          </div>
          Aktif Hedeflerim
        </h2>
        <button
          onClick={() => navigate("/my-goal")}
          className="text-sm font-semibold text-gray-400 dark:text-gray-500 dark:hover:text-blue-400 hover:text-[#007AFF] flex items-center transition-colors gap-0.5"
        >
          Tümü <ChevronRight size={18} />
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Henüz hedef oluşturmadın.</p>
          <button
            onClick={() => navigate("/my-goal")}
            className="mt-4 text-[#007AFF] font-semibold text-sm hover:underline"
          >
            İlk hedefini oluştur →
          </button>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-5 md:gap-6 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {goals.map((goal) => {
            const progressPercentage = Math.min(
              (goal.currentAmount / goal.targetAmount) * 100,
              100
            ).toFixed(1);

            return (
              <div
                key={goal.id}
                onClick={() => navigate(`/my-goal/${goal.id}`)}
                className="w-[80%] sm:w-[calc(50%-10px)] md:w-[calc(50%-12px)] shrink-0 bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500/30 border border-gray-100 rounded-[28px] overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 cursor-pointer snap-start flex flex-col group relative"
              >
                {goal.isShared && (
                  <div className="absolute top-4 left-4 z-10 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <Users size={10} /> {goal.ownerName || "Ortak Hedef"}
                  </div>
                )}

                <div className="w-full h-64 sm:h-72 md:h-96 shrink-0 relative overflow-hidden bg-gray-50 dark:bg-gray-700">
                  <img
                    src={goal.image}
                    alt={goal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm text-[#007AFF] font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-full shadow-inner">
                    %{progressPercentage}
                  </div>
                </div>

                <div className="p-5 md:p-6 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-gray-950 dark:text-white text-xl md:text-2xl tracking-tighter line-clamp-1 group-hover:text-[#007AFF] transition-colors">
                    {goal.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-2 font-semibold tracking-wide">
                    {goal.currentAmount.toLocaleString("tr-TR")} ₺{" "}
                    <span className="text-gray-400 font-medium">
                      / {goal.targetAmount.toLocaleString("tr-TR")} ₺
                    </span>
                  </p>

                  <div className="mt-auto pt-6">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 md:h-3 overflow-hidden">
                      <div
                        className="bg-[#007AFF] h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyGoalWidget;
