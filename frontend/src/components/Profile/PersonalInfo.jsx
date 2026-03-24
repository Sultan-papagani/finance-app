import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Wallet,
  TrendingUp,
  Check,
  PlusCircle,
} from "lucide-react";

const PersonalInfo = () => {
  const navigate = useNavigate();

  // Form verileri (Sanal cüzdan mantığına uygun)
  const [formData, setFormData] = useState({
    fullName: "Ayberk Okuyucu",
    email: "ayberk@whilewallet.com",
    phone: "+90 555 123 45 67",
    occupation: "Öğrenci / Yazılım Geliştirici",
    monthlyIncome: "15000", // Hayali aylık gelir/harçlık
  });

  const [virtualBalance, setVirtualBalance] = useState(4500); // Cüzdandaki hayali ana bakiye
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Hayali Bakiye Ekleme Simülasyonu
  const handleAddVirtualMoney = () => {
    const amount = prompt("Cüzdana eklenecek hayali tutarı girin (₺):");
    if (amount && !isNaN(amount) && amount > 0) {
      setVirtualBalance((prev) => prev + parseFloat(amount));
      alert(`${amount} ₺ sanal cüzdanınıza eklendi!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 md:px-8 sticky top-0 z-10 shadow-sm flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 text-gray-800 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Hesap ve Cüzdan</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6 space-y-6">
        {/* --- SANAL CÜZDAN ÖZETİ --- */}
        <div className="bg-gradient-to-br from-[#007AFF] to-blue-600 rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden">
          {/* Arka plan deseni */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={120} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-blue-100 font-medium text-sm mb-1">
                While Wallet Ana Bakiye
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight">
                {virtualBalance.toLocaleString("tr-TR")} ₺
              </h2>
            </div>

            <button
              onClick={handleAddVirtualMoney}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full md:w-auto"
            >
              <PlusCircle size={20} />
              Bakiye Yükle
            </button>
          </div>
        </div>

        {/* --- KİŞİSEL BİLGİLER FORMU --- */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Profil Detayları
            </h2>

            <div className="space-y-5">
              {/* Ad Soyad */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Telefon */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Cep Telefonu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* E-posta */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Finansal Durum (Uygulamanın matematiğini besler) */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Finansal Durum
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Meslek */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                  Meslek / Ünvan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Briefcase size={18} />
                  </div>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Aylık Gelir */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                  Aylık Ortalama Gelir (₺)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <TrendingUp size={18} />
                  </div>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyIncome: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-12 py-3 font-bold text-[#007AFF] rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    ₺
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium ml-1 mt-1.5">
                  Bütçe tavsiyeleri bu tutara göre hesaplanır.
                </p>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              isSaved
                ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                : "bg-[#007AFF] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
            }`}
          >
            {isSaved ? (
              <>
                <Check size={20} strokeWidth={3} />
                Değişiklikler Kaydedildi
              </>
            ) : (
              "Bilgileri Güncelle"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
