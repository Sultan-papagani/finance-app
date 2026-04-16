import React, { useState, useEffect, useRef } from 'react';
// 🔥 EKSİK OLAN ChevronRight İKONU EKLENDİ (Beyaz ekran sorunu çözüldü)
import { ArrowLeft, RefreshCw, BarChart2, Info, TrendingUp, TrendingDown, Wallet, BookOpen, Save, Maximize, List, X, Coins, Sparkles, ChevronDown, ChevronRight, PenTool, LineChart as LineIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiGet, apiPatch } from '../services/api'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GoldMarketsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const idParam = searchParams.get('id') || 'gram';

  const [goldList, setGoldList] = useState([]);
  const [activeGold, setActiveGold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(false); 
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [isProChart, setIsProChart] = useState(false);
  const [timeRange, setTimeRange] = useState('30');
  const [historicalData, setHistoricalData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const [holdings, setHoldings] = useState(''); 
  const [userNotes, setUserNotes] = useState({}); 
  const [currentNote, setCurrentNote] = useState(''); 
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showAllNotesModal, setShowAllNotesModal] = useState(false); 

  const chartBoxRef = useRef(null); 
  const dropdownRef = useRef(null);

  const getMultiplier = (id) => {
    const multipliers = { 'gram': 1, 'ceyrek': 1.6065, 'yarim': 3.213, 'tam': 6.426, 'cumhuriyet': 6.6, 'ata5': 33.0, 'bilezik22': 0.916 };
    return multipliers[id] || 1;
  };

  useEffect(() => {
    const fetchGoldData = async () => {
      try {
        const data = await apiGet('/api/gold');
        setGoldList(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchGoldData();
    const interval = setInterval(fetchGoldData, 60000); 
    return () => clearInterval(interval);
  }, []); 

  useEffect(() => {
    if (goldList.length > 0) {
      const selected = goldList.find(g => g.id === idParam);
      setActiveGold(selected || goldList[0]);
    }
  }, [idParam, goldList]);

  useEffect(() => {
    const fetchHistory = async () => {
      if(isProChart) return;
      setChartLoading(true);
      try {
        const data = await apiGet(`/api/historical-gold?days=${timeRange}`);
        setHistoricalData(data);
      } catch (err) {
        console.error("Geçmiş veri hatası:", err);
      } finally {
        setChartLoading(false);
      }
    };
    fetchHistory();
  }, [timeRange, isProChart]);

  useEffect(() => {
    const fetchUserFinances = async () => {
      try {
        const data = await apiGet('/api/user/finances');
        if (data && data.notes) setUserNotes(data.notes);
      } catch (err) { console.error("Notlar çekilemedi:", err); }
    };
    fetchUserFinances();
  }, []);

  useEffect(() => {
    if (activeGold) {
      setHoldings('');
      setCurrentNote(userNotes[activeGold.id] || '');
      setSaveMessage('');
    }
  }, [activeGold, userNotes]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (chartBoxRef.current?.requestFullscreen) chartBoxRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleSaveNote = async () => {
    if(!activeGold) return;
    setIsSavingNote(true);
    setSaveMessage('');
    
    const updatedNotes = { ...userNotes, [activeGold.id]: currentNote };
    setUserNotes(updatedNotes);

    try {
      await apiPatch('/api/user/finances', { notes: updatedNotes });
      setSaveMessage('Kaydedildi ✓');
    } catch (err) { setSaveMessage('Sunucu hatası ❌'); }
    
    setIsSavingNote(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1C1E] text-white p-3 rounded-xl shadow-lg border border-gray-800">
          <p className="text-gray-400 text-xs mb-1 font-medium">{payload[0].payload.fullDate}</p>
          {/* 🔥 SARI TOOLTIP YAZISI */}
          <p className="text-[#EAB308] font-black text-sm">{payload[0].value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TRY</p>
        </div>
      );
    }
    return null;
  };

  const processedChartData = historicalData.map(item => ({
    ...item,
    price: item.price * getMultiplier(activeGold?.id)
  }));

  if (error) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Veriler yüklenemedi.</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      
      {/* ÜST BAR */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 shadow-sm dark:shadow-lg">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => navigate('/finance')} className="p-2 md:p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Coins className="text-yellow-500" size={24} /> Altın Terminali
          </h1>
        </div>

        <div className="relative w-full md:w-72" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent rounded-2xl px-4 py-3 text-sm md:text-base font-bold text-blue-700 dark:text-blue-400 transition-all"
          >
            <span>{activeGold ? activeGold.name : 'Altın Seçiliyor...'}</span>
            <ChevronDown size={18} className={`transition-transform duration-300`} />
          </button>

          {showDropdown && (
            <div className="absolute top-[110%] left-0 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl z-[60] overflow-hidden">
              {goldList.map((gold) => (
                <div
                  key={gold.id}
                  onClick={() => { setSearchParams({ id: gold.id }); setShowDropdown(false); }}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors ${activeGold?.id === gold.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <div className={`text-sm font-black ${activeGold?.id === gold.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-white'}`}>{gold.name}</div>
                  <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6 relative">
        
        {loading && !activeGold && (
          <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/80 z-40 flex flex-col items-center justify-center min-h-[50vh]">
            <RefreshCw className="animate-spin text-yellow-500 dark:text-yellow-400 mb-4" size={32} />
          </div>
        )}

        {activeGold && (
          <div className={`space-y-4 md:space-y-6 transition-opacity duration-500 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            
            {/* HERO KARTI */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-8 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none">
                <Coins size={250} />
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-inner border-4 border-yellow-600">
                  <Coins className="text-yellow-800" size={36} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-50 border border-yellow-100 text-yellow-700 font-bold uppercase tracking-widest text-[10px] md:text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Sparkles size={12} /> Kapalıçarşı
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-blue-700 dark:text-blue-400">{activeGold.name}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-700 w-full lg:w-auto relative z-10">
                <div className="border-r border-gray-200 dark:border-gray-700 pr-4">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Kuyumcu Alış (Bozdurma)</div>
                  <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    ₺{activeGold.buy.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="pl-2">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Kuyumcu Satış (Alma)</div>
                  <div className="text-2xl md:text-3xl font-black text-[#10B981] dark:text-green-400 tracking-tighter">
                    ₺{activeGold.sell.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className={`col-span-2 flex items-center justify-center gap-1.5 font-bold mt-2 text-sm px-3 py-2 rounded-xl ${activeGold.change >= 0 ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                  {activeGold.change >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  24S Değişim: {activeGold.change > 0 ? '+' : ''}{activeGold.change}%
                </div>
              </div>
            </div>

            {/* ÜST KAT: GRAFİK VE KİŞİSEL ARAÇLAR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              
              <div ref={chartBoxRef} className={`lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-8 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col ${isFullScreen ? 'p-6 h-screen' : 'h-[400px] md:h-[480px]'}`}>

                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isFullScreen ? 'mb-4' : 'mb-6'}`}>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="text-[#EAB308]" size={24} />
                    {isProChart ? 'Pro Çizim Tahtası' : `${activeGold.name} Trendi`}
                  </h3>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsProChart(!isProChart)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center ${isProChart ? 'bg-[#EAB308] text-white shadow-md dark:shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {isProChart ? <LineIcon size={16} /> : <PenTool size={16} />}
                      {isProChart ? 'Basit Görünüm' : 'Pro Çizim'}
                    </button>

                    <button onClick={toggleFullScreen} className="p-2.5 rounded-xl font-bold text-sm transition-all bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-blue-400 hover:bg-[#EAB308] dark:hover:bg-yellow-500 hover:text-white dark:hover:text-gray-900 flex-shrink-0" title="Tam Ekran">
                      <Maximize size={18} />
                    </button>

                    {!isProChart && (
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl justify-between ml-2">
                        {[
                          { id: '30', label: '1A' },
                          { id: '90', label: '3A' },
                          { id: '180', label: '6A' },
                          { id: '365', label: '1Y' }
                        ].map(range => (
                          <button 
                            key={range.id} 
                            onClick={() => setTimeRange(range.id)} 
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm transition-all text-center ${timeRange === range.id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
                  {chartLoading && !isProChart && (
                     <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 z-20 flex flex-col items-center justify-center">
                       <RefreshCw className="animate-spin text-[#EAB308] mb-2" size={28} />
                       <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Trend Yükleniyor...</span>
                     </div>
                  )}

                  {!isProChart ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedChartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                          dy={10}
                          minTickGap={30}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 'bold' }} 
                          tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`}
                          width={80}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 2, strokeDasharray: '4 4' }} />
                        {/*  GRAFİK ÇİZGİSİ ALTIN SARISI YAPILDI */}
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#EAB308" 
                          strokeWidth={3} 
                          dot={false} 
                          activeDot={{ r: 6, fill: '#EAB308', stroke: '#fff', strokeWidth: 2 }} 
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <iframe
                      title="TradingView Gold Chart"
                      src="https://s.tradingview.com/widgetembed/?symbol=FX_IDC:XAUTRYG&interval=D&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=0&saveimage=1&toolbarbg=ffffff&studies=%5B%5D&theme=light&style=1&timezone=Etc%2FUTC&locale=tr"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  )}
                </div>
              </div>

              {/* SAĞ: TRADE GÜNLÜĞÜ VE HESAPLAYICI */}
              <div className="space-y-4 md:space-y-6">

                <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-8 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="text-yellow-500" size={20} /> Altın Notlarım
                    </h3>
                    <button onClick={() => setShowAllNotesModal(true)} className="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors flex items-center gap-1.5">
                      <List size={14} /> Tüm Notlar
                    </button>
                  </div>
                  {saveMessage && (
                    <div className={`text-xs font-bold px-3 py-2 rounded-lg mb-3 ${saveMessage.includes('❌') ? 'bg-red-50 text-red-600' : saveMessage.includes('⚠️') ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                      {saveMessage}
                    </div>
                  )}
                  <textarea
                    value={currentNote} onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder={`${activeGold.name} alış hedeflerin veya piyasa yorumların...`}
                    className="w-full h-28 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-medium text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none transition-all resize-none mb-4 custom-scrollbar"
                  />
                  <button onClick={handleSaveNote} disabled={isSavingNote} className="w-full py-3 bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md dark:shadow-lg hover:shadow-lg disabled:opacity-70">
                    {isSavingNote ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSavingNote ? 'Kaydediliyor...' : 'Notu Kaydet'}
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-8 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Wallet className="text-yellow-500" size={20} /> Varlık Hesaplayıcı
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                        Elimdeki {activeGold.name} Adedi/Gramı
                      </label>
                      <input
                        type="number" value={holdings} onChange={(e) => setHoldings(e.target.value)} placeholder="Örn: 5"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base md:text-lg font-black text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none transition-all placeholder-gray-300 dark:placeholder-gray-500"
                      />
                    </div>
                    <div className="bg-green-50/50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Bozdurma Değeri</span>
                        <span className="text-lg md:text-xl font-black text-green-600 dark:text-green-400">
                          {holdings && parseFloat(holdings) > 0 ? `₺${(parseFloat(holdings) * activeGold.buy).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₺0,00'}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-right">Kuyumcu Alış (₺{activeGold.buy.toLocaleString('tr-TR', {maximumFractionDigits:0})}) üzerinden hesaplanır.</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>


            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-8 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800 mt-4 md:mt-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="text-blue-700 dark:text-blue-400" size={20} /> Sistem Notu
              </h3>
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                Görmüş olduğunuz alış ve satış fiyatları, küresel <strong>ONS Altın ($)</strong> ve anlık <strong>Dolar/TL</strong> kurları üzerinden milimetrik olarak has altın (24 Ayar) baz alınarak hesaplanmıştır. Kapalıçarşıdaki fiziki kuyumcu standartlarına uygun olarak ortalama <strong>%1.5 Alış/Satış makası</strong> uygulanmaktadır. Grafikler uluslararası Gram Altın (XAUTRYG) paritesini göstermektedir.
              </div>
            </div>

          </div>
        )}
      </main>


      {showAllNotesModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowAllNotesModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl dark:shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-blue-700 dark:bg-blue-900 text-white">
              <h2 className="text-xl font-black flex items-center gap-2"><List size={20} /> Tüm Altın Notlarım</h2>
              <button onClick={() => setShowAllNotesModal(false)} className="p-1 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50 dark:bg-gray-800">
              {Object.keys(userNotes).filter(k => userNotes[k].trim() !== '' && ['gram','ceyrek','yarim','tam','cumhuriyet','ata5','bilezik22'].includes(k)).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(userNotes).map(([key, note]) => {
                    if (!note.trim() || !['gram','ceyrek','yarim','tam','cumhuriyet','ata5','bilezik22'].includes(key)) return null;
                    const goldName = goldList.find(g => g.id === key)?.name || key;
                    return (
                      <div key={key} className="bg-white dark:bg-gray-700 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm dark:shadow-lg">
                        <div className="text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-700 inline-block px-2 py-1 rounded-md">{goldName}</div>
                        <p className="text-gray-700 dark:text-gray-200 text-sm font-medium whitespace-pre-wrap">{note}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <BookOpen size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="font-bold text-gray-500 dark:text-gray-400">Henüz kaydedilmiş bir altın stratejin yok.</p>
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

export default GoldMarketsPage;