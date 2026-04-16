import React from 'react';
import { Activity, ChevronRight, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StockTerminalComponent = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-[#04009A] dark:from-blue-900 to-[#007AFF] dark:to-blue-700 rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
      
      {/* Arka plan süslemeleri  */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 text-white opacity-[0.03] pointer-events-none transition-transform duration-1000 group-hover:scale-110 group-hover:-translate-y-4">
        <BarChart2 size={280} />
      </div>

      {/* Sol Taraf: Yazı ve Buton */}
      <div className="z-10 text-white max-w-xl w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
            <Activity size={28} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Hisse Terminali</h2>
        </div>
        
        <p className="text-blue-100 font-medium text-sm md:text-base leading-relaxed mb-8 opacity-90">
          Wall Street'in kalbine bağlanın. Binlerce hisse senedini gerçek zamanlı fiyatlar, hacim analizleri ve yapay zeka destekli piyasa momentumu ile anında keşfedin.
        </p>
        
        <button
          onClick={() => navigate('/stock-terminal')}
          className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_25px_rgba(0,0,0,0.2)] flex items-center gap-3 transform hover:-translate-y-1"
        >
          Terminali Başlat
          <ChevronRight size={20} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </button>
      </div>

      {/* Sağ Taraf*/}
      <div className="hidden lg:flex z-10 bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 w-80 flex-col gap-4 transform rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-white font-black text-2xl">AAPL</div>
            <div className="text-blue-200 text-xs font-bold mt-0.5">Apple Inc.</div>
          </div>
          <div className="bg-green-400/20 text-green-400 border border-green-400/30 px-2 py-1 rounded-lg text-xs font-black shadow-sm">
            +0.72%
          </div>
        </div>
        <div className="text-4xl font-black text-white mt-2">$173.50</div>
        
        {/* Sahte bir mini grafik efekti */}
        <div className="h-16 w-full mt-4 flex items-end gap-1.5 opacity-80">
          {[40, 30, 50, 40, 60, 50, 70, 80, 75, 90, 100].map((h, i) => (
            <div key={i} className="bg-green-400 rounded-t-sm w-full transition-all duration-700 delay-75 group-hover:bg-green-300" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default StockTerminalComponent;