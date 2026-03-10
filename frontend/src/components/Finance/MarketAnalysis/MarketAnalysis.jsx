import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRightLeft, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MarketAnalysis = () => {
  const navigate = useNavigate(); 

  const [amount, setAmount] = useState(1);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('TRY');
  const [chartData, setChartData] = useState([]);
  const [currentRate, setCurrentRate] = useState(0);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  // Dünyadaki tüm majör para birimleri
  const currencies = [
    'TRY', 'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD',
    'BGN', 'BRL', 'CNY', 'CZK', 'DKK', 'HKD', 'HUF', 'IDR', 
    'ILS', 'INR', 'ISK', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 
    'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'ZAR'
  ];

  useEffect(() => {
    // İki birim aynıysa API'yi yormuyoruz
    if (baseCurrency === targetCurrency) {
      setChartData([]);
      setCurrentRate(1);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/historical-rates?base=${baseCurrency}&symbol=${targetCurrency}&days=${days}`);
        const data = await res.json();

        if (data && data.length > 0) {
          setChartData(data);
          setCurrentRate(data[data.length - 1].rate);
        }
      } catch (err) {
        console.error("Grafik verisi çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [baseCurrency, targetCurrency, days]);

  // Takla Atma Fonksiyonu
  const handleSwap = () => {
    const tempBase = baseCurrency;
    setBaseCurrency(targetCurrency);
    setTargetCurrency(tempBase);
  };

  // Özel Tooltip (Grafik Üzerindeki Kutu)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <p className="text-sm font-bold text-[#007AFF]">
            {payload[0].value.toFixed(4)} {targetCurrency}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* BAŞLIK */}
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-xl">
          <TrendingUp className="text-[#007AFF]" size={24} />
        </div>
        <h2 className="text-2xl font-black text-[#04009A] uppercase tracking-wide">
          Piyasa Analizi
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* SOL TARAF: DÖVİZ ÇEVİRİCİ */}
          <div className="lg:col-span-1 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Döviz Çevirici</h3>
            
            <div className="space-y-4 relative">
              {/* Kaynak Kur */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group">
                <div className="flex justify-between items-center">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent text-2xl font-black text-gray-800 w-full outline-none"
                    min="0"
                  />
                  <select 
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 font-bold py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:bg-gray-50 scrollbar-hide"
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Takla Butonu */}
              <button 
                onClick={handleSwap}
                className="absolute left-1/2 -translate-x-1/2 top-[55%] -translate-y-1/2 bg-white p-2.5 rounded-full shadow-md border border-gray-200 z-10 hover:bg-gray-100 hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none"
              >
                <ArrowRightLeft size={16} className="text-[#007AFF] rotate-90" />
              </button>

              {/* Hedef Kur */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-black text-[#007AFF] truncate pr-4">
                    {(amount * currentRate).toFixed(4)}
                  </div>
                  <select 
                    value={targetCurrency}
                    onChange={(e) => setTargetCurrency(e.target.value)}
                    className="bg-blue-100 text-[#007AFF] font-bold py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:bg-blue-200 scrollbar-hide"
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ TARAF: GRAFİK ALANI */}
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  1 {baseCurrency} eşittir
                </p>
                <h4 className="text-4xl font-black text-gray-800 flex items-baseline gap-2">
                  {currentRate.toFixed(4)} <span className="text-xl text-gray-400 font-bold">{targetCurrency}</span>
                </h4>
              </div>

              <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                {[
                  { label: '1A', val: 30 },
                  { label: '6A', val: 180 },
                  { label: '1Y', val: 365 }
                ].map((btn) => (
                  <button
                    key={btn.val}
                    onClick={() => setDays(btn.val)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      days === btn.val 
                        ? 'bg-white text-[#007AFF] shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[280px] w-full relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <span className="text-sm font-bold text-[#007AFF] animate-pulse">Grafik Çiziliyor...</span>
                </div>
              ) : null}
              
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return `${date.getDate()} ${date.toLocaleString('tr-TR', { month: 'short' })}`;
                    }}
                    minTickGap={30}
                  />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#007AFF" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#007AFF", stroke: "#white", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

  
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button 

            onClick={() => navigate(`/detail?base=${baseCurrency}&target=${targetCurrency}`)}
            className="w-full bg-blue-50 hover:bg-blue-100 text-[#007AFF] font-black py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group border border-blue-100 hover:border-blue-200"
          >
            <span>Detaylı Analizi Gör</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default MarketAnalysis;