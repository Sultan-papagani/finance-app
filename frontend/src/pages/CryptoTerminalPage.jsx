import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity, ArrowLeft, RefreshCw, ChevronRight, BarChart2, Info, TrendingUp, TrendingDown, Globe, Wallet, Gauge, PenTool, LineChart, BookOpen, Save, Maximize, List, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { apiGet, apiPatch } from '../services/api';

const CryptoTerminalPage = () => {
  const navigate = useNavigate();

  // Arama ve Detay State'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [activeCoinId, setActiveCoinId] = useState('bitcoin'); 
  const [coinData, setCoinData] = useState(null);
  const [chartData, setChartData] = useState([]); 
  const [timeRange, setTimeRange] = useState('1'); 
  const [loading, setLoading] = useState(true);

  // Fonksiyonel State'ler
  const [currency, setCurrency] = useState('USD'); 
  const [usdToTryRate, setUsdToTryRate] = useState(null);
  const [holdings, setHoldings] = useState(''); 
  const [fearGreed, setFearGreed] = useState(null);

  const [isProChart, setIsProChart] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false); 

  // Trade Günlüğü State'leri
  const [userNotes, setUserNotes] = useState({}); 
  const [currentNote, setCurrentNote] = useState(''); 
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showAllNotesModal, setShowAllNotesModal] = useState(false); 

  const dropdownRef = useRef(null);
  const chartBoxRef = useRef(null); 

  // Başlangıç Verileri
  useEffect(() => {
    fetchCoinDetails('bitcoin', '1');
    
    // GÜVENLİ: apiGet kullanarak kurları çektik (res.json()'a gerek kalmadı)
    apiGet('/api/rates')
      .then(data => { if(data && data.USD) setUsdToTryRate(parseFloat(data.USD)); })
      .catch(err => console.error("Döviz kurları çekilemedi:", err));

    // DİKKAT: Bu harici bir API olduğu için dokunmuyoruz, normal fetch olarak kalıyor!
    fetch('https://api.alternative.me/fng/')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          setFearGreed({ value: parseInt(data.data[0].value), text: data.data[0].value_classification });
        }
      })
      .catch(err => console.error("Piyasa psikolojisi çekilemedi:", err));

    const fetchUserFinances = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; 
      try {
        // GÜVENLİ: apiGet kullanarak notları çektik (Headers'a gerek kalmadı, api.js hallediyor)
        const data = await apiGet('/api/user/finances');
        if (data && data.notes) setUserNotes(data.notes);
      } catch (err) { console.error("Notlar çekilemedi:", err); }
    };
    fetchUserFinances();
  }, []);

  // Yeni Coin Seçildiğinde
  useEffect(() => {
    setHoldings('');
    setCurrentNote(userNotes[activeCoinId] || '');
    setSaveMessage('');
  }, [activeCoinId, userNotes]);

  // Arama Motoru
  useEffect(() => {
    if (!searchTerm.trim() || !showSuggestions) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await apiGet(`/api/crypto/search/${searchTerm}`);
        setSearchResults(data || []);
      } catch (err) {
        console.error("Arama hatası:", err);
      } finally {
        setIsSearching(false);
      }
    }, 800); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, showSuggestions]);

  // Coin Verisi Çekme
  const fetchCoinDetails = async (coinId, days = '1') => {
    if (!coinId) return;
    setLoading(true);
    setActiveCoinId(coinId);
    setShowSuggestions(false);
    setSearchTerm(''); 

    try {
      const [detailData, chartRawData] = await Promise.all([
        apiGet(`/api/crypto/details/${coinId}`),
        apiGet(`/api/crypto/chart/${coinId}?days=${days}`)
      ]);

      setCoinData(detailData);

      const formattedChart = chartRawData.prices.map(item => {
        const dateObj = new Date(item[0]);
        const dateStr = days === '1' 
          ? dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          : dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
        return { date: dateStr, price: item[1] };
      });
      setChartData(formattedChart);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCoinId && coinData && !isProChart) fetchCoinDetails(activeCoinId, timeRange);
  }, [timeRange]);

  // Dışarı tıklayınca aramayı kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // TAM EKRAN MOTORU
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (chartBoxRef.current?.requestFullscreen) {
        chartBoxRef.current.requestFullscreen().catch(err => console.error("Tam ekran hatası:", err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Not Kaydetme Motoru
  const handleSaveNote = async () => {
    setIsSavingNote(true);
    setSaveMessage('');

    const updatedNotes = { ...userNotes, [activeCoinId]: currentNote };
    setUserNotes(updatedNotes);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        // GÜVENLİ: apiPatch kullanıyoruz. Method, Headers ve JSON.stringify ile vedalaşıyoruz!
        await apiPatch('/api/user/finances', { notes: updatedNotes });
        setSaveMessage('Kaydedildi ✓');
      } catch (err) { 
        setSaveMessage('Sunucu hatası ❌'); 
      }
    } else {
      setSaveMessage('Geçici kaydedildi ⚠️');
    }
    setIsSavingNote(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const formatPrice = (usdValue, minFrac = 2, maxFrac = 6) => {
    if (currency === 'TRY' && usdToTryRate) {
      return `₺${(usdValue * usdToTryRate).toLocaleString('tr-TR', { minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac })}`;
    }
    return `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac })}`;
  };

  const formatCompact = (usdValue) => {
    if (currency === 'TRY' && usdToTryRate) {
      return `₺${((usdValue * usdToTryRate) / 1000000000).toFixed(2)} Mlr`;
    }
    return `$${(usdValue / 1000000000).toFixed(2)} Mlr`;
  };

  const isPositive = coinData?.market_data?.price_change_percentage_24h >= 0;
  const themeColor = isPositive ? '#10B981' : '#EF4444';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 md:p-4 rounded-xl shadow-xl border border-gray-800">
          <p className="text-xs md:text-sm font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-lg md:text-2xl font-black text-white">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const getFearGreedColor = (val) => {
    if (val <= 25) return 'text-red-600';
    if (val <= 45) return 'text-orange-500';
    if (val <= 55) return 'text-yellow-500';
    if (val <= 75) return 'text-green-400';
    return 'text-green-600';
  };

  const translateFearGreed = (text) => {
    const map = { 'Extreme Fear': 'Aşırı Korku', 'Fear': 'Korku', 'Neutral': 'Nötr', 'Greed': 'Açgözlülük', 'Extreme Greed': 'Aşırı Açgözlülük' };
    return map[text] || text;
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 font-sans">
      
      {/* ÜST BAR */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 shadow-sm">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/finance')} className="p-2 md:p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Globe className="text-[#007AFF]" size={24} /> Piyasalar
            </h1>
          </div>
          <div className="md:hidden">
            <button onClick={() => setCurrency(c => c === 'USD' ? 'TRY' : 'USD')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-black text-xs transition-all text-[#04009A]">
              {currency === 'USD' ? '🇺🇸 USD' : '🇹🇷 TRY'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden md:block">
            <button onClick={() => setCurrency(c => c === 'USD' ? 'TRY' : 'USD')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl font-black text-sm transition-all text-[#04009A] w-24 text-center">
              {currency === 'USD' ? '🇺🇸 USD' : '🇹🇷 TRY'}
            </button>
          </div>

          <div className="relative w-full md:w-[400px]" ref={dropdownRef}>
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-[#007AFF]" />
              <input 
                type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }} onFocus={() => { if(searchTerm) setShowSuggestions(true); }}
                placeholder="Coin veya token ara..." 
                className="w-full bg-gray-100 border border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm md:text-base font-bold text-gray-900 focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400" 
              />
            </div>
            {showSuggestions && searchTerm.trim().length > 0 && (
              <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl max-h-[300px] overflow-y-auto z-[60] custom-scrollbar">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <RefreshCw className="animate-spin text-gray-400 mb-2" size={24} />
                    <span className="text-gray-500 text-xs font-bold">Aranıyor...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((coin) => (
                    <div key={coin.id} onClick={() => fetchCoinDetails(coin.id)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="text-sm font-black text-[#04009A]">{coin.name}</div>
                          <div className="text-xs font-bold text-gray-400 uppercase">{coin.symbol}</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 font-bold text-sm">Sonuç bulunamadı.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6 relative">
        
        {loading && !coinData && (
          <div className="absolute inset-0 bg-gray-50/80 z-40 flex flex-col items-center justify-center min-h-[50vh]">
            <RefreshCw className="animate-spin text-[#007AFF] mb-4" size={32} />
          </div>
        )}

        {coinData && (
          <div className={`space-y-4 md:space-y-6 transition-opacity duration-500 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            
            {/* HERO KARTI */}
            <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                 <img src={coinData.image.large} alt={coinData.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-sm border border-gray-100" />
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="bg-[#007AFF]/10 text-[#007AFF] font-bold uppercase tracking-widest text-[10px] md:text-xs px-2.5 py-1 rounded-lg">Rank #{coinData.market_cap_rank}</span>
                     <span className="text-gray-400 font-bold uppercase text-xs md:text-sm">{coinData.symbol}</span>
                   </div>
                   <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#04009A]">{coinData.name}</h2>
                 </div>
               </div>

               <div className="text-left md:text-right bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none">
                 <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1">Anlık Fiyat ({currency})</div>
                 <div className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter transition-all">
                   {formatPrice(coinData.market_data.current_price.usd)}
                 </div>
                 
                 <div className={`flex items-center md:justify-end gap-1 font-black mt-2 text-sm md:text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                   {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                   {Math.abs(coinData.market_data.price_change_percentage_24h).toFixed(2)}% (24s)
                 </div>
               </div>
            </div>

            {/* ÜST KAT: GRAFİK VE KİŞİSEL ARAÇLAR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              
              {/* SOL: GRAFİK BÖLÜMÜ */}
              <div 
                ref={chartBoxRef} 
                className={`lg:col-span-2 bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 flex flex-col ${isFullScreen ? 'p-6 h-screen' : 'h-[380px] md:h-[450px]'}`}
              >
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isFullScreen ? 'mb-4' : 'mb-6'}`}>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
                    <BarChart2 className="text-[#007AFF]" size={24} /> 
                    {isFullScreen ? `${coinData.name} Fiyat Grafiği` : 'Fiyat Geçmişi'}
                  </h3>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsProChart(!isProChart)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center ${isProChart ? 'bg-[#007AFF] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {isProChart ? <LineChart size={16} /> : <PenTool size={16} />}
                      {isProChart ? 'Basit Görünüm' : 'Pro Çizim'}
                    </button>

                    <button onClick={toggleFullScreen} className="p-2.5 rounded-xl font-bold text-sm transition-all bg-gray-100 text-[#04009A] hover:bg-[#007AFF] hover:text-white flex-shrink-0" title="Tam Ekran">
                      <Maximize size={18} />
                    </button>

                    {!isProChart && (
                      <div className="flex items-center bg-gray-100 p-1.5 rounded-xl justify-between ml-2">
                        {['1', '7', '30', '365'].map(days => (
                          <button key={days} onClick={() => setTimeRange(days)} className={`px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm transition-all text-center ${timeRange === days ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                            {days === '1' ? '24S' : days === '7' ? '1H' : days === '30' ? '1A' : '1Y'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full relative">
                  {isProChart ? (
                    <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border border-gray-100 bg-white">
                      <iframe 
                        title="TradingView"
                        src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coinData.symbol.toUpperCase()}USDT&interval=D&hidesidetoolbar=0&symboledit=0&saveimage=1&toolbarbg=ffffff&studies=%5B%5D&theme=light&style=1&timezone=Etc%2FUTC&locale=tr`}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} minTickGap={30} />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: themeColor, strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="price" stroke={themeColor} strokeWidth={3} fillOpacity={1} fill="url(#chartColor)" activeDot={{ r: 6, fill: "#fff", stroke: themeColor, strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* SAĞ: TRADE GÜNLÜĞÜ VE HESAPLAYICI */}
              <div className="space-y-4 md:space-y-6">
                
                {/* TRADE GÜNLÜĞÜ */}
                <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
                      <BookOpen className="text-[#04009A]" size={20} /> Trade Günlüğü
                    </h3>
                    <button onClick={() => setShowAllNotesModal(true)} className="text-xs font-bold text-[#007AFF] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                      <List size={14} /> Tüm Notlarım
                    </button>
                  </div>
                  {saveMessage && (
                    <div className={`text-xs font-bold px-3 py-2 rounded-lg mb-3 ${saveMessage.includes('❌') ? 'bg-red-50 text-red-600' : saveMessage.includes('⚠️') ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                      {saveMessage}
                    </div>
                  )}
                  <textarea
                    value={currentNote} onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder={`${coinData.name} için stratejini buraya yaz...`}
                    className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-800 focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none mb-4 custom-scrollbar"
                  />
                  <button onClick={handleSaveNote} disabled={isSavingNote} className="w-full py-3 bg-[#04009A] hover:bg-[#007AFF] text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70">
                    {isSavingNote ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSavingNote ? 'Kaydediliyor...' : 'Analizi Kaydet'}
                  </button>
                </div>

                {/* VARLIK HESAPLAYICI */}
                <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
                  <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet className="text-[#007AFF]" size={20} /> Varlık Hesaplayıcı
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        Elimdeki {coinData.symbol.toUpperCase()} Miktarı
                      </label>
                      <input 
                        type="number" value={holdings} onChange={(e) => setHoldings(e.target.value)} placeholder="Örn: 0.5" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base md:text-lg font-black text-gray-900 focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-300" 
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                      <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">Toplam Değer</span>
                      <span className="text-lg md:text-xl font-black text-[#007AFF]">
                        {holdings && parseFloat(holdings) > 0 ? formatPrice(parseFloat(holdings) * coinData.market_data.current_price.usd, 2, 2) : formatPrice(0, 2, 2)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/*  ALT KAT: PİYASA VERİLERİ VE PSİKOLOJİ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
              
              {/* PİYASA VERİLERİ */}
              <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="text-[#007AFF]" size={20} /> Piyasa Verileri
                </h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                  <div>
                    <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Piyasa Değeri</div>
                    <div className="text-base md:text-xl font-black text-[#04009A]">{formatCompact(coinData.market_data.market_cap.usd)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">24S Hacim</div>
                    <div className="text-base md:text-xl font-black text-[#04009A]">{formatCompact(coinData.market_data.total_volume.usd)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tarihi Zirve (ATH)</div>
                    <div className="text-base md:text-xl font-black text-green-500">{formatPrice(coinData.market_data.ath.usd, 2, 2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Dolaşan Arz</div>
                    <div className="text-base md:text-xl font-black text-[#04009A]">{coinData.market_data.circulating_supply.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
              </div>

              {/* KORKU VE AÇGÖZLÜLÜK */}
              {fearGreed && (
                <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Gauge className="text-[#007AFF]" size={20} /> Piyasa Psikolojisi
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-gray-50 border-[6px] border-gray-100 flex-shrink-0">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-transparent" />
                        <circle 
                          cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="250" strokeDashoffset={250 - (250 * fearGreed.value) / 100} 
                          className={`${getFearGreedColor(fearGreed.value)} transition-all duration-1000 ease-out`} style={{ transformOrigin: 'center' }}
                        />
                      </svg>
                      <span className={`text-3xl md:text-4xl font-black ${getFearGreedColor(fearGreed.value)}`}>{fearGreed.value}</span>
                    </div>
                    <div>
                      <div className={`text-xl md:text-2xl font-black uppercase tracking-wider mb-2 ${getFearGreedColor(fearGreed.value)}`}>
                        {translateFearGreed(fearGreed.text)}
                      </div>
                      <p className="text-sm font-bold text-gray-400 leading-relaxed">
                        Kripto piyasasındaki yatırımcıların duygu durumunu gösteren global endeks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* HAKKINDA BÖLÜMÜ */}
            {coinData.description?.en && (
              <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 mt-4 md:mt-6">
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="text-[#007AFF]" size={20} /> Proje Hakkında
                </h3>
                <div 
                  className="text-gray-600 text-sm font-medium leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar"
                  dangerouslySetInnerHTML={{ __html: coinData.description.en }}
                />
              </div>
            )}

          </div>
        )}
      </main>

      {/* TÜM NOTLAR MODALI */}
      {showAllNotesModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowAllNotesModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#04009A] text-white">
              <h2 className="text-xl font-black flex items-center gap-2"><List size={20} /> Tüm Stratejilerim</h2>
              <button onClick={() => setShowAllNotesModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
              {Object.keys(userNotes).filter(coin => userNotes[coin].trim() !== '').length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(userNotes).map(([coin, note]) => {
                    if (!note.trim()) return null;
                    return (
                      <div key={coin} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-black text-[#007AFF] uppercase tracking-widest mb-2 bg-blue-50 inline-block px-2 py-1 rounded-md">{coin}</div>
                        <p className="text-gray-700 text-sm font-medium whitespace-pre-wrap">{note}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <BookOpen size={48} className="mb-4 text-[#04009A]" />
                  <p className="font-bold text-gray-600">Henüz kaydedilmiş bir stratejin yok.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default CryptoTerminalPage;