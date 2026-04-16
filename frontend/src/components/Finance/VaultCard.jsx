import React, { useState, useEffect } from "react";
import { apiGet } from "../../services/api";
import * as LucideIcons from "lucide-react";

function VaultCard() {
  const [vaultBalance, setVaultBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchVault = async () => {
    try {
      const data = await apiGet("/api/user/finances");
      if (data.vault && data.vault.balance) {
        setVaultBalance(data.vault.balance);
      }
    } catch (error) {
      console.error("Kasa verisi çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
    // Diğer sayfalarda işlem yapıldığında kasanın güncellenmesi için 
    // her 5 saniyede bir sessizce kontrol eder (Gerçek zamanlı hissiyat)
    const interval = setInterval(fetchVault, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="animate-pulse h-[200px] bg-blue-100/50 dark:bg-gray-800 rounded-[40px] w-full max-w-5xl mx-auto mb-10" />;
  }

  return (
    <div className="w-full mb-10 px-4">
      <div 
        className="relative w-full max-w-5xl mx-auto rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden transition-all duration-500 hover:scale-[1.01]"
        style={{
          // 🔥 EFSANEVİ OKYANUS MAVİSİ GRADİENT 🔥
          background: 'linear-gradient(135deg, #04009A 0%, #1D4ED8 50%, #3B82F6 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(4, 0, 154, 0.5)'
        }}
      >
        {/* Arkadaki Parlama ve Silüet Efektleri */}
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-10 opacity-10 pointer-events-none -rotate-12">
          <LucideIcons.Shield size={240} className="text-white" strokeWidth={1} />
        </div>

        {/* Sol Kısım: Başlık ve İkon */}
        <div className="relative z-10 flex items-center gap-5 mb-8 md:mb-0">
          {/* Glassmorphism (Cam Efektli) İkon Kutusu */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
            <LucideIcons.Landmark size={40} className="text-white" />
          </div>
          <div>
            <h3 className="text-blue-200 font-black tracking-[0.2em] text-xs md:text-sm uppercase mb-1 drop-shadow-sm">
              Merkez Üssü
            </h3>
            <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight drop-shadow-md">
              Ana Varlık Kasası
            </h2>
          </div>
        </div>

        {/* Sağ Kısım: Devasa Bakiye */}
        <div className="relative z-10 text-left md:text-right">
          <p className="text-blue-200 font-bold text-sm md:text-base mb-2 uppercase tracking-widest drop-shadow-sm">
            Toplam Kasa Bakiyesi
          </p>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter drop-shadow-lg flex items-center gap-2">
            {vaultBalance.toLocaleString("tr-TR")} <span className="text-2xl md:text-3xl text-blue-200">₺</span>
          </h3>
        </div>

      </div>
    </div>
  );
}

export default VaultCard;