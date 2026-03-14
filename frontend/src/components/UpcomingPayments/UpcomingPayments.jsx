import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { fetchPayments } from "../../services/goalService";

const UpcomingPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments()
      .then(data => {
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setPayments(data);
      })
      .catch(err => console.error("Ödemeler yüklenemedi:", err))
      .finally(() => setLoading(false));
  }, []);

  const getDynamicIcon = (payment) => {
    let iconName = payment.iconName;
    let colorClass = payment.color;
    if (!iconName && payment.category) {
      const legacyMap = { Home: "Home", Zap: "Zap", Wifi: "Wifi" };
      iconName = legacyMap[payment.category] || "CreditCard";
      colorClass = "text-gray-500";
    }
    const IconComponent = LucideIcons[iconName] || LucideIcons.CreditCard;
    return <IconComponent size={24} className={colorClass} />;
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const totalIncome = payments.filter(p => p.transactionType === "income").reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExpense = payments.filter(p => p.transactionType !== "income").reduce((sum, p) => sum + Number(p.amount), 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-6 border border-gray-100 relative overflow-hidden">

      <LucideIcons.ArrowRightLeft size={120} className="absolute -top-6 -right-6 text-gray-50 opacity-50 pointer-events-none" />

      <div className="flex justify-between items-center mb-1 relative z-10">
        <div className="flex items-center gap-2">
          <LucideIcons.CalendarClock size={22} className="text-[#04009A]" />
          <h2 className="text-lg font-bold text-gray-800">Ödemeler</h2>
        </div>
        <Link to="/add-payment" className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors">
          <LucideIcons.Plus size={20} strokeWidth={3} />
        </Link>
      </div>

      <div className="mb-5 relative z-10">
        <p className="text-xs text-gray-400 font-medium">Tahmini Net Durum</p>
        {loading ? (
          <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse mt-1" />
        ) : (
          <p className={`text-2xl font-black ${netBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
            {netBalance > 0 ? "+" : ""}{netBalance.toLocaleString('tr-TR')} ₺
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <p className="text-gray-400 text-center py-4 text-sm">Bekleyen işlem bulunmuyor.</p>
        ) : (
          payments.slice(0, 4).map((payment) => (
            <Link to="/add-payment" key={payment.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">

              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border border-gray-100 shadow-sm group-hover:bg-white transition-colors">
                  {getDynamicIcon(payment)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-gray-800 text-base">{payment.title}</h3>
                    {payment.isRecurring && <LucideIcons.RefreshCw size={12} className="text-blue-500" title="Düzenli" />}
                  </div>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">{formatDate(payment.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`font-bold text-lg ${payment.transactionType === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {payment.transactionType === 'income' ? '+' : '-'}{Number(payment.amount).toLocaleString('tr-TR')} ₺
                </span>
                <LucideIcons.ChevronRight size={18} className="text-gray-300 group-hover:text-[#007AFF] group-hover:translate-x-1 transition-all" />
              </div>

            </Link>
          ))
        )}

        {payments.length > 4 && (
          <Link to="/add-payment" className="text-center text-sm font-bold text-[#007AFF] hover:underline mt-2">
            Tümünü Gör ({payments.length})
          </Link>
        )}
      </div>

    </div>
  );
};

export default UpcomingPayments;
