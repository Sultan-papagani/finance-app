import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import {
  ArrowLeft,
  Plus,
  Minus,
  Clock,
  Users,
  Loader2,
  X,
  Wallet,
  Key,
  Copy,
  Check
} from "lucide-react";
import { fetchGoals, saveGoals } from "../../services/goalService";
import { apiGet } from "../../services/api";

const MyGoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [allGoals, setAllGoals] = useState([]);
  const [username, setUsername] = useState("Kullanıcı");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [actionAmount, setActionAmount] = useState("");
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt');
        const [ownGoals, profile] = await Promise.all([fetchGoals(), apiGet('/api/user/profile')]);
        
        let sharedGoals = [];
        try {
          const headers = token ? { 'Authorization': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
          const res = await fetch('http://localhost:3000/api/friends/shared-goals', { headers });
          if(res.ok) {
            const json = await res.json();
            sharedGoals = (json.sharedGoals || []).map(g => ({ ...g, isShared: true }));
          }
        } catch(e) {}

        const combinedGoals = [...ownGoals, ...sharedGoals];
        
        setAllGoals(ownGoals);
        setUsername(profile.username);
        
        const found = combinedGoals.find(g => g.id.toString() === id.toString());
        if (!found) throw new Error("Hedef bulunamadı");
        
        setGoal(found);
        if (found.currentAmount >= found.targetAmount) {
          setShowConfetti(true);
        }
      } catch (err) {
        setError("Hedef bulunamadı veya silinmiş.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const persistGoal = (updatedGoal) => {
    if (updatedGoal.isShared) return; 
    const updatedAllGoals = allGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    setAllGoals(updatedAllGoals);
    saveGoals(updatedAllGoals).catch(err => console.error("Kaydetme hatası:", err));
  };

  const handleTransaction = async (e, type) => {
    e.preventDefault();

    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (type === "withdraw" && amount > goal.currentAmount) return alert("Bakiyeden fazlasını çekemezsin!");

    const finalActionNote = actionNote ? `${type === "add" ? "Para Eklendi" : "Para Çekildi"} (${actionNote})` : (type === "add" ? "Para Eklendi" : "Para Çekildi");

    if (goal.isShared) {
      // 1. ORTAK HEDEF İSE: Yeni backend route'una istek atıyoruz
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt');
        const res = await fetch(`http://localhost:3000/api/friends/shared-goals/${goal.id}/transaction`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount, type, actionNote: finalActionNote })
        });
        
        const data = await res.json();
        if (res.ok) {
           // Backend'den gelen güncel goal verisini state'e yaz
           setGoal({...data.updatedGoal, isShared: true, ownerName: goal.ownerName});
           if (data.updatedGoal.currentAmount >= goal.targetAmount && type === "add") setShowConfetti(true);
        } else {
           alert(data.error || "İşlem başarısız.");
        }
      } catch (err) {
        alert("Sunucuya bağlanılamadı.");
      }
    } else {
      // 2. KENDİ HEDEFİMİZ İSE: Frontend'de hesaplayıp eski usül kaydediyoruz
      const now = new Date();
      const transactionAmount = type === "add" ? amount : -amount;
      
      const newHistoryItem = {
        id: Date.now(),
        user: username,
        action: finalActionNote,
        amount: transactionAmount,
        date: now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
        time: now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        likes: 0,
        isLiked: false,
      };

      const newCurrentAmount = goal.currentAmount + transactionAmount;
      if (newCurrentAmount >= goal.targetAmount && type === "add") setShowConfetti(true);

      const updatedGoal = { ...goal, currentAmount: newCurrentAmount, history: [newHistoryItem, ...goal.history] };
      setGoal(updatedGoal);
      persistGoal(updatedGoal);
    }

    setActionAmount("");
    setActionNote("");
    setIsAddMoneyOpen(false);
    setIsWithdrawOpen(false);
  };

  const handleGenerateCode = async () => {
    if (goal.isShared) return alert("Başkasının ortak hedefine kod üretemezsin!");
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      const res = await fetch('http://localhost:3000/api/friends/generate-code', {
        method: 'POST',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: goal.id })
      });
      const data = await res.json();
      if(res.ok) {
        setShareCode(data.code);
        setIsShareModalOpen(true);
        setCopied(false);
      } else { alert(data.error); }
    } catch (err) { alert("Sunucu hatası."); }
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-[#007AFF]" size={40} /></div>;
  if (error || !goal) return <div className="text-center mt-20">{error}</div>;

  const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto w-full pb-24 md:pb-10 pt-6 px-4 md:px-8 relative">
      {showConfetti && <div className="fixed inset-0 z-[999] pointer-events-none"><Confetti recycle={false} numberOfPieces={600} /></div>}

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/my-goal")} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm"><ArrowLeft size={24} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hedef Detayı</h1>
          {goal.isShared && <p className="text-sm font-semibold text-[#007AFF]">Ortak Hedef ({goal.ownerName})</p>}
        </div>
      </div>

      <div className="relative h-64 md:h-80 w-full rounded-[32px] overflow-hidden shadow-lg mb-8">
        <img src={goal.image} alt={goal.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-8 left-6 right-6 text-white z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 shadow-sm">{goal.title}</h1>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold">{goal.currentAmount.toLocaleString("tr-TR")} ₺</span>
            <span className="text-white/70 mb-1">/ {goal.targetAmount.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center mb-8">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 font-medium text-sm">Genel İlerleme</span>
            <span className="text-[#007AFF] font-bold text-lg">%{progressPercentage}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div className="bg-[#007AFF] h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Butonlar artık herkes için görünür (İzleme Modu engeli kalktı) */}
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setIsWithdrawOpen(true)} className="bg-red-50 text-red-600 px-5 py-4 rounded-xl font-bold hover:bg-red-100"><Minus size={20} strokeWidth={3} /></button>
          <button onClick={() => setIsAddMoneyOpen(true)} className="bg-[#007AFF] text-white px-8 py-4 rounded-xl font-bold flex gap-2 hover:bg-blue-700"><Plus size={20} strokeWidth={3} /> Para Ekle</button>
        </div>
      </div>

      {!goal.isShared && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4"><Users size={22} className="text-[#007AFF]" /> Davet Et</h3>
          <button onClick={handleGenerateCode} className="w-full sm:w-1/2 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 flex items-center gap-4 hover:border-[#007AFF] hover:bg-blue-50/50 transition-all group text-left">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-200 group-hover:border-[#007AFF] group-hover:text-[#007AFF] text-gray-400 transition-colors shadow-sm"><Key size={24} strokeWidth={2.5} /></div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-600 group-hover:text-[#007AFF]">Davet Kodu Üret</h4>
              <p className="text-sm text-gray-400">Arkadaşlarını ortak hedefe davet et</p>
            </div>
          </button>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4"><Clock size={22} className="text-[#007AFF]" /> Son İşlemler</h3>
        <div className="bg-white rounded-[24px] border border-gray-100 p-2">
          {goal.history.map((item, index) => (
             <div key={item.id} className="flex items-center gap-4 p-4 border-b border-gray-50">
               <div className="flex-1">
                 <h4 className="font-semibold text-gray-800 text-sm"><span className="text-[#007AFF]">{item.user}</span> {item.action}</h4>
               </div>
               <div className={`font-bold ${item.amount > 0 ? "text-gray-900" : "text-red-500"}`}>
                 {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString("tr-TR")} ₺
               </div>
             </div>
          ))}
        </div>
      </div>

      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <button onClick={() => setIsShareModalOpen(false)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Davet Kodu Üretildi!</h2>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 mb-6 mt-4">
              <div className="text-4xl font-black tracking-widest text-gray-800">{shareCode}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(shareCode); setCopied(true); setTimeout(()=>setCopied(false), 2000) }} className="w-full py-3.5 rounded-xl font-bold text-white bg-[#007AFF] flex justify-center gap-2">
              {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? "Kopyalandı!" : "Kodu Kopyala"}
            </button>
          </div>
        </div>
      )}

      {isAddMoneyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-[#007AFF]" size={24} /> Para Ekle
              </h2>
              <button onClick={() => setIsAddMoneyOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => handleTransaction(e, "add")} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Eklenecek Tutar (₺)</label>
                <div className="relative">
                  <input type="number" required min="1" value={actionAmount} onChange={(e) => setActionAmount(e.target.value)} className="w-full pl-4 pr-10 py-3 text-lg font-bold text-[#007AFF] rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₺</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kısa Not (İsteğe Bağlı)</label>
                <input type="text" value={actionNote} onChange={(e) => setActionNote(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"><Plus size={20} strokeWidth={3} /> Hedefe Aktar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isWithdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-red-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-red-500" size={24} /> Para Çek
              </h2>
              <button onClick={() => setIsWithdrawOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => handleTransaction(e, "withdraw")} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Çekilecek Tutar (₺)</label>
                <div className="relative">
                  <input type="number" required min="1" max={goal.currentAmount} value={actionAmount} onChange={(e) => setActionAmount(e.target.value)} className="w-full pl-4 pr-10 py-3 text-lg font-bold text-red-500 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₺</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Çekim Nedeni (İsteğe Bağlı)</label>
                <input type="text" value={actionNote} onChange={(e) => setActionNote(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2"><Minus size={20} strokeWidth={3} /> Hedeften Düş</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGoalDetail;