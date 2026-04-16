import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPatch, apiPost } from "../../services/api";
import * as LucideIcons from "lucide-react";
import html2canvas from "html2canvas";

const CARD_COLORS = [
  { label: "Mavi",    value: "bg-blue-600" },
  { label: "Koyu",    value: "bg-gray-800" },
  { label: "Mor",     value: "bg-violet-600" },
  { label: "Yeşil",   value: "bg-emerald-600" },
  { label: "Kırmızı", value: "bg-rose-600" },
  { label: "Turuncu", value: "bg-amber-600" },
];

// Tarih ve veri formatlama fonksiyonu
function normalizeHistoryItem(item) {
  return {
    id: item.id,
    type: item.type || "expense",
    amount: Math.abs(item.amount),
    label: item.action || item.description || "İşlem",
    icon: item.icon || "CreditCard",
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

function CardView() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ name: "", initialBalance: "", color: "bg-blue-600" });
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
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
          color: "bg-blue-600",
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

  const handleNext = useCallback(() => {
    if (isAnimating || cards.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [cards.length, isAnimating]);

  const handlePrev = useCallback(() => {
    if (isAnimating || cards.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [cards.length, isAnimating]);

  const handleCardClick = (index) => {
    if (isAnimating) return;
    if (index === currentIndex) return; // Zaten ortadaysa hiçbir şey yapma (detay sayfasını iptal ettik)
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleShareCard = async (e, cardId, cardName) => {
    e.stopPropagation();
    if (isSharing) return;
    setIsSharing(true);
    try {
      const cardElement = document.getElementById(`digital-card-${cardId}`);
      if (!cardElement) return;
      const canvas = await html2canvas(cardElement, { scale: 3, backgroundColor: null, useCORS: true });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `${cardName}-kart.png`, { type: "image/png" });
        if (navigator.share) {
          await navigator.share({ title: "Finans Kartım", text: `İşte benim ${cardName} dijital kartım!`, files: [file] });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `${cardName}-kart.png`; a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (err) { console.error("Hata:", err); } finally { setIsSharing(false); }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiPost("/api/cards", { name: newCard.name, initialBalance: Number(newCard.initialBalance) || 0, color: newCard.color });
      setNewCard({ name: "", initialBalance: "", color: "bg-blue-600" });
      setIsModalOpen(false);
      await fetchAndInitializeCards();
    } catch (err) { alert(err.message); } finally { setIsSaving(false); }
  };

  const handleDeleteCard = async (e, cardId) => {
    e.stopPropagation(); 
    if (cards.length <= 1) {
      alert("Sistemde her zaman en az 1 kartınız bulunmalıdır.");
      return;
    }
    const isConfirmed = window.confirm("Bu kartı ve içindeki tüm işlem geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!");
    if (isConfirmed) {
      try {
        const updatedCards = cards.filter(c => c.id !== cardId);
        await apiPatch("/api/user/finances", { cards: updatedCards });
        setCards(updatedCards);
        setCurrentIndex(0); 
        alert("Kart başarıyla silindi!");
      } catch (err) {
        console.error("Kart silinirken hata oluştu:", err);
      }
    }
  };

  const getCardStyle = (index) => {
    const length = cards.length;
    if (length === 1) return "left-1/2 -translate-x-1/2 scale-100 z-30 opacity-100 shadow-xl border-white/20";
    
    const prev = (currentIndex - 1 + length) % length;
    const next = (currentIndex + 1) % length;

    if (index === currentIndex) return "left-1/2 -translate-x-1/2 scale-[1.05] z-30 opacity-100 shadow-2xl border-white/30";
    if (index === prev) return "left-[15%] -translate-x-1/2 scale-90 z-20 opacity-40 blur-[1px] cursor-pointer hover:opacity-80 transition-all";
    if (index === next) return "left-[85%] -translate-x-1/2 scale-90 z-20 opacity-40 blur-[1px] cursor-pointer hover:opacity-80 transition-all";
    return "left-1/2 -translate-x-1/2 scale-50 z-0 opacity-0 pointer-events-none";
  };

  if (loading) return <div className="animate-pulse h-[240px] bg-gray-200 dark:bg-gray-700 rounded-[30px] w-full mb-8" />;

  // 🔥 AKTİF KARTI SEÇİYORUZ 🔥
  const activeCard = cards[currentIndex];
  const activeHistory = activeCard?.history ? activeCard.history.map(normalizeHistoryItem) : [];

  return (
    <div className="w-full mb-12 relative overflow-hidden py-4">
      
      {/* ÜST BAŞLIK VE EKLE BUTONU */}
      <div className="flex items-center justify-between mb-8 px-4">
        <h2 className="text-2xl font-black text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <LucideIcons.Wallet size={28} /> Cüzdanım
        </h2>
        {cards.length < 3 ? (
          <button onClick={() => setIsModalOpen(true)} className="bg-[#007AFF] text-white p-2 rounded-xl hover:shadow-lg transition-all">
            <LucideIcons.Plus size={20} strokeWidth={3} />
          </button>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 px-3 py-2 rounded-xl border border-gray-200 shadow-inner">
            Maksimum (3/3)
          </span>
        )}
      </div>

      {/* 3D KART CAROUSEL'İ */}
      <div className="relative w-full flex items-center justify-center h-[240px] px-4 mb-4">
        {cards.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-2 z-40 p-2 bg-white dark:bg-gray-800 dark:text-gray-400 shadow-md rounded-full text-gray-400 hover:text-[#007AFF] transition-all"><LucideIcons.ChevronLeft size={24} /></button>
            <button onClick={handleNext} className="absolute right-2 z-40 p-2 bg-white dark:bg-gray-800 dark:text-gray-400 shadow-md rounded-full text-gray-400 hover:text-[#007AFF] transition-all"><LucideIcons.ChevronRight size={24} /></button>
          </>
        )}

        <div className="relative w-full max-w-4xl h-full">
          {cards.map((card, index) => {
            return (
              <div
                key={card.id}
                id={`digital-card-${card.id}`}
                onClick={() => handleCardClick(index)}
                className={`absolute top-0 transition-all duration-500 ease-out flex flex-col justify-between p-6 rounded-[32px] w-[280px] md:w-[340px] h-[210px] border-2 text-white overflow-hidden ${card.color || "bg-blue-600"} ${getCardStyle(index)}`}
              >
                <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none">
                  <LucideIcons.Wifi size={180} strokeWidth={1} />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <span className="font-bold tracking-widest text-sm uppercase opacity-80">{card.name}</span>
                  <LucideIcons.Nfc size={32} className="opacity-90" />
                </div>

                <div className="relative z-10 flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">Toplam Bakiye</p>
                    <h3 className="text-3xl font-black tracking-tighter">
                      {card.balance.toLocaleString("tr-TR")} <span className="text-xl">₺</span>
                    </h3>
                  </div>

                  {/* KART BUTONLARI (Sadece merkezdeyken tıklanabilir) */}
                  <div className="flex items-center gap-2" style={{ pointerEvents: index === currentIndex ? 'auto' : 'none' }} data-html2canvas-ignore="true">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/add-transaction?cardId=${card.id}`); }}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all"
                      title="İşlem Ekle"
                    >
                      <LucideIcons.Plus size={20} className="text-white" />
                    </button>
                    <button
                      onClick={(e) => handleShareCard(e, card.id, card.name)}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all"
                      title="Kartı Paylaş"
                    >
                      {isSharing ? <LucideIcons.Loader2 size={20} className="animate-spin" /> : <LucideIcons.Share2 size={20} />}
                    </button>
                    {cards.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteCard(e, card.id)}
                        className="p-2.5 rounded-xl bg-red-500/80 hover:bg-red-600 backdrop-blur-md transition-all shadow-md"
                        title="Kartı Sil"
                      >
                        <LucideIcons.Trash2 size={20} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔥 YENİ: DİNAMİK HESAP GEÇMİŞİ LİSTESİ 🔥 */}
      {activeCard && (
        <div className="max-w-4xl mx-auto px-4 mt-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
              <LucideIcons.History className="text-[#007AFF]" size={20} />
              {activeCard.name} Geçmişi
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {activeHistory.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-8 rounded-[24px] border border-gray-100 text-center shadow-sm">
                <LucideIcons.SearchX size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 dark:text-gray-500 font-bold text-sm">Henüz bu kartta bir işlem yapılmamış.</p>
              </div>
            ) : (
              activeHistory.slice(0, 5).map((item) => { // Son 5 işlemi gösterelim ki ana sayfa çok uzamasın
                const IconComp = LucideIcons[item.icon] || LucideIcons.CreditCard;
                const isIncome = item.type === "income";

                return (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500/30 rounded-2xl shadow-sm border border-gray-100 hover:border-[#007AFF]/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full flex items-center justify-center transition-colors ${isIncome ? "bg-green-50 text-green-500 group-hover:bg-green-100" : "bg-red-50 text-red-500 group-hover:bg-red-100"}`}>
                        <IconComp size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white text-sm md:text-base leading-tight">{item.label}</p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.date}</p>
                      </div>
                    </div>
                    <span className={`font-black text-base md:text-lg whitespace-nowrap ${isIncome ? "text-green-500" : "text-gray-900 dark:text-gray-100"}`}>
                      {isIncome ? "+" : "-"}{item.amount.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                );
              })
            )}
            
            {/* Eğer 5'ten fazla işlem varsa ufak bir bilgilendirme */}
            {activeHistory.length > 5 && (
              <p className="text-center text-xs font-bold text-gray-400 mt-2">Son 5 işlem gösteriliyor.</p>
            )}
          </div>
        </div>
      )}

      {/* Yeni Kart Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Yeni Kart Oluştur</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-full"><LucideIcons.X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCard} className="space-y-5">
              <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Kart Adı</label><input required value={newCard.name} onChange={(e) => setNewCard({ ...newCard, name: e.target.value })} placeholder="Maaş Hesabım" className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-700 outline-none font-bold transition-all" /></div>
              <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Başlangıç Bakiyesi (₺)</label><input type="number" min="0" value={newCard.initialBalance} onChange={(e) => setNewCard({ ...newCard, initialBalance: e.target.value })} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-700 outline-none font-bold transition-all" /></div>
              <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Renk</label><div className="flex flex-wrap gap-3">{CARD_COLORS.map((c) => (<button key={c.value} type="button" onClick={() => setNewCard({ ...newCard, color: c.value })} className={`w-10 h-10 rounded-xl ${c.value} transition-all ${newCard.color === c.value ? "ring-2 ring-offset-2 ring-[#007AFF] scale-110" : "opacity-70 hover:opacity-100"}`} />))}</div></div>
              <button type="submit" disabled={isSaving} className="w-full py-4 rounded-2xl font-black text-white bg-[#007AFF] shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all">{isSaving ? <LucideIcons.Loader2 className="animate-spin mx-auto" size={24} /> : "Kartı Oluştur"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardView;