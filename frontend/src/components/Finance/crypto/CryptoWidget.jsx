import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, ChevronRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../../services/api';

const CryptoWidget = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopCryptos = async () => {
      try {
        const data = await apiGet('/api/crypto/widget');
        setCryptos(data);
      } catch (err) {
        console.error("Backend Hatası:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCryptos();
    const interval = setInterval(fetchTopCryptos, 60000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[3rem] p-10 flex flex-col items-center justify-center h-[380px] shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 rounded-full animate-pulse"></div>
          <Loader2 className="animate-spin text-blue-700 dark:text-blue-400 relative z-10" size={56} />
        </div>
        <p className="mt-6 text-gray-400 dark:text-gray-500 font-bold tracking-[0.2em] uppercase text-sm animate-pulse">Piyasa Okunuyor...</p>
      </div>
    );
  }

  if (error || cryptos.length === 0) return null;

  return (
    <div className="w-full space-y-8">
 
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between px-4 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
            Trend Kriptolar
          </h2>
          <p className="text-gray-400 dark:text-gray-500 font-semibold mt-1">Piyasa değerine göre en büyük 4 varlık.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="hidden md:flex items-center gap-2 bg-green-50/80 border border-green-100 px-4 py-2.5 rounded-2xl shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-black text-green-700 tracking-widest uppercase">Canlı</span>
          </div>

          <button
            onClick={() => navigate('/crypto-terminal')}
            className="w-full md:w-auto bg-gray-900 dark:bg-gray-800 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            Terminali Keşfet
            <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
        {cryptos.map((coin) => {
          const isPositive = coin?.price_change_percentage_24h >= 0;
          const sparklineData = coin?.sparkline_in_7d?.price.map((p, i) => ({ index: i, val: p })) || [];
          const gradientId = `color-${coin.id}`; 

          return (
            <div
              key={coin.id}
              className="relative bg-white dark:bg-gray-900 rounded-[3rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-700 hover:-translate-y-4 group overflow-hidden flex flex-col h-[380px]"
            >
              <img 
                src={coin.image} 
                alt="bg-logo" 
                className="absolute -top-10 -right-10 w-64 h-64 opacity-[0.02] group-hover:opacity-[0.06] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 pointer-events-none grayscale group-hover:grayscale-0" 
              />

              <div className="flex justify-between items-start z-10 relative">
                <div className="relative">
                  <div className={`absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <img 
                    src={coin.image} 
                    alt={coin.name} 
                    className="w-20 h-20 rounded-full shadow-md relative z-10 group-hover:-translate-y-2 transition-transform duration-500 ease-out bg-white p-1" 
                  />
                </div>
                
                <div className={`px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-1.5 shadow-sm transition-transform duration-500 group-hover:scale-105 ${isPositive ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-700'}`}>
                  {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>

              <div className="mt-auto mb-10 z-10 relative">
                <h3 className="text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase text-sm mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  {coin.name} ({coin.symbol})
                </h3>

                <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-500">
                  ${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-[55%] opacity-40 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Area 
                      type="monotone" 
                      dataKey="val" 
                      stroke={isPositive ? '#10B981' : '#EF4444'} 
                      strokeWidth={4} 
                      fill={`url(#${gradientId})`} 
                      isAnimationActive={true} 
                      animationDuration={2000} 
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoWidget;