import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Coins, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api'; 

const GoldWidget = () => {
  const [goldData, setGoldData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGoldPrices = async () => {
      try {
        const data = await apiGet('/api/gold'); 
        setGoldData(data);
      } catch (err) {
        console.error("Altın verisi çekilemedi:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGoldPrices();
    const interval = setInterval(fetchGoldPrices, 60000); 
    return () => clearInterval(interval);
  }, []);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % goldData.length);
    setTimeout(() => setIsAnimating(false), 500); 
  }, [goldData.length, isAnimating]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + goldData.length) % goldData.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [goldData.length, isAnimating]);

  // 🔥 GÜNCELLENMİŞ TIKLAMA MOTORU
  const handleCardClick = (index, coinId) => {
    if (isAnimating) return;
    
    // Eğer kart zaten ortadaysa, tıklandığında detay sayfasına git!
    if (index === currentIndex) {
      navigate(`/gold-market?id=${coinId}`);
      return;
    }

    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (loading && goldData.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-blue-50/30 rounded-3xl">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 className="animate-spin text-[#04009A] relative z-10" size={48} />
        </div>
        <p className="mt-6 text-[#04009A] font-black tracking-[0.2em] text-xs uppercase animate-pulse">
          Kapalıçarşı Verileri Bekleniyor...
        </p>
      </div>
    );
  }

  if (error || goldData.length === 0) return null;

  const getCardStyle = (index) => {
    const length = goldData.length;
    const prev = (currentIndex - 1 + length) % length;
    const next = (currentIndex + 1) % length;

    if (index === currentIndex) {
      return "left-1/2 -translate-x-1/2 scale-[1.15] z-30 opacity-100 shadow-[0_20px_60px_-15px_rgba(4,0,154,0.4)] border-[#04009A] bg-white cursor-pointer";
    } 
    if (index === prev) {
      return "left-[15%] md:left-[20%] -translate-x-1/2 scale-90 z-20 opacity-60 blur-[1px] border-gray-200 bg-gray-50/80 cursor-pointer hover:opacity-100 hover:blur-none hover:-translate-y-2";
    } 
    if (index === next) {
      return "left-[85%] md:left-[80%] -translate-x-1/2 scale-90 z-20 opacity-60 blur-[1px] border-gray-200 bg-gray-50/80 cursor-pointer hover:opacity-100 hover:blur-none hover:-translate-y-2";
    }
    
    return "left-1/2 -translate-x-1/2 scale-50 z-0 opacity-0 pointer-events-none";
  };

  return (
    <div className="w-full flex flex-col items-center py-10 overflow-hidden">
      
      <div className="w-full px-4 mb-10 flex justify-between items-end max-w-5xl">
        <div className="relative">
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3 relative z-10">
            Altın Piyasası <Sparkles className="text-yellow-500" size={28} />
          </h2>
          <p className="text-gray-400 font-semibold mt-1">Kapalıçarşı canlı kurlar ve fiziki makas oranları</p>
        </div>
      </div>

      <div className="relative w-full max-w-6xl flex items-center justify-center h-[460px] px-4">
        
        <button 
          onClick={handlePrev}
          className="absolute left-2 md:left-8 z-40 p-3 bg-white/80 backdrop-blur-md border border-gray-100 shadow-xl rounded-full text-[#04009A] hover:bg-[#04009A] hover:text-white transition-all duration-300 group"
        >
          <ChevronLeft size={28} className="transition-transform group-hover:-translate-x-1" />
        </button>

        <div className="relative w-full max-w-3xl h-full">
          {goldData.map((coin, index) => {
            const isCenter = index === currentIndex;

            return (
              <div 
                key={coin.id}
                onClick={() => handleCardClick(index, coin.id)} // 🔥 ARTIK COIN ID'Sİ DE GİDİYOR
                className={`absolute top-4 transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col items-center rounded-[2.5rem] p-6 md:p-8 w-[280px] md:w-[320px] border-2 ${getCardStyle(index)}`}
              >
                <h3 className={`text-xl md:text-2xl font-black mb-4 text-center transition-colors duration-500 ${isCenter ? 'text-[#04009A]' : 'text-gray-500'}`}>
                  {coin.name}
                </h3>

                <div className="relative mb-6">
                  <div className={`absolute inset-0 rounded-full border-4 border-yellow-400/30 border-dashed ${isCenter ? 'animate-[spin_10s_linear_infinite]' : ''} scale-125`}></div>
                  <div className={`absolute inset-0 rounded-full bg-yellow-400 blur-md transition-opacity duration-500 ${isCenter ? 'opacity-40' : 'opacity-0'}`}></div>
                  
                  <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 ${isCenter ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.2)]' : 'bg-gradient-to-br from-gray-200 to-gray-300 grayscale'}`}>
                    <Coins className={isCenter ? 'text-yellow-900/80' : 'text-gray-500'} size={40} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="w-full mb-6">
                  <div className={`flex justify-between items-center rounded-2xl p-3 border transition-colors duration-500 ${isCenter ? 'bg-gray-50 border-gray-100' : 'bg-transparent border-transparent'}`}>
                    <div className="text-left">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Alış</div>
                      <div className={`text-lg md:text-xl font-black transition-colors duration-500 ${isCenter ? 'text-gray-900' : 'text-gray-400'}`}>
                        ₺{coin.buy.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className={`h-8 w-px transition-colors duration-500 ${isCenter ? 'bg-gray-200' : 'bg-transparent'}`}></div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Satış</div>
                      <div className={`text-lg md:text-xl font-black transition-colors duration-500 ${isCenter ? 'text-[#10B981]' : 'text-gray-400'}`}>
                        ₺{coin.sell.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-xs font-bold mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl w-full transition-all duration-500 ${isCenter ? (coin.change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600') : 'bg-gray-100 text-gray-400 opacity-50'}`}>
                    {coin.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    Değişim: {coin.change > 0 ? '+' : ''}{coin.change}%
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    if (isCenter) navigate(`/gold-market?id=${coin.id}`);
                  }}
                  className={`w-full py-3 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    isCenter 
                    ? 'bg-[#04009A] text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1' 
                    : 'bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ opacity: isCenter ? 1 : 0, pointerEvents: isCenter ? 'auto' : 'none' }}
                >
                  Detayları İncele <ChevronRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleNext}
          className="absolute right-2 md:right-8 z-40 p-3 bg-white/80 backdrop-blur-md border border-gray-100 shadow-xl rounded-full text-[#04009A] hover:bg-[#04009A] hover:text-white transition-all duration-300 group"
        >
          <ChevronRight size={28} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

    </div>
  );
};

export default GoldWidget;