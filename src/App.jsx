import React from "react";
import AppLayout from "./components/AppLayout/AppLayout";
import "./app.css"

/*
App.jsx
sitenin entry point'i
AppLayout'un içini kullanın.
*/

function App() {
  return (
    <AppLayout>
    {/* Tüm Site */}
    <div className="flex justify-center min-h-screen pt-8">
      <div className="max-w-6xl w-full px-4">
        <h1 className="text-3xl font-bold">Sayfa İçeriği</h1>
        <p className="mt-4">Bu div tüm sitenin gösterileceği kısım.</p>
      </div>
    </div>
    </AppLayout>
  );
}

export default App;