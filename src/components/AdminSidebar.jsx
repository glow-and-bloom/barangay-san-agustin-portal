import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  FileBarChart, 
  Settings, 
  History, 
  LogOut,
  Bell,
  Award,
  MessageSquare,
  Wrench,
  Inbox
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onLogout, userEmail }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requested-documents', label: 'Requested Documents', icon: Inbox }, // Dito muna papasok ang mga bagong request mula sa public landing page
    { id: 'requests', label: 'Manage Requests', icon: FileText },             // Pagkatapos ma-approve, dito na mapupunta
    { id: 'residents', label: 'Resident Records', icon: Users },
    { id: 'financials', label: 'Projects & Financials', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements & MV', icon: Bell },
    { id: 'officials', label: 'Barangay Officials', icon: Award },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'logs', label: 'Activity Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 via-white to-amber-100/60 backdrop-blur-xl text-zinc-800 border-r border-amber-200 select-none font-sans shadow-2xl">
      
      {/* LOGO & HEADER */}
      <div className="p-6 border-b border-amber-200/60 flex flex-col items-center text-center bg-amber-100/30">
        <div className="w-16 h-16 rounded-full bg-white backdrop-blur-md p-1 mb-3 shadow-lg flex items-center justify-center border-2 border-amber-400 overflow-hidden shadow-amber-300/20">
          <img 
            src="logo.jfif" 
            alt="Barangay Logo" 
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        
        <h2 className="font-black text-xs text-zinc-900 tracking-wider uppercase">
          BRGY. SAN AGUSTIN PORTAL
        </h2>
        <p className="text-[11px] text-amber-700 mt-0.5 font-extrabold">
          Administrator
        </p>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-3 flex-1 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-black uppercase tracking-wider text-amber-800/70 mb-2">
          Management Modules
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 shadow-md shadow-amber-400/30 font-black border border-amber-300'
                  : 'text-zinc-700 hover:bg-amber-100/50 hover:text-zinc-950'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-zinc-950' : 'text-amber-600'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-amber-200/60 bg-amber-50/50 backdrop-blur-md">
        <div className="mb-2 px-1">
          <p className="text-[10px] font-black text-amber-800/70 uppercase">Signed in as</p>
          <p className="text-xs font-bold text-zinc-900 truncate mt-0.5">{userEmail || 'admin.sanagustin@gmail.com'}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition cursor-pointer border border-red-200"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}