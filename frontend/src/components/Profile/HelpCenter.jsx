import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  ChevronDown,
  MapPin,
  Search,
  Wallet,
  Target,
  CreditCard,
  Shield,
  BarChart3,
  Users,
  Bell,
  Smartphone,
  TrendingUp,
} from "lucide-react";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const categories = [
    { id: "all", label: "Tumunu Gor", icon: HelpCircle },
    { id: "wallet", label: "Cuzdan", icon: Wallet },
    { id: "goals", label: "Hedefler", icon: Target },
    { id: "cards", label: "Kartlar", icon: CreditCard },
    { id: "security", label: "Guvenlik", icon: Shield },
    { id: "finance", label: "Finans", icon: BarChart3 },
    { id: "social", label: "Sosyal", icon: Users },
  ];

  const faqs = [
    {
      category: "wallet",
      question: "While Wallet nedir ve nasil calisir?",
      answer:
        "While Wallet, arkadaslarinizla veya ailenizle ortak finansal hedefler belirleyip birlikte para biriktirmenizi saglayan sosyal bir cuzdan uygulamasidir. Sanal bakiye ekleyebilir, islemlere etkilesim birakabilirsiniz.",
    },
    {
      category: "wallet",
      question: "Cuzdanima nasil para yuklerim?",
      answer:
        "Ana sayfadaki kartlarinizdan birine tiklayarak islem ekle butonunu kullanabilirsiniz. Gelir olarak secip miktari girdikten sonra bakiyeniz aninda guncellenir.",
    },
    {
      category: "wallet",
      question: "Kasam (Vault) nedir?",
      answer:
        "Kasa, kartlarinizdan bagimsiz ekstra birikiminizi sakladiginiz guvenli bir alandir. Kartlariniz arasinda transfer yaparak kasaniza para aktarabilirsiniz.",
    },
    {
      category: "goals",
      question: "Ortak hedeften nasil para cekebilirim?",
      answer:
        "Guvenlik geregi ortak hedeflerden sadece kendi eklediginiz tutar kadar cekim yapabilirsiniz. Baska bir katilimcinin havuza ekledigi bakiyeye mudahale edemezsiniz.",
    },
    {
      category: "goals",
      question: "Smart Math (Akilli Matematik) nedir?",
      answer:
        "Hedefinize kalan tutari ve sectiginiz bitis tarihini analiz ederek size 'Gunde/Ayda su kadar biriktirmelisin' seklinde dinamik butce tavsiyeleri veren akilli asistanimizdir.",
    },
    {
      category: "goals",
      question: "Bir hedefe nasil arkadas davet ederim?",
      answer:
        "Hedef detay sayfasindaki Paylasim Kodu olustur butonuna tiklayarak bir kod uretebilirsiniz. Arkadasiniz bu kodu kendi hesabinda girerek ortak birikime dahil olabilir.",
    },
    {
      category: "goals",
      question: "Hedef tamamlandiginda ne olur?",
      answer:
        "Hedef %100 tamamlandiginda kutlama animasyonu gosterilir. Bildirim ayarlariniz aciksa ayrica bildirim de alirsiniz. Hedefteki bakiyeyi istediginiz karta aktarabilirsiniz.",
    },
    {
      category: "cards",
      question: "Kac tane kart olusturabilirim?",
      answer:
        "Her kullanici en fazla 3 adet sanal kart olusturabilir. Her kartin kendi bakiyesi, rengi ve islem gecmisi vardir.",
    },
    {
      category: "cards",
      question: "Kart bakiyemi nasil gorebilirim?",
      answer:
        "Ana sayfadaki kart kaydirma alaninda tum kartlarinizi gorebilirsiniz. Herhangi bir karta tiklayarak detayli islem gecmisine ulasabilirsiniz.",
    },
    {
      category: "cards",
      question: "Kartlar arasi transfer yapabilir miyim?",
      answer:
        "Islem ekleme sayfasindan bir karttan diger karta veya kasaniza transfer yapabilirsiniz. Transfer islemleri aninda gerceklesir.",
    },
    {
      category: "security",
      question: "Sifremi nasil degistiririm?",
      answer:
        "Profil > Guvenlik ve Sifre bolumunden mevcut sifrenizi girerek yeni bir sifre belirleyebilirsiniz. Sifreniz sifrelenerek veritabaninda saklanir.",
    },
    {
      category: "security",
      question: "Iki Adimli Dogrulama (2FA) nedir?",
      answer:
        "2FA, hesabiniza giris yaparken sifrenize ek olarak bir dogrulama kodu istenmesidir. Bu, hesabinizin yetkisiz erisimlere karsi ekstra guvenlik katmani saglar.",
    },
    {
      category: "security",
      question: "Hesabim guvenli mi?",
      answer:
        "Evet. Sifreleriniz bcrypt ile hashlenir, tum API istekleri JWT token ile dogrulanir ve guvenlik basliklari (Helmet) aktiftir.",
    },
    {
      category: "finance",
      question: "Doviz kurlarini nereden takip edebilirim?",
      answer:
        "Finans sayfasindan canli doviz kurlarini gorebilirsiniz. EUR, USD, GBP ve diger para birimlerinin TRY karsisindaki degerlerini anlık olarak takip edebilirsiniz.",
    },
    {
      category: "finance",
      question: "Hisse senedi ve kripto para takibi var mi?",
      answer:
        "Evet! Finans sayfasindan borsa terminali ve kripto terminal sayfarina erisebilirsiniz. Hisse arayabilir, grafikleri inceleyebilir ve kripto para fiyatlarini takip edebilirsiniz.",
    },
    {
      category: "finance",
      question: "Altin fiyatlarini gorebilir miyim?",
      answer:
        "Evet, Finans sayfasindaki Altin Piyasalari bolumunden gram altin, ceyrek altin ve diger altin cesitlerinin guncel fiyatlarini takip edebilirsiniz.",
    },
    {
      category: "finance",
      question: "Varliklarimi nasil takip ederim?",
      answer:
        "Islem ekleme sayfasindan satin aldiginiz varliklari (hisse, kripto, altin vb.) sisteme kaydedebilirsiniz. Ana sayfadaki varlik bolumlunde tum portfoyunuzu gorebilirsiniz.",
    },
    {
      category: "social",
      question: "Arkadaslarimi nasil eklerim?",
      answer:
        "Hedef detay sayfasindan paylasim kodu olusturup arkadasiniza gonderebilirsiniz. Arkadasiniz bu kodu girerek ortak hedeflerinize katilabilir.",
    },
    {
      category: "social",
      question: "Islemlere begeni birakabilir miyim?",
      answer:
        "Evet! Ortak hedeflerdeki islem gecmisinde her isleme begeni (like) birakabilirsiniz. Bildirim ayarlariniz aciksa islemleriniz begenildiginde haberdar olursunuz.",
    },
    {
      category: "social",
      question: "Odeme planlayicisi nedir?",
      answer:
        "Duzenli odemelerinizi (kira, maas, fatura vb.) planlayabilir ve takip edebilirsiniz. Tekrarlanan ve tek seferlik odemeleri ayri ayri yonetebilirsiniz.",
    },
  ];

  // Filtreleme
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yardım Merkezi</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6 space-y-6">
        {/* Welcome card */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[24px] p-8 text-white shadow-md text-center">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm inline-block mb-4">
            <HelpCircle size={36} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Size nasil yardimci olabiliriz?
          </h2>
          <p className="text-teal-50 text-sm mt-2 font-medium max-w-md mx-auto">
            While Wallet hakkinda merak ettiginiz tum sorularin cevaplari asagida.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Soru ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-[#007AFF] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-[#007AFF] text-white shadow-md shadow-blue-500/20"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Contact channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="bg-white dark:bg-gray-800 p-5 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left">
            <div className="bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] p-3 rounded-2xl">
              <MessageCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Canlı Destek</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                Hafta içi 09:00 - 18:00
              </p>
            </div>
          </button>

          <button className="bg-white dark:bg-gray-800 p-5 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left">
            <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 p-3 rounded-2xl">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">E-posta Gönder</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                destek@whilewallet.com
              </p>
            </div>
          </button>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Sikca Sorulan Sorular
            </h2>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-lg">
              {filteredFaqs.length} soru
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center">
              <Search size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aramanizla eslesen soru bulunamadi.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Farkli bir kelimeyle tekrar deneyin.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span
                      className={`font-semibold text-sm md:text-base pr-4 ${
                        openFaq === index ? "text-[#007AFF]" : "text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`shrink-0 transition-transform duration-300 ${
                        openFaq === index ? "rotate-180 text-[#007AFF]" : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </button>

                  <div
                    className={`px-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-all duration-300 ease-in-out ${
                      openFaq === index
                        ? "max-h-40 pb-5 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Office address */}
        <div className="text-center pt-2 pb-6 flex flex-col items-center gap-1.5">
          <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            While Wallet HQ - Karabuk Universitesi Teknokent
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
