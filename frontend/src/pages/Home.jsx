import React, { useState, useEffect } from "react";
import HomeHeader from "../components/HomeHeader";
import MyGoalsWidget from "../components/MyGoal/MyGoalWidget";
import UpcomingPayments from "../components/UpcomingPayments/UpcomingPayments";
import { apiGet } from "../services/api";
import CardView from "../components/CardView/CardView";

const Home = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    apiGet('/api/user/profile')
      .then(data => setUsername(data.username))
      .catch(() => setUsername(""));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">

      <HomeHeader />

      <div className="flex justify-center mt-8">
        <div className="max-w-6xl w-full px-6 space-y-6">

          {/*
          <div className="bg-white p-6 md:p-8 rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-black text-[#04009A]">
                Hoş Geldin{username ? `, ${username}` : ""}! 👋
              </h1>
              <p className="mt-2 text-gray-500 font-medium">
                Bugün finanslarını kontrol etmeye hazır mısın?
              </p>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          </div>*/}

          <CardView/>

          <MyGoalsWidget />

          <UpcomingPayments />

        </div>
      </div>
    </div>
  );
};

export default Home;
