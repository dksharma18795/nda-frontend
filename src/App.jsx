import React from 'react';
import AttendanceRoster from './components/AttendanceRoster';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">📝 CleanReport NDA Register</h1>
          <span className="text-sm font-medium bg-blue-800 py-1 px-3 rounded-full shadow-inner">
            SaaS Edition v1.0
          </span>
        </div>
      </nav>

      <main className="container mx-auto p-6 mt-8">
        
        {/* 🌟 SIMPLE WELCOME BANNER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-2xl font-extrabold text-gray-800">
            📝 Welcome to the Night Duty Allowance Calculator Tool
          </h2>
          <p className="text-gray-600 mt-2 font-medium text-lg">
            Automated 7th CPC Multi-Month NDA Generator. Generate professional bills in Excel, Word, and PDF instantly.
          </p>
        </div>

        {/* Yahan hamara naya Smart Roster render hoga */}
        <AttendanceRoster />

      </main>
    </div>
  );
}

export default App;