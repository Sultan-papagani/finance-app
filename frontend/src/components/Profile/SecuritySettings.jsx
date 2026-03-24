import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Key,
  Smartphone,
  Check,
  Eye,
  EyeOff,
  Monitor,
  LogOut,
} from "lucide-react";

const SecuritySettings = () => {
  const navigate = useNavigate();

  // Şifre Formu State'leri
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSaved, setIsSaved] = useState(false);

  // Güvenlik Ayarları (Toggle) State
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Yeni şifreler birbiriyle eşleşmiyor!");
      return;
    }
    // API Kaydetme Simülasyonu
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setPasswords({ current: "", new: "", confirm: "" }); // Formu temizle
    }, 3000);
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
        <h1 className="text-2xl font-bold text-gray-900">Güvenlik ve Şifre</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6 space-y-6">
        {/* Güvenlik Skoru */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[24px] p-6 text-white shadow-md flex items-center gap-5">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shrink-0">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Hesabın Güvende</h2>
            <p className="text-emerald-50 text-sm mt-1 font-medium">
              Şifreleme standartları aktif ve hesabın korunuyor.
            </p>
          </div>
        </div>

        {/* --- ŞİFRE DEĞİŞTİRME FORMU --- */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Key size={16} /> Şifre Değiştir
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Mevcut Şifre */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                Mevcut Şifreniz
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  className="w-full px-4 py-3 font-medium text-gray-800 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Yeni Şifre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    className="w-full px-4 py-3 font-medium text-gray-800 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Yeni Şifre Tekrar */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                  Yeni Şifre (Tekrar)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="w-full px-4 py-3 font-medium text-gray-800 rounded-xl border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  {/* Şifre Göster/Gizle Butonu */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#007AFF] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isSaved
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                  : "bg-gray-900 hover:bg-black hover:shadow-lg"
              }`}
            >
              {isSaved ? (
                <>
                  <Check size={20} /> Şifre Güncellendi
                </>
              ) : (
                "Şifreyi Güncelle"
              )}
            </button>
          </form>
        </div>

        {/* --- EKSTRA GÜVENLİK AYARLARI (Sadece 2FA) --- */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Ek Güvenlik
            </h2>
          </div>

          {/* İki Adımlı Doğrulama (2FA) */}
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors ${is2FAEnabled ? "bg-blue-50 text-[#007AFF]" : "bg-gray-50 text-gray-400"}`}
              >
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">
                  İki Adımlı Doğrulama (2FA)
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Giriş yaparken ek bir doğrulama kodu istenir.
                </p>
              </div>
            </div>
            {/* Tailwind Toggle Switch */}
            <button
              onClick={() => setIs2FAEnabled(!is2FAEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${is2FAEnabled ? "bg-[#007AFF]" : "bg-gray-200"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform duration-300 ease-in-out ${is2FAEnabled ? "translate-x-6" : "translate-x-0.5"}`}
              ></div>
            </button>
          </div>
        </div>

        {/* --- AKTİF CİHAZLAR VE OTURUMLAR --- */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Kayıtlı Yerler & Oturumlar
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-semibold">
              Güvenli
            </span>
          </div>

          <div className="space-y-4">
            {/* Cihaz 1 (Mevcut Cihaz) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 p-2 rounded-lg text-[#007AFF]">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    Bu Cihaz (iPhone 14)
                  </h4>
                  <p className="text-xs text-emerald-500 font-medium mt-0.5">
                    Şu an aktif • Karabük, TR
                  </p>
                </div>
              </div>
            </div>

            {/* Cihaz 2 (Başka bir cihaz - Çıkış yapılabilir) */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 p-2 rounded-lg text-gray-600">
                  <Monitor size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    Windows PC - Chrome
                  </h4>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Son görülme: 2 saat önce
                  </p>
                </div>
              </div>
              <button
                onClick={() => alert("Bu cihazdan güvenli çıkış yapıldı.")}
                className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <LogOut size={14} /> Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
