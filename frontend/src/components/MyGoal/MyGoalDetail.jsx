import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Clock,
  Users,
  Loader2,
  X,
  Wallet,
} from "lucide-react";
import { fetchGoalById } from "../../services/goalService";

const MyGoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State'leri
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [addedAmount, setAddedAmount] = useState("");
  const [actionNote, setActionNote] = useState("");

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

  // Dinamik Para Ekleme İşlemi (Tüm UI'ı günceller)
  const handleAddMoney = (e) => {
    e.preventDefault();

    const amountToAdd = parseFloat(addedAmount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newHistoryItem = {
      id: Date.now(),
      user: "Ayberk",
      action: actionNote ? `Para Eklendi (${actionNote})` : "Para Eklendi",
      amount: amountToAdd,
      date: formattedDate,
      time: formattedTime,
    };

    setGoal((prevGoal) => {
      const updatedContributors = [...prevGoal.contributors];
      const userIndex = updatedContributors.findIndex(
        (c) => c.name === "Ayberk",
      );

      if (userIndex !== -1) {
        updatedContributors[userIndex].amount += amountToAdd;
      } else {
        updatedContributors.push({
          name: "Ayberk",
          amount: amountToAdd,
          avatarColor: "bg-blue-100 text-blue-600",
        });
      }

      return {
        ...prevGoal,
        currentAmount: prevGoal.currentAmount + amountToAdd,
        contributors: updatedContributors,
        history: [newHistoryItem, ...prevGoal.history],
      };
    });

    setAddedAmount("");
    setActionNote("");
    setIsAddMoneyOpen(false);
  };

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
    <div className="max-w-4xl mx-auto w-full pb-24 md:pb-10 relative">
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
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-colors z-10"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="absolute bottom-8 left-6 right-6 text-white z-10">
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

          <button
            onClick={() => setIsAddMoneyOpen(true)}
            className="w-full md:w-auto bg-[#007AFF] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 hover:scale-105 transition-all shadow-[0_4px_20px_rgba(0,122,255,0.3)] shrink-0"
          >
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

            {/* Büyük Arkadaş Ekle Kartı */}
            <button
              onClick={() =>
                alert("Davet linki kopyalandı! Arkadaşına gönderebilirsin.")
              }
              className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 flex items-center gap-4 hover:border-[#007AFF] hover:bg-blue-50/50 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-200 group-hover:border-[#007AFF] group-hover:text-[#007AFF] text-gray-400 transition-colors shadow-sm">
                <Plus size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-600 group-hover:text-[#007AFF] transition-colors">
                  Arkadaş Ekle
                </h4>
                <p className="text-sm text-gray-400">Ortak hedefe davet et</p>
              </div>
            </button>
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

      {/* --- PARA EKLEME MODALI (POP-UP) --- */}
      {isAddMoneyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-[#007AFF]" size={24} />
                Para Ekle
              </h2>
              <button
                onClick={() => setIsAddMoneyOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Eklenecek Tutar (₺)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Örn: 1500"
                    required
                    min="1"
                    value={addedAmount}
                    onChange={(e) => setAddedAmount(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 text-lg font-bold text-[#007AFF] rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    ₺
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Kısa Not (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Maaş yattı, harçlık..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} strokeWidth={3} />
                  Hedefe Aktar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGoalDetail;
