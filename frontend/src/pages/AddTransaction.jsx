import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../services/api";
import { addTransaction } from "../services/goalService";


const AddTransaction = () => {
  const navigate = useNavigate();
  
  // Form ve Data State'leri
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("expense"); // 'income' (Gelir) veya 'expense' (Gider)
  const [description, setDescription] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Masaüstü kontrolü
    if (window.innerWidth >= 768) {
      navigate("/");
    }

    // 2. Component yüklendiğinde kullanıcının kartlarını Backend'den getir
    fetchCards();
  }, [navigate]);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      // Senin kendi apiGet fonksiyonunu kullanıyoruz, base URL zaten içinde!
      const data = await apiGet("/api/cards"); 
      
      setCards(data);
      
      // Eğer kullanıcının kartı varsa, ilk kartı varsayılan olarak seç
      if (data.length > 0) {
        setSelectedCard(data[0].id); // Dikkat: backend'de id'yi "card_123" diye ürettik, o yüzden .id kullanıyoruz.
      }
    } catch (err) {
      setError(err.message);
      console.error("Kart çekme hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // BACKEND İŞLEMİ 2: Form Gönderildiğinde İşlemi Kaydet (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const newTransaction = {
      cardId: selectedCard,
      amount: Number(amount),
      type: transactionType,
      description: description,
      date: new Date().toISOString()
    };

    try {
      await addTransaction(newTransaction); // Bitti gitti!
      alert("İşlem başarıyla kaydedildi!");
      navigate("/"); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-[#04009A] mb-6">Yeni İşlem Ekle</h1>
      
      {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Kart Seçimi */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">İşlem Yapılacak Kart/Hesap</label>
          <select 
            value={selectedCard} 
            onChange={(e) => setSelectedCard(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#04009A]"
            required
          >
            <option value="" disabled>Kart Seçiniz</option>
            <option value="" disabled>Kart Seçiniz</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} (Bakiye: {card.balance} ₺)
              </option>
            ))}
          </select>
        </div>

        {/* İşlem Türü (Gelir/Gider) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">İşlem Türü</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="type" 
                value="expense"
                checked={transactionType === "expense"}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-4 h-4 text-[#04009A]"
              />
              <span className="text-red-500 font-medium">Gider (Para Çıkar)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="type" 
                value="income"
                checked={transactionType === "income"}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-4 h-4 text-[#04009A]"
              />
              <span className="text-green-500 font-medium">Gelir (Para Ekle)</span>
            </label>
          </div>
        </div>

        {/* Miktar */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Tutar (₺)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Örn: 500"
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04009A]"
            min="1"
            required
          />
        </div>

        {/* Açıklama */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Açıklama (Opsiyonel)</label>
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Örn: Market alışverişi, Maaş yatışı..."
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04009A]"
          />
        </div>

        {/* Gönder Butonu */}
        <button 
          type="submit" 
          disabled={isLoading || !selectedCard}
          className="mt-4 w-full bg-[#04009A] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "İşleniyor..." : "İşlemi Kaydet"}
        </button>

      </form>
    </div>
  );
};

export default AddTransaction;