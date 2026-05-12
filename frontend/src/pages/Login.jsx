import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("admin");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsRegister(!isRegister);
    setError("");
    setSuccess("");
    if (!isRegister) {
      // Register moduna geçerken inputları temizle
      setUsername("");
      setEmail("");
      setPassword("");
    } else {
      // Login moduna geçerken varsayılan admin'i getir
      setEmail("admin");
      setPassword("admin");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const endpoint = isRegister ? "/register" : "/login";
      const bodyData = isRegister 
        ? { username, email, password }
        : { email, password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegister) {
          // Kayıt başarılı oldu, arka planda otomatik giriş yapalım
          const loginResponse = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            localStorage.setItem("token", loginData.token);
            navigate("/home");
          } else {
            setError("Kayıt başarılı ancak otomatik giriş yapılamadı. Lütfen giriş yapın.");
            setIsRegister(false);
          }
        } else {
          localStorage.setItem("token", data.token);
          // window.location.href = "/home" yerine navigate
          navigate("/home");
        }
      } else {
        setError(data.message || data.error || "Bir hata oluştu.");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı. Backend açık mı?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-6 transition-all duration-300">
        
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {isRegister ? "Hesap Oluştur" : "Hesabınıza Giriş Yapın"}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isRegister 
              ? "Finansal yolculuğunuza başlamak için hemen kayıt olun."
              : <span>Şimdilik e-posta <span className="font-semibold text-gray-800 dark:text-gray-200">"admin"</span>, şifre <span className="font-semibold text-gray-800 dark:text-gray-200">"admin"</span> olarak giriver.</span>}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-4 rounded-2xl text-center font-bold border border-red-100 dark:border-red-800 animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm p-4 rounded-2xl text-center font-bold border border-green-100 dark:border-green-800 animate-in fade-in zoom-in duration-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          
          {isRegister && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                İsim / Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isRegister}
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all outline-none font-bold"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              E-posta / Giriş Adı
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all outline-none font-bold"
              placeholder="admin veya ornek@mail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all outline-none font-bold"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-black py-4 px-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center mt-2"
          >
            {isLoading ? (
              <span className="animate-pulse">İşlem yapılıyor...</span>
            ) : (
              isRegister ? "Kayıt Ol" : "Giriş Yap"
            )}
          </button>
        </form>

        <div className="pt-4 text-center border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {isRegister ? "Zaten hesabınız var mı?" : "Hesabınız yok mu?"}{" "}
            <button
              type="button"
              onClick={handleToggle}
              className="text-[#007AFF] hover:text-blue-700 dark:hover:text-blue-400 font-bold transition-colors"
            >
              {isRegister ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;