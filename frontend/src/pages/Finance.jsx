import React from 'react';
import MarketAnalysis from '../components/Finance/MarketAnalysis/MarketAnalysis';
import StockTerminal from '../components/Finance/StockTerminal/StockTerminal';
import CryptoWidget from '../components/Finance/crypto/CryptoWidget'; 
const Finance = () => {
  return (
    // Sayfanın iskeleti: max-w-7xl, ortalanmış, boşluklu
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      
      {/* 1. Modül: Piyasa Analizi Component'ini Çağırıyoruz */}
      <MarketAnalysis />
      {/* 2. Modül: Hisse Senedi Terminali Component'ini Çağırıyoruz */}
      <StockTerminal />
      {/* 3. Modül: Kripto Para Widget'ı Component'ini Çağırıyoruz */}
      <CryptoWidget />


    </div>
  );
};

export default Finance;