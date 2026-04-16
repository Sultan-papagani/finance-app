import React, { createContext, useContext, useState, useEffect } from "react";
import { apiGet, apiPatch } from "../services/api";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "light", toggleTheme: () => {}, isDark: false };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Oncelikle localStorage'dan oku (hizli yukleme icin)
    return localStorage.getItem("app-theme") || "light";
  });

  // Backend'den tema ayarini yukle
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiGet("/api/user/profile")
        .then((data) => {
          if (data.theme) {
            setTheme(data.theme);
            localStorage.setItem("app-theme", data.theme);
          }
        })
        .catch(() => {});
    }
  }, []);

  // HTML elementine dark class ekle/kaldir
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await apiPatch("/api/user/theme", { theme: newTheme });
    } catch (err) {
      console.error("Tema kaydedilemedi:", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
