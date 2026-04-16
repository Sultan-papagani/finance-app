import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Wallet,
  TrendingUp,
  Calendar,
  Check,
  Loader2,
} from "lucide-react";
import { apiGet, apiPatch } from "../../services/api";

const PersonalInfo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    occupation: "",
    monthlyIncome: "",
    birthDate: "",
  });

  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    Promise.all([apiGet("/api/user/profile"), apiGet("/api/user/finances")])
      .then(([profile, finances]) => {
        setFormData({
          fullName: profile.username || "",
          email: profile.email || "",
          phone: profile.phone || "",
          occupation: profile.occupation || "",
          monthlyIncome: profile.monthlyIncome || "",
          birthDate: profile.birthDate || "",
        });

        const cards = finances.cards || [];
        const total = cards.reduce((sum, c) => sum + (c.balance || 0), 0);
        setTotalBalance(total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);
    try {
      await apiPatch("/api/user/profile", {
        username: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        occupation: formData.occupation,
        monthlyIncome: formData.monthlyIncome,
        birthDate: formData.birthDate,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message || "Kaydedilemedi, tekrar dene.");
    } finally {
      setIsSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kişisel Bilgiler</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6 space-y-6">
        {/* Total balance banner */}
        <div className="bg-gradient-to-br from-[#007AFF] to-blue-600 rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-100 font-medium text-sm mb-1">Toplam Kart Bakiyesi</p>
            {loading ? (
              <div className="h-10 bg-white/20 rounded-xl animate-pulse w-40" />
            ) : (
              <h2 className="text-4xl font-extrabold tracking-tight">
                {totalBalance.toLocaleString("tr-TR")} ₺
              </h2>
            )}
            <p className="text-blue-200 text-xs mt-2 font-medium">
              Tüm kartlarının toplam bakiyesi
            </p>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5 transition-colors">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Profil Detayları
            </h2>

            {loading ? (
              <div className="space-y-4">
                <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 ml-1">
                    Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 ml-1">
                      Cep Telefonu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+90 5XX XXX XX XX"
                        className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 ml-1">
                      E-posta Adresi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Birth date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 ml-1">
                    Doğum Tarihi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Financial details */}
          <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5 transition-colors">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Finansal Durum
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 ml-1">
                  Meslek / Ünvan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Briefcase size={18} />
                  </div>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Örn: Yazılım Geliştirici"
                    className="w-full pl-11 pr-4 py-3 font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 ml-1">
                  Aylık Ortalama Gelir (₺)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <TrendingUp size={18} />
                  </div>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                    placeholder="0"
                    className="w-full pl-11 pr-12 py-3 font-bold text-[#007AFF] bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-semibold">
                    ₺
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {saveError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold px-4 py-3 rounded-xl">
              {saveError}
            </div>
          )}

          {/* Save button */}
          <button
            type="submit"
            disabled={isSaving || loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              isSaved
                ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                : "bg-[#007AFF] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
            } disabled:opacity-60`}
          >
            {isSaving ? (
              <><Loader2 size={20} className="animate-spin" /> Kaydediliyor...</>
            ) : isSaved ? (
              <><Check size={20} strokeWidth={3} /> Değişiklikler Kaydedildi</>
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
