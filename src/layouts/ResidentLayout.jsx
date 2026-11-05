import React, { useState } from 'react';
import { Home, FileText, User, LogOut, Menu, X, Sun } from 'lucide-react';

export default function ResidentLayout({ children, activeTab, setActiveTab, onLogout, residentName, userEmail }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR PARA SA DESKTOP */}
      <aside className="hidden md:flex w-64 bg-white text-gray-800 border-r border-gray-200 flex-col fixed h-full z-20 shadow-sm">
        
        {/* LOGO & PORTAL HEADER */}
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-amber-400 font-black text-base shadow-md">
            SA
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight text-gray-900">San Agustin</h3>
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">E-Governance Portal</p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Resident Menu</div>
        <nav className="flex-grow px-3 space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-amber-100/70 text-amber-900 border border-amber-200/60' 
                : 'text-gray-600 hover:bg-gray-100/80'
            }`}
          >
            <Home size={16} className={activeTab === 'dashboard' ? 'text-amber-700' : 'text-gray-400'} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer ${
              activeTab === 'request' 
                ? 'bg-amber-100/70 text-amber-900 border border-amber-200/60' 
                : 'text-gray-600 hover:bg-gray-100/80'
            }`}
          >
            <FileText size={16} className={activeTab === 'request' ? 'text-amber-700' : 'text-gray-400'} />
            <span>Request Document</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-amber-100/70 text-amber-900 border border-amber-200/60' 
                : 'text-gray-600 hover:bg-gray-100/80'
            }`}
          >
            <User size={16} className={activeTab === 'profile' ? 'text-amber-700' : 'text-gray-400'} />
            <span>Resident Profile</span>
          </button>
        </nav>

        {/* SIGNED IN CARD SA BABA (DESKTOP) */}
        <div className="p-4 m-3 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-3 shadow-inner">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Signed in as</p>
            <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{userEmail || 'resident@gmail.com'}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-black text-amber-400 text-[10px] font-black rounded-full tracking-widest uppercase">
              Resident
            </span>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <span className="flex items-center space-x-1">
              <Sun size={12} className="text-amber-500" />
              <span>32°C</span>
            </span>
            <span>Partly sunny</span>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER NA MAY HAMBURGER MENU */}
      <div className="md:hidden bg-white text-gray-900 fixed top-0 left-0 right-0 h-16 px-4 flex items-center justify-between z-30 border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-800 focus:outline-none p-2 rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center text-amber-400 font-black text-xs">
              SA
            </div>
            <h3 className="font-bold text-xs tracking-wider">San Agustin Portal</h3>
          </div>
        </div>
        <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-extrabold">
          Verified
        </span>
      </div>

      {/* MOBILE SLIDE-OUT MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 flex pt-16">
          <div className="bg-white text-gray-800 w-80 h-full flex flex-col border-r border-gray-200 shadow-2xl p-4 justify-between">
            <div className="space-y-4">
              {/* Header inside Mobile Drawer */}
              <div className="p-3 border-b border-gray-100 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-black flex items-center justify-center text-amber-400 font-black text-sm shadow-md">
                  SA
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">San Agustin</h3>
                  <p className="text-[11px] text-gray-400 font-medium">E-Governance Portal</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Resident Menu</div>
              <nav className="space-y-1.5">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    activeTab === 'dashboard' ? 'bg-amber-100 text-amber-900 border border-amber-200/60' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home size={16} className={activeTab === 'dashboard' ? 'text-amber-700' : 'text-gray-400'} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNavClick('request')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    activeTab === 'request' ? 'bg-amber-100 text-amber-900 border border-amber-200/60' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText size={16} className={activeTab === 'request' ? 'text-amber-700' : 'text-gray-400'} />
                  <span>Request Document</span>
                </button>

                <button
                  onClick={() => handleNavClick('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    activeTab === 'profile' ? 'bg-amber-100 text-amber-900 border border-amber-200/60' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User size={16} className={activeTab === 'profile' ? 'text-amber-700' : 'text-gray-400'} />
                  <span>Resident Profile</span>
                </button>
              </nav>
            </div>

            {/* SIGNED IN CARD SA BABA NG MOBILE DRAWER (Eksaktong disenyo gaya ng nasa larawan) */}
            <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-3 shadow-inner my-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Signed in as</p>
                <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{userEmail || 'resident@gmail.com'}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-black text-amber-400 text-[10px] font-black rounded-full tracking-widest uppercase">
                  Resident
                </span>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span className="flex items-center space-x-1">
                  <Sun size={12} className="text-amber-500" />
                  <span>32°C</span>
                </span>
                <span>Partly sunny</span>
              </div>
            </div>
          </div>
          {/* Overlay to close menu on click */}
          <div className="flex-grow" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col md:ml-64 w-full pt-16 md:pt-0">
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 px-8 items-center justify-between shadow-sm sticky top-0 z-10">
          <h1 className="text-sm font-black text-gray-900 uppercase tracking-wider">Barangay San Agustin - Resident Portal</h1>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            Verified Resident
          </span>
        </header>

        <div className="p-4 md:p-8 flex-grow overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}