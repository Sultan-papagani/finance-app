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
} from "lucide-react";

// --- SAHTE VERİLER (MOCK DATA) ---

// 1. Uygulama İçi Menüler ve Sayfalar
const MOCK_PAGES = [
  {
    id: "p1",
    title: "Hedeflerim",
    path: "/my-goal",
    icon: Target,
    desc: "Ortak veya bireysel birikim hedeflerin",
  },
  {
    id: "p2",
    title: "Para Transferi / Ekle",
    path: "/add-transaction",
    icon: CreditCard,
    desc: "Yeni bir gelir veya gider kaydı oluştur",
  },
  {
    id: "p3",
    title: "Ayarlar",
    path: "/settings",
    icon: Settings,
    desc: "Profil, bildirim ve güvenlik ayarları",
  },
  {
    id: "p4",
    title: "İşlem Geçmişi",
    path: "/history",
    icon: History,
    desc: "Eski harcamalarını ve gelirlerini incele",
  },
  {
    id: "p5",
    title: "Finansal Özet",
    path: "/finance",
    icon: Wallet,
    desc: "Grafikler, analizler ve istatistikler",
  },
];

// 2. Platformdaki Kullanıcılar
const MOCK_USERS = [
  {
    id: "u1",
    username: "ali.yilmaz",
    name: "Ali Yılmaz",
    color: "bg-green-100 text-green-600",
  },
  {
    id: "u2",
    username: "zeynep.kaya",
    name: "Zeynep Kaya",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "u5",
    username: "ayberk.kaya",
    name: "Ayberk Kaya",
    color: "bg-blue-100 text-blue-600",
  },
];

// 3. YENİ: Kayıtlı İban ve Banka Hesapları
const MOCK_SAVED_ACCOUNTS = [
  {
    id: "acc1",
    name: "Ev Sahibi (Ahmet Bey)",
    bank: "Ziraat Bankası",
    iban: "TR12 0001 ... 99",
    color: "bg-red-100 text-red-600",
  },
  {
    id: "acc2",
    name: "Annem",
    bank: "Enpara",
    iban: "TR99 0004 ... 11",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "acc3",
    name: "Birikim Hesabım",
    bank: "Garanti BBVA",
    iban: "TR55 0006 ... 33",
    color: "bg-blue-100 text-blue-600",
  },
];

// 4. YENİ: Yardım ve SSS (Sıkça Sorulan Sorular)
const MOCK_FAQS = [
  {
    id: "faq1",
    question: "Aylık para gönderme limitim nedir?",
    answer: "Onaylı hesaplar için aylık FAST ve Havale limiti 500.000 ₺'dir.",
  },
  {
    id: "faq2",
    question: "Hesabımı nasıl onaylarım?",
    answer:
      "Profil > Kimlik Doğrulama adımından çipli kimliğinizi NFC ile okutarak saniyeler içinde onaylayabilirsiniz.",
  },
  {
    id: "faq3",
    question: "Kredi kartı ile cüzdana para yükleyebilir miyim?",
    answer:
      "Evet, Ayarlar > Ödeme Yöntemleri kısmından banka veya kredi kartınızı kaydedebilirsiniz.",
  },
  {
    id: "faq4",
    question: "IBAN'a transfer ne kadar sürer?",
    answer:
      "FAST sistemi ile 7/24 anında karşı hesaba geçer. Herhangi bir bekleme süresi yoktur.",
  },
];

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // --- FİLTRELEME İŞLEMLERİ ---
  const query = searchQuery.toLowerCase();

  const filteredPages = MOCK_PAGES.filter(
    (page) =>
      page.title.toLowerCase().includes(query) ||
      page.desc.toLowerCase().includes(query),
  );

  const filteredUsers = MOCK_USERS.filter(
    (user) =>
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query),
  );

  const filteredAccounts = MOCK_SAVED_ACCOUNTS.filter(
    (acc) =>
      acc.name.toLowerCase().includes(query) ||
      acc.bank.toLowerCase().includes(query) ||
      acc.iban.toLowerCase().includes(query),
  );

  const filteredFAQs = MOCK_FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query),
  );

  const hasNoResults =
    filteredPages.length === 0 &&
    filteredUsers.length === 0 &&
    filteredAccounts.length === 0 &&
    filteredFAQs.length === 0;

  return (
    <div className="max-w-3xl mx-auto w-full pb-24 md:pb-10 pt-6 px-4 md:px-8">
      {/* BAŞLIK VE ARAMA ÇUBUĞU */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Keşfet</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Menüler, kişiler, kayıtlı hesaplar ve yardım makaleleri arasında ara.
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
            className="w-full pl-12 pr-12 py-4 bg-white border-2 border-transparent focus:border-[#007AFF] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] focus:shadow-[0_4px_25px_rgba(0,122,255,0.15)] outline-none transition-all text-gray-800 text-lg font-medium placeholder:text-gray-400 placeholder:font-normal"
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

      {/* ARAMA SONUÇLARI */}
      {searchQuery.trim() === "" ? (
        // Arama yapılmadan önce görünen boş durum
        <div className="text-center py-10 animate-in fade-in duration-500">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon size={32} className="text-[#007AFF]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Uygulamada Keşfe Çık
          </h3>
          <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
            "Ev sahibi" yazarak IBAN bulabilir, "Limit" yazarak makaleleri
            okuyabilir veya arkadaşlarına ulaşabilirsin.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* 1. UYGULAMA İÇİ SAYFALAR */}
          {filteredPages.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Menüler ve İşlemler
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredPages.map((page, index) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.id}
                      onClick={() => navigate(page.path)}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${index !== filteredPages.length - 1 ? "border-b border-gray-50" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#007AFF] shrink-0">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {page.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {page.desc}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. KAYITLI İBAN VE HESAPLAR (YENİ) */}
          {filteredAccounts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Kayıtlı Hesaplar & IBAN
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredAccounts.map((acc, index) => (
                  <div
                    key={acc.id}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${index !== filteredAccounts.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${acc.color}`}
                      >
                        <Landmark size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {acc.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {acc.bank} • {acc.iban}
                        </p>
                      </div>
                    </div>
                    {/* Hızlı Para Gönder Butonu */}
                    <button
                      onClick={() =>
                        alert(
                          `${acc.name} kişisine para gönderme ekranı açılacak!`,
                        )
                      }
                      className="p-2.5 bg-blue-50 text-[#007AFF] hover:bg-[#007AFF] hover:text-white rounded-xl transition-colors shadow-sm"
                      title="Para Gönder"
                    >
                      <Send size={18} className="ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. KİŞİLER / ARKADAŞLAR */}
          {filteredUsers.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Kişiler
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${index !== filteredUsers.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.color}`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {user.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        alert(
                          `${user.name} kullanıcısına arkadaşlık isteği gönderildi!`,
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-[#007AFF] hover:text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <UserPlus size={16} /> Ekle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. YARDIM VE SSS (YENİ) */}
          {filteredFAQs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Yardım & SSS
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${index !== filteredFAQs.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <div className="mt-0.5 text-[#007AFF] bg-blue-50 p-2 rounded-lg">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {faq.question}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HİÇBİR SONUÇ BULUNAMAZSA */}
          {hasNoResults && (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-800 font-semibold text-lg">
                "{searchQuery}" bulunamadı
              </p>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Yazım hatası yapmış olabilir misin? Farklı bir kelimeyle tekrar
                dene.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
