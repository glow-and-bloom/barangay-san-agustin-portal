import React from 'react';
import { Home, FileText, User, LogOut } from 'lucide-react';

export default function ResidentLayout({ children, activeTab, setActiveTab, onLogout, residentName }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white border-r-2 border-gold-500 flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-black font-extrabold text-lg">
            SA
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wider">RESIDENT PORTAL</h3>
            <p className="text-xs text-gold-500 truncate max-w-[120px]">{residentName || 'Barangay Member'}</p>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'dashboard' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'request' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <FileText size={18} />
            <span>Request Document</span>
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
      <main className="flex-grow flex flex-col">
        <header className="bg-white border-b border-gray-200 h-16 px-8 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Barangay San Agustin - E-Governance</h1>
          <span className="text-xs bg-gold-100 text-gold-700 px-3 py-1 rounded-full font-bold">Verified Resident</span>
        </header>
        <div className="p-8 flex-grow overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}