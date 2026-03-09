import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import {
  ArrowLeft,
  Plus,
  Minus,
  Clock,
  Users,
  Loader2,
  X,
  Wallet,
  Heart,
  Calendar,
} from "lucide-react";
import { fetchGoalById } from "../../services/goalService";

const MyGoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Modal State'leri
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [actionAmount, setActionAmount] = useState("");
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    const getSingleGoal = async () => {
      try {
        const data = await fetchGoalById(id);
        setGoal(data);
        // Sayfa açıldığında hedef %100 ise konfetiyi patlat
        if (data.currentAmount >= data.targetAmount) {
          setShowConfetti(true);
        }
      } catch (err) {
        setError("Hedef bulunamadı veya silinmiş.");
      } finally {
        setLoading(false);
      }
    };

    getSingleGoal();
  }, [id]);

  // --- AKILLI MATEMATİK HESAPLAMALARI ---
  const calculateInsights = () => {
    if (!goal || !goal.targetDate) return null;

    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0)
      return { status: "completed", message: "Hedefine ulaştın! Harikasın!" };

    const targetDateObj = new Date(goal.targetDate);
    const today = new Date();
    const diffTime = targetDateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0)
      return {
        status: "late",
        message: "Hedef tarihi geçti, biraz hızlanmalısın!",
      };

    const daily = (remaining / diffDays).toFixed(0);
    const monthly = (daily * 30).toFixed(0);

    return {
      status: "active",
      days: diffDays,
      daily: parseInt(daily).toLocaleString("tr-TR"),
      monthly: parseInt(monthly).toLocaleString("tr-TR"),
    };
  };

  // --- SOSYAL ETKİLEŞİM: BEĞENİ (LIKE) ---
  const handleLike = (historyId) => {
    setGoal((prev) => ({
      ...prev,
      history: prev.history.map((item) => {
        if (item.id === historyId) {
          const newIsLiked = !item.isLiked;
          return {
            ...item,
            isLiked: newIsLiked,
            likes: item.likes + (newIsLiked ? 1 : -1),
          };
        }
        return item;
      }),
    }));
  };

  // --- İŞLEM: PARA EKLE / ÇEK ---
  const handleTransaction = (e, type) => {
    e.preventDefault();
    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Eğer para çekilecekse ve bakiye yetersizse uyar
    if (type === "withdraw" && amount > goal.currentAmount) {
      alert("Biriken tutardan fazlasını çekemezsin!");
      return;
    }

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

    const actionText = type === "add" ? "Para Eklendi" : "Para Çekildi";
    const finalActionNote = actionNote
      ? `${actionText} (${actionNote})`
      : actionText;
    const transactionAmount = type === "add" ? amount : -amount;

    const newHistoryItem = {
      id: Date.now(),
      user: "Ayberk",
      action: finalActionNote,
      amount: transactionAmount,
      date: formattedDate,
      time: formattedTime,
      likes: 0,
      isLiked: false,
    };

    setGoal((prevGoal) => {
      const updatedContributors = [...prevGoal.contributors];
      const userIndex = updatedContributors.findIndex(
        (c) => c.name === "Ayberk",
      );

      if (userIndex !== -1) {
        updatedContributors[userIndex].amount += transactionAmount;
      } else if (type === "add") {
        updatedContributors.push({
          name: "Ayberk",
          amount: amount,
          avatarColor: "bg-blue-100 text-blue-600",
        });
      }

      const newCurrentAmount = prevGoal.currentAmount + transactionAmount;

      // İşlem sonrası %100 olduysa konfeti patlat
      if (newCurrentAmount >= prevGoal.targetAmount && type === "add") {
        setShowConfetti(true);
      } else {
        setShowConfetti(false); // Geri düştüyse konfetiyi durdur
      }

      return {
        ...prevGoal,
        currentAmount: newCurrentAmount,
        contributors: updatedContributors,
        history: [newHistoryItem, ...prevGoal.history],
      };
    });

    setActionAmount("");
    setActionNote("");
    setIsAddMoneyOpen(false);
    setIsWithdrawOpen(false);
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
  const insights = calculateInsights();

  return (
    <div className="max-w-5xl mx-auto w-full pb-24 md:pb-10 pt-6 px-4 md:px-8 relative">
      {showConfetti && (
        <div className="fixed inset-0 z-[999] pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={600}
            gravity={0.15}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/my-goal")}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-800 transition-colors shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hedef Detayı</h1>
          <p className="text-sm text-gray-500">
            Ortak hedefine ait ilerleme ve geçmiş
          </p>
        </div>
      </div>

      {/* Hero Kartı */}
      <div className="relative h-64 md:h-80 w-full rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <img
          src={goal.image}
          alt={goal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

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

      <div className="mt-8 space-y-8">
        {/* --- AKILLI MATEMATİK KARTI --- */}
        {insights && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="bg-white p-3 rounded-xl text-[#007AFF] shadow-sm">
              <Calendar size={28} />
            </div>
            <div className="flex-1">
              {insights.status === "active" ? (
                <>
                  <h4 className="font-bold text-gray-800 text-lg">
                    Hedefe {insights.days} Gün Kaldı
                  </h4>
                  <p className="text-gray-600 text-sm mt-0.5">
                    Hedefe ulaşmak için günde{" "}
                    <strong className="text-[#007AFF]">
                      {insights.daily} ₺
                    </strong>{" "}
                    veya ayda{" "}
                    <strong className="text-[#007AFF]">
                      {insights.monthly} ₺
                    </strong>{" "}
                    ayırmalısın.
                  </p>
                </>
              ) : (
                <h4 className="font-bold text-[#007AFF] text-lg">
                  {insights.message}
                </h4>
              )}
            </div>
          </div>
        )}

        {/* İlerleme Çubuğu ve Aksiyon Butonları */}
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

          <div className="flex gap-2 w-full md:w-auto">
            {/* PARA ÇEK BUTONU */}
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 md:flex-none bg-red-50 text-red-600 px-5 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
            >
              <Minus size={20} strokeWidth={3} />
            </button>
            {/* PARA EKLE BUTONU */}
            <button
              onClick={() => setIsAddMoneyOpen(true)}
              className="flex-[3] md:flex-none bg-[#007AFF] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 hover:scale-105 transition-all shadow-[0_4px_20px_rgba(0,122,255,0.3)] shrink-0"
            >
              <Plus size={20} strokeWidth={3} />
              Para Ekle
            </button>
          </div>
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

        {/* Geçmiş ve Beğeni Sistemi */}
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
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${item.amount > 0 ? "bg-blue-50 text-[#007AFF]" : "bg-red-50 text-red-500"}`}
                >
                  {item.amount > 0 ? (
                    <Plus size={18} strokeWidth={3} />
                  ) : (
                    <Minus size={18} strokeWidth={3} />
                  )}
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

                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`font-bold ${item.amount > 0 ? "text-gray-900" : "text-red-500"}`}
                  >
                    {item.amount > 0 ? "+" : ""}
                    {item.amount.toLocaleString("tr-TR")} ₺
                  </div>
                  {/* Beğeni Butonu */}
                  <button
                    onClick={() => handleLike(item.id)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                      item.isLiked
                        ? "bg-red-50 text-red-500"
                        : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400"
                    }`}
                  >
                    <Heart
                      size={14}
                      fill={item.isLiked ? "currentColor" : "none"}
                    />
                    {item.likes > 0 && item.likes}
                  </button>
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

            <form
              onSubmit={(e) => handleTransaction(e, "add")}
              className="p-6 space-y-5"
            >
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
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
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

      {/* --- PARA ÇEKME MODALI (POP-UP) --- */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-red-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-red-500" size={24} />
                Para Çek
              </h2>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => handleTransaction(e, "withdraw")}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Çekilecek Tutar (₺)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Örn: 500"
                    required
                    min="1"
                    max={goal.currentAmount}
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 text-lg font-bold text-red-500 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    ₺
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Kullanılabilir Bakiye:{" "}
                  {goal.currentAmount.toLocaleString("tr-TR")} ₺
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Çekim Nedeni (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Acil ihtiyaç, vazgeçildi..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Minus size={20} strokeWidth={3} />
                  Hedeften Düş
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
