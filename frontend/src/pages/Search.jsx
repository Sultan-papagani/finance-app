import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  Settings,
  Target,
  Wallet,
  ChevronRight,
  UserPlus,
  History,
  CreditCard,
  X,
  Landmark,
  Send,
  HelpCircle,
  Home,
  User,
  Shield,
  Bell,
  Moon,
  BarChart3,
  TrendingUp,
  Coins,
  PlusCircle,
  Calendar,
  ArrowRightLeft,
} from "lucide-react";

// Uygulamadaki tum sayfalar ve bilesenler
const APP_PAGES = [
  { id: "p1", title: "Ana Sayfa", path: "/home", icon: Home, desc: "Genel bakis ve kart ozeti", tags: ["anasayfa", "home", "panel", "dashboard"] },
  { id: "p2", title: "Hedeflerim", path: "/my-goal", icon: Target, desc: "Ortak veya bireysel birikim hedeflerin", tags: ["hedef", "birikim", "tasarruf", "goal"] },
  { id: "p3", title: "Islem Ekle / Para Transferi", path: "/add-transaction", icon: PlusCircle, desc: "Yeni gelir, gider veya transfer kaydi olustur", tags: ["islem", "transfer", "gelir", "gider", "para", "ekle"] },
  { id: "p4", title: "Islem Gecmisi", path: "/history", icon: History, desc: "Eski harcamalarini ve gelirlerini incele", tags: ["gecmis", "tarihce", "islem", "history"] },
  { id: "p5", title: "Finansal Ozet", path: "/finance", icon: BarChart3, desc: "Grafikler, analizler ve istatistikler", tags: ["finans", "grafik", "analiz", "istatistik"] },
  { id: "p6", title: "Doviz Kurlari", path: "/detail", icon: ArrowRightLeft, desc: "Canli doviz kurlari ve grafikleri", tags: ["doviz", "kur", "euro", "dolar", "usd", "eur"] },
  { id: "p7", title: "Borsa Terminali", path: "/stock-terminal", icon: TrendingUp, desc: "Hisse senedi arama ve grafikleri", tags: ["borsa", "hisse", "stock", "bist"] },
  { id: "p8", title: "Kripto Terminal", path: "/crypto-terminal", icon: Coins, desc: "Kripto para fiyatlari ve grafikleri", tags: ["kripto", "crypto", "bitcoin", "ethereum"] },
  { id: "p9", title: "Altin Piyasalari", path: "/gold-market", icon: Coins, desc: "Gram altin, ceyrek altin fiyatlari", tags: ["altin", "gold", "gram", "ceyrek"] },
  { id: "p10", title: "Odeme Planlayici", path: "/add-payment", icon: Calendar, desc: "Duzenli odemeleri planla ve takip et", tags: ["odeme", "plan", "fatura", "kira"] },
  { id: "p11", title: "Profil Ayarlari", path: "/profile", icon: User, desc: "Profil bilgilerini duzenle", tags: ["profil", "ayar", "hesap"] },
  { id: "p12", title: "Kisisel Bilgiler", path: "/personal-info", icon: User, desc: "Ad, telefon, e-posta ve meslek bilgileri", tags: ["kisisel", "isim", "telefon", "email", "meslek"] },
  { id: "p13", title: "Guvenlik ve Sifre", path: "/security-settings", icon: Shield, desc: "Sifre degistirme ve 2FA ayarlari", tags: ["guvenlik", "sifre", "2fa", "parola"] },
  { id: "p14", title: "Bildirim Ayarlari", path: "/notification-settings", icon: Bell, desc: "Bildirim tercihlerini yonet", tags: ["bildirim", "notification", "uyari"] },
  { id: "p15", title: "Yardim Merkezi", path: "/help-center", icon: HelpCircle, desc: "SSS ve destek kanallari", tags: ["yardim", "destek", "sss", "faq", "soru"] },
  { id: "p16", title: "Kartlarim", path: "/add-transaction", icon: CreditCard, desc: "Kart islemleri ve bakiye goruntuleme", tags: ["kart", "bakiye", "card"] },
  { id: "p17", title: "Ayarlar", path: "/settings", icon: Settings, desc: "Genel uygulama ayarlari", tags: ["ayar", "setting", "tercih"] },
];

