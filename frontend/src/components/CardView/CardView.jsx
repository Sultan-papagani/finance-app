import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPatch, apiPost } from "../../services/api";
import * as LucideIcons from "lucide-react";

const CARD_COLORS = [
  { label: "Koyu",    value: "bg-gray-800" },
  { label: "Mavi",    value: "bg-blue-600" },
  { label: "Mor",     value: "bg-violet-600" },
  { label: "Yeşil",   value: "bg-emerald-600" },
  { label: "Kırmızı", value: "bg-rose-600" },
  { label: "Turuncu", value: "bg-amber-600" },
];

function CardView() {
  const [cards, setCards]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard]       = useState({ name: "", initialBalance: "", color: "bg-gray-800" });
  const [isSaving, setIsSaving]     = useState(false);
  const navigate = useNavigate();

  const fetchAndInitializeCards = useCallback(async () => {
    try {
      const data = await apiGet("/api/user/finances");
      let userCards = data.cards || [];

      if (userCards.length === 0) {
        const defaultCard = {
          id: `card_${Date.now()}`,
          name: "Hesabım",
          balance: 0,
          color: "bg-gray-800",
          history: [],
        };
        userCards = [defaultCard];
        await apiPatch("/api/user/finances", { cards: userCards });
      }

      setCards(userCards);
    } catch (error) {
      console.error("Kart verileri alınamadı:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndInitializeCards();
  }, [fetchAndInitializeCards]);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiPost("/api/cards", {
        name: newCard.name,
        initialBalance: Number(newCard.initialBalance) || 0,
        color: newCard.color,
      });
      setNewCard({ name: "", initialBalance: "", color: "bg-gray-800" });
      setIsModalOpen(false);
      await fetchAndInitializeCards();
    } catch (err) {
      alert("Kart oluşturulamadı: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-[30px] w-full mb-8" />;
  }

  return (
    <div className="w-full mb-8 relative">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-[#04009A] flex items-center gap-2">
          <LucideIcons.Wallet size={24} /> Cüzdanım
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-[#007AFF] text-sm font-bold flex items-center gap-1 hover:underline"
        >
          <LucideIcons.Plus size={16} /> Yeni Kart
        </button>
      </div>

      {/* Horizontally scrollable card slider */}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(`/card/${card.id}`)}
            className={`snap-center shrink-0 w-[85%] sm:w-[320px] h-[180px] rounded-[30px] p-6 flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative overflow-hidden ${card.color || "bg-gray-800"} text-white`}
          >
            <div className="absolute -top-10 -right-10 opacity-20 pointer-events-none">
              <LucideIcons.Wifi size={160} strokeWidth={1} />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="font-semibold tracking-wider text-sm opacity-90">{card.name}</span>
              <LucideIcons.Nfc size={28} className="opacity-80" />
            </div>
            <div className="relative z-10">
              <p className="text-xs opacity-80 mb-1 font-medium">Toplam Bakiye</p>
              <h3 className="text-3xl font-black tracking-tight">
                {card.balance.toLocaleString("tr-TR")} <span className="text-xl">₺</span>
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ---- New Card Modal ---- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Yeni Kart Oluştur</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <LucideIcons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="p-6 space-y-5">
              {/* Card name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kart Adı</label>
                <input
                  required
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  placeholder="Örn: Birikim Hesabım"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Initial balance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Başlangıç Bakiyesi (₺)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newCard.initialBalance}
                  onChange={(e) => setNewCard({ ...newCard, initialBalance: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kart Rengi</label>
                <div className="flex flex-wrap gap-3">
                  {CARD_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => setNewCard({ ...newCard, color: c.value })}
                      className={`w-10 h-10 rounded-xl ${c.value} transition-all ${
                        newCard.color === c.value
                          ? "ring-2 ring-offset-2 ring-[#007AFF] scale-110"
                          : "hover:scale-105 opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className={`${newCard.color} rounded-2xl p-4 text-white text-sm font-semibold opacity-90`}>
                <div className="flex justify-between mb-2">
                  <span>{newCard.name || "Kart Adı"}</span>
                  <LucideIcons.Nfc size={18} className="opacity-70" />
                </div>
                <p className="text-xs opacity-70 mb-0.5">Başlangıç Bakiyesi</p>
                <p className="text-xl font-black">
                  {Number(newCard.initialBalance || 0).toLocaleString("tr-TR")} ₺
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 flex justify-center items-center gap-2 transition-all"
              >
                {isSaving ? (
                  <LucideIcons.Loader2 className="animate-spin" size={20} />
                ) : (
                  "Kartı Oluştur"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardView;
