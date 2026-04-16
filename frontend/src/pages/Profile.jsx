import React, { useState, useRef, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  User,
  Shield,
  CreditCard,
  Bell,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { apiGet, apiPatch } from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Tema state'ini doğrudan burada tutuyoruz (Eğer uygulamanın genelinde bir Context yoksa)
  const [theme, setTheme] = useState("light");

  const [profile, setProfile] = useState({ username: "Kullanıcı", email: "Yükleniyor..." });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/user/profile")
      .then((data) => {
        setProfile({ username: data.username, email: data.email });
        setAvatar(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=0D8ABC&color=fff&size=256`
        );
        setTheme(data.theme || "light");
        
        // Temayı HTML'e uygula ki karanlık mod aktif olsun
        if (data.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      })
      .catch(() => {
        setProfile({ username: "Kullanici", email: "" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleThemeToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Anında UI değişikliği
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    try {
      await apiPatch("/api/user/theme", { theme: newTheme });
    } catch (err) {
      console.error("Tema guncellenemedi:", err);
      // Hata olursa eski haline getir
      setTheme(theme); 
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Burada sadece frontend önizlemesi var. Gerçek bir projede bunu FormData ile /api/user/images rotana POST etmen gerekir.
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-10 transition-colors duration-300">
      {/* Header gradient */}
      <div className="bg-gradient-to-br from-blue-600 to-[#007AFF] h-64 relative overflow-hidden">
        <div className="absolute top-10 -left-10 text-[180px] font-extrabold text-white/10 tracking-tighter select-none rotate-[-15deg]">
          Wallet
        </div>
        <div className="px-4 pt-6 md:px-8 relative z-10 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profil Ayarlari</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-24 space-y-6 relative z-10">
        
        {/* Profile card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-colors duration-300">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-[28px] border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                  <Loader2 className="animate-spin text-[#007AFF]" size={32} />
                </div>
              ) : (
                <img src={avatar} alt="Profil" className="w-full h-full object-cover" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 text-[#007AFF] p-2.5 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-600"
              title="Fotograf Degistir"
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

          <div className="flex-1 text-center sm:text-left flex flex-col pt-1">
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse w-48" />
                <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse w-36" />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tighter flex items-center justify-center sm:justify-start gap-2.5">
                  {profile.username}
                  <CheckCircle2 size={22} className="text-blue-500 shrink-0" />
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-base">{profile.email}</p>
              </>
            )}

            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-inner">
                <CheckCircle2 size={14} />
                Onayli Hesap
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                Wealth Status: Explorer
              </span>
            </div>
          </div>
        </div>

        {/* Settings menu */}
        <div className="space-y-4">
          
          {/* Account management */}
          <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="p-4 border-b border-gray-50 dark:border-gray-700">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">
                Hesap Yonetimi
              </span>
            </div>

            <button
              onClick={() => navigate("/personal-info")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] rounded-xl group-hover:scale-110 transition-transform">
                  <User size={22} />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Kisisel Bilgiler</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/security-settings")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Shield size={22} />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-gray-700 dark:text-gray-200 block">Guvenlik ve Sifre</span>
                  <span className="text-xs text-gray-400 font-medium">Iki adimli dogrulama (2FA)</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="p-4 border-b border-gray-50 dark:border-gray-700">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">
                Tercihler
              </span>
            </div>

            <button
              onClick={() => navigate("/add-transaction")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                  <CreditCard size={22} />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Kartlarim</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/notification-settings")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Bell size={22} />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Bildirim Ayarlari</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={handleThemeToggle}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${
                  theme === "dark" ? "bg-gray-900 text-yellow-400" : "bg-gray-100 text-gray-600"
                }`}>
                  {theme === "dark" ? <Moon size={22} /> : <Sun size={22} />}
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Tema (Karanlik Mod)</span>
              </div>
              <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                theme === "dark"
                  ? "text-yellow-600 bg-yellow-500/20"
                  : "text-[#007AFF] bg-blue-50"
              }`}>
                {theme === "dark" ? "Acik" : "Kapali"}
              </span>
            </button>
          </div>

          {/* Support & logout */}
          <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 mt-6 transition-colors">
            <button
              onClick={() => navigate("/help-center")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
                  <HelpCircle size={22} />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Yardim Merkezi</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => {
                if (window.confirm("Hesabinizdan guvenli cikis yapmak istediginize emin misiniz?")) {
                  localStorage.removeItem("token");
                  navigate("/");
                }
              }}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <div className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all">
                <LogOut size={22} />
              </div>
              <span className="font-bold text-red-500">Guvenli Cikis Yap</span>
            </button>
          </div>
        </div>

        <div className="text-center pb-8 pt-4">
          <p className="text-xs font-medium text-gray-400">While Wallet v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;