import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Target, ChevronRight, CheckCircle2, CalendarClock, Sparkles } from "lucide-react";

const SmartAlerts = ({ payments, goals }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      
      {/* --- 1. BÖLÜM: FATURALAR VE ÖDEMELER (Zorunlu) --- */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <CalendarClock size={20} className="text-red-500" />
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Yaklaşan Ödemeler</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payments && payments.length > 0 ? (
            payments.map(payment => (
              <button 
                key={payment.id}
                onClick={() => navigate('/add-payment')}
                className={`border rounded-[24px] p-4 flex items-center gap-4 hover:shadow-md transition-all text-left ${payment.isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-700' : 'bg-white dark:bg-gray-800 border-red-100 dark:border-red-700 shadow-sm'}`}
              >
                <div className={`p-3 rounded-2xl shrink-0 ${payment.isCompleted ? 'bg-green-100 text-green-500' : 'bg-red-50 text-red-500'}`}>
                  {payment.isCompleted ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm ${payment.isCompleted ? 'text-green-700' : 'text-red-600'}`}>
                    {payment.isCompleted ? 'Ödendi' : 'Bugün Son Gün'}
                  </h3>
                  <p className={`text-xs font-medium mt-0.5 ${payment.isCompleted ? 'text-green-600 line-through' : 'text-gray-600'}`}>
                    {payment.title} <span className="font-black">({payment.amount.toLocaleString('tr-TR')} ₺)</span>
                  </p>
                </div>
                <ChevronRight size={20} className={payment.isCompleted ? 'text-green-400' : 'text-red-300'} />
              </button>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[24px] p-4 flex items-center gap-4 shadow-sm w-full md:col-span-2">
               <div className="bg-gray-50 p-3 rounded-2xl text-emerald-500 shrink-0"><CheckCircle2 size={24} /></div>
               <div>
                 <h3 className="font-bold text-gray-800 dark:text-white text-sm">Günün Temiz!</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Bugün için yaklaşan fatura veya ödemen bulunmuyor.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* --- 2. BÖLÜM: HEDEF TAVSİYELERİ (Motivasyon) --- */}
      {goals && goals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1 mt-2">
            <Sparkles size={20} className="text-[#007AFF]" />
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Günün Tasarruf Hedefleri</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(goal => {
              // Hedefe Kalan Gün Hesaplaması
              let diffDays = 30; // Varsayılan
              if (goal.targetDate) {
                const target = new Date(goal.targetDate);
                const today = new Date();
                const diffTime = target - today;
                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) diffDays = 1; 
              }

              // Günlük atılması gereken tutar
              const goalDailyReq = Math.ceil((goal.targetAmount - goal.currentAmount) / diffDays);

              return (
                <button 
                  key={goal.id}
                  onClick={() => navigate(`/my-goal/${goal.id}`)}
                  className="bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-[#F8FAFC] dark:to-gray-800 border border-blue-100 dark:border-blue-700 rounded-[24px] p-4 flex items-center gap-4 hover:shadow-md transition-all text-left group"
                >
                  <div className="bg-white p-3 rounded-2xl text-[#007AFF] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                    <Target size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm truncate">{goal.title}</h3>
                    <p className="text-xs text-blue-700/80 dark:text-blue-200/80 font-medium mt-0.5 leading-relaxed">
                      Zamanında ulaşmak için bugün havuza <strong className="font-black text-[#007AFF]">{goalDailyReq.toLocaleString('tr-TR')} ₺</strong> eklemelisin.
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-blue-300 shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
              )
            })}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default SmartAlerts;