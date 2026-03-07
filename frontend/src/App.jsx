import React from "react";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AppLayout from "./components/AppLayout/AppLayout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import "./app.css"

/*
App.jsx
sitenin entry point'i
AppLayout'un içini kullanın.
*/

function App() {
  {/* Tüm Site */}
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;