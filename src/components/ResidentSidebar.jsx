import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  UserCheck,
  LogOut,
  Building2,
  CloudSun
} from 'lucide-react';

export default function ResidentSidebar({
  activeTab,
  setActiveTab,
  onLogout,
  userEmail
}) {
  const menuItems = [
    { id: 'dashboard', label: 'My Requests', icon: LayoutDashboard },
    { id: 'request', label: 'Request Document', icon: FilePlus },
    { id: 'profile', label: 'Resident Profile', icon: UserCheck }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col min-h-full text-gray-700 font-sans">

      <div className="p-5 border-b border-gray-200 flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-black text-amber-400 flex items-center justify-center shadow-md border border-amber-500/30">
          <Building2 size={21} />
        </div>

        <div className="min-w-0">
          <h1 className="font-extrabold text-sm text-gray-900">
            San Agustin
          </h1>
          <p className="text-xs text-gray-500">
            E-Governance Portal
          </p>
        </div>
      </div>

      <div className="px-5 pt-7 pb-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Resident Services
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-amber-100 text-amber-900 border border-amber-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={19} className={isActive ? 'text-amber-800' : 'text-gray-500'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 mt-auto">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              Signed in as
            </p>

            <p className="text-xs font-bold text-gray-900 truncate mt-1">
              {userEmail || 'resident@gmail.com'}
            </p>

            <span className="inline-block mt-2 px-2.5 py-1 bg-black text-amber-400 text-[10px] font-extrabold rounded uppercase">
              Resident
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition border border-red-200"
          >
            <LogOut size={15} />
            Sign Out
          </button>

          <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <CloudSun size={15} className="text-amber-500" />
              32°C
            </span>
            <span>Partly sunny</span>
          </div>

        </div>
      </div>

    </aside>
  );
}