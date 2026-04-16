import React, { useState, useEffect, useMemo } from "react";
import { apiGet } from "../services/api";
import { Loader2 } from "lucide-react";
import DailyLimitCard from "../components/Daily/DailyLimitCard";
import SmartAlerts from "../components/Daily/SmartAlerts";
import MicroSavings from "../components/Daily/MicroSavings";
import DailyTransactions from "../components/Daily/DailyTransactions";

const Daily = () => {
  const [finances, setFinances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState("all");

  useEffect(() => {
    apiGet("/api/user/finances")
      .then(data => {
        setFinances(data);
        if (data.cards && data.cards.length > 0) {
          // Ana sayfada (CardView) seçili bırakılan kartı hatırla, yoksa ilk kartı seç
          const savedCardId = localStorage.getItem("activeCardId");
          setSelectedCardId(savedCardId || data.cards[0].id); 
        }
      })
      .catch(err => console.error("Veri çekilemedi:", err))
      .finally(() => setLoading(false));
  }, []);

  // --- MATEMATİK VE TARİH FİLTRELERİ ---
  const todayData = useMemo(() => {
    if (!finances) return null;

    const today = new Date();
    const isToday = (dateString) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      return d.getDate() === today.getDate() &&
             d.getMonth() === today.getMonth() &&
             d.getFullYear() === today.getFullYear();
    };

    // 1. Seçili Karta Göre İşlemler ve Harcama
    let cardsToSearch = selectedCardId === "all" ? (finances.cards || []) : (finances.cards || []).filter(c => c.id === selectedCardId);
    
    let todaysTransactions = [];
    cardsToSearch.forEach(card => {
      if (card.history) {
        const todayTxs = card.history.filter(tx => isToday(tx.date));
        todaysTransactions = [...todaysTransactions, ...todayTxs];
      }
    });

    // Sadece bugünkü giderleri topla
    const spentToday = todaysTransactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // 2. Bugünkü ve Gecikmiş Ödemeler
    const todayDateStr = today.toISOString().split('T')[0];
    const todaysPayments = (finances.payments || []).filter(p => {
      return p.date === todayDateStr || (p.date < todayDateStr && !p.isCompleted);
    });

    // 3. Aktif Hedef Tavsiyeleri (TÜMÜNÜ ALIYORUZ)
    const activeGoals = (finances.goals || []).filter(g => g.currentAmount < g.targetAmount);

    return { todaysTransactions, spentToday, todaysPayments, activeGoals };
  }, [finances, selectedCardId]);

  // Kullanıcı kart değiştirdiğinde localStorage'a kaydet ki diğer sayfalarda da hatırlansın
  const handleCardChange = (newCardId) => {
    setSelectedCardId(newCardId);
    localStorage.setItem("activeCardId", newCardId);
  };

  if (loading || !todayData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#007AFF]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <DailyLimitCard 
        cards={finances.cards || []}
        selectedCardId={selectedCardId}
        setSelectedCardId={handleCardChange} // Değişimi yakalayan fonksiyonu yolluyoruz
        spentToday={todayData.spentToday}
      />
      
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        <SmartAlerts 
          payments={todayData.todaysPayments} 
          goals={todayData.activeGoals} // Birden fazla hedefi yolluyoruz
        />
        
        <MicroSavings spentToday={todayData.spentToday} />
        
        <DailyTransactions transactions={todayData.todaysTransactions} />
      </div>
    </div>
  );
};

export default Daily;