import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout/AppLayout";

// Sayfaları içe aktarıyoruz
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Finance from "./pages/Finance";
import AddTransaction from "./pages/AddTransaction";
import History from "./pages/History";
import MyGoal from "./components/MyGoal/MyGoal";
import MyGoalDetail from "./components/MyGoal/MyGoalDetail";
import AddPayment from "./pages/AddPayment";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import CurrencyDetail from "./pages/CurrencyDetail";
import StockTerminalPage from "./pages/StockTerminalPage";
import CryptoTerminalPage from "./pages/CryptoTerminalPage";

import PersonalInfo from "./components/Profile/PersonalInfo";
import SecuritySettings from "./components/Profile/SecuritySettings";
import NotificationSettings from "./components/Profile/NotificationSettings";
import HelpCenter from "./components/Profile/HelpCenter";

import CardDetail from "./pages/CardDetail";

function App() {
  const hasToken = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* --- ANA YÖNLENDİRME --- */}
        {/* Siteye ilk girildiğinde: Token varsa doğrudan içeri (home), yoksa karşılama sayfasına (Index) */}
        <Route
          path="/"
          element={hasToken ? <Navigate to="/home" replace /> : <Index />}
        />

        {/* Sadece Giriş Sayfası */}
        <Route path="/login" element={<Login />} />

        {/* --- KORUMALI ROTALAR --- */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              {/* AppLayout sadece giriş yapmış kişilere render edilecek */}
              <AppLayout>
                <Routes>
                  {/* Dikkat: Home rotasını "/" yerine "/home" yaptık ki Index ile karışmasın */}
                  <Route path="/home" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/add-transaction" element={<AddTransaction />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/my-goal" element={<MyGoal />} />
                  <Route path="/my-goal/:id" element={<MyGoalDetail />} />
                  <Route path="/add-payment" element={<AddPayment />} />
                  <Route path="/detail" element={<CurrencyDetail />} />
                  <Route
                    path="/crypto-terminal"
                    element={<CryptoTerminalPage />}
                  />
                  <Route
                    path="/stock-terminal"
                    element={<StockTerminalPage />}
                  />

                  {/* Profile sub-routes */}
                  <Route path="/personal-info" element={<PersonalInfo />} />
                  <Route path="/security-settings" element={<SecuritySettings />} />
                  <Route path="/notification-settings" element={<NotificationSettings />} />
                  <Route path="/help-center" element={<HelpCenter />} />

                  <Route path="/card/:id" element={<CardDetail />} />

                  {/* Catch-all — must be last */}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
