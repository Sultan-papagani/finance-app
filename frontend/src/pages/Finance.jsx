import React from 'react';
import MarketAnalysis from '../components/Finance/MarketAnalysis/MarketAnalysis';
import StockTerminal from '../components/Finance/StockTerminal/StockTerminal';
const Finance = () => {
  return (
    // Sayfanın iskeleti: max-w-7xl, ortalanmış, boşluklu
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      
      {/* 1. Modül: Piyasa Analizi Component'ini Çağırıyoruz */}
      <MarketAnalysis />
      {/* 2. Modül: Hisse Senedi Terminali Component'ini Çağırıyoruz */}
      <StockTerminal />


    </div>
  );
};

export default Finance;