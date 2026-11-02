import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Bell, 
  Activity, 
  LogOut, 
  Building2,
  CloudSun
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onLogout, userEmail }) {
  const menuItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'residents', label: 'Resident Records', icon: Users },
    { id: 'requests', label: 'Document Requests', icon: FileText },
    { id: 'financials', label: 'Financial Monitoring', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0 min-h-screen text-gray-700 font-sans select-none">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200 flex items-center space-x-3 bg-white">
        <div className="w-10 h-10 rounded-xl bg-black text-gold-500 flex items-center justify-center font-black shadow-md border border-gold-500/30">
          <Building2 size={20} />
        </div>
        <div>
          <h1 className="font-extrabold text-sm text-gray-900 tracking-tight leading-none">San Agustin</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">E-Governance Portal</p>
        </div>
      </div>

      {/* Navigation Group Title */}
      <div className="px-6 pt-6 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Administration
        </span>
      </div>

      {/* Menu Links */}
      <nav className="flex-grow px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-amber-100/70 text-amber-900 shadow-sm border border-amber-200/60' 
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-amber-800' : 'text-gray-500'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / User Session Card */}
      <div className="p-4 m-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Signed in as</p>
          <p className="text-xs font-semibold text-gray-900 truncate mt-0.5">
            {userEmail || 'admin.sanagustin@gmail.com'}
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-black text-gold-500 text-[10px] font-extrabold rounded tracking-wider uppercase">
            Admin
          </span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition border border-red-100"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>

        {/* Weather / Subic Widget */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-gray-500 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <CloudSun size={14} className="text-amber-500" />
            <span>32°C</span>
          </div>
          <span className="text-gray-400">Partly sunny</span>
        </div>
      </div>

    </aside>
  );
}