import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "While Wallet nedir ve nasıl çalışır?",
      answer:
        "While Wallet, arkadaşlarınızla veya ailenizle ortak finansal hedefler belirleyip birlikte para biriktirmenizi sağlayan 'sosyal' bir cüzdan uygulamasıdır. Sanal bakiye ekleyebilir, işlemlere etkileşim bırakabilirsiniz.",
    },
    {
      question: "Ortak hedeften nasıl para çekebilirim?",
      answer:
        "Güvenlik gereği ortak hedeflerden sadece 'kendi eklediğiniz' tutar kadar çekim yapabilirsiniz. Başka bir katılımcının havuza eklediği bakiyeye müdahale edemezsiniz.",
    },
    {
      question: "Smart Math (Akıllı Matematik) nedir?",
      answer:
        "Hedefinize kalan tutarı ve seçtiğiniz bitiş tarihini analiz ederek size 'Günde/Ayda şu kadar biriktirmelisin' şeklinde dinamik bütçe tavsiyeleri veren akıllı asistanımızdır.",
    },
    {
      question: "Bir hedefe nasıl arkadaş davet ederim?",
      answer:
        "Hedef detay sayfasındaki 'Arkadaş Ekle' butonuna tıklayarak arkadaşınızı ismen havuza dahil edebilir ve ortak birikime anında başlayabilirsiniz.",
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Yardım Merkezi</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6 space-y-6">
        {/* Karşılama Kartı */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[24px] p-8 text-white shadow-md text-center">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm inline-block mb-4">
            <HelpCircle size={36} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Size nasıl yardımcı olabiliriz?
          </h2>
          <p className="text-teal-50 text-sm mt-2 font-medium max-w-md mx-auto">
            While Wallet hakkında merak ettiğiniz tüm soruların cevapları
            aşağıda yer almaktadır.
          </p>
        </div>

        {/* --- İLETİŞİM KANALLARI --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left">
            <div className="bg-blue-50 text-[#007AFF] p-3 rounded-2xl">
              <MessageCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Canlı Destek</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Hafta içi 09:00 - 18:00
              </p>
            </div>
          </button>

          <button className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-left">
            <div className="bg-orange-50 text-orange-500 p-3 rounded-2xl">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">E-posta Gönder</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                destek@whilewallet.com
              </p>
            </div>
          </button>
        </div>

        {/* --- SIKÇA SORULAN SORULAR (FAQ) --- */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {faqs.map((faq, index) => (
              <div key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`font-semibold text-sm md:text-base pr-4 ${openFaq === index ? "text-[#007AFF]" : "text-gray-800"}`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`shrink-0 transition-transform duration-300 ${openFaq === index ? "rotate-180 text-[#007AFF]" : "text-gray-400"}`}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                {/* Akordiyon Cevap Alanı (Açılır/Kapanır) */}
                <div
                  className={`px-5 text-sm text-gray-500 leading-relaxed transition-all duration-300 ease-in-out ${
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
        </div>

        {/* Ofis Adresi */}
        <div className="text-center pt-2 pb-6 flex flex-col items-center gap-1.5">
          <MapPin size={16} className="text-gray-400" />
          <p className="text-xs font-medium text-gray-400">
            While Wallet HQ • Karabük Üniversitesi Teknokent
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
