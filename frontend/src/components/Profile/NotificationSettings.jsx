import React, { useState, useEffect } from "react";
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
  Loader2,
  Check,
} from "lucide-react";
import { apiGet, apiPatch } from "../../services/api";

const NotificationSettings = () => {
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState({
    transfers: true,
    goals: true,
    likes: true,
    newMembers: true,
    pushApp: true,
    email: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGet("/api/user/profile")
      .then((data) => {
        if (data.notificationSettings && typeof data.notificationSettings === "object") {
          setNotifs((prev) => ({ ...prev, ...data.notificationSettings }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleNotif = async (key) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);

    setSaving(true);
    try {
      await apiPatch("/api/user/notifications", updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Bildirim ayarı kaydedilemedi:", err);
      setNotifs(notifs);
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out shrink-0 ${
        checked ? "bg-[#007AFF]" : "bg-gray-200 dark:bg-gray-600"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-0.5"
        }`}
      ></div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-10 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 pt-6 pb-4 md:px-8 sticky top-0 z-10 shadow-sm flex items-center gap-4 transition-colors">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bildirim Ayarları</h1>
          {saving && <Loader2 size={16} className="animate-spin text-[#007AFF]" />}
          {saved && <Check size={16} className="text-emerald-500" />}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6 space-y-6">
        {/* Info card */}
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

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse w-48" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Financial Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="p-5 border-b border-gray-50 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Cüzdan ve Hedefler
                </h2>
              </div>

              <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${notifs.transfers ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-gray-50 dark:bg-gray-700 text-gray-400"}`}>
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Para Giriş / Çıkışı</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Ortak hedeflere para eklendiğinde haber ver.
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={notifs.transfers} onChange={() => toggleNotif("transfers")} />
              </div>

              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${notifs.goals ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "bg-gray-50 dark:bg-gray-700 text-gray-400"}`}>
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Hedef Durumu</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Hedefe %100 ulaşıldığında beni kutla.
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={notifs.goals} onChange={() => toggleNotif("goals")} />
              </div>
            </div>

            {/* Social Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="p-5 border-b border-gray-50 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Sosyal Etkileşimler
                </h2>
              </div>

              <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${notifs.likes ? "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400" : "bg-gray-50 dark:bg-gray-700 text-gray-400"}`}>
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Beğeniler (Likes)</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Biri finansal işlemimi beğendiğinde bildir.
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={notifs.likes} onChange={() => toggleNotif("likes")} />
              </div>

              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${notifs.newMembers ? "bg-blue-50 dark:bg-blue-900/30 text-[#007AFF]" : "bg-gray-50 dark:bg-gray-700 text-gray-400"}`}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Yeni Katılımcılar</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Ortak havuza yeni bir arkadaş eklendiğinde bildir.
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={notifs.newMembers} onChange={() => toggleNotif("newMembers")} />
              </div>
            </div>

            {/* Communication Channels */}
            <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="p-5 border-b border-gray-50 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  İletişim Kanalları
                </h2>
              </div>

              <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${notifs.pushApp ? "bg-gray-900 dark:bg-gray-600 text-white" : "bg-gray-50 dark:bg-gray-700 text-gray-400"}`}>
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Anlık Bildirimler (Push)</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Telefonuma uygulama içi bildirim gönder.
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={notifs.pushApp} onChange={() => toggleNotif("pushApp")} />
              </div>

              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${notifs.email ? "bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400" : "bg-gray-50 dark:bg-gray-700 text-gray-400"}`}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">E-posta Bülteni</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Aylık finansal özetimi mail olarak al.
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={notifs.email} onChange={() => toggleNotif("email")} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
