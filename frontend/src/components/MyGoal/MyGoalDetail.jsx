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
  Key,
  Copy,
  Check,
  CreditCard,
} from "lucide-react";
import { fetchGoals, saveGoals } from "../../services/goalService";
import { apiGet, apiPost } from "../../services/api";

// Avatar color pool for contributors
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

function getAvatarColor(name, index) {
  if (!name) return AVATAR_COLORS[0];
  const code = name.charCodeAt(0) + (index || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

const MyGoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal]           = useState(null);
  const [allGoals, setAllGoals]   = useState([]);
  const [username, setUsername]   = useState("Kullanıcı");
  const [cards, setCards]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [isAddMoneyOpen, setIsAddMoneyOpen]   = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen]   = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [copied, setCopied]       = useState(false);

  const [actionAmount, setActionAmount]   = useState("");
  const [actionNote, setActionNote]       = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const [ownGoals, profile, finances] = await Promise.all([
          fetchGoals(),
          apiGet("/api/user/profile"),
          apiGet("/api/user/finances"),
        ]);

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

        const combinedGoals = [...ownGoals, ...sharedGoals];

        setAllGoals(ownGoals);
        setUsername(profile.username);
        setCards(finances.cards || []);

        const found = combinedGoals.find((g) => g.id.toString() === id.toString());
        if (!found) throw new Error("Hedef bulunamadı");

        setGoal(found);
        if (found.currentAmount >= found.targetAmount) setShowConfetti(true);
      } catch (err) {
        setError("Hedef bulunamadı veya silinmiş.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Persist own goals back to the server
  const persistGoal = (updatedGoal) => {
    if (updatedGoal.isShared) return;
    const updatedAll = allGoals.map((g) =>
      g.id.toString() === updatedGoal.id.toString() ? updatedGoal : g
    );
    setAllGoals(updatedAll);
    saveGoals(updatedAll).catch((err) => console.error("Kaydetme hatası:", err));
  };

  const handleTransaction = async (e, type) => {
    e.preventDefault();

    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (type === "withdraw" && amount > goal.currentAmount)
      return alert("Bakiyeden fazlasını çekemezsin!");

    const finalNote = actionNote
      ? `${type === "add" ? "Para Eklendi" : "Para Çekildi"} (${actionNote})`
      : type === "add"
      ? "Para Eklendi"
      : "Para Çekildi";

    if (goal.isShared) {
      // Shared goal → backend handles it
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:3000/api/friends/shared-goals/${goal.id}/transaction`,
          {
            method: "POST",
            headers: { Authorization: token, "Content-Type": "application/json" },
            body: JSON.stringify({ amount, type, actionNote: finalNote }),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setGoal({ ...data.updatedGoal, isShared: true, ownerName: goal.ownerName });
          if (data.updatedGoal.currentAmount >= goal.targetAmount && type === "add")
            setShowConfetti(true);
        } else {
          alert(data.error || "İşlem başarısız.");
        }
      } catch (err) {
        alert("Sunucuya bağlanılamadı.");
      }
    } else {
      // Own goal → update locally then persist
      const now = new Date();
      const txAmount = type === "add" ? amount : -amount;

      const newHistoryItem = {
        id: Date.now(),
        user: username,
        action: finalNote,
        amount: txAmount,
        date: now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
        time: now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        likes: 0,
        isLiked: false,
      };

      const newCurrentAmount = goal.currentAmount + txAmount;
      if (newCurrentAmount >= goal.targetAmount && type === "add") setShowConfetti(true);

      // Update contributors array
      let updatedContributors = [...(goal.contributors || [])];
      if (type === "add") {
        const idx = updatedContributors.findIndex((c) => c.name === username);
        if (idx > -1) {
          updatedContributors[idx] = {
            ...updatedContributors[idx],
            amount: updatedContributors[idx].amount + amount,
          };
        } else {
          const colorIdx = updatedContributors.length;
          updatedContributors.push({
            name: username,
            amount,
            avatarColor: getAvatarColor(username, colorIdx),
          });
        }
      } else if (type === "withdraw") {
        const idx = updatedContributors.findIndex((c) => c.name === username);
        if (idx > -1) {
          updatedContributors[idx] = {
            ...updatedContributors[idx],
            amount: Math.max(0, updatedContributors[idx].amount - amount),
          };
        }
      }

      const updatedGoal = {
        ...goal,
        currentAmount: newCurrentAmount,
        contributors: updatedContributors,
        history: [newHistoryItem, ...goal.history],
      };
      setGoal(updatedGoal);
      persistGoal(updatedGoal);

      // If a card was selected, also deduct/add on that card
      if (selectedCardId) {
        try {
          await apiPost("/api/transactions", {
            cardId: selectedCardId,
            amount,
            type: type === "add" ? "expense" : "income",
            description: `Hedef: ${goal.title} – ${finalNote}`,
          });
          // Refresh local cards list so CardView shows updated balance
          const updatedFinances = await apiGet("/api/user/finances");
          setCards(updatedFinances.cards || []);
        } catch (err) {
          console.warn("Kart bakiyesi güncellenemedi:", err.message);
        }
      }
    }

    setActionAmount("");
    setActionNote("");
    setSelectedCardId("");
    setIsAddMoneyOpen(false);
    setIsWithdrawOpen(false);
  };

  const handleGenerateCode = async () => {
    if (goal.isShared) return alert("Başkasının ortak hedefine kod üretemezsin!");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/friends/generate-code", {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: goal.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setShareCode(data.code);
        setIsShareModalOpen(true);
        setCopied(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Sunucu hatası.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin text-[#007AFF]" size={40} />
      </div>
    );
  if (error || !goal)
    return <div className="text-center mt-20 text-red-500 font-semibold">{error}</div>;

  const progressPercentage = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100
  ).toFixed(1);

  const selectedCard = cards.find((c) => c.id === selectedCardId);

  return (
    <div className="max-w-5xl mx-auto w-full pb-24 md:pb-10 pt-6 px-4 md:px-8 relative">
      {showConfetti && (
        <div className="fixed inset-0 z-[999] pointer-events-none">
          <Confetti recycle={false} numberOfPieces={600} />
        </div>
      )}

      {/* Back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/my-goal")}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hedef Detayı</h1>
          {goal.isShared && (
            <p className="text-sm font-semibold text-[#007AFF]">
              Ortak Hedef ({goal.ownerName})
            </p>
          )}
        </div>
      </div>

      {/* Hero image */}
      <div className="relative h-64 md:h-80 w-full rounded-[32px] overflow-hidden shadow-lg mb-8">
        <img src={goal.image} alt={goal.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-6 right-6 text-white z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{goal.title}</h1>
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

      {/* Progress + action buttons */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center mb-8">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 font-medium text-sm">Genel İlerleme</span>
            <span className="text-[#007AFF] font-bold text-lg">%{progressPercentage}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-[#007AFF] h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {goal.targetDate && (
            <p className="text-xs text-gray-400 font-medium mt-2">
              Hedef tarihi:{" "}
              {new Date(goal.targetDate).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="bg-red-50 text-red-600 px-5 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors"
          >
            <Minus size={20} strokeWidth={3} />
          </button>
          <button
            onClick={() => setIsAddMoneyOpen(true)}
            className="bg-[#007AFF] text-white px-8 py-4 rounded-xl font-bold flex gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} strokeWidth={3} /> Para Ekle
          </button>
        </div>
      </div>

      {/* ---- Contributors Section ---- */}
      {goal.contributors && goal.contributors.length > 0 && (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Users size={22} className="text-[#007AFF]" /> Katkıda Bulunanlar
          </h3>
          <div className="space-y-3">
            {goal.contributors.map((c, i) => {
              const pct =
                goal.currentAmount > 0
                  ? Math.min((c.amount / goal.currentAmount) * 100, 100).toFixed(0)
                  : 0;
              const initials = c.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const color = c.avatarColor || getAvatarColor(c.name, i);
              return (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{c.name}</span>
                      <span className="text-sm font-bold text-[#007AFF]">
                        {c.amount.toLocaleString("tr-TR")} ₺
                        <span className="text-gray-400 font-normal ml-1 text-xs">(%{pct})</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#007AFF] h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Invite section (own goals only) ---- */}
      {!goal.isShared && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Users size={22} className="text-[#007AFF]" /> Davet Et
          </h3>
          <button
            onClick={handleGenerateCode}
            className="w-full sm:w-1/2 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 flex items-center gap-4 hover:border-[#007AFF] hover:bg-blue-50/50 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-200 group-hover:border-[#007AFF] group-hover:text-[#007AFF] text-gray-400 transition-colors shadow-sm">
              <Key size={24} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-600 group-hover:text-[#007AFF]">
                Davet Kodu Üret
              </h4>
              <p className="text-sm text-gray-400">Arkadaşlarını ortak hedefe davet et</p>
            </div>
          </button>
        </div>
      )}

      {/* ---- History ---- */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Clock size={22} className="text-[#007AFF]" /> Son İşlemler
        </h3>
        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
          {goal.history.length === 0 ? (
            <p className="text-center text-gray-400 py-8 font-medium">
              Henüz bir işlem yok.
            </p>
          ) : (
            goal.history.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 ${
                  index < goal.history.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(item.user, 0)}`}
                >
                  {item.user
                    ? item.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm truncate">
                    <span className="text-[#007AFF]">{item.user}</span>{" "}
                    {item.action}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium">
                    {item.date}
                    {item.time ? ` · ${item.time}` : ""}
                  </p>
                </div>
                <div
                  className={`font-bold text-sm shrink-0 ${
                    item.amount > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.amount > 0 ? "+" : ""}
                  {item.amount.toLocaleString("tr-TR")} ₺
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---- Share code modal ---- */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 relative">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Davet Kodu Üretildi!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Bu kodu arkadaşınla paylaşarak hedefi ortak takip edebilirsiniz. Kod 1 saat
              geçerlidir.
            </p>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 mb-6">
              <div className="text-4xl font-black tracking-widest text-gray-800">
                {shareCode}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? "Kopyalandı!" : "Kodu Kopyala"}
            </button>
          </div>
        </div>
      )}

      {/* ---- Add Money modal ---- */}
      {isAddMoneyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-[#007AFF]" size={24} /> Para Ekle
              </h2>
              <button
                onClick={() => setIsAddMoneyOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => handleTransaction(e, "add")} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Eklenecek Tutar (₺)
                </label>
                <div className="relative">
                  <input
                    type="number"
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
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Örn: Bu ayki birikimim"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>

              {/* Card picker — only for own goals */}
              {!goal.isShared && cards.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <CreditCard size={16} className="text-gray-400" />
                    Hangi Karttan? (İsteğe Bağlı)
                  </label>
                  <select
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">— Kart seçme, sadece kaydet —</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.balance.toLocaleString("tr-TR")} ₺)
                      </option>
                    ))}
                  </select>
                  {selectedCardId && (
                    <p className="text-xs text-amber-600 font-medium mt-1.5 ml-1">
                      Bu tutar "{selectedCard?.name}" kartından düşülecek.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} strokeWidth={3} /> Hedefe Aktar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---- Withdraw modal ---- */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-red-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-red-500" size={24} /> Para Çek
              </h2>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => handleTransaction(e, "withdraw")} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Çekilecek Tutar (₺)
                </label>
                <div className="relative">
                  <input
                    type="number"
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Çekim Nedeni (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm"
                />
              </div>

              {/* Card picker — receive withdrawn money back to a card */}
              {!goal.isShared && cards.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <CreditCard size={16} className="text-gray-400" />
                    Hangi Karta Yüklesin? (İsteğe Bağlı)
                  </label>
                  <select
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">— Kart seçme —</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.balance.toLocaleString("tr-TR")} ₺)
                      </option>
                    ))}
                  </select>
                  {selectedCardId && (
                    <p className="text-xs text-green-600 font-medium mt-1.5 ml-1">
                      Bu tutar "{selectedCard?.name}" kartına eklenecek.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Minus size={20} strokeWidth={3} /> Hedeften Düş
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGoalDetail;
