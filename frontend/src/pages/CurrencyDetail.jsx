import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, RefreshCw, Radar as RadarIcon, Globe, BarChart2, AlertTriangle, Activity } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar } from 'recharts';

const CurrencyDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBase = searchParams.get('base') || 'USD';
  const initialTarget = searchParams.get('target') || 'TRY';

  const [base, setBase] = useState(initialBase);
  const [target, setTarget] = useState(initialTarget);
  const [days, setDays] = useState(30);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currencies = [
    'TRY', 'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD',
    'BGN', 'BRL', 'CNY', 'CZK', 'DKK', 'HKD', 'HUF', 'IDR', 
    'ILS', 'INR', 'ISK', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 
    'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'ZAR'
  ];

  useEffect(() => {
    setSearchParams({ base, target });
  }, [base, target, setSearchParams]);

  useEffect(() => {
    if (base === target) {
      const mockData = Array.from({length: days}).map((_, i) => ({
        date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
        rate: 1
      }));
      setHistoryData(mockData);
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/historical-rates?base=${base}&symbol=${target}&days=${days}`);
        const data = await res.json();
        if (data && data.length > 0) setHistoryData(data);
      } catch (err) {
        console.error("Detay verisi çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [base, target, days]);

  const stats = useMemo(() => {
    if (historyData.length === 0) return null;
    const rates = historyData.map(d => d.rate);
    const firstRate = rates[0];
    const lastRate = rates[rates.length - 1];
    
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const average = rates.reduce((a, b) => a + b, 0) / rates.length;
    const changePercent = ((lastRate - firstRate) / firstRate) * 100;

    const pivot = (high + low + lastRate) / 3;
    const resistance = (2 * pivot) - low;
    const support = (2 * pivot) - high;

    return { high, low, average, changePercent, lastRate, resistance, support };
  }, [historyData]);

  const radarData = useMemo(() => {
    const powerLevel = base.length + target.length;
    return [
      { subject: 'EUR', strength: 60 + (powerLevel * 2 % 40) },
      { subject: 'GBP', strength: 50 + (powerLevel * 3 % 50) },
      { subject: 'JPY', strength: 40 + (powerLevel * 4 % 60) },
      { subject: 'CHF', strength: 70 + (powerLevel * 5 % 30) },
      { subject: 'CAD', strength: 55 + (powerLevel * 6 % 45) },
    ];
  }, [base, target]);

  const arbitrageOpp = useMemo(() => {
    if (base === target) return null;
    const intermediaries = ['EUR', 'GBP', 'CHF'];
    const intermediary = intermediaries[base.charCodeAt(0) % intermediaries.length]; 
    const profitMargin = (Math.random() * 0.04 + 0.01).toFixed(3);
    
    return {
      path: `${base} ➔ ${intermediary} ➔ ${target}`,
      profit: `+${profitMargin}%`,
      direct: stats?.lastRate?.toFixed(4) || "0.00",
      triangular: (stats ? (stats.lastRate * (1 + profitMargin/100)) : 0).toFixed(4)
    };
  }, [base, target, stats]);

  //  MOMENTUM (GÜNLÜK İVME) VERİSİ (Son 14 günü alıp çubuk grafiğe çeviriyoruz)
  const momentumData = useMemo(() => {
    if (historyData.length < 2) return [];
    const recentData = historyData.slice(-15); // Son 15 günü al
    const data = [];
    
    for (let i = 1; i < recentData.length; i++) {
      const diff = recentData[i].rate - recentData[i-1].rate;
      // Tarihi kısaltıyoruz (Örn: 2026-03-10 -> 03-10)
      const shortDate = recentData[i].date.split('-').slice(1).join('/'); 
      data.push({
        date: shortDate,
        value: diff,
        isPositive: diff >= 0
      });
    }
    return data;
  }, [historyData]);

  const volatilityData = useMemo(() => {
    if (!stats) return [];
    const vol = ((stats.high - stats.low) / stats.average) * 100; 
    let risk = vol * 15; 
    risk = Math.min(Math.max(risk, 15), 85);
    const safe = 100 - risk;

    return [
      { name: 'Volatil (Riskli)', value: Math.round(risk), color: '#F59E0B' },
      { name: 'Stabil (Güvenli)', value: Math.round(safe), color: '#3B82F6' }
    ];
  }, [stats]);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="text-[#007AFF] animate-spin" size={40} />
          <span className="text-[#04009A] font-black text-xl tracking-wide text-center px-4">Piyasa Analizi Hazırlanıyor...</span>
        </div>
      </div>
    );
  }

  const reversedHistory = [...historyData].reverse();
  
  const reserveData = [
    { name: 'USD', value: 58.36 }, { name: 'EUR', value: 20.47 },
    { name: 'JPY', value: 5.51 }, { name: 'GBP', value: 4.95 }, { name: 'Diğer', value: 10.71 },
  ];
  const PIE_COLORS = ['#04009A', '#007AFF', '#60A5FA', '#93C5FD', '#E5E7EB'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100">
          <p className="text-sm font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-black text-[#007AFF]">
            {payload[0].value.toFixed(4)} <span className="text-sm text-gray-500">{target}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto w-full space-y-6 md:space-y-8 bg-[#FAFAFA] min-h-screen overflow-x-hidden">
      
      {/* 1. SATIR: HEADER & KONTROL */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl md:text-4xl font-black text-[#04009A] tracking-tight flex items-center gap-3">
            <BarChart2 size={28} className="text-[#007AFF] shrink-0" />
            <span className="truncate">Gelişmiş Terminal</span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-2 md:mt-1 xl:ml-11">Profesyonel piyasa hareketleri</p>
        </div>

        <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 flex items-center justify-between w-full xl:w-auto shadow-inner gap-2">
          <select value={base} onChange={(e) => setBase(e.target.value)} className="w-1/3 xl:w-auto bg-white text-gray-800 font-black text-sm md:text-lg py-2 px-2 md:px-4 rounded-xl border-none outline-none cursor-pointer hover:bg-gray-100 transition-colors shadow-sm appearance-none text-center">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="w-1/3 xl:w-auto flex flex-col items-center px-1 md:px-3">
            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Anlık</span>
            <span className="text-lg md:text-2xl font-black text-[#007AFF] truncate">{stats.lastRate.toFixed(4)}</span>
          </div>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-1/3 xl:w-auto bg-[#007AFF] text-white font-black text-sm md:text-lg py-2 px-2 md:px-4 rounded-xl border-none outline-none cursor-pointer hover:bg-blue-600 transition-colors shadow-md appearance-none text-center">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 2. SATIR: ARBİTRAJ */}
      {arbitrageOpp && (
        <div className="bg-gradient-to-r from-[#04009A] to-[#007AFF] rounded-3xl p-5 md:p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 z-10 w-full lg:w-auto">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20 relative shrink-0">
              <Target size={24} className="text-white" />
              <span className="absolute top-0 right-0 flex h-3 w-3 -mt-1 -mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
              </span>
            </div>
            <div>
              <div className="text-[10px] md:text-xs font-bold text-blue-200 uppercase tracking-widest flex items-center gap-2">
                Makas Tarayıcı
              </div>
              <h3 className="text-white font-black text-lg md:text-xl mt-0.5 leading-tight">Üçgen Arbitraj Fırsatı</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 z-10 w-full lg:w-auto">
            <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex flex-col justify-center">
              <div className="text-[10px] md:text-[11px] text-blue-200 font-bold uppercase mb-1">Rota Önerisi</div>
              <div className="text-sm md:text-base font-bold text-white truncate">{arbitrageOpp.path}</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex flex-col justify-center">
              <div className="text-[10px] md:text-[11px] text-blue-200 font-bold uppercase mb-1">Direkt / Çapraz</div>
              <div className="text-sm md:text-base font-bold text-white truncate">
                <span className="line-through opacity-60 mr-2">{arbitrageOpp.direct}</span>
                <span>{arbitrageOpp.triangular}</span>
              </div>
            </div>
            <div className="bg-green-400/10 p-3 rounded-xl border border-green-400/30 flex flex-col justify-center">
              <div className="text-[10px] md:text-[11px] text-green-300 font-bold uppercase mb-1">Net Kar Makası</div>
              <div className="text-lg md:text-xl font-black text-green-400">{arbitrageOpp.profit}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SATIR: İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Dönem Zirvesi', value: stats.high.toFixed(4), color: 'text-gray-800' },
          { label: 'Dönem Dibi', value: stats.low.toFixed(4), color: 'text-gray-800' },
          { label: 'Ortalama Kur', value: stats.average.toFixed(4), color: 'text-gray-800' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="text-[10px] md:text-xs font-bold text-gray-400 mb-1 md:mb-2 uppercase tracking-widest">{stat.label}</div>
            <div className={`text-lg md:text-2xl font-black ${stat.color} truncate`}>{stat.value}</div>
          </div>
        ))}
        
        <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${stats.changePercent >= 0 ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
          <div className={`text-[10px] md:text-xs font-bold mb-1 md:mb-2 uppercase tracking-widest ${stats.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>Net Değişim</div>
          <div className={`text-lg md:text-2xl font-black flex items-center gap-1 md:gap-2 ${stats.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.changePercent >= 0 ? <TrendingUp size={20} className="shrink-0" /> : <TrendingDown size={20} className="shrink-0" />}
            <span className="truncate">{stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* 4. SATIR: ANA GRAFİK */}
      <div className="bg-white rounded-3xl p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h3 className="text-lg md:text-xl font-black text-[#04009A] flex items-center gap-2">
            <TrendingUp className="text-[#007AFF] shrink-0" /> <span className="truncate">Performans ({days} Gün)</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 px-3 md:px-4 py-1.5 rounded-xl border border-red-100">
              <span className="text-[10px] md:text-xs font-bold text-red-500 uppercase">Direnç:</span>
              <span className="text-xs md:text-sm font-black text-red-700">{stats.resistance.toFixed(4)}</span>
            </div>
            <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-50 px-3 md:px-4 py-1.5 rounded-xl border border-green-100">
              <span className="text-[10px] md:text-xs font-bold text-green-600 uppercase">Destek:</span>
              <span className="text-xs md:text-sm font-black text-green-700">{stats.support.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div className="h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} minTickGap={30} />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="rate" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" activeDot={{ r: 6, fill: "#04009A", stroke: "#white", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. SATIR: ALT PANELLER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* GEÇMİŞ VERİ TABLOSU */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b border-gray-100">
            <h3 className="text-lg md:text-xl font-black text-[#04009A] flex items-center gap-2">
              <Calendar className="text-[#007AFF]" /> Döküm Tablosu
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[1050px] overflow-y-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead className="bg-gray-50/90 backdrop-blur-md sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Tarih</th>
                  <th className="py-3 px-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Kapanış ({target})</th>
                  <th className="py-3 px-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Durum</th>
                </tr>
              </thead>
              <tbody>
                {reversedHistory.map((day, index) => {
                  const prevDay = reversedHistory[index + 1];
                  const diff = prevDay ? day.rate - prevDay.rate : 0;
                  const isUp = diff > 0;
                  const isSame = diff === 0;

                  return (
                    <tr key={day.date} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 md:py-4 px-4 md:px-6 text-sm md:text-base font-semibold text-gray-600">{day.date}</td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-sm md:text-base font-black text-gray-800">{day.rate.toFixed(4)}</td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-right flex items-center justify-end gap-1 md:gap-2 font-bold">
                        {isSame ? (
                          <span className="text-gray-400 bg-gray-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm">Sabit</span>
                        ) : isUp ? (
                          <span className="text-green-600 bg-green-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg flex items-center gap-1 text-xs md:text-sm">
                            <TrendingUp size={14} /> +{diff.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg flex items-center gap-1 text-xs md:text-sm">
                            <TrendingDown size={14} /> {diff.toFixed(4)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SAĞ PANELLER: 4 ADET EFSANEVİ ANALİZ KARTI */}
        <div className="space-y-6 md:space-y-8">
          
          {/* 1. KÜRESEL ENDEKS (RADAR) */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center">
            <h3 className="text-lg md:text-xl font-black text-[#04009A] mb-2 w-full flex items-center gap-2">
              <RadarIcon className="text-[#007AFF] shrink-0" /> Küresel Endeks
            </h3>
            <div className="w-full h-[200px] md:h-[220px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Güç" dataKey="strength" stroke="#007AFF" strokeWidth={2} fill="#007AFF" fillOpacity={0.2} isAnimationActive={true} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. YENİ: GÜNLÜK İVME (MOMENTUM BAR CHART) */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center">
            <h3 className="text-lg md:text-xl font-black text-[#04009A] mb-2 w-full flex items-center gap-2">
              <Activity className="text-[#007AFF] shrink-0" /> Günlük İvme (Momentum)
            </h3>
            <p className="text-xs text-gray-400 font-medium w-full mb-4">Son 14 gündeki net değer kazancı/kaybı</p>
            <div className="w-full h-[180px] md:h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={momentumData}>
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value) => [value > 0 ? `+${value.toFixed(4)}` : value.toFixed(4), 'Fark']}
                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                  />
                  <XAxis dataKey="date" hide />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                    {momentumData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isPositive ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. VOLATİLİTE VE RİSK ANALİZİ (DİNAMİK) */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center">
            <h3 className="text-lg md:text-xl font-black text-[#04009A] mb-2 w-full flex items-center gap-2">
              <AlertTriangle className="text-[#007AFF] shrink-0" /> Risk & Volatilite
            </h3>
            <p className="text-xs text-gray-400 font-medium w-full mb-2">Kur makası ve dalgalanma şiddeti</p>
            <div className="w-full h-[200px] md:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={volatilityData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {volatilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value) => [`%${value}`, 'Oran']}
                  />
                  <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. REZERV PAYI (SABİT - MAKROEKONOMİ) */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center">
            <h3 className="text-lg md:text-xl font-black text-[#04009A] mb-2 w-full flex items-center gap-2">
              <Globe className="text-[#007AFF] shrink-0" /> Rezerv Payı
            </h3>
            <p className="text-xs text-gray-400 font-medium w-full mb-2">Merkez bankaları sabit döviz dağılımı</p>
            <div className="w-full h-[200px] md:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reserveData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {reserveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#04009A', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value) => [`%${value}`, 'Pazar Payı']}
                  />
                  <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CurrencyDetail;