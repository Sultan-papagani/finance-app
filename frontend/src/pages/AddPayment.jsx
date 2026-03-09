import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";

const AddPayment = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  
  // --- FORM STATE'LERİ ---
  const [transactionType, setTransactionType] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState(""); // Not kısmı aktif!
  const [selectedIcon, setSelectedIcon] = useState("CreditCard");
  const [selectedColor, setSelectedColor] = useState("text-[#007AFF]");
  const [iconSearch, setIconSearch] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  
  const [payments, setPayments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // --- FİLTRELEME & ANALİTİK STATE'LERİ ---
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [analyticsTab, setAnalyticsTab] = useState("expense");

  const colorPalette = [
    { bg: "bg-red-500", text: "text-red-500" },
    { bg: "bg-orange-500", text: "text-orange-500" },
    { bg: "bg-yellow-500", text: "text-yellow-500" },
    { bg: "bg-green-500", text: "text-green-500" },
    { bg: "bg-cyan-500", text: "text-cyan-500" },
    { bg: "bg-[#007AFF]", text: "text-[#007AFF]" },
    { bg: "bg-indigo-500", text: "text-indigo-500" },
    { bg: "bg-purple-500", text: "text-purple-500" },
    { bg: "bg-pink-500", text: "text-pink-500" },
    { bg: "bg-gray-800", text: "text-gray-800" },
  ];

  const allIconNames = Object.keys(LucideIcons).filter(
    (key) => /^[A-Z]/.test(key) && key !== "Icon" && key !== "LucideProps" && key !== "createLucideIcon"
  );

  const displayedIcons = allIconNames
    .filter((name) => name.toLowerCase().includes(iconSearch.toLowerCase()))
    .slice(0, 36);

  useEffect(() => {
    const saved = localStorage.getItem("upcomingPayments");
    if (saved) {
      const parsedData = JSON.parse(saved);
      parsedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setPayments(parsedData);
    }
  }, []);

  // --- YARDIMCI FONKSİYONLAR ---
  const getDynamicIcon = (payment, size = 20) => {
    let iconName = payment.iconName || "CreditCard";
    const IconComponent = LucideIcons[iconName] || LucideIcons.CreditCard;
    return <IconComponent size={size} className={payment.color} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isUrgent = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pDate = new Date(dateString);
    pDate.setHours(0, 0, 0, 0);
    return pDate <= today;
  };

  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const weekdays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(prev => prev - 1); }
    else { setCurrentMonth(prev => prev - 1); }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(prev => prev + 1); }
    else { setCurrentMonth(prev => prev + 1); }
  };

  const filteredPayments = payments.filter(p => {
    const pDate = new Date(p.date);
    return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
  });

  const totalIncome = filteredPayments.filter(p => p.transactionType === "income" && !p.isCompleted).reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExpense = filteredPayments.filter(p => p.transactionType !== "income" && !p.isCompleted).reduce((sum, p) => sum + Number(p.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const getAnalytics = (type) => {
    const dataByIcon = filteredPayments
      .filter(p => (type === "income" ? p.transactionType === "income" : p.transactionType !== "income"))
      .reduce((acc, p) => {
        const key = p.iconName || "CreditCard";
        if (!acc[key]) acc[key] = { amount: 0, color: p.color || "text-gray-500", name: p.title.split(" ")[0] };
        acc[key].amount += Number(p.amount);
        return acc;
      }, {});
    return Object.entries(dataByIcon).map(([key, data]) => ({ icon: key, ...data })).sort((a, b) => b.amount - a.amount);
  };

  const activeAnalytics = getAnalytics(analyticsTab);
  const activeTotal = analyticsTab === "expense" 
    ? filteredPayments.filter(p => p.transactionType !== "income").reduce((sum, p) => sum + Number(p.amount), 0)
    : filteredPayments.filter(p => p.transactionType === "income").reduce((sum, p) => sum + Number(p.amount), 0);

  // --- AKSİYONLAR ---
  const handleSave = (e) => {
    e.preventDefault();
    if (!title || !amount || !date) { alert("Lütfen gerekli alanları doldur kingo!"); return; }
    const newPayment = {
      id: Date.now(), title, amount: Number(amount), date, note,
      iconName: selectedIcon, color: selectedColor, isRecurring, transactionType,
      isCompleted: false
    };
    const updatedPayments = [...payments, newPayment].sort((a, b) => new Date(a.date) - new Date(b.date));
    setPayments(updatedPayments);
    localStorage.setItem("upcomingPayments", JSON.stringify(updatedPayments));
    setTitle(""); setAmount(""); setDate(""); setNote(""); setIconSearch(""); setIsRecurring(false);
  };

  const handleComplete = (e, id) => {
    e.stopPropagation();
    const updatedPayments = payments.map(p => p.id === id ? { ...p, isCompleted: !p.isCompleted } : p);
    setPayments(updatedPayments);
    localStorage.setItem("upcomingPayments", JSON.stringify(updatedPayments));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Kaydı silmek istediğine emin misin?")) {
      const updatedPayments = payments.filter(p => p.id !== id);
      setPayments(updatedPayments);
      localStorage.setItem("upcomingPayments", JSON.stringify(updatedPayments));
    }
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-12 transition-all duration-300">
      
      {/* ÜST BAŞLIK */}
      <div className="bg-[#04009A] pt-12 pb-6 px-6 rounded-b-[40px] md:rounded-none md:pt-6 md:pb-6 relative shadow-lg z-10 flex items-center justify-center">
        <button onClick={() => navigate("/")} className="absolute left-6 md:left-10 text-white bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2">
          <LucideIcons.ArrowLeft size={20} />
          <span className="text-sm font-medium hidden md:block pr-2">Ana Sayfa</span>
        </button>
        <h1 className="text-2xl font-bold text-white mt-1">Ödeme Yönetim Paneli</h1>
      </div>

      <div className="px-6 mt-8 md:mt-12 md:px-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL KOLON: EKLEME FORMU */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-xl border border-gray-100 sticky top-6">
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-8 shadow-inner">
              <button type="button" onClick={() => setTransactionType("expense")} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${transactionType === "expense" ? "bg-white text-red-500 shadow-md" : "text-gray-400 hover:text-gray-600"}`}>
                <LucideIcons.TrendingDown size={18} /> Ödeme Ekle
              </button>
              <button type="button" onClick={() => setTransactionType("income")} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${transactionType === "income" ? "bg-white text-green-500 shadow-md" : "text-gray-400 hover:text-gray-600"}`}>
                <LucideIcons.TrendingUp size={18} /> Gelen Ödeme Ekle
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <input type="text" placeholder={transactionType === "expense" ? "Örn: Kira, Fatura..." : "Örn: Maaş, Prim..."} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-gray-800 font-bold text-lg bg-transparent border-none outline-none focus:ring-0 placeholder:font-normal placeholder:text-gray-400" />
              </div>

              <div className="flex gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-1 flex items-center">
                  <span className={`text-xl font-bold mr-1 ${transactionType === "income" ? "text-green-500" : "text-red-500"}`}>₺</span>
                  <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full text-gray-800 font-bold text-xl bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400" />
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-1">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-gray-800 font-bold text-sm bg-transparent border-none outline-none focus:ring-0 text-gray-500" />
                </div>
              </div>

              <div onClick={() => setIsRecurring(!isRecurring)} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${isRecurring ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}><LucideIcons.RefreshCw size={20} className={isRecurring ? "animate-spin-slow" : ""} /></div>
                  <span className="font-bold text-gray-800 text-sm">Düzenli Ödeme</span>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isRecurring ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`}></div></div>
              </div>

              {/*  NOT KISMI BURADA  */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <textarea 
                  placeholder="İsteğe bağlı detay veya not ekle..." 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  className="w-full text-gray-800 font-medium text-sm bg-transparent border-none outline-none focus:ring-0 resize-none h-16 placeholder:text-gray-400"
                ></textarea>
              </div>

              {/* İKON VE RENK STÜDYOSU */}
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  {colorPalette.map((color) => (<button key={color.bg} type="button" onClick={() => setSelectedColor(color.text)} className={`w-8 h-8 rounded-full shrink-0 transition-all ${color.bg} ${selectedColor === color.text ? "ring-4 ring-offset-2 ring-gray-300 scale-110 shadow-md" : "opacity-70 hover:opacity-100"}`}></button>))}
                </div>
                <div className="flex items-center bg-white p-3 rounded-xl border border-gray-200 mb-3"><LucideIcons.Search size={18} className="text-gray-400 mr-2" /><input type="text" placeholder="İkon ara..." value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} className="w-full text-sm outline-none bg-transparent" /></div>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-1">
                  {displayedIcons.map((iconName) => {
                    const IconComponent = LucideIcons[iconName];
                    return (<button key={iconName} type="button" onClick={() => setSelectedIcon(iconName)} className={`flex items-center justify-center p-3 rounded-xl transition-all ${selectedIcon === iconName ? "bg-white shadow-md scale-110 z-10" : "hover:bg-gray-200/50"}`}><IconComponent size={24} className={selectedIcon === iconName ? selectedColor : "text-gray-400"} /></button>);
                  })}
                </div>
              </div>

              <button type="submit" className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 ${transactionType === "income" ? "bg-green-500 hover:shadow-green-500/40" : "bg-[#007AFF] hover:shadow-blue-500/40"}`}>
                <LucideIcons.Save size={24} /> Kaydet
              </button>
            </form>
          </div>
        </div>

        {/* SAĞ KOLON */}
        <div className="lg:col-span-7 mt-8 lg:mt-0 flex flex-col gap-6">
          
          {/* AY SEÇİCİ */}
          <div className="flex items-center justify-between bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
            <button onClick={handlePrevMonth} className="p-3 bg-gray-50 rounded-2xl hover:bg-[#007AFF] hover:text-white transition-all text-gray-500"><LucideIcons.ChevronLeft size={24} /></button>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{months[currentMonth]} {currentYear}</h2>
            <button onClick={handleNextMonth} className="p-3 bg-gray-50 rounded-2xl hover:bg-[#007AFF] hover:text-white transition-all text-gray-500"><LucideIcons.ChevronRight size={24} /></button>
          </div>

          {/* NET DURUM KARTI */}
          <div className={`rounded-[30px] p-6 text-white shadow-xl relative overflow-hidden transition-colors duration-500 ${netBalance >= 0 ? "bg-gradient-to-br from-[#04009A] to-blue-600" : "bg-gradient-to-br from-red-600 to-red-400"}`}>
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-8"><LucideIcons.LineChart size={150} /></div>
            <div className="relative z-10">
              <p className="text-white/80 font-semibold mb-1 uppercase tracking-wider text-xs">Aylık Tahmini Net Durum</p>
              <h3 className="text-4xl font-black mt-1">{netBalance > 0 ? "+" : ""}{netBalance.toLocaleString('tr-TR')} ₺</h3>
              <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/20">
                <div><p className="text-white/70 text-xs mb-1">Beklenen Gelir</p><p className="font-bold text-xl text-green-300">+{totalIncome.toLocaleString('tr-TR')} ₺</p></div>
                <div><p className="text-white/70 text-xs mb-1">Yaklaşan Gider</p><p className="font-bold text-xl text-red-200">-{totalExpense.toLocaleString('tr-TR')} ₺</p></div>
              </div>
            </div>
          </div>

          {/* GRAFİK ANALİZİ */}
          {(totalExpense > 0 || totalIncome > 0) && (
            <div className="bg-white rounded-[30px] p-6 shadow-xl border border-gray-100">
              <div className="flex bg-gray-50 p-1 rounded-xl mb-6 border border-gray-100">
                <button onClick={() => setAnalyticsTab("expense")} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${analyticsTab === "expense" ? "bg-white text-red-500 shadow-sm" : "text-gray-400"}`}>Gider Analizi</button>
                <button onClick={() => setAnalyticsTab("income")} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${analyticsTab === "income" ? "bg-white text-green-500 shadow-sm" : "text-gray-400"}`}>Gelir Analizi</button>
              </div>
              <div className="space-y-4">
                {activeAnalytics.slice(0, 4).map((item, index) => {
                  const percent = Math.round((item.amount / activeTotal) * 100);
                  const IconComp = LucideIcons[item.icon] || LucideIcons.CreditCard;
                  return (
                    <div key={index} className="relative">
                      <div className="flex justify-between text-sm mb-2 items-center font-bold">
                        <div className="flex items-center gap-2"><IconComp size={16} className={item.color} /> {item.name}</div>
                        <span>{item.amount.toLocaleString('tr-TR')} ₺ <span className="text-gray-400 text-xs font-medium ml-1">%{percent}</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className={`h-full transition-all duration-1000 ${item.color.replace('text-', 'bg-')}`} style={{ width: `${percent}%` }}></div></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* HAREKETLER LİSTESİ */}
          <div className="bg-white rounded-[30px] p-6 shadow-xl border border-gray-100 flex-1">
            <h2 className="text-xl font-bold text-[#04009A] mb-6 flex items-center gap-2"><LucideIcons.ListTodo size={24} /> Hareketler</h2>
            <div className="flex flex-col gap-3">
              {filteredPayments.map((payment) => (
                <div key={payment.id} onClick={() => toggleExpand(payment.id)} className={`flex flex-col p-4 rounded-2xl bg-gray-50 border transition-all cursor-pointer group ${expandedId === payment.id ? "border-[#007AFF] shadow-md bg-white" : "border-transparent hover:border-gray-200"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm border shrink-0 ${expandedId === payment.id ? "border-[#007AFF]" : "border-gray-100"}`}>{getDynamicIcon(payment, 24)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-lg ${payment.isCompleted ? "line-through text-gray-400" : "text-gray-800"}`}>{payment.title}</h3>
                          {!payment.isCompleted && isUrgent(payment.date) && (<span className="animate-pulse bg-red-100 p-1 rounded-full"><LucideIcons.Flame size={14} className="text-red-500 fill-red-500" /></span>)}
                          {payment.isRecurring && <LucideIcons.RefreshCw size={12} className="text-blue-500" />}
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 mt-1">{formatDate(payment.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className={`font-bold text-xl ${payment.isCompleted ? "text-gray-300" : payment.transactionType === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {payment.transactionType === 'income' ? '+' : '-'}{payment.amount.toLocaleString('tr-TR')} ₺
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => handleComplete(e, payment.id)} className={`p-2 rounded-xl transition-all ${payment.isCompleted ? "bg-green-500 text-white" : "bg-white text-gray-300 hover:text-green-500 border border-gray-100 shadow-sm"}`} title="Öde/Tamamla"><LucideIcons.CheckCircle2 size={20}/></button>
                        <button onClick={(e) => handleDelete(e, payment.id)} className="p-2 text-gray-300 hover:text-red-500 transition-all"><LucideIcons.Trash2 size={20}/></button>
                      </div>
                    </div>
                  </div>
                  {expandedId === payment.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                      <p className="text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-inner">{payment.note || "Not eklenmemiş."}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AYLIK GÖRÜNÜM TAKVİMİ */}
          <div className="bg-white rounded-[30px] p-6 shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <LucideIcons.CalendarRange size={20} className="text-[#04009A]" />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aylık Ödeme Takvimi</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide select-none" ref={calendarRef}>
              {calendarDays.map((day) => {
                const dayDate = new Date(currentYear, currentMonth, day);
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayPayments = filteredPayments.filter(p => p.date === dateStr);
                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                const dayName = weekdays[dayDate.getDay()];
                return (
                  <div key={day} className={`flex-shrink-0 w-16 h-28 rounded-3xl border-2 flex flex-col items-center justify-between py-3 transition-all duration-300 ${isToday ? 'bg-[#007AFF] border-[#007AFF] shadow-lg scale-105' : 'bg-gray-50 border-gray-100 hover:border-blue-200'}`}>
                    <span className={`text-[10px] font-black uppercase ${isToday ? 'text-white/70' : 'text-gray-300'}`}>{dayName}</span>
                    <span className={`text-xl font-black ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</span>
                    <div className="flex flex-col gap-1 items-center justify-center min-h-[30px]">
                      {dayPayments.length > 0 ? (
                        <div className="flex flex-col -space-y-1">
                          {dayPayments.slice(0, 2).map((p, idx) => {
                            const Icon = LucideIcons[p.iconName] || LucideIcons.CreditCard;
                            return (
                              <div key={idx} className={`p-1 rounded-full bg-white shadow-sm border ${p.color.replace('text-', 'border-')}`}>
                                <Icon size={10} className={p.color} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (<div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white/30' : 'bg-gray-200'}`}></div>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddPayment;