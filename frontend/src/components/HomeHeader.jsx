import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, Euro, PoundSterling, JapaneseYen, Banknote, Coins } from 'lucide-react';

const HomeHeader = () => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY,USD,GBP,CHF,JPY,AUD,CAD");
        const data = await response.json();

        if (data && data.rates) {
          const eurTry = data.rates.TRY;
          const usdTry = data.rates.TRY / data.rates.USD;
          const gbpTry = data.rates.TRY / data.rates.GBP;
          const chfTry = data.rates.TRY / data.rates.CHF;
          const jpyTry = data.rates.TRY / data.rates.JPY; 
          const audTry = data.rates.TRY / data.rates.AUD;
          const cadTry = data.rates.TRY / data.rates.CAD;

          setRates({
            EUR: eurTry.toFixed(2),
            USD: usdTry.toFixed(2),
            GBP: gbpTry.toFixed(2),
            CHF: chfTry.toFixed(2),
            JPY: jpyTry.toFixed(2), 
            AUD: audTry.toFixed(2),
            CAD: cadTry.toFixed(2)
          });
        }
      } catch (error) {
        console.error("Kur verileri çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes marquee-perfect {
            0% { left: 100%; transform: translateX(0%); }
            100% { left: 0%; transform: translateX(-100%); }
          }
          .animate-marquee-perfect {
            position: absolute;
            display: flex;
            align-items: center;
            white-space: nowrap;
            animation: marquee-perfect 25s linear infinite;
          }
          .animate-marquee-perfect:hover {
            animation-play-state: paused;
          }
        `}
      </style>


      <header className="w-full bg-white border-b border-gray-100 shadow-sm px-10 py-4 hidden md:flex justify-between items-center sticky top-0 z-10">
        
        {/* SOL TARAF BOŞLUK */}
        <div className="flex-1"></div>

        {/* SAĞ ÜST GRUP: Borsa verileri ve Logo */}
        <div className="flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer shrink-0">
          
          {/*  BORSA LİSTESİ */}
          <div className="relative overflow-hidden h-6 border-r border-gray-100 pr-6 w-[400px] lg:w-[500px]">
            {loading ? (
              <span className="text-[10px] font-bold text-gray-400 animate-pulse uppercase tracking-widest absolute left-0 flex items-center h-full">
                Veriler Yükleniyor...
              </span>
            ) : rates ? (
              <div className="animate-marquee-perfect cursor-default gap-8 h-full">
                
                <div className="flex items-center gap-1.5">
                  <div className="bg-green-100 p-1 rounded-full"><DollarSign size={12} className="text-green-600" /></div>
                  <span className="text-[10px] font-black text-gray-700">USD/TRY</span>
                  <span className="text-xs font-bold text-[#007AFF]">{rates.USD} ₺</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="bg-blue-100 p-1 rounded-full"><Euro size={12} className="text-blue-600" /></div>
                  <span className="text-[10px] font-black text-gray-700">EUR/TRY</span>
                  <span className="text-xs font-bold text-[#007AFF]">{rates.EUR} ₺</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="bg-purple-100 p-1 rounded-full"><PoundSterling size={12} className="text-purple-600" /></div>
                  <span className="text-[10px] font-black text-gray-700">GBP/TRY</span>
                  <span className="text-xs font-bold text-[#007AFF]">{rates.GBP} ₺</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="bg-red-100 p-1 rounded-full"><Banknote size={12} className="text-red-600" /></div>
                  <span className="text-[10px] font-black text-gray-700">CHF/TRY</span>
                  <span className="text-xs font-bold text-[#007AFF]">{rates.CHF} ₺</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="bg-orange-100 p-1 rounded-full"><JapaneseYen size={12} className="text-orange-600" /></div>
                  <span className="text-[10px] font-black text-gray-700">JPY/TRY</span>
                  <span className="text-xs font-bold text-[#007AFF]">{rates.JPY} ₺</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="bg-teal-100 p-1 rounded-full"><Coins size={12} className="text-teal-600" /></div>
                  <span className="text-[10px] font-black text-gray-700">AUD/TRY</span>
                  <span className="text-xs font-bold text-[#007AFF]">{rates.AUD} ₺</span>
                </div>

                <div className="flex items-center gap-1.5 pr-8">
                  <div className="bg-emerald-100 p-1 rounded-full"><DollarSign size={12} className="text-emerald-600" /></div>
                  <span className="text-[10px] font-black text-gray-700">CAD/TRY</span>
                  <span className="text-xs font-bold text-[#007AFF]">{rates.CAD} ₺</span>
                </div>

              </div>
            ) : (
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest absolute left-0 flex items-center h-full">
                Bağlantı Hatası
              </span>
            )}
          </div>

          {/*  LOGO GRUBU */}
          <div className="flex items-center gap-2 shrink-0 group">
            <h1 className="text-sm font-black uppercase tracking-widest text-[#04009A]">
              FINANCE APP
            </h1>
            <Wallet size={18} className="text-[#04009A]" strokeWidth={2.5} />
          </div>

        </div>
        
      </header>
    </>
  );
};

export default HomeHeader;