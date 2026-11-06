import React from 'react';
import { LayoutDashboard, FileCheck, Users, BarChart3, LogOut } from 'lucide-react';

export default function AdminLayout({ children, activeTab, setActiveTab, onLogout, adminName }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white border-r-2 border-gold-500 flex flex-col z-10">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-black font-extrabold text-lg">
            SA
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wider">ADMIN PORTAL</h3>
            <p className="text-xs text-gold-500">{adminName || 'Barangay Staff'}</p>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'requests' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <FileCheck size={18} />
            <span>Document Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('transparency')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'transparency' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <BarChart3 size={18} />
            <span>Project & Finances</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        
        {/* =========================================
            BARANGAY LOGO BACKGROUND WATERMARK
           ========================================= */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img 
            src="logo.jfif" 
            alt="Barangay San Agustin Watermark" 
            className="w-[500px] h-[500px] object-contain opacity-5 filter grayscale contrast-125"
          />
        </div>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 px-8 flex items-center justify-between shadow-sm relative z-10">
          <h1 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Barangay Hall Management Console</h1>
          <span className="text-xs bg-black text-gold-500 px-3 py-1 rounded-full font-bold border border-gold-500">Official Access</span>
        </header>

        {/* Page Contents */}
        <div className="p-8 flex-grow overflow-y-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}