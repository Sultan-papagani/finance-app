import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Wallet,
  Target,
  Heart,
  Users,
  Smartphone,
  Mail,
} from "lucide-react";

const NotificationSettings = () => {
  const navigate = useNavigate();

  // Bildirim State'leri (Varsayılan olarak hepsi açık)
  const [notifs, setNotifs] = useState({
    transfers: true,
    goals: true,
    likes: true,
    newMembers: true,
    pushApp: true,
    email: false, // E-posta varsayılan kapalı olsun
  });

  // Tekil toggle değiştirme fonksiyonu
  const toggleNotif = (key) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Tekrar kullanılabilir şık Switch (Aç/Kapat) Butonu
  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out shrink-0 ${checked ? "bg-[#007AFF]" : "bg-gray-200"}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform duration-300 ease-in-out ${checked ? "translate-x-6" : "translate-x-0.5"}`}
      ></div>
    </button>
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Bildirim Ayarları</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6 space-y-6">
        {/* Bilgi Kartı */}
        <div className="bg-gradient-to-r from-blue-500 to-[#007AFF] rounded-[24px] p-6 text-white shadow-md flex items-center gap-5">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shrink-0">
            <Bell size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Haberdar Ol</h2>
            <p className="text-blue-50 text-sm mt-1 font-medium">
              Cüzdan hareketlerinden ve ekip arkadaşlarının etkileşimlerinden
              anında haberdar ol.
            </p>
          </div>
        </div>

        {/* --- FİNANSAL BİLDİRİMLER --- */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Cüzdan ve Hedefler
            </h2>
          </div>

          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors ${notifs.transfers ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"}`}
              >
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Para Giriş / Çıkışı</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Ortak hedeflere para eklendiğinde haber ver.
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifs.transfers}
              onChange={() => toggleNotif("transfers")}
            />
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors ${notifs.goals ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-400"}`}
              >
                <Target size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Hedef Durumu</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Hedefe %100 ulaşıldığında beni kutla.
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifs.goals}
              onChange={() => toggleNotif("goals")}
            />
          </div>
        </div>

        {/* --- SOSYAL ETKİLEŞİMLER --- */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Sosyal Etkileşimler
            </h2>
          </div>

          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors ${notifs.likes ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"}`}
              >
                <Heart size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Beğeniler (Likes)</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Biri finansal işlemimi beğendiğinde bildir.
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifs.likes}
              onChange={() => toggleNotif("likes")}
            />
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors ${notifs.newMembers ? "bg-blue-50 text-[#007AFF]" : "bg-gray-50 text-gray-400"}`}
              >
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Yeni Katılımcılar</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Ortak havuza yeni bir arkadaş eklendiğinde bildir.
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifs.newMembers}
              onChange={() => toggleNotif("newMembers")}
            />
          </div>
        </div>

        {/* --- İLETİŞİM KANALLARI --- */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              İletişim Kanalları
            </h2>
          </div>

          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors ${notifs.pushApp ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-400"}`}
              >
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">
                  Anlık Bildirimler (Push)
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Telefonuma uygulama içi bildirim gönder.
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifs.pushApp}
              onChange={() => toggleNotif("pushApp")}
            />
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors ${notifs.email ? "bg-orange-50 text-orange-500" : "bg-gray-50 text-gray-400"}`}
              >
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">E-posta Bülteni</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Aylık finansal özetimi mail olarak al.
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifs.email}
              onChange={() => toggleNotif("email")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
