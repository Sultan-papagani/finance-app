import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout/AppLayout";
import MyGoal from "./components/MyGoal/MyGoal";
import MyGoalDetail from "./components/MyGoal/MyGoalDetail";

// Sayfaları içe aktarıyoruz
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Finance from "./pages/Finance";
import AddTransaction from "./pages/AddTransaction";
import History from "./pages/History";

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/history" element={<History />} />
          <Route path="/my-goal" element={<MyGoal />} />
          <Route path="/my-goal/:id" element={<MyGoalDetail />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
