import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Plus,
  Users,
  Loader2,
  X,
  Image as ImageIcon,
  Key,
  Copy,
  Check
} from "lucide-react";
import { fetchGoals, saveGoals } from "../../services/goalService";
import { apiGet } from "../../services/api";

const MyGoal = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("Kullanıcı");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Modallar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // State'ler
  const [joinCode, setJoinCode] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    targetDate: "",
    image: "",
  });

  const loadData = async () => {
    try {
      // Backend'den hem kendi hedeflerini hem profilini çek
      const [ownGoalsData, profile] = await Promise.all([fetchGoals(), apiGet('/api/user/profile')]);
      
      // Ortak hedefleri çek (Yeni Endpoint)
      let sharedGoalsData = [];
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt');
        const headers = token ? { 'Authorization': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
        
        const res = await fetch('http://localhost:3000/api/friends/shared-goals', { headers });
        if(res.ok) {
          const json = await res.json();
          // Ortak hedefleri ayırt edebilmek için isShared bayrağı ekliyoruz
          sharedGoalsData = (json.sharedGoals || []).map(g => ({ ...g, isShared: true }));
        }
      } catch (err) {
        console.error("Ortak hedefler çekilemedi", err);
      }

      // Hepsini birleştir
      setGoals([...ownGoalsData, ...sharedGoalsData]);
      setUsername(profile.username);
    } catch (error) {
      console.error("Veriler çekilirken hata oluştu", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Yeni Hedef Oluşturma
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    const newGoalObject = {
      id: Date.now().toString(),
      title: newGoal.title,
      image: newGoal.image || "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=1000",
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: newGoal.targetDate || "",
      contributors: [],
      history: [
        {
          id: Date.now() + 1,
          user: username,
          action: "Hedef Oluşturuldu",
          amount: 0,
          date: formattedDate,
          time: formattedTime,
          likes: 0,
          isLiked: false,
        },
      ],
    };

    try {
      // Sadece kendi hedeflerimizi (ortak olmayanları) bul ve kaydet
      const ownGoals = goals.filter(g => !g.isShared);
      const sharedGoals = goals.filter(g => g.isShared);
      
      const updatedOwnGoals = [...ownGoals, newGoalObject];
      await saveGoals(updatedOwnGoals); // Backend'e sadece kendi verilerimizi yazıyoruz
      
      setGoals([...updatedOwnGoals, ...sharedGoals]);
      setNewGoal({ title: "", targetAmount: "", targetDate: "", image: "" });
      setIsModalOpen(false);
    } catch (err) {
      alert("Hedef oluşturulurken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  // Ortak Hedefe Katılma
  const handleJoinGoal = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      const res = await fetch('http://localhost:3000/api/friends/join', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() })
      });
      
      const data = await res.json();
      if(res.ok) {
        alert(data.message || "Hedefe başarıyla katıldın!");
        setIsJoinModalOpen(false);
        setJoinCode("");
        loadData(); // Sayfayı yenileyip yeni katıldığımız hedefi çekiyoruz
      } else {
        alert(data.error || "Geçersiz kod.");
      }
    } catch(err) {
      alert("Bağlantı hatası.");
    } finally {
      setIsSaving(false);
    }
  };

  // Davet Kodu Üretme
  const handleGenerateCode = async (e, goalId) => {
    e.stopPropagation(); // Kartın içine tıklanmasını engelle
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      const res = await fetch('http://localhost:3000/api/friends/generate-code', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goalId })
      });
      
      const data = await res.json();
      if(res.ok) {
        setShareCode(data.code);
        setIsShareModalOpen(true);
        setCopied(false);
      } else {
        alert(data.error || "Kod üretilemedi.");
      }
    } catch (err) {
      alert("Sunucuya ulaşılamadı.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#007AFF] mb-4" size={40} />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Hedeflerin yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full relative bg-white dark:bg-gray-900">
      {/* Üst Kısım: Başlık ve Ekleme Butonları */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="text-[#007AFF]" size={32} />
            Hedeflerim
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
            Hayallerin için birikim yap, hedefini gözünün önünde tut.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 md:px-5 md:py-3 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-sm"
          >
            <Key size={18} className="text-[#007AFF]" />
            <span className="hidden sm:inline">Koda Katıl</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#007AFF] hover:bg-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-[0_4px_15px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.4)]"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span className="hidden md:inline">Yeni Hedef</span>
          </button>
        </div>
      </div>

      {/* Hedef Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map((goal) => {
          const progressPercentage = Math.min(
            (goal.currentAmount / goal.targetAmount) * 100,
            100,
          ).toFixed(1);

          return (
            <div
              key={goal.id}
              onClick={() => navigate(`/my-goal/${goal.id}`)}
              className={`bg-white dark:bg-gray-800 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,122,255,0.15)] transition-all duration-300 cursor-pointer group flex flex-col border overflow-hidden relative ${goal.isShared ? 'border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-700'}`}
            >
              {goal.isShared && (
                <div className="absolute top-4 left-4 z-10 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
                  Ortak Hedef ({goal.ownerName || "Arkadaş"})
                </div>
              )}

              <div className="w-full h-48 sm:h-52 relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={goal.image}
                  alt={goal.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#007AFF] shadow-sm">
                  %{progressPercentage} Tamamlandı
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {goal.title}
                  </h3>
                  <div className="text-[#007AFF] font-bold text-lg">
                    {goal.currentAmount.toLocaleString("tr-TR")} ₺
                    <span className="text-gray-400 dark:text-gray-500 text-sm font-medium ml-1">
                      / {goal.targetAmount.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="w-full bg-blue-50 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-4">
                    <div
                      className="bg-[#007AFF] h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Users size={16} className="text-gray-400 dark:text-gray-500" />
                      <span>{goal.contributors?.length || 0} Katılımcı</span>
                    </div>

                    {!goal.isShared && (
                      <button
                        onClick={(e) => handleGenerateCode(e, goal.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors z-20 border border-blue-100 dark:border-gray-600 shadow-sm"
                        title="Davet Kodu Üret"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- YENİ HEDEF OLUŞTURMA MODALI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Hedef Oluştur</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Hedef Adı</label>
                <input required value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#007AFF] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Hedeflenen Tutar (₺)</label>
                <input type="number" required value={newGoal.targetAmount} onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#007AFF] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Hedef Bitiş Tarihi</label>
                <input type="date" required value={newGoal.targetDate} onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#007AFF] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Görsel Linki (İsteğe Bağlı)</label>
                <input type="url" value={newGoal.image} onChange={(e) => setNewGoal({ ...newGoal, image: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#007AFF] outline-none" />
              </div>

              <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-xl font-medium flex items-start gap-2">
                <Users size={18} className="shrink-0 mt-0.5" />
                <p>Hedefi kaydettikten sonra, üzerine tıklayarak davet kodu oluşturabilir ve arkadaşlarınla paylaşabilirsin.</p>
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-3.5 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 flex justify-center items-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Oluştur"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- KODA KATIL MODALI --- */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-in fade-in zoom-in-95">
            <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#007AFF]">
              <Key size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ortak Hedefe Katıl</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Arkadaşından aldığın 6 haneli davet kodunu aşağıya gir.</p>

            <form onSubmit={handleJoinGoal}>
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Örn: X9K2P1"
                className="w-full text-center text-2xl tracking-[0.3em] font-bold px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#007AFF] outline-none mb-6 uppercase"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">İptal</button>
                <button type="submit" disabled={isSaving || joinCode.length < 4} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 disabled:opacity-50">Katıl</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- KOD PAYLAŞMA (ÜRETİLDİ) MODALI --- */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <button onClick={() => setIsShareModalOpen(false)} className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Davet Kodu Üretildi!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Bu kodu arkadaşınla paylaşarak hedefi ortak takip edebilirsiniz. Kod 1 saat geçerlidir.</p>

            <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 mb-6 relative">
              <div className="text-4xl font-black tracking-widest text-gray-800 dark:text-white">{shareCode}</div>
            </div>

            <button onClick={copyToClipboard} className="w-full py-3.5 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? "Kopyalandı!" : "Kodu Kopyala"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGoal;