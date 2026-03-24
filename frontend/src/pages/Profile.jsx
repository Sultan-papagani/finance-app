import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  User,
  Shield,
  CreditCard,
  Bell,
  Moon,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profil fotoğrafı için state (Varsayılan şık bir avatar)
  const [avatar, setAvatar] = useState(
    "https://ui-avatars.com/api/?name=Ayberk&background=0D8ABC&color=fff&size=256",
  );

  // Fotoğraf Yükleme Simülasyonu (Önizleme)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      {/* --- PREMIUM ARKA PLAN VE HEADER --- */}
      {/* Tepeden başlayan mavi alan */}
      <div className="bg-gradient-to-br from-blue-600 to-[#007AFF] h-64 relative overflow-hidden">
        {/* Arka plandaki devasa, silik 'Wallet' yazısı (Tasarım Detayı) */}
        <div className="absolute top-10 -left-10 text-[180px] font-extrabold text-white/10 tracking-tighter select-none rotate-[-15deg]">
          Wallet
        </div>

        {/* Header Butonu */}
        <div className="px-4 pt-6 md:px-8 relative z-10 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Profil Ayarları
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-24 space-y-6 relative z-10">
        {/* --- YENİLENEN MODERM PROFİL KARTI --- */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Fotoğraf Alanı (Solda Sabit) */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-[28px] border-4 border-white shadow-xl overflow-hidden bg-gray-50">
              <img
                src={avatar}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Fotoğraf Değiştir Butonu */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-2 -right-2 bg-white text-[#007AFF] p-2.5 rounded-full shadow-lg hover:bg-gray-100 transition-colors border border-gray-100"
              title="Fotoğraf Değiştir"
            >
              <Camera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Kullanıcı Bilgileri (Sağda, Asimetrik) */}
          <div className="flex-1 text-center sm:text-left flex flex-col pt-1">
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tighter flex items-center justify-center sm:justify-start gap-2.5">
              Ayberk Okuyucu
              <CheckCircle2 size={22} className="text-blue-500 shrink-0" />
            </h2>

            <p className="text-gray-500 font-medium mt-1 text-base">
              ayberk@whilewallet.com
            </p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#007AFF] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-inner">
                <CheckCircle2 size={14} />
                Onaylı Hesap
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                Wealth Status: Explorer
              </span>
            </div>
          </div>
        </div>

        {/* --- AYARLAR MENÜSÜ (Grup Grubu) --- */}
        <div className="space-y-4">
          {/* Hesap Grubu */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">
                Hesap Yönetimi
              </span>
            </div>

            <button
              onClick={() => navigate("/personal-info")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-[#007AFF] rounded-xl group-hover:scale-110 transition-transform">
                  <User size={22} />
                </div>
                <span className="font-semibold text-gray-700">
                  Kişisel Bilgiler
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/security-settings")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Shield size={22} />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-gray-700 block">
                    Güvenlik ve Şifre
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    İki adımlı doğrulama (2FA)
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Finans ve Tercihler Grubu */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">
                Tercihler
              </span>
            </div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                  <CreditCard size={22} />
                </div>
                <span className="font-semibold text-gray-700">
                  Kayıtlı Hesaplarım
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/notification-settings")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Bell size={22} />
                </div>
                <span className="font-semibold text-gray-700">
                  Bildirim Ayarları
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-100 text-gray-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Moon size={22} />
                </div>
                <span className="font-semibold text-gray-700">
                  Tema (Karanlık Mod)
                </span>
              </div>
              {/* Buraya bir toggle (switch) de konulabilir */}
              <span className="text-sm font-bold text-[#007AFF] bg-blue-50 px-3 py-1 rounded-lg">
                Kapalı
              </span>
            </button>
          </div>

          {/* Destek ve Çıkış Grubu */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 mt-6">
            <button
              onClick={() => navigate("/help-center")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
                  <HelpCircle size={22} />
                </div>
                <span className="font-semibold text-gray-700">
                  Yardım Merkezi
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            {/* ProfileSettings.jsx içindeki Çıkış Butonu */}
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Hesabınızdan güvenli çıkış yapmak istediğinize emin misiniz?",
                  )
                ) {
                  // Burada localStorage'daki JWT token'ı silinir
                  localStorage.removeItem("token");
                  // Login sayfasına yönlendirilir (Senin giriş rotan neyse onu yazmalısın, örn: "/")
                  navigate("/");
                }
              }}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors group"
            >
              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all">
                <LogOut size={22} />
              </div>
              <span className="font-bold text-red-500">Güvenli Çıkış Yap</span>
            </button>
          </div>
        </div>

        {/* App Versiyon Bilgisi */}
        <div className="text-center pb-8 pt-4">
          <p className="text-xs font-medium text-gray-400">
            While Wallet v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
