import React from 'react';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminDashboard({ requests = [], residents = [], projects = [] }) {
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'under_review').length;
  const readyRequests = requests.filter(r => r.status === 'ready_for_pickup').length;
  const totalResidents = residents.length;

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-900 text-white p-6 sm:p-8 rounded-2xl border border-amber-500/40 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} />
              <span>Admin Portal • Barangay San Agustin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Castillejos, Zambales • Monitoring resident database and document application requests in real time.
            </p>
          </div>

          <div className="bg-zinc-800/60 border border-zinc-700 px-4 py-2.5 rounded-xl text-right">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">System Status</p>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-zinc-200">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Requests */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold border border-amber-100">
              <FileText size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md">Total</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Document Requests</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-black text-zinc-900">{totalRequests}</p>
            <span className="text-xs font-medium text-amber-600 flex items-center">
              <TrendingUp size={12} className="mr-0.5" /> All records
            </span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold border border-sky-100">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md">Action</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Pending Review</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-black text-zinc-900">{pendingRequests}</p>
            <span className="text-xs font-medium text-sky-600">For evaluation</span>
          </div>
        </div>

        {/* Ready for Pickup */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold border border-emerald-100">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">Claimable</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Ready for Pickup</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-black text-zinc-900">{readyRequests}</p>
            <span className="text-xs font-medium text-emerald-600">For releasing</span>
          </div>
        </div>

        {/* Registered Residents */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold border border-purple-100">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">Database</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Registered Residents</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-black text-zinc-900">{totalResidents}</p>
            <span className="text-xs font-medium text-purple-600">Total profiles</span>
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
          <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-lg">
            Live Feed
          </span>
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