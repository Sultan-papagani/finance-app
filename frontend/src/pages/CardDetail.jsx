import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../services/api";
import * as LucideIcons from "lucide-react";

// Normalize a history item so the UI always gets the same shape
// regardless of whether it came from AddPayment (action/icon) or
// POST /api/transactions (description, ISO date).
function normalizeHistoryItem(item) {
  return {
    id: item.id,
    type: item.type || "expense",
    amount: Math.abs(item.amount),
    label: item.action || item.description || "İşlem",
    icon: item.icon || null,
    date: item.date
      ? typeof item.date === "string" && item.date.includes("T")
        ? new Date(item.date).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : item.date
      : "",
  };
}

function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [card, setCard]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [txForm, setTxForm]     = useState({ amount: "", description: "", type: "income" });
  const [isSaving, setIsSaving] = useState(false);

  const loadCard = useCallback(async () => {
    try {
      const data = await apiGet("/api/user/finances");
      const found = data.cards?.find((c) => c.id === id) || null;
      setCard(found);
    } catch (e) {
      console.error("Kart yüklenemedi:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!txForm.amount || Number(txForm.amount) <= 0) return;
    setIsSaving(true);
    try {
      await apiPost("/api/transactions", {
        cardId: id,
        amount: Number(txForm.amount),
        type: txForm.type,
        description: txForm.description || (txForm.type === "income" ? "Gelir" : "Gider"),
      });
      setTxForm({ amount: "", description: "", type: "income" });
      setIsAddOpen(false);
      await loadCard();
    } catch (err) {
      alert("İşlem kaydedilemedi: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex justify-center items-center">
        <LucideIcons.Loader2 className="animate-spin text-[#007AFF]" size={40} />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Kart bulunamadı!
      </div>
    );
  }

  const cardColor = card.color || "bg-gray-800";
  const history = (card.history || []).map(normalizeHistoryItem);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header / card banner */}
      <div
        className={`${cardColor} pt-12 pb-16 px-6 rounded-b-[40px] shadow-lg relative transition-colors duration-500`}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 left-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          <LucideIcons.ArrowLeft size={24} />
        </button>

        {/* Quick-add transaction button */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="absolute top-10 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
          title="Yeni İşlem Ekle"
        >
          <LucideIcons.Plus size={24} />
        </button>

        <div className="mt-12 text-center text-white">
          <p className="opacity-80 font-medium mb-1">Kart Bakiyesi</p>
          <h1 className="text-5xl font-black">
            {card.balance.toLocaleString("tr-TR")} ₺
          </h1>
          <p className="mt-2 text-lg font-bold opacity-90">{card.name}</p>
        </div>
      </div>

      {/* History list */}
      <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-[30px] shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <LucideIcons.History size={20} className="text-[#007AFF]" />
              Hesap Geçmişi
            </h3>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-[#007AFF] text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
            >
              <LucideIcons.Plus size={16} strokeWidth={3} /> İşlem Ekle
            </button>
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Henüz bu kartta bir işlem yok.
              </p>
            ) : (
              history.map((item) => {
                const Icon = LucideIcons[item.icon] || LucideIcons.CreditCard;
                const isIncome = item.type === "income";
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          isIncome
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400 font-medium">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-black text-lg ${
                        isIncome ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {item.amount.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ---- Add Transaction Modal ---- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Yeni İşlem Ekle</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <LucideIcons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransaction} className="p-6 space-y-5">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTxForm({ ...txForm, type: "income" })}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    txForm.type === "income"
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  + Gelir
                </button>
                <button
                  type="button"
                  onClick={() => setTxForm({ ...txForm, type: "expense" })}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    txForm.type === "expense"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  − Gider
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tutar (₺)
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="1"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none font-bold text-lg transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    ₺
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Açıklama (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  placeholder="Örn: Market alışverişi"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-3.5 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all ${
                  txForm.type === "income"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isSaving ? (
                  <LucideIcons.Loader2 className="animate-spin" size={20} />
                ) : (
                  "İşlemi Kaydet"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardDetail;
