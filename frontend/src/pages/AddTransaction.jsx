import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddTransaction = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Ekran genişliği 768px veya daha büyükse (masaüstü/tablet ise) Ana Sayfaya yönlendir!
    if (window.innerWidth >= 768) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#04009A]">Yeni İşlem Ekle</h1>
      <p className="mt-4 text-gray-600">Bu sayfa sadece mobil ekranlar için tasarlandı!</p>
    </div>
  );
};

export default AddTransaction;