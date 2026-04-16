import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity, TrendingUp, TrendingDown, BarChart2, PieChart as PieIcon, AlertCircle, RefreshCw, ArrowLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

//  DÜNYANIN EN BÜYÜK 10 BORSASI 
const MARKETS = [
  { id: 'ALL', label: 'Tüm Piyasalar', icon: '🌍', suffix: '', currency: '$' },
  { id: 'US', label: 'ABD (NYSE/NASDAQ)', icon: '🇺🇸', suffix: '', currency: '$', placeholder: 'Örn: AAPL, TSLA, NVDA' },
  { id: 'BIST', label: 'Türkiye (BIST)', icon: '🇹🇷', suffix: '.IS', currency: '₺', placeholder: 'Örn: THYAO, SASA, TUPRS' },
  { id: 'LSE', label: 'İngiltere (Londra)', icon: '🇬🇧', suffix: '.L', currency: '£', placeholder: 'Örn: HSBA.L, BP.L' },
  { id: 'XETRA', label: 'Almanya (Frankfurt)', icon: '🇩🇪', suffix: '.DE', currency: '€', placeholder: 'Örn: VOW3.DE, BMW.DE' },
  { id: 'EPA', label: 'Fransa (Paris)', icon: '🇫🇷', suffix: '.PA', currency: '€', placeholder: 'Örn: OR.PA, MC.PA' },
  { id: 'TSE', label: 'Japonya (Tokyo)', icon: '🇯🇵', suffix: '.T', currency: '¥', placeholder: 'Örn: 7203.T (Toyota)' },
  { id: 'HKG', label: 'Çin (Hong Kong)', icon: '🇭🇰', suffix: '.HK', currency: 'HK$', placeholder: 'Örn: 0700.HK (Tencent)' },
  { id: 'TSX', label: 'Kanada (Toronto)', icon: '🇨🇦', suffix: '.TO', currency: 'C$', placeholder: 'Örn: RY.TO, TD.TO' },
  { id: 'ASX', label: 'Avustralya (Sidney)', icon: '🇦🇺', suffix: '.AX', currency: 'A$', placeholder: 'Örn: BHP.AX, CBA.AX' },
  { id: 'NSE', label: 'Hindistan (NSE)', icon: '🇮🇳', suffix: '.NS', currency: '₹', placeholder: 'Örn: RELIANCE.NS' }
];

const StockTerminalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSymbol = searchParams.get('symbol') || '';

  const [searchTerm, setSearchTerm] = useState(initialSymbol);
  const [stockData, setStockData] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [exchangeFilter, setExchangeFilter] = useState('ALL'); 
  const [showExchangeMenu, setShowExchangeMenu] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const dropdownRef = useRef(null);
  const filterRef = useRef(null);

  const activeMarket = MARKETS.find(m => m.id === exchangeFilter) || MARKETS[0];

  const fetchStockData = async (symbolToFetch) => {
    if (!symbolToFetch || !symbolToFetch.trim()) return;
    setLoading(true); setError(''); setStockData(null); setShowSuggestions(false);
    setSearchParams({ symbol: symbolToFetch.toUpperCase() });

    try {
      const res = await fetch(`http://localhost:3000/api/stock/${symbolToFetch}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) throw new Error("Sunucu çöktü, lütfen node server.js'i yeniden başlatın.");
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Veri çekilemedi.');
      setStockData(data); 
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { if (initialSymbol) fetchStockData(initialSymbol); }, [initialSymbol]);

  useEffect(() => {
    if (!searchTerm || !searchTerm.trim() || !showSuggestions) { setSearchResults([]); return; }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:3000/api/search/${searchTerm}`);
        if (res.headers.get("content-type")?.includes("application/json")) {
          const data = await res.json();
          let filteredData = Array.isArray(data) ? data : [];
          
          if (exchangeFilter !== 'ALL') {
            if (exchangeFilter === 'US') {
              filteredData = filteredData.filter(q => q?.symbol && !q.symbol.includes('.'));
            } else {
              filteredData = filteredData.filter(q => q?.symbol && q.symbol.endsWith(activeMarket.suffix));
            }
          }
          setSearchResults(filteredData);
        } else setSearchResults([]);
      } catch (err) { console.error("Arama başarısız:", err); } finally { setIsSearching(false); }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, showSuggestions, exchangeFilter, activeMarket.suffix]);


  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let finalSymbol = searchTerm?.toUpperCase()?.trim() || '';
    if (exchangeFilter !== 'ALL' && exchangeFilter !== 'US' && !finalSymbol.endsWith(activeMarket.suffix)) {
      finalSymbol += activeMarket.suffix; 
    }
    fetchStockData(finalSymbol);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowSuggestions(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowExchangeMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMarketUIBySymbol = (symbol) => {
    if (!symbol) return { icon: '🌍', currency: '$' };
    const market = MARKETS.find(m => m.id !== 'ALL' && m.id !== 'US' && symbol.endsWith(m.suffix));
    return market ? { icon: market.icon, currency: market.currency } : { icon: '🇺🇸', currency: '$' };
  };

  const currentUI = stockData?.info?.symbol ? getMarketUIBySymbol(stockData.info.symbol) : { icon: '🌍', currency: '$' };
  const isCenterMode = !stockData && !loading;

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto w-full min-h-screen flex flex-col transition-all duration-500 bg-[#FAFAFA] dark:bg-gray-950">
      
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/finance')} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-2xl shadow-sm dark:shadow-lg dark:text-white"><ArrowLeft size={20} /></button>
        <h1 className="text-3xl md:text-4xl font-black text-blue-700 dark:text-blue-400 flex items-center gap-3"><Activity size={32} className="text-[#007AFF] dark:text-blue-400"/> Hisse Terminali</h1>
      </div>

      <div className={`w-full max-w-4xl mx-auto transition-all duration-700 ease-in-out z-50 ${isCenterMode ? 'mt-24 scale-100' : 'mt-0 scale-100 mb-10'}`}>
        
        {isCenterMode && (
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white tracking-tight mb-4">Piyasayı Keşfet</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">10 farklı global borsada hisse senedi araması yapın.</p>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="relative w-full shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2rem] bg-white dark:bg-gray-900 flex flex-col md:flex-row items-center border border-gray-100 dark:border-gray-800" ref={dropdownRef}>
          
          <div className="relative w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800" ref={filterRef}>
            <button type="button" onClick={() => setShowExchangeMenu(!showExchangeMenu)} className="flex items-center justify-between w-full gap-3 px-6 py-4 md:py-6 text-gray-700 dark:text-white font-black hover:text-[#007AFF] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-[2rem] md:rounded-t-none md:rounded-l-[2rem] min-w-[220px]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeMarket?.icon}</span>
                <span>{activeMarket?.label?.split(' ')[0]}</span>
              </div>
              <ChevronDown size={18} className={`transition-transform duration-300 ${showExchangeMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExchangeMenu && (
              <div className="absolute top-full left-0 mt-2 w-full md:w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl z-[60] py-2 max-h-72 overflow-y-auto animate-in slide-in-from-top-2">
                {MARKETS.map(market => (
                  <button key={market.id} type="button" onClick={() => { setExchangeFilter(market.id); setShowExchangeMenu(false); setShowSuggestions(true); }} className="w-full text-left px-5 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 font-bold text-gray-700 dark:text-white flex items-center gap-3">
                    <span className="text-xl">{market.icon}</span> {market.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={24} className="text-[#007AFF]/50 dark:text-blue-400/50" /></div>
            <input type="text" value={searchTerm} onChange={handleInputChange} onFocus={() => { if(searchTerm) setShowSuggestions(true); }} placeholder={activeMarket?.placeholder || "Hisse senedi sembolü yazın..."} className="w-full pl-12 pr-6 py-5 md:py-6 bg-transparent dark:bg-transparent focus:outline-none text-xl md:text-2xl font-black text-gray-800 dark:text-white uppercase" />
          </div>
          
          <div className="p-2 w-full md:w-auto">
            <button type="submit" disabled={loading} className="w-full md:w-auto bg-blue-700 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white px-8 py-4 md:py-4 rounded-xl font-black transition-colors shadow-md dark:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={24} /> : 'Ara'}
            </button>
          </div>

          {showSuggestions && searchTerm?.trim().length > 0 && (
            <ul className="absolute top-[110%] left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] max-h-96 overflow-y-auto z-50 divide-y divide-gray-50 dark:divide-gray-800">
              {isSearching ? (
                <li className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 font-bold flex flex-col items-center gap-3"><RefreshCw className="animate-spin text-[#007AFF] dark:text-blue-400" size={28} /> {activeMarket?.label} taranıyor...</li>
              ) : searchResults?.length > 0 ? (
                searchResults.map((stock, i) => {
                  const ui = getMarketUIBySymbol(stock?.symbol);
                  return (
                    <li key={`${stock?.symbol}-${i}`} onClick={() => { setSearchTerm(stock?.symbol); fetchStockData(stock?.symbol); }} className="px-6 py-4 md:py-5 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 cursor-pointer flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl w-12 h-12 items-center justify-center text-2xl shadow-sm">{ui.icon}</div>
                        <div><div className="text-xl text-blue-700 dark:text-blue-400 font-black group-hover:text-[#007AFF] dark:group-hover:text-blue-300">{stock?.symbol}</div><div className="text-sm font-bold text-gray-400 dark:text-gray-500 truncate w-40 md:w-96">{stock?.name}</div></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg font-black">{stock?.exchange}</span>
                        <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-[#007AFF] dark:group-hover:text-blue-400" />
                      </div>
                    </li>
                  )
                })
              ) : (
                <li className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 font-bold text-lg">Sonuç bulunamadı.</li>
              )}
            </ul>
          )}
        </form>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5 rounded-2xl flex items-center justify-center gap-3 max-w-4xl mx-auto w-full">
          <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={24} /><p className="text-red-700 dark:text-red-400 font-bold text-lg">{error}</p>
        </div>
      )}

      {stockData && stockData.chartData && stockData.chartData.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
          <div className="bg-gradient-to-r from-[#04009A] dark:from-blue-900 to-[#007AFF] dark:to-blue-700 rounded-[2.5rem] p-8 md:p-10 shadow-2xl dark:shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
             <div className="z-10 flex items-center gap-4">
               <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner text-4xl">{currentUI?.icon}</div>
               <div>
                 <div className="text-blue-200 font-black uppercase tracking-widest text-sm mb-1 opacity-80">{stockData?.info?.exchange || 'Borsa'}</div>
                 <h2 className="text-5xl md:text-6xl font-black flex items-center gap-4">{stockData?.info?.symbol} <span className="text-2xl font-semibold opacity-70 truncate max-w-[200px] md:max-w-xl">{stockData?.info?.name}</span></h2>
               </div>
             </div>
             <div className="z-10 bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20 text-left md:text-right min-w-[200px]">
               <div className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1 opacity-80">Anlık Fiyat</div>
               <div className="text-4xl md:text-5xl font-black">{currentUI?.currency}{parseFloat(stockData?.info?.close || 0).toFixed(2)}</div>
               <div className={`flex items-center gap-1.5 font-black mt-2 text-base ${parseFloat(stockData?.info?.change || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                 {parseFloat(stockData?.info?.change || 0) >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                 {parseFloat(stockData?.info?.change || 0) > 0 ? '+' : ''}{parseFloat(stockData?.info?.change || 0).toFixed(2)} ({parseFloat(stockData?.info?.percent_change || 0).toFixed(2)}%)
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-black text-blue-700 dark:text-blue-400 mb-8 flex items-center gap-3"><BarChart2 className="text-[#007AFF] dark:text-blue-400" size={24} /> Fiyat Geçmişi</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stockData.chartData}>
                    <defs><linearGradient id="stockColor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/><stop offset="95%" stopColor="#007AFF" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} minTickGap={20} />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="price" stroke="#007AFF" strokeWidth={4} fillOpacity={1} fill="url(#stockColor)" activeDot={{ r: 8, fill: "#04009A", stroke: "#white", strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                <h3 className="text-xl font-black text-blue-700 dark:text-blue-400 mb-4 w-full flex items-center gap-3"><Activity className="text-[#007AFF] dark:text-blue-400" size={24} /> İşlem Hacmi</h3>
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

              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                <h3 className="text-xl font-black text-blue-700 dark:text-blue-400 mb-4 w-full flex items-center gap-3"><PieIcon className="text-[#007AFF] dark:text-blue-400" size={24} /> Momentum</h3>
                <div className="h-[140px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stockData.momentumData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                        {stockData.momentumData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
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