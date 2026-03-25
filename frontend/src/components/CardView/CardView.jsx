import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPatch } from "../../services/api";
import * as LucideIcons from "lucide-react";

function CardView() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndInitializeCards = async () => {
      try {
        const data = await apiGet('/api/user/finances');
        let userCards = data.cards || [];

        // Kullanıcının hiç kartı yoksa varsayılan kart oluştur
        if (userCards.length === 0) {
          const defaultCard = {
            id: `card_${Date.now()}`,
            name: "Hesabım",
            balance: 0,
            color: "bg-gray-800", // Varsayılan renk (siyah/koyu gri)
            history: [] // Kartın kendi geçmişi
          };
          userCards = [defaultCard];
          
          // Mevcut diğer verileri (goals, payments) bozmadan sadece cards'ı ekler/günceller
          await apiPatch('/api/user/finances', { cards: userCards });
        }
        
        setCards(userCards);
      } catch (error) {
        console.error("Kart verileri alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndInitializeCards();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-[30px] w-full mb-8"></div>;
  }

  return (
    <div className="w-full mb-8 relative">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-[#04009A] flex items-center gap-2">
          <LucideIcons.Wallet size={24} /> Cüzdanım
        </h2>
        {/* İleride yeni kart ekleme modalı/sayfası için */}
        <button className="text-[#007AFF] text-sm font-bold flex items-center gap-1 hover:underline">
          <LucideIcons.Plus size={16} /> Yeni Kart
        </button>
      </div>

      {/* Yana Kaydırmalı Slider */}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(`/card/${card.id}`)}
            className={`snap-center shrink-0 w-[85%] sm:w-[320px] h-[180px] rounded-[30px] p-6 flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative overflow-hidden ${card.color} text-white`}
          >
            {/* Kart Arkaplan Deseni */}
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
                {card.balance.toLocaleString('tr-TR')} <span className="text-xl">₺</span>
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardView;