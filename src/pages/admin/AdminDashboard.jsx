import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Wallet, 
  Bell, 
  ShieldCheck, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard({ requests = [], residents = [], projects: initialProjects = [], notifications = [], onNavigate }) {
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjects(initialProjects);
    } else {
      const fetchProjectsDirectly = async () => {
        let { data } = await supabase.from('barangay_projects').select('*');
        if (!data || data.length === 0) {
          const res = await supabase.from('projects').select('*');
          data = res.data;
        }
        if (data) setProjects(data);
      };
      fetchProjectsDirectly();
    }
  }, [initialProjects]);

  const totalRequests = requests.length;
  const totalResidents = residents.length;
  
  // Kinakalkula ang kabuuang alokasyon ng badyet mula sa database
  const totalBudget = projects.reduce((acc, curr) => acc + Number(curr.allocated_budget || 0), 0);
  
  const totalNotifications = notifications.length;
  const recentRequests = requests.slice(0, 5);

  const handleRoute = (target) => {
    if (onNavigate) {
      onNavigate(target);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. DASHBOARD OVERVIEW BANNER */}
      <div className="relative bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg overflow-hidden flex flex-col justify-center">
        
        {/* Background Barangay Logo Watermark */}
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-15 pointer-events-none w-40 h-40 rounded-full overflow-hidden flex items-center justify-center">
          <img 
            src="logo.jfif" 
            alt="Barangay San Agustin Logo" 
            className="w-full h-full object-cover filter brightness-125"
          />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase mb-1">
              <ShieldCheck size={13} />
              <span>Admin Portal • Barangay San Agustin</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Dashboard Overview
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Castillejos, Zambales • Monitoring resident database and document application requests in real time.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CLICKABLE STATS METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Document Requests -> managerequests */}
        <div 
          onClick={() => handleRoute('managerequests')}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold border border-amber-100 group-hover:scale-105 transition">
              <FileText size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md">Total</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Document Requests</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-black text-zinc-900">{totalRequests}</p>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5 group-hover:underline">
              Manage requests <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        {/* Financial Monitoring -> projectfinancial (Nakatutok na sa Total Budget) */}
        <div 
          onClick={() => handleRoute('projectfinancial')}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold border border-emerald-100 group-hover:scale-105 transition">
              <Wallet size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">Budget</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Financial Monitoring</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-emerald-800">₱{totalBudget.toLocaleString()}</p>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 group-hover:underline">
              View budget <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        {/* Notification -> notification */}
        <div 
          onClick={() => handleRoute('notification')}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-sky-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold border border-sky-100 group-hover:scale-105 transition">
              <Bell size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md">Alerts</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Notification</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-black text-zinc-900">{totalNotifications}</p>
            <span className="text-xs font-bold text-sky-600 flex items-center gap-0.5 group-hover:underline">
              Check alerts <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        {/* Registered Residents -> residentrecords */}
        <div 
          onClick={() => handleRoute('residentrecords')}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold border border-purple-100 group-hover:scale-105 transition">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">Database</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Registered Residents</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-black text-zinc-900">{totalResidents}</p>
            <span className="text-xs font-bold text-purple-600 flex items-center gap-0.5 group-hover:underline">
              Total profiles <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

      </div>

      {/* 3. RECENT ACTIVITY TABLE */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              Recent Document Applications
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Latest document requests submitted by residents.</p>
          </div>
          <button 
            onClick={() => handleRoute('managerequests')}
            className="text-xs font-bold text-amber-600 hover:underline bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-100">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                <th className="p-3.5 font-bold">Tracking No.</th>
                <th className="p-3.5 font-bold">Document Type</th>
                <th className="p-3.5 font-bold">Purpose</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold">Date Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentRequests.length > 0 ? (
                recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-zinc-900">{req.tracking_number}</td>
                    <td className="p-3.5 font-semibold text-zinc-800 uppercase">
                      {req.document_type?.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3.5 text-zinc-600 truncate max-w-xs">{req.purpose || 'N/A'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider inline-block ${
                        req.status === 'ready_for_pickup' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'completed' ? 'bg-zinc-100 text-zinc-800' : 
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-500 font-mono">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    No document applications found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}