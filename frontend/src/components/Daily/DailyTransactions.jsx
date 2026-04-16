import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, SearchX } from "lucide-react";
import * as LucideIcons from "lucide-react";

const DailyTransactions = ({ transactions }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg">Bugünün İşlemleri</h2>
        <button 
          onClick={() => navigate('/history')}
          className="text-[#007AFF] text-sm font-bold flex items-center gap-1 hover:text-blue-700"
        >
          Tümünü Gör <ArrowRight size={16} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700 p-2 shadow-sm">
        {transactions && transactions.length > 0 ? (
          transactions.map((tx, index) => {
            const Icon = LucideIcons[tx.icon || "CreditCard"] || LucideIcons.CreditCard;
            return (
              <div 
                key={tx.id} 
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-2xl cursor-pointer ${
                  index !== transactions.length - 1 ? "border-b border-gray-50 dark:border-gray-700" : ""
                }`}
              >
                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                  <Icon size={20} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{tx.description || tx.action}</h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-bold uppercase">{tx.type === 'income' ? 'Gelir' : 'Gider'}</p>
                </div>

                <div className={`font-black text-base ${tx.type === 'income' ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                  {tx.type === 'income' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('tr-TR')} ₺
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <SearchX size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-bold">Bugün henüz bir işlem yapmadın.</p>
          </div>
        )}

        <button 
          onClick={() => navigate('/add-transaction')}
          className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl text-[#007AFF] font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> Harcama Ekle
        </button>
      </div>
    </div>
  );
};

export default DailyTransactions;