// SSS
const FAQ_ITEMS = [
  { id: "faq1", question: "Kart bakiyemi nasil gorebilirim?", answer: "Ana sayfadaki kartlariniza tiklayarak detayli bakiye ve islem gecmisine ulasabilirsiniz." },
  { id: "faq2", question: "Hedef nasil olusturulur?", answer: "Hedeflerim sayfasindan yeni hedef olustur butonuna tiklayarak baslik, hedef tutar ve tarih belirleyebilirsiniz." },
  { id: "faq3", question: "Sifremi nasil degistiririm?", answer: "Profil > Guvenlik ve Sifre bolumunden mevcut sifrenizi girerek yeni sifre belirleyebilirsiniz." },
  { id: "faq4", question: "Kac kart olusturabilirim?", answer: "Her kullanici en fazla 3 adet sanal kart olusturabilir." },
  { id: "faq5", question: "Doviz kurlarini nereden takip ederim?", answer: "Finans sayfasindan canli doviz kurlarini gorebilir, detay sayfasinda grafikleri inceleyebilirsiniz." },
  { id: "faq6", question: "Bildirim ayarlarimi nasil degistiririm?", answer: "Profil > Bildirim Ayarlari bolumunden tum bildirim tercihlerinizi yonetebilirsiniz." },
  { id: "faq7", question: "Arkadasimi hedefe nasil eklerim?", answer: "Hedef detay sayfasindan paylasim kodu olusturup arkadasiniza gonderebilirsiniz." },
  { id: "faq8", question: "Tema nasil degistirilir?", answer: "Profil Ayarlari sayfasindaki Tema butonuna tiklayarak karanlik mod acip kapatabilirsiniz." },
];

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.toLowerCase().trim();

  // Sayfalar icinde arama (baslik, aciklama ve tags)
  const filteredPages = query
    ? APP_PAGES.filter(
        (page) =>
          page.title.toLowerCase().includes(query) ||
          page.desc.toLowerCase().includes(query) ||
          page.tags.some((tag) => tag.includes(query))
      )
    : [];

  // SSS icinde arama
  const filteredFAQs = query
    ? FAQ_ITEMS.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      )
    : [];

  const hasNoResults = query && filteredPages.length === 0 && filteredFAQs.length === 0;

  // Hizli erisim butonlari (arama yapilmadan once gosterilir)
  const quickLinks = [
    { label: "Hedeflerim", path: "/my-goal", icon: Target, color: "bg-purple-50 text-purple-600" },
    { label: "Islem Ekle", path: "/add-transaction", icon: PlusCircle, color: "bg-emerald-50 text-emerald-600" },
    { label: "Finans", path: "/finance", icon: BarChart3, color: "bg-blue-50 text-[#007AFF]" },
    { label: "Profil", path: "/profile", icon: User, color: "bg-orange-50 text-orange-600" },
    { label: "Guvenlik", path: "/security-settings", icon: Shield, color: "bg-red-50 text-red-500" },
    { label: "Yardim", path: "/help-center", icon: HelpCircle, color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full pb-24 md:pb-10 pt-6 px-4 md:px-8">
      {/* Header and search */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Keşfet</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Sayfaları, işlemleri ve yardım makalelerini ara.
        </p>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon
              className="text-gray-400 group-focus-within:text-[#007AFF] transition-colors"
              size={22}
            />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-[#007AFF] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] focus:shadow-[0_4px_25px_rgba(0,122,255,0.15)] outline-none transition-all text-gray-800 dark:text-gray-100 text-lg font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal"
            placeholder="Ne aramak istersin?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!query ? (
        // Default state - quick links
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Hizli Erisim
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2.5 group"
                  >
                    <div className={`p-3 rounded-xl ${link.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center py-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <SearchIcon size={28} className="text-[#007AFF]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Uygulamada Keşfe Çık</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Yukarıya yazarak sayfaları, işlemleri ve yardım makalelerini bulabilirsin.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pages */}
          {filteredPages.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Sayfalar ve Islemler
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {filteredPages.map((page, index) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.id}
                      onClick={() => navigate(page.path)}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                        index !== filteredPages.length - 1 ? "border-b border-gray-50 dark:border-gray-700" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#007AFF] shrink-0">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{page.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{page.desc}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAQs */}
          {filteredFAQs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Yardim & SSS
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index !== filteredFAQs.length - 1 ? "border-b border-gray-50 dark:border-gray-700" : ""
                    }`}
                  >
                    <div className="mt-0.5 text-[#007AFF] bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">{faq.question}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {hasNoResults && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-800 dark:text-gray-100 font-semibold text-lg">
                "{searchQuery}" bulunamadı
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                Yazım hatası yapmış olabilir misin? Farklı bir kelimeyle tekrar dene.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
