import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Sun
} from 'lucide-react';

export default function ResidentLayout({
  children,
  activeTab,
  setActiveTab,
  onLogout,
  residentName,
  userEmail
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'request', label: 'Request Document', icon: FileText },
    { id: 'profile', label: 'Resident Profile', icon: User }
  ];

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const renderNavigation = () => (
    <nav className="px-3 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
              isActive
                ? 'bg-amber-100 text-amber-900 border border-amber-200 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon
              size={19}
              className={isActive ? 'text-amber-700' : 'text-gray-500'}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const renderUserCard = () => (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Signed in as
        </p>

        <p className="text-sm font-bold text-gray-900 truncate mt-1">
          {userEmail || 'resident@gmail.com'}
        </p>

        <span className="inline-block mt-2 px-2.5 py-1 bg-black text-amber-400 text-[10px] font-black rounded-md uppercase">
          Resident
        </span>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold transition cursor-pointer"
      >
        <LogOut size={16} />
        Sign Out
      </button>

      <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Sun size={14} className="text-amber-500" />
          32°C
        </span>
        <span>Partly sunny</span>
      </div>
    </div>
  );

  const renderBrand = () => (
    <div className="p-5 border-b border-gray-200 flex items-center gap-3 bg-white">
      <div className="w-12 h-12 shrink-0 rounded-xl bg-black flex items-center justify-center text-amber-400 font-black text-lg shadow-md border border-amber-500">
        SA
      </div>

      <div className="min-w-0">
        <h2 className="font-extrabold text-base text-gray-900">
          San Agustin
        </h2>
        <p className="text-xs text-gray-500">
          E-Governance Portal
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans overflow-hidden relative">

      {/* =========================================================
          FIXED WATERMARK LOGO SA LIKOD (Isang beses na lang lalabas)
         ========================================================= */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 md:pl-32">
        <img
          src="logo.jfif"
          alt="Barangay Watermark"
          className="w-[min(80vw,650px)] h-[min(80vw,650px)] object-contain opacity-[0.08]"
        />
      </div>

      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex-col shadow-sm">
        {renderBrand()}

        <div className="px-6 pt-7 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Resident Menu
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderNavigation()}
        </div>

        <div className="p-3 mt-auto">
          {renderUserCard()}
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[100] bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className="absolute top-0 left-0 bottom-0 w-[min(320px,85vw)] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              {renderBrand()}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mr-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <div className="px-6 pt-7 pb-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Resident Menu
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {renderNavigation()}
            </div>

            <div className="p-3 mt-auto">
              {renderUserCard()}
            </div>
          </aside>
        </div>
      )}

      {/* Main container */}
      <main className="min-w-0 flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto relative z-10 bg-transparent">

        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 h-16 px-4 sm:px-6 md:px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 shrink-0 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={23} />
            </button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                Barangay San Agustin
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                Resident Management Portal
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-bold shrink-0">
            Verified Resident
          </span>
        </header>

        <div className="flex-1 min-w-0 w-full p-3 sm:p-5 md:p-8 relative z-10">
          <div className="w-full max-w-7xl mx-auto min-w-0">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
}