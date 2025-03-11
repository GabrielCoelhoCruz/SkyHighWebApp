import React, { useState, useEffect } from 'react';

/**
 * Welcome banner displayed at the top of the home page
 */
const WelcomeBanner = ({ user }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update time every second
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(timerId);
  }, []);
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl p-6 mb-6 shadow-lg text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Bem-vindo(a), {user?.nome || (user?.email ? user.email.split('@')[0] : 'Usuário')}!
          </h1>
          <p className="text-blue-100">Sky is the limit! 🌟</p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm font-medium">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner; 