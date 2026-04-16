import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame, AlertCircle, Target, ArrowRight,
  Coffee, Bus, ShoppingBag, Plus, Sparkles, ChevronRight
} from "lucide-react";

const DailyDashboard = () => {
  const navigate = useNavigate();

  // Dinamik Tarih (Örn: 10 Nisan Cuma)
  const today = new Date();
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('tr-TR', dateOptions);

  // Günlük Mock Veriler (Sanal Cüzdan Mantığı)
  const dailyData = {
    safeToSpend: 450, // Bugün harcayabileceği güvenli tutar
    spentToday: 185, // Bugün şu ana kadar harcadığı
    streakDays: 4, // Bütçeyi aşmadığı gün sayısı
    upcomingBills: [
      { id: 1, title: "Spotify Premium", amount: 39.99, isUrgent: true }
    ],
    goalNudge: { title: "Teknokent Fonu", dailyRequired: 50 },
    transactions: [
      { id: 1, title: "Starbucks", category: "Yemek", amount: -120, time: "14:30", icon: <Coffee size={18} /> },
      { id: 2, title: "Karabük Kart", category: "Ulaşım", amount: -45, time: "09:15", icon: <Bus size={18} /> },
      { id: 3, title: "Market", category: "Alışveriş", amount: -20, time: "08:45", icon: <ShoppingBag size={18} /> }
    ]
  };

  const limitTotal = dailyData.safeToSpend + dailyData.spentToday;
  const spentPercentage = (dailyData.spentToday / limitTotal) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-10">

      {/* Header & Tarih */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-8 pb-6 md:px-8 sticky top-0 z-10 shadow-sm dark:shadow-gray-900/50 rounded-b-[32px] mb-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-400 dark:text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">
              {formattedDate}
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Günlük Özet</h1>
          </div>
          {/* Streak Sayacı */}
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/50 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-800 shadow-sm">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">{dailyData.streakDays} Gün</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-6">

        {/* 1. GÜVENLİ HARCAMA LİMİTİ (HERO KART) */}
        <div className="bg-gray-900 dark:bg-gray-800 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
          {/* Dekoratif Arkaplan */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-[60px] opacity-30 pointer-events-none"></div>

          <p className="text-gray-400 font-medium text-sm mb-1">Bugün Harcanabilir Limitin</p>
          <div className="flex items-end gap-2 mb-6">
            <h2 className="text-5xl font-extrabold tracking-tighter">
              {dailyData.safeToSpend} <span className="text-2xl font-bold text-gray-400">₺</span>
            </h2>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-xs font-bold text-gray-400">
              <span>Harcandı: {dailyData.spentToday} ₺</span>
              <span>Günlük Bütçe: {limitTotal} ₺</span>
            </div>
            <div className="w-full bg-gray-800 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${spentPercentage > 80 ? "bg-red-500" : "bg-emerald-400"}`}
                style={{ width: `${spentPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 2. AKILLI ASİSTAN / UYARILAR (SMART NUDGES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Yaklaşan Ödeme Uyarısı */}
          {dailyData.upcomingBills.length > 0 && (
            <button className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800 rounded-[24px] p-4 flex items-center gap-4 hover:shadow-md transition-all text-left">
              <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-2xl text-red-500 dark:text-red-400 shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Bugün Ödemen Var</h3>
                <p className="text-xs text-red-500 dark:text-red-500/80 font-medium mt-0.5">
                  {dailyData.upcomingBills[0].title} ({dailyData.upcomingBills[0].amount} ₺)
                </p>
              </div>
              <ChevronRight size={20} className="text-red-400 shrink-0" />
            </button>
          )}

          {/* Hedef Yönlendirmesi */}
          <button
            onClick={() => navigate('/my-goal')}
            className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 rounded-[24px] p-4 flex items-center gap-4 hover:shadow-md transition-all text-left"
          >
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-2xl text-blue-600 dark:text-blue-400 shrink-0">
              <Target size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Günlük Hedef Katkısı</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                {dailyData.goalNudge.title}'na {dailyData.goalNudge.dailyRequired} ₺ eklemelisin.
              </p>
            </div>
            <ChevronRight size={20} className="text-blue-400 shrink-0" />
          </button>
        </div>

        {/* 3. MİKRO TASARRUF (KÜSURAT YUVARLAMA) - OYUNLAŞTIRMA */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 rounded-[24px] p-5 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shrink-0">
              <Sparkles size={24} className="text-purple-100" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Küsuratları Yuvarla</h3>
              <p className="text-xs text-purple-100 mt-0.5 font-medium opacity-90">
                Bugünkü harcamalarından artan <strong className="text-white">15 ₺</strong> hedefe aktarılsın mı?
              </p>
            </div>
          </div>
          <button
            onClick={() => alert("15 ₺ hedefe başarıyla aktarıldı!")}
            className="bg-white dark:bg-gray-100 text-indigo-600 font-bold px-4 py-2 rounded-xl text-sm hover:scale-105 transition-transform shadow-sm"
          >
            Aktar
          </button>
        </div>

        {/* 4. BUGÜNÜN HARCAMALARI (LİSTE) */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Bugünün İşlemleri</h2>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-700 dark:hover:text-blue-300">
              Tümünü Gör <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 p-2 shadow-sm dark:shadow-gray-900/30">
            {dailyData.transactions.map((tx, index) => (
              <div
                key={tx.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-2xl cursor-pointer ${
                  index !== dailyData.transactions.length - 1 ? "border-b border-gray-50 dark:border-gray-800" : ""
                }`}
              >
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0">
                  {tx.icon}
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{tx.title}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">{tx.category} • {tx.time}</p>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {tx.amount} ₺
                  </div>
                </div>
              </div>
            ))}

            {/* Yeni İşlem Ekle Butonu */}
            <button className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
              <Plus size={18} /> Harcama Ekle
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DailyDashboard;