import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Plus,
  Users,
  Loader2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { fetchGoals } from "../../services/goalService";

const MyGoal = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal (Pop-up) açık/kapalı durumunu kontrol eden state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Yeni eklenecek hedefin verilerini tutan state
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    image: "",
    friends: [], // Arkadaş listesi
  });

  // Arkadaş ekleme inputu için geçici state
  const [friendInput, setFriendInput] = useState("");

  useEffect(() => {
    const getGoalsData = async () => {
      try {
        const data = await fetchGoals();
        setGoals(data);
      } catch (error) {
        console.error("Veriler çekilirken hata oluştu", error);
      } finally {
        setLoading(false);
      }
    };

    getGoalsData();
  }, []);

  // Arkadaş Ekleme Fonksiyonu
  const handleAddFriendToNewGoal = (e) => {
    e.preventDefault();
    if (friendInput.trim() !== "") {
      setNewGoal({
        ...newGoal,
        friends: [...newGoal.friends, friendInput.trim()],
      });
      setFriendInput(""); // Yazdıktan sonra kutuyu temizle
    }
  };

  // Eklenen Arkadaşı Silme Fonksiyonu
  const handleRemoveFriend = (indexToRemove) => {
    const updatedFriends = newGoal.friends.filter(
      (_, index) => index !== indexToRemove,
    );
    setNewGoal({ ...newGoal, friends: updatedFriends });
  };

  // Formu gönderme (Kaydetme) işlemi
  const handleCreateGoal = (e) => {
    e.preventDefault();

    const friendMessage =
      newGoal.friends.length > 0
        ? ` ve ${newGoal.friends.length} arkadaşına davet gönderildi!`
        : "!";

    alert(
      `Harika! "${newGoal.title}" hedefi ${newGoal.targetAmount} ₺ tutarıyla oluşturuldu${friendMessage}`,
    );

    // Formu temizle ve modalı kapat
    setNewGoal({ title: "", targetAmount: "", image: "", friends: [] });
    setFriendInput("");
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#007AFF] mb-4" size={40} />
        <p className="text-gray-500 font-medium">Hedeflerin yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full relative">
      {/* Üst Kısım: Başlık ve Ekleme Butonu */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="text-[#007AFF]" size={32} />
            Hedeflerim
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Hayallerin için birikim yap, hedefini gözünün önünde tut.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#007AFF] hover:bg-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-[0_4px_15px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.4)]"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span className="hidden md:inline">Yeni Hedef</span>
        </button>
      </div>

      {/* Hedef Kartları Grid Yapısı */}
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
              className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_40px_rgba(0,122,255,0.15)] transition-all duration-300 cursor-pointer group flex flex-col border border-gray-100 overflow-hidden"
            >
              <div className="w-full h-48 sm:h-52 relative overflow-hidden bg-gray-100">
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
                  <h3 className="font-bold text-xl text-gray-900 mb-1">
                    {goal.title}
                  </h3>
                  <div className="text-[#007AFF] font-bold text-lg">
                    {goal.currentAmount.toLocaleString("tr-TR")} ₺
                    <span className="text-gray-400 text-sm font-medium ml-1">
                      / {goal.targetAmount.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="w-full bg-blue-50 rounded-full h-3 overflow-hidden mb-4">
                    <div
                      className="bg-[#007AFF] h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                      <Users size={16} className="text-gray-400" />
                      <span>{goal.contributors.length} Katılımcı</span>
                    </div>

                    <div className="flex items-center -space-x-2">
                      {goal.contributors.slice(0, 3).map((user, index) => (
                        <div
                          key={index}
                          className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold z-10 ${user.avatarColor || "bg-blue-100 text-[#007AFF]"}`}
                        >
                          {user.name.charAt(0)}
                        </div>
                      ))}

                      {/* Kart İçindeki Küçük Arkadaş Ekle Butonu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(
                            `${goal.title} hedefine arkadaş davet etme modalı açılacak!`,
                          );
                        }}
                        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-[#007AFF] hover:text-white transition-colors z-20 shadow-sm"
                        title="Arkadaş Ekle"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- YENİ HEDEF EKLEME MODALI (POP-UP) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Yeni Hedef Oluştur
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Hedef Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: PlayStation 5"
                  required
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Hedeflenen Tutar (₺)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="25000"
                    required
                    min="1"
                    value={newGoal.targetAmount}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetAmount: e.target.value })
                    }
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    ₺
                  </span>
                </div>
              </div>
              {/* Hedef Tarihi Eklemesi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Hedef Bitiş Tarihi
                </label>
                <input
                  type="date"
                  required
                  value={newGoal.targetDate || ""}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Görsel Linki (İsteğe Bağlı)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#007AFF] shrink-0">
                    <ImageIcon size={24} />
                  </div>
                  <input
                    type="url"
                    placeholder="https://... (Resim Linki)"
                    value={newGoal.image}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, image: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Arkadaş Davet Et Alanı */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Arkadaş Davet Et (İsteğe Bağlı)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Users
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Kullanıcı adı veya e-posta"
                      value={friendInput}
                      onChange={(e) => setFriendInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddFriendToNewGoal(e))
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFriendToNewGoal}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-colors text-sm"
                  >
                    Ekle
                  </button>
                </div>

                {/* Eklenen Arkadaşların Listesi */}
                {newGoal.friends.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {newGoal.friends.map((friend, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 bg-blue-50 text-[#007AFF] px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100 animate-in fade-in slide-in-from-left-2"
                      >
                        {friend}
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(index)}
                          className="hover:text-blue-700 transition-colors bg-white rounded-full p-0.5"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGoal;
