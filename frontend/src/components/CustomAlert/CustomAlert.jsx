import React, { useState, useEffect } from "react";

const CustomAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [confirms, setConfirms] = useState([]);

  useEffect(() => {
    // Orjinal fonksiyonları yedekle
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;

    // alert'i ez
    window.alert = (message) => {
      const id = Date.now() + Math.random();
      setAlerts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      }, 5000);
    };

    // confirm'i ez (Promise döner)
    window.confirm = (message) => {
      return new Promise((resolve) => {
        const id = Date.now() + Math.random();
        setConfirms((prev) => [...prev, { id, message, resolve }]);
      });
    };

    return () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
    };
  }, []);

  const handleConfirm = (id, result) => {
    setConfirms((prev) => {
      const confirmItem = prev.find(c => c.id === id);
      if (confirmItem) {
        confirmItem.resolve(result);
      }
      return prev.filter(c => c.id !== id);
    });
  };

  if (alerts.length === 0 && confirms.length === 0) return null;

  return (
    <>
      {/* ALERTS */}
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none w-[90%] max-w-md">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl text-center pointer-events-auto transition-all duration-500 ease-in-out"
            style={{
              animation: "slideDown 0.3s ease-out forwards",
              boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.5)"
            }}
          >
            <p className="font-medium text-sm md:text-base">{alert.message}</p>
          </div>
        ))}
      </div>

      {/* CONFIRMS */}
      {confirms.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 pointer-events-auto backdrop-blur-sm" style={{ animation: "fadeIn 0.2s ease-out" }}>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[24px] shadow-2xl max-w-sm w-[90%] p-6 flex flex-col gap-6 text-center transform transition-all scale-100" style={{ animation: "zoomIn 0.2s ease-out" }}>
            <p className="text-gray-800 dark:text-white font-bold text-lg leading-snug">{confirms[0].message}</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => handleConfirm(confirms[0].id, false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold transition-all"
              >
                İptal
              </button>
              <button 
                onClick={() => handleConfirm(confirms[0].id, true)}
                className="flex-1 py-3 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 transition-all"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0.9; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </>
  );
};

export default CustomAlert;
