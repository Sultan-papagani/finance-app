import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Clock, Users, Loader2 } from "lucide-react";
import { fetchGoalById } from "../../services/goalService";

const MyGoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSingleGoal = async () => {
      try {
        const data = await fetchGoalById(id);
        setGoal(data);
      } catch (err) {
        setError("Hedef bulunamadı veya silinmiş.");
      } finally {
        setLoading(false);
      }
    };

    getSingleGoal();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#007AFF] mb-4" size={40} />
        <p className="text-gray-500 font-medium">Detaylar getiriliyor...</p>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Oops!</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => navigate("/my-goal")}
          className="bg-[#007AFF] text-white px-6 py-2 rounded-xl"
        >
          Hedeflerime Dön
        </button>
      </div>
    );
  }

  const progressPercentage = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100,
  ).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto w-full pb-24 md:pb-10">
      {/* Üst Kısım (Hero) */}
      <div className="relative h-64 md:h-80 w-full rounded-b-[40px] overflow-hidden shadow-lg">
        <img
          src={goal.image}
          alt={goal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <button
          onClick={() => navigate("/my-goal")}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="absolute bottom-8 left-6 right-6 text-white">
          <div className="bg-blue-500 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3 shadow-md">
            Ortak Hedef
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 shadow-sm">
            {goal.title}
          </h1>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold">
              {goal.currentAmount.toLocaleString("tr-TR")} ₺
            </span>
            <span className="text-white/70 mb-1">
              / {goal.targetAmount.toLocaleString("tr-TR")} ₺
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-8">
        {/* Büyük İlerleme Çubuğu ve Aksiyon */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 font-medium text-sm">
                Genel İlerleme
              </span>
              <span className="text-[#007AFF] font-bold text-lg">
                %{progressPercentage}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-[#007AFF] h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/40 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          <button className="w-full md:w-auto bg-[#007AFF] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 hover:scale-105 transition-all shadow-[0_4px_20px_rgba(0,122,255,0.3)] shrink-0">
            <Plus size={20} strokeWidth={3} />
            Para Ekle
          </button>
        </div>

        {/* Katkıda Bulunanlar */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Users size={22} className="text-[#007AFF]" />
            Katkı Payları
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goal.contributors.map((user, index) => {
              const userContributionPercent = (
                (user.amount / goal.targetAmount) *
                100
              ).toFixed(1);

              return (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${user.avatarColor || "bg-blue-100 text-blue-600"}`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{user.name}</h4>
                    <p className="text-sm text-gray-500">
                      {user.amount.toLocaleString("tr-TR")} ₺ eklendi
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#007AFF]">
                      %{userContributionPercent}
                    </div>
                    <div className="text-[10px] text-gray-400">Katkı</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geçmiş (History) */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Clock size={22} className="text-[#007AFF]" />
            Son İşlemler
          </h3>
          <div className="bg-white rounded-[24px] border border-gray-100 p-2">
            {goal.history.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 ${index !== goal.history.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#007AFF]">
                  <Plus size={18} strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">
                    <span className="text-[#007AFF]">{item.user}</span>{" "}
                    {item.action}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.date} • {item.time}
                  </p>
                </div>
                <div className="font-bold text-gray-900">
                  +{item.amount.toLocaleString("tr-TR")} ₺
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGoalDetail;
