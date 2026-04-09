import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../services/api"; // veya "../services/api" (dosya yoluna göre ayarla)
import * as LucideIcons from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MULTIPLIERS = { 'Gram Altın': 1, 'Çeyrek Altın': 1.6065, 'Yarım Altın': 3.213, 'Tam Altın': 6.426, 'Cumhuriyet Altını': 6.6, 'Beşi Bir Yerde': 33.0, '22 Ayar Bilezik': 0.916 };

function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [livePrice, setLivePrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        setLoading(true);
        // 1. Kullanıcının Varlığını Çek
        const userRes = await apiGet("/api/user/finances");
        const foundAsset = (userRes.assets || []).find(a => a.id === id);
        if (!foundAsset) throw new Error("Varlık bulunamadı!");
        setAsset(foundAsset);

        // 2. Kurları Çek (Yabancı hisse ve kriptoları TL'ye çevirmek için)
        const rates = await apiGet("/api/rates").catch(() => ({ USD: 32.5 }));
        const usdToTry = Number(rates.USD) || 32.5;

        // 3. Varlık Türüne Göre Geçmiş Grafik ve Canlı Fiyat Çek
        let formattedChart = [];
        let currentPrice = 0;

        if (foundAsset.category === 'gold') {
          const mult = MULTIPLIERS[foundAsset.name] || 1;
          const goldHist = await apiGet('/api/historical-gold?days=30');
          formattedChart = goldHist.map(item => ({ date: item.date, price: item.price * mult }));
          currentPrice = formattedChart[formattedChart.length - 1]?.price || 0;
        } 
        else if (foundAsset.category === 'stock') {
          const stockData = await apiGet(`/api/stock/${foundAsset.name}`);
          const isTurkish = foundAsset.name.endsWith('.IS');
          formattedChart = stockData.chartData.map(item => ({
            date: item.date,
            price: isTurkish ? item.price : item.price * usdToTry
          }));
          currentPrice = isTurkish ? stockData.info.close : stockData.info.close * usdToTry;
        } 
        else if (foundAsset.category === 'crypto') {
          const search = await apiGet(`/api/crypto/search/${foundAsset.name.toLowerCase()}`);
          if (search && search[0]) {
            const chartRes = await apiGet(`/api/crypto/chart/${search[0].id}?days=30`);
            formattedChart = chartRes.prices.map(p => {
              const d = new Date(p[0]);
              return { date: `${d.getDate()}/${d.getMonth() + 1}`, price: p[1] * usdToTry };
            });
            const details = await apiGet(`/api/crypto/details/${search[0].id}`);
            currentPrice = details.market_data.current_price.usd * usdToTry;
          }
        }

        setChartData(formattedChart);
        setLivePrice(currentPrice);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LucideIcons.Loader2 className="animate-spin text-[#04009A]" size={40} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;

  const totalCurrentValue = livePrice * asset.quantity;
  const totalProfit = totalCurrentValue - asset.totalCost;
  const isProfit = totalProfit >= 0;
  const profitPercent = ((totalProfit / asset.totalCost) * 100).toFixed(2);

  // Kategoriye Göre Renk ve İkon Belirleme
  const theme = asset.category === 'gold' ? { color: '#EAB308', bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'Coins' } :
                asset.category === 'crypto' ? { color: '#F97316', bg: 'bg-orange-50', text: 'text-orange-600', icon: 'Bitcoin' } :
                { color: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-600', icon: 'TrendingUp' };

  const TheIcon = LucideIcons[theme.icon];

  // Grafik Tooltip Özelleştirme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800">
          <p className="text-gray-400 text-xs mb-1 font-medium">{payload[0].payload.date}</p>
          <p className="font-black text-sm" style={{ color: theme.color }}>
            {payload[0].value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ÜST BAŞLIK */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 transition-all">
          <LucideIcons.ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <TheIcon className={theme.text} size={24} /> {asset.name}
        </h1>
        <div className="w-10"></div> {/* Ortalamak için boş div */}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* FİYAT VE KAR/ZARAR KARTI */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Güncel Portföy Değeri</p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
            {totalCurrentValue.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} <span className="text-2xl text-gray-400">₺</span>
          </h2>
          
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
            <div className={`px-4 py-3 rounded-2xl flex items-center gap-3 ${isProfit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className={`p-2 rounded-full ${isProfit ? 'bg-green-200/50' : 'bg-red-200/50'}`}>
                {isProfit ? <LucideIcons.TrendingUp size={20} /> : <LucideIcons.TrendingDown size={20} />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Tüm Zamanlar Kâr/Zarar</p>
                <p className="font-black text-lg">{isProfit ? '+' : ''}{totalProfit.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺ (%{Math.abs(profitPercent)})</p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 rounded-2xl flex items-center gap-3 text-gray-700">
              <div className="p-2 rounded-full bg-white border border-gray-100"><LucideIcons.Briefcase size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sahip Olunan Adet</p>
                <p className="font-black text-lg">{asset.quantity} Birim</p>
              </div>
            </div>
          </div>
        </div>

        {/* EFSANEVİ 30 GÜNLÜK GRAFİK (AreaChart) */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <LucideIcons.LineChart className={theme.text} size={20} /> 30 Günlük Fiyat Trendi
          </h3>
          <div className="w-full h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} minTickGap={30} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 'bold' }} tickFormatter={(val) => `₺${val.toLocaleString()}`} width={60} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="price" stroke={theme.color} strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" activeDot={{ r: 6, fill: theme.color, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DETAYLI BİLGİLER KARTI */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Toplam Maliyet (Ödenen)</p>
            <p className="font-black text-gray-900 text-xl">{asset.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ortalama Birim Maliyet</p>
            <p className="font-black text-gray-900 text-xl">{(asset.totalCost / asset.quantity).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Anlık Birim Fiyatı</p>
            <p className="font-black text-[#04009A] text-xl">{livePrice > 0 ? livePrice.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : 'Hesaplanıyor...'} ₺</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alım Tarihi</p>
            <p className="font-bold text-gray-700 text-sm mt-1">{new Date(asset.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AssetDetail;