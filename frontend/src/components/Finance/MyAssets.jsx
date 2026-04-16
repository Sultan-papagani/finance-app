import React, { useState, useEffect } from "react";
import { apiGet, apiPatch } from "../../services/api";
import { Coins, Bitcoin, TrendingUp, Gem, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 🔥 Yönlendirme kütüphanesi

function MyAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveData, setLiveData] = useState({}); 
  const navigate = useNavigate(); // 🔥 Yönlendirme motoru tanımlandı

  const fetchAssetsAndPrices = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      // Kullanıcının varlıklarını çek
      const data = await apiGet("/api/user/finances");
      const userAssets = data.assets || [];
      setAssets(userAssets);

      // Canlı piyasa verilerini çek
      const [goldList, rates] = await Promise.all([
        apiGet("/api/gold").catch(() => []),
        apiGet("/api/rates").catch(() => ({ USD: 32.5 }))
      ]);

      const prices = {};
      const usdToTry = Number(rates.USD) || 32.5;

      for (const asset of userAssets) {
        try {
          if (asset.category === 'gold') {
            const gold = goldList.find(g => g.name === asset.name);
            prices[asset.id] = gold ? gold.sell : 0; 
          } 
          else if (asset.category === 'crypto') {
            prices[asset.id] = asset.totalCost / asset.quantity; 
            const cryptoRes = await apiGet(`/api/crypto/search/${asset.name.toLowerCase()}`);
            if (cryptoRes && cryptoRes[0]) {
              const details = await apiGet(`/api/crypto/details/${cryptoRes[0].id}`);
              prices[asset.id] = details.market_data.current_price.usd * usdToTry;
            }
          } 
          else if (asset.category === 'stock') {
            const stockRes = await apiGet(`/api/stock/${asset.name}`);
            let price = stockRes.info.close;
            if (!asset.name.endsWith('.IS')) price *= usdToTry;
            prices[asset.id] = price;
          }
        } catch (e) { console.error(`${asset.name} fiyatı alınamadı`, e); }
      }
      setLiveData(prices);
    } catch (err) {
      console.error("Varlıklar güncellenemedi", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssetsAndPrices();
    const interval = setInterval(() => fetchAssetsAndPrices(), 120000); 
    return () => clearInterval(interval);
  }, []);

  const handleDeleteAsset = async (e, assetId) => {
    e.preventDefault();
    e.stopPropagation(); // 🔥 ÇOK ÖNEMLİ: Silme butonuna basınca detay sayfasına gitmeyi engeller!

    if (!window.confirm("Bu varlığı silmek istediğinize emin misiniz?")) return;
    
    try {
      const updatedAssets = assets.filter(a => a.id !== assetId);
      await apiPatch("/api/user/finances", { assets: updatedAssets }); //
      setAssets(updatedAssets);
    } catch (err) {
      console.error(err);
      alert("Silme işlemi başarısız.");
    }
  };

  if (loading) return <div className="animate-pulse h-24 bg-gray-100 dark:bg-gray-800 rounded-[24px] mx-4 mb-8" />;
  if (assets.length === 0) return null;

  const getIcon = (category) => {
    switch(category) {
      case 'gold': return <Coins className="text-yellow-600" size={20} />;
      case 'crypto': return <Bitcoin className="text-orange-600" size={20} />;
      case 'stock': return <TrendingUp className="text-blue-600" size={20} />;
      default: return <Gem className="text-purple-600" size={20} />;
    }
  };

  const totalCurrentValue = assets.reduce((sum, a) => sum + (liveData[a.id] ? liveData[a.id] * a.quantity : Number(a.totalCost)), 0);

  return (
    <div className="w-full px-4 mb-12">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Gem size={24} className="text-blue-700 dark:text-blue-400" /> Portföyüm
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-black text-blue-700 dark:text-blue-400 text-lg">{totalCurrentValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</span>
          <button
            onClick={() => fetchAssetsAndPrices(true)}
            disabled={refreshing}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50 text-gray-600 dark:text-gray-400"
            title="Piyasayı Güncelle"
          >
            {refreshing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {assets.map(asset => {
          const currentUnitPrice = liveData[asset.id] || 0;
          const currentTotalValue = currentUnitPrice > 0 ? currentUnitPrice * asset.quantity : asset.totalCost;
          const assetProfit = currentTotalValue - asset.totalCost;
          const isProfit = assetProfit >= 0;

          return (
            <div
              key={asset.id}
              // 🔥 YENİ: Kutuya tıklandığında detay sayfasına yönlendirir
              onClick={() => navigate(`/asset/${asset.id}`)}
              className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all gap-4 sm:gap-0"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  asset.category === 'gold' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
                  asset.category === 'crypto' ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-blue-50 dark:bg-blue-900/30'
                }`}>
                  {getIcon(asset.category)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{asset.name}</h3>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-0.5">{asset.quantity} Adet/Gram</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-16 sm:pl-0">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Değer</p>
                  <p className="font-black text-gray-800 dark:text-gray-200">{currentTotalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</p>
                </div>

                <div className={`text-right min-w-[70px] ${isProfit ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-gray-400 dark:text-gray-500">Durum</p>
                  <p className="font-black text-sm">
                    {isProfit ? '+' : ''}{assetProfit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                  </p>
                </div>

                <button
                  onClick={(e) => handleDeleteAsset(e, asset.id)}
                  className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  title="Varlığı Sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyAssets;