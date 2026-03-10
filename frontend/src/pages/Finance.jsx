import React from 'react';
import MarketAnalysis from '../components/Finance/MarketAnalysis/MarketAnalysis';

const Finance = () => {
  return (
    // Sayfanın iskeleti: max-w-7xl, ortalanmış, boşluklu
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      
      {/* 1. Modül: Piyasa Analizi Component'ini Çağırıyoruz */}
      <MarketAnalysis />



    </div>
  );
};

export default Finance;