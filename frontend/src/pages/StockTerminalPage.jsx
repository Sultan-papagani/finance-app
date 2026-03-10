import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity, TrendingUp, TrendingDown, BarChart2, PieChart as PieIcon, AlertCircle, RefreshCw, ArrowLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const StockTerminalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSymbol = searchParams.get('symbol') || '';

  const [searchTerm, setSearchTerm] = useState(initialSymbol);
  const [stockData, setStockData] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

// 1. ANA VERİ ÇEKME MOTORU (Zırhlı Versiyon 🛡️)
  const fetchStockData = async (symbolToFetch) => {
    if (!symbolToFetch.trim()) return;
    setLoading(true);
    setError('');
    setStockData(null);
    setShowSuggestions(false);
    setSearchParams({ symbol: symbolToFetch.toUpperCase() });

    try {
      const res = await fetch(`http://localhost:3000/api/stock/${symbolToFetch}`);
      
      // 🔥 KRİTİK KONTROL: Backend bize HTML sayfası mı fırlattı?
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend'e ulaşılamıyor veya sunucu kapalı! (Lütfen node server.js'i yeniden başlatın)");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Veri çekilemedi.');
      
      setStockData(data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. CANLI ARAMA MOTORU (
  useEffect(() => {
    if (!searchTerm.trim() || !showSuggestions) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:3000/api/search/${searchTerm}`);
        
        //   Gelen arama sonucu HTML ise çökmeyi engelle!
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setSearchResults(data);
        } else {
          console.error("Arama API'si çöktü, HTML döndürdü. Backend'i kontrol et!");
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Arama başarısız:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, showSuggestions]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStockData(searchTerm);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const PriceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-700">
          <p className="text-sm font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-black text-white">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  // EKRANDA VERİ YOKSA ARAMA ÇUBUĞUNU ORTALA, VARSA YUKARI AL
  const isCenterMode = !stockData && !loading;

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto w-full min-h-screen flex flex-col transition-all duration-500 bg-[#FAFAFA]">
      
      {/* ÜST BAR (SADECE BAŞLIK VE GERİ BUTONU) */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/finance')} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 p-3 rounded-2xl transition-colors shadow-sm" title="Geri Dön">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-[#04009A] tracking-tight flex items-center gap-3">
          <Activity size={32} className="text-[#007AFF] shrink-0" /> Hisse Terminali
        </h1>
      </div>

      {/*  DEVASA ARAMA MOTORU (Merkezde veya Yukarıda) */}
      <div className={`w-full max-w-3xl mx-auto transition-all duration-700 ease-in-out z-50 ${isCenterMode ? 'mt-24 md:mt-40 scale-100' : 'mt-0 scale-95 md:scale-100 mb-10'}`}>
        
        {isCenterMode && (
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tight mb-4">Piyasayı Keşfet</h2>
            <p className="text-gray-500 font-medium text-lg">Hisse senedi sembolü veya şirket adı yazarak canlı analizlere ulaşın.</p>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="relative w-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem]" ref={dropdownRef}>
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search size={28} className="text-[#007AFF]" />
          </div>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={handleInputChange} 
            onFocus={() => { if(searchTerm) setShowSuggestions(true); }}
            placeholder="Örn: APPLE, TSLA, THYAO..." 
            className="w-full pl-16 pr-40 py-5 md:py-6 bg-white border-2 border-transparent rounded-[2rem] focus:outline-none focus:border-[#007AFF]/30 text-xl md:text-2xl font-black text-gray-800 uppercase transition-all" 
          />
          
          <button type="submit" disabled={loading} className="absolute right-3 top-3 bottom-3 bg-[#04009A] hover:bg-[#007AFF] text-white px-8 rounded-xl font-black transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="animate-spin" size={24} /> : 'Ara'}
          </button>

          {/*  ARAMA SONUÇLARI AÇILIR MENÜSÜ */}
          {showSuggestions && searchTerm.trim().length > 0 && (
            <ul className="absolute top-[110%] left-0 right-0 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] max-h-96 overflow-y-auto z-50 overflow-hidden divide-y divide-gray-50/50">
              {isSearching ? (
                <li className="px-6 py-8 text-center text-gray-500 font-bold flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin text-[#007AFF]" size={28} /> Dünyadaki tüm borsalar taranıyor...
                </li>
              ) : searchResults.length > 0 ? (
                searchResults.map((stock, i) => (
                  <li 
                    key={`${stock.symbol}-${i}`}
                    onClick={() => { setSearchTerm(stock.symbol); fetchStockData(stock.symbol); }}
                    className="px-6 py-4 md:py-5 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xl text-[#04009A] font-black group-hover:text-[#007AFF] transition-colors">{stock.symbol}</div>
                      <div className="text-sm font-bold text-gray-400 truncate w-56 md:w-96">{stock.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-black tracking-wider">{stock.exchange}</span>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#007AFF] group-hover:translate-x-1.5 transition-all" />
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-6 py-8 text-center text-gray-500 font-bold text-lg">Hiçbir sonuç bulunamadı.</li>
              )}
            </ul>
          )}
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in max-w-3xl mx-auto w-full">
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <p className="text-red-700 font-bold text-lg">{error}</p>
        </div>
      )}

      {/*  DOLU EKRAN (GRAFİKLER) */}
      {stockData && stockData.chartData && stockData.chartData.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
          
          <div className="bg-gradient-to-r from-[#04009A] to-[#007AFF] rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
             <div className="z-10">
               <div className="text-blue-200 font-black uppercase tracking-widest text-sm mb-2 opacity-80">{stockData.info.exchange}</div>
               <h2 className="text-5xl md:text-6xl font-black flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 tracking-tight">
                 {stockData.info.symbol} <span className="text-2xl font-semibold opacity-70 truncate max-w-[300px] md:max-w-xl">{stockData.info.name}</span>
               </h2>
             </div>
             <div className="z-10 bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20 text-left md:text-right min-w-[200px]">
               <div className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1 opacity-80">Anlık Fiyat</div>
               <div className="text-4xl md:text-5xl font-black">${parseFloat(stockData.info.close).toFixed(2)}</div>
               <div className={`flex items-center gap-1.5 font-black mt-2 text-base ${parseFloat(stockData.info.change) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                 {parseFloat(stockData.info.change) >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                 {parseFloat(stockData.info.change) > 0 ? '+' : ''}{parseFloat(stockData.info.change).toFixed(2)} ({parseFloat(stockData.info.percent_change).toFixed(2)}%)
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-xl font-black text-[#04009A] mb-8 flex items-center gap-3"><BarChart2 className="text-[#007AFF]" size={24} /> Fiyat Geçmişi (Son 30 İş Günü)</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stockData.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stockColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} minTickGap={20} />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip content={<PriceTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="price" stroke="#007AFF" strokeWidth={4} fillOpacity={1} fill="url(#stockColor)" activeDot={{ r: 8, fill: "#04009A", stroke: "#white", strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center">
                <h3 className="text-xl font-black text-[#04009A] mb-4 w-full flex items-center gap-3"><Activity className="text-[#007AFF]" size={24} /> İşlem Hacmi</h3>
                <div className="h-[140px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockData.chartData}>
                      <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ backgroundColor: '#111827', borderRadius: '16px', border: 'none', color: '#fff' }} formatter={(v) => [`${v.toFixed(2)}M`, 'Hacim']} labelStyle={{ display: 'none' }} />
                      <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                        {stockData.chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.isPositive ? '#34D399' : '#F87171'} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center">
                <h3 className="text-xl font-black text-[#04009A] mb-4 w-full flex items-center gap-3"><PieIcon className="text-[#007AFF]" size={24} /> Momentum</h3>
                <div className="h-[140px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stockData.momentumData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                        {stockData.momentumData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 'bold', paddingLeft: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTerminalPage;