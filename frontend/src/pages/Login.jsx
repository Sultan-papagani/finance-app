// src/pages/Login.jsx
import React, { useState } from "react";

function Login() {
  // Test için "admin" dolu geliyor
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estetik için ufak bir yüklenme durumu

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/home";
      } else {
        setError(data.message || "Giriş başarısız oldu.");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı. Backend açık mı?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Arka plan rengi ve tam ekran ortalama (Flexbox)
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      {/* Form Kartı */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Başlık ve Açıklama */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Hesabınıza Giriş Yapın
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Şimdilik kullanıcı adı <span className="font-semibold text-gray-800">"admin"</span>, şifre <span className="font-semibold text-gray-800">"admin"</span> olarak giriver.
          </p>
        </div>

        {/* Hata Mesajı Kutusu */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* Form Alanı */}
        <form onSubmit={handleLogin} className="space-y-5 mt-4">
          
          {/* Email / Kullanıcı Adı Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none text-gray-900 bg-gray-50 focus:bg-white"
              placeholder="Kullanıcı adınızı girin"
            />
          </div>

          {/* Şifre Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none text-gray-900 bg-gray-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center"
          >
            {isLoading ? (
              <span className="animate-pulse">Giriş Yapılıyor...</span>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;