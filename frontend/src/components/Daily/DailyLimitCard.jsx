import React from "react";
import { Flame, CreditCard } from "lucide-react";

const DailyLimitCard = ({ cards, selectedCardId, setSelectedCardId, spentToday }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' });

  // Seçili kartın bakiyesine göre dinamik günlük limit belirleme (Örnek: Bakiyenin 1/30'u)
  const selectedCard = cards.find(c => c.id === selectedCardId);
  const cardBalance = selectedCard ? selectedCard.balance : cards.reduce((sum, c) => sum + c.balance, 0);
  const dailyBudget = Math.max(Math.round(cardBalance / 30), 100); // Aylık bütçeyi güne böl, minimum 100 ₺ ver
  
  const safeToSpend = Math.max(dailyBudget - spentToday, 0);
  const spentPercentage = Math.min((spentToday / dailyBudget) * 100, 100);

  return (
    <div className="bg-white dark:bg-gray-800 px-4 pt-8 pb-6 md:px-8 shadow-sm rounded-b-[32px] mb-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-1">{formattedDate}</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Günlük Özet</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
          <Flame size={18} className="text-orange-500 fill-orange-500" />
          <span className="font-bold text-orange-600 text-sm">4 Gün</span>
        </div>
      </div>

      {/* Kart Seçici */}
      <div className="flex items-center gap-2 mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl border border-gray-100 dark:border-gray-600">
        <CreditCard size={18} className="text-gray-400 ml-2" />
        <select 
          value={selectedCardId} 
          onChange={(e) => setSelectedCardId(e.target.value)}
          className="w-full bg-transparent font-bold text-sm text-gray-700 dark:text-gray-300 outline-none p-1 cursor-pointer dark:bg-gray-700"
        >
          <option value="all">Tüm Hesaplar</option>
          {cards.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden transition-all">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-[60px] opacity-30 pointer-events-none"></div>
        
        <p className="text-gray-400 font-medium text-sm mb-1">Bugün Harcanabilir Limitin</p>
        <div className="flex items-end gap-2 mb-6">
          <h2 className={`text-5xl font-extrabold tracking-tighter ${safeToSpend === 0 ? 'text-red-400' : 'text-white'}`}>
            {safeToSpend.toLocaleString('tr-TR')} <span className="text-2xl font-bold text-gray-400">₺</span>
          </h2>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex justify-between text-xs font-bold text-gray-400">
            <span>Harcandı: {spentToday.toLocaleString('tr-TR')} ₺</span>
            <span>Bütçe: {dailyBudget.toLocaleString('tr-TR')} ₺</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${spentPercentage > 85 ? "bg-red-500" : spentPercentage > 60 ? "bg-yellow-400" : "bg-emerald-400"}`}
              style={{ width: `${spentPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLimitCard;