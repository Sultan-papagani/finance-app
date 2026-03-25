import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../services/api";
import * as LucideIcons from "lucide-react";

function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/user/finances').then(data => {
      const foundCard = data.cards?.find(c => c.id === id);
      setCard(foundCard);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#F8F9FA] p-8 flex justify-center items-center"><LucideIcons.Loader2 className="animate-spin text-[#007AFF]" size={40} /></div>;
  if (!card) return <div className="p-8 text-center text-red-500">Kart bulunamadı!</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Üst Kısım */}
      <div className={`${card.color} pt-12 pb-16 px-6 rounded-b-[40px] shadow-lg relative transition-colors duration-500`}>
        <button onClick={() => navigate(-1)} className="absolute top-10 left-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/30">
          <LucideIcons.ArrowLeft size={24} />
        </button>
        <div className="mt-12 text-center text-white">
          <p className="opacity-80 font-medium mb-1">Kart Bakiyesi</p>
          <h1 className="text-5xl font-black">{card.balance.toLocaleString('tr-TR')} ₺</h1>
          <p className="mt-2 text-lg font-bold opacity-90">{card.name}</p>
        </div>
      </div>

      {/* Geçmiş (History) Listesi */}
      <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-[30px] shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <LucideIcons.History size={20} className="text-[#007AFF]" />
            Hesap Geçmişi
          </h3>

          <div className="space-y-4">
            {card.history.length === 0 ? (
              <p className="text-center text-gray-400 py-6">Henüz bu kartta bir işlem yok.</p>
            ) : (
              card.history.map(item => {
                const Icon = LucideIcons[item.icon] || LucideIcons.CreditCard;
                const isIncome = item.type === "income";
                return (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.action}</p>
                        <p className="text-xs text-gray-400 font-medium">{item.date}</p>
                      </div>
                    </div>
                    <span className={`font-black text-lg ${isIncome ? 'text-green-500' : 'text-gray-800'}`}>
                      {isIncome ? '+' : '-'}{item.amount.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDetail;