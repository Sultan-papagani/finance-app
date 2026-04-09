import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiPost } from "../services/api";
import { Loader2, Search } from "lucide-react";

const AddTransaction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultCardId = searchParams.get("cardId");
  
  const [cards, setCards] = useState([]);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [exchangeRates, setExchangeRates] = useState(null); 
  
  const [selectedCard, setSelectedCard] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("expense"); 
  const [description, setDescription] = useState("");

  const [assetCategory, setAssetCategory] = useState("gold");
  const [assetName, setAssetName] = useState("");
  const [quantity, setQuantity] = useState("");
  
  const [goldPrices, setGoldPrices] = useState([]);
  const [selectedAssetPrice, setSelectedAssetPrice] = useState(0); 
  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet("/api/user/finances"); 
      if(data.cards) {
        setCards(data.cards);
        if (data.cards.length > 0) setSelectedCard(defaultCardId || data.cards[0].id); 
      }
      if(data.vault) setVaultBalance(data.vault.balance);

      const [goldData, ratesData] = await Promise.all([
        apiGet("/api/gold").catch(() => []),
        apiGet("/api/rates").catch(() => null)
      ]);
      setGoldPrices(goldData);
      setExchangeRates(ratesData);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssetSearchChange = (value) => {
    setAssetName(value);
    setSelectedAssetPrice(0); 
    setAmount("");

    if (!value.trim() || assetCategory === 'gold') {
      setSearchResults([]);
      return;
    }

    if (searchTimeout) clearTimeout(searchTimeout);

    setSearchTimeout(setTimeout(async () => {
      setIsSearching(true);
      try {
        if (assetCategory === 'crypto') {
          const res = await apiGet(`/api/crypto/search/${value}`);
          setSearchResults(res || []);
        } else if (assetCategory === 'stock') {
          const res = await apiGet(`/api/search/${value}`);
          setSearchResults(res || []);
        }
      } catch (err) {
        console.error("Arama hatası:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500)); 
  };

  const handleSelectAsset = async (item) => {
    setSearchResults([]);
    setIsLoading(true);
    
    try {
      if (assetCategory === 'crypto') {
        setAssetName(item.symbol.toUpperCase());
        const details = await apiGet(`/api/crypto/details/${item.id}`);
        const priceUsd = details.market_data.current_price.usd;
        const usdRate = exchangeRates ? Number(exchangeRates.USD) : 32.5; 
        setSelectedAssetPrice(priceUsd * usdRate);
      } 
      else if (assetCategory === 'stock') {
        setAssetName(item.symbol);
        const details = await apiGet(`/api/stock/${item.symbol}`);
        let price = details.info.close;
        if (!item.symbol.endsWith('.IS')) {
          const usdRate = exchangeRates ? Number(exchangeRates.USD) : 32.5;
          price = price * usdRate;
        }
        setSelectedAssetPrice(price);
      }
    } catch (error) {
      alert("Canlı fiyat çekilemedi, lütfen fiyatı manuel girin.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transactionType === 'buy_asset') {
      if (assetCategory === 'gold') {
        const goldItem = goldPrices.find(g => g.name === assetName);
        if (goldItem) {
          setSelectedAssetPrice(goldItem.sell);
          if (quantity) setAmount((goldItem.sell * Number(quantity)).toFixed(2));
          else setAmount("");
        }
      } else {
        if (selectedAssetPrice > 0 && quantity) {
          setAmount((selectedAssetPrice * Number(quantity)).toFixed(2));
        } else if (!quantity) {
          setAmount("");
        }
      }
    }
  }, [assetName, quantity, transactionType, assetCategory, goldPrices, selectedAssetPrice]);

  useEffect(() => {
    if (transactionType === 'buy_asset') {
      setAssetName(""); setQuantity(""); setAmount(""); setSelectedAssetPrice(0); setSearchResults([]);
    }
  }, [assetCategory, transactionType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null);

    const payload = { type: transactionType, amount: Number(amount) };

    if (transactionType === 'buy_asset') {
      payload.assetCategory = assetCategory;
      payload.assetName = assetName;
      payload.quantity = Number(quantity);
    } else {
      payload.cardId = selectedCard;
      payload.description = description;
    }

    try {
      await apiPost("/api/transactions", payload);
      alert(
        transactionType === 'buy_asset' ? "Varlık Kasadan Başarıyla Alındı! 💎" : 
        transactionType === 'withdraw_from_vault' ? "Para Kasadan Kartınıza Çekildi! 💸" :
        "İşlem başarıyla kaydedildi!"
      );
      navigate("/"); 
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <h1 className="text-2xl font-bold text-[#04009A] mb-6">Yeni İşlem Ekle</h1>
      {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 font-bold">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl mx-auto">
        
        {/* 🔥 5 SEÇENEKLİ İŞLEM MENÜSÜ 🔥 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">İşlem Türü</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-white p-2 rounded-xl border border-gray-200">
            <label className={`flex flex-col items-center gap-1 cursor-pointer p-3 rounded-lg transition-all ${transactionType === 'expense' ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="type" value="expense" checked={transactionType === "expense"} onChange={(e) => setTransactionType(e.target.value)} className="hidden"/>
              <span className={`text-xl ${transactionType === 'expense' ? 'grayscale-0' : 'grayscale opacity-50'}`}>🛒</span>
              <span className={`text-[10px] font-black uppercase tracking-wider ${transactionType === 'expense' ? 'text-red-600' : 'text-gray-500'}`}>Gider</span>
            </label>
            
            <label className={`flex flex-col items-center gap-1 cursor-pointer p-3 rounded-lg transition-all ${transactionType === 'income' ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="type" value="income" checked={transactionType === "income"} onChange={(e) => setTransactionType(e.target.value)} className="hidden"/>
              <span className={`text-xl ${transactionType === 'income' ? 'grayscale-0' : 'grayscale opacity-50'}`}>💵</span>
              <span className={`text-[10px] font-black uppercase tracking-wider ${transactionType === 'income' ? 'text-green-600' : 'text-gray-500'}`}>Gelir</span>
            </label>
            
            <label className={`flex flex-col items-center gap-1 cursor-pointer p-3 rounded-lg transition-all ${transactionType === 'transfer_to_vault' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="type" value="transfer_to_vault" checked={transactionType === "transfer_to_vault"} onChange={(e) => setTransactionType(e.target.value)} className="hidden"/>
              <span className={`text-xl ${transactionType === 'transfer_to_vault' ? 'grayscale-0' : 'grayscale opacity-50'}`}>🏦</span>
              <span className={`text-[10px] font-black uppercase tracking-wider text-center ${transactionType === 'transfer_to_vault' ? 'text-blue-600' : 'text-gray-500'}`}>Kasaya At</span>
            </label>

            {/* 🔥 YENİ: KASADAN ÇEK BUTONU 🔥 */}
            <label className={`flex flex-col items-center gap-1 cursor-pointer p-3 rounded-lg transition-all ${transactionType === 'withdraw_from_vault' ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="type" value="withdraw_from_vault" checked={transactionType === "withdraw_from_vault"} onChange={(e) => setTransactionType(e.target.value)} className="hidden"/>
              <span className={`text-xl ${transactionType === 'withdraw_from_vault' ? 'grayscale-0' : 'grayscale opacity-50'}`}>📤</span>
              <span className={`text-[10px] font-black uppercase tracking-wider text-center ${transactionType === 'withdraw_from_vault' ? 'text-purple-600' : 'text-gray-500'}`}>Kasadan Çek</span>
            </label>

            <label className={`flex flex-col items-center gap-1 cursor-pointer p-3 rounded-lg transition-all ${transactionType === 'buy_asset' ? 'bg-yellow-50 border border-yellow-300 shadow-sm' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="type" value="buy_asset" checked={transactionType === "buy_asset"} onChange={(e) => setTransactionType(e.target.value)} className="hidden"/>
              <span className={`text-xl ${transactionType === 'buy_asset' ? 'grayscale-0' : 'grayscale opacity-50'}`}>💎</span>
              <span className={`text-[10px] font-black uppercase tracking-wider text-center ${transactionType === 'buy_asset' ? 'text-yellow-600' : 'text-gray-500'}`}>Varlık Al</span>
            </label>
          </div>
        </div>

        {/* 💎 VARLIK ALIMI FORMU 💎 */}
        {transactionType === 'buy_asset' ? (
          <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-yellow-200">
              <span className="text-xs font-bold text-gray-500">Ana Kasa Bakiyesi:</span>
              <span className="font-black text-yellow-600 text-lg">{vaultBalance.toLocaleString('tr-TR')} ₺</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Yatırım Türü</label>
              <select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} className="p-3 border border-gray-200 rounded-xl bg-white font-bold outline-none focus:ring-2 focus:ring-yellow-400">
                <option value="gold">Altın</option>
                <option value="crypto">Kripto Para</option>
                <option value="stock">Hisse Senedi</option>
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-2 flex-[2] relative">
                <label className="text-sm font-semibold text-gray-700">Varlık Adı</label>
                {assetCategory === 'gold' ? (
                  <select value={assetName} onChange={(e) => setAssetName(e.target.value)} className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 bg-white font-semibold" required>
                    <option value="" disabled>Altın Türü Seçin</option>
                    {goldPrices.map(g => <option key={g.id} value={g.name}>{g.name} (₺{g.sell.toLocaleString('tr-TR', { maximumFractionDigits: 0 })})</option>)}
                  </select>
                ) : (
                  <div className="relative w-full">
                    <input 
                      type="text" value={assetName} onChange={(e) => handleAssetSearchChange(e.target.value)} 
                      placeholder={assetCategory === 'crypto' ? "Örn: Bitcoin, ETH..." : "Örn: THYAO, Apple..."} 
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 bg-white font-semibold pr-10" 
                      required autoComplete="off"
                    />
                    {isSearching && <Loader2 className="absolute right-3 top-3.5 animate-spin text-gray-400" size={18} />}
                    {!isSearching && assetName && searchResults.length === 0 && <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />}
                    
                    {searchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                        {searchResults.map((item, idx) => (
                          <div 
                            key={idx} onClick={() => handleSelectAsset(item)}
                            className="p-3 border-b border-gray-50 last:border-0 hover:bg-yellow-50 cursor-pointer flex flex-col"
                          >
                            <span className="font-bold text-gray-800">{item.symbol ? item.symbol.toUpperCase() : item.name}</span>
                            <span className="text-xs text-gray-500">{item.name} {item.exchange ? `(${item.exchange})` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-gray-700">Adet</label>
                <input type="number" min="0.00000001" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Örn: 2.5" className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 font-bold" required />
              </div>
            </div>

            <div className="flex flex-col gap-2 relative mt-2">
              <label className="text-sm font-semibold text-gray-700">Toplam Ödenen Tutar (₺)</label>
              <input 
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Hesaplanan tutar" 
                className={`p-3 border rounded-xl outline-none font-black text-xl text-yellow-700 ${selectedAssetPrice > 0 ? 'bg-gray-100 opacity-80 border-gray-200' : 'bg-white border-yellow-300 focus:ring-2 focus:ring-yellow-500'}`} 
                min="0.01" step="any" required readOnly={selectedAssetPrice > 0} 
              />
            </div>
          </div>
        ) : (
          /* 💳 NORMAL KART İŞLEMLERİ (VE KASADAN ÇEK) FORMU 💳 */
          <div className="space-y-5 animate-in fade-in">
            
            {/* Eğer Kasadan Çek Seçiliyse Bilgi Verelim */}
            {transactionType === 'withdraw_from_vault' && (
              <div className="flex justify-between items-center bg-purple-50 p-4 rounded-2xl border border-purple-200 mb-2">
                <span className="text-sm font-bold text-purple-600">Ana Kasa Bakiyesi:</span>
                <span className="font-black text-purple-700 text-xl">{vaultBalance.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                {transactionType === 'withdraw_from_vault' ? 'Paranın Aktarılacağı Kart' : 'İşlem Yapılacak Kart'}
              </label>
              <select value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)} className="p-3 border border-gray-300 rounded-xl bg-white font-bold outline-none focus:ring-2 focus:ring-[#04009A]" required>
                {cards.map(c => <option key={c.id} value={c.id}>{c.name} ({c.balance.toLocaleString('tr-TR')} ₺)</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                {transactionType === 'withdraw_from_vault' ? 'Kasadan Çekilecek Tutar (₺)' : 'Tutar (₺)'}
              </label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Örn: 500" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04009A] font-bold text-lg" min="1" required />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Açıklama (Opsiyonel)</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={transactionType === 'withdraw_from_vault' ? "Örn: Kasadan nakit ihtiyacı için çekildi" : "Örn: Maaş, Kira..."} className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04009A]" />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || (transactionType !== 'buy_asset' && !selectedCard)} 
          className={`mt-2 w-full text-white font-black py-4 rounded-xl transition-all shadow-lg hover:-translate-y-1 
            ${transactionType === 'buy_asset' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow-yellow-500/40' : 
              transactionType === 'withdraw_from_vault' ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/40' :
              'bg-[#04009A] hover:bg-blue-800'}`}
        >
          {isLoading ? "İşleniyor..." : (
            transactionType === 'buy_asset' ? "Varlığı Satın Al 💎" : 
            transactionType === 'withdraw_from_vault' ? "Kasadan Çek 📤" : 
            "İşlemi Kaydet"
          )}
        </button>

      </form>
    </div>
  );
};

export default AddTransaction;