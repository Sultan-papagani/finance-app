import React from "react";
import { Sparkles } from "lucide-react";

const MicroSavings = () => {
  return (
    <div className="bg-gradient-to-r from-purple-500 dark:from-purple-600 to-indigo-600 dark:to-indigo-700 rounded-[24px] p-5 text-white flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shrink-0">
          <Sparkles size={24} className="text-purple-100" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Küsuratları Yuvarla</h3>
          <p className="text-xs text-purple-100 mt-0.5 font-medium opacity-90">
            Bugünkü harcamalarından artan <strong className="text-white">15 ₺</strong> hedefe aktarılsın mı?
          </p>
        </div>
      </div>
      <button 
        onClick={() => alert("15 ₺ hedefe başarıyla aktarıldı!")}
        className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-xl text-sm hover:scale-105 transition-transform shadow-sm"
      >
        Aktar
      </button>
    </div>
  );
};

export default MicroSavings;