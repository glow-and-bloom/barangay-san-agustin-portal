import React, { useState, useEffect } from 'react';
import { Activity, Search, RotateCcw, Calendar, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './ActivityLogs.css';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterModule('all');
  };

  const filteredLogs = logs.filter(log => {
    const actionText = (log.action || log.activity || log.description || '').trim();
    const moduleText = (log.module || log.entity_type || '').trim();

    // Salain lang ang mga purong lowercase raw database triggers (hal. 'insert', 'update', 'delete')
    const rawActions = ['insert', 'update', 'delete'];
    if (rawActions.includes(actionText.toLowerCase())) {
      return false; // Itago ang mga hilaw na database action logs
    }

    const userText = log.performed_by || log.user || log.user_name || '';
    const detailsText = log.details || log.entity_type || '';

    const matchesSearch = 
      actionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detailsText.toLowerCase().includes(searchTerm.toLowerCase());
    
    const logModule = moduleText || 'System';
    const matchesModule = filterModule === 'all' || logModule.toLowerCase() === filterModule.toLowerCase();

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Activity className="text-amber-600" size={28} />
          SYSTEM ACTIVITY LOGS
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Comprehensive audit trails and administrative actions for system accountability and tracking.
        </p>
      </div>

      {/* FILTER & SEARCH CONTROLS CONTAINER */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-800 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        {/* Filter & Reset Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-semibold focus:outline-none focus:border-amber-400 transition"
          >
            <option value="all">All Modules / Types</option>
            <option value="Authentication">Authentication</option>
            <option value="Residents">Residents</option>
            <option value="Documents">Documents</option>
            <option value="Projects">Projects</option>
          </select>

          <button onClick={handleReset} className="walkin-trigger-btn">
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>

      </div>

      {/* LOGS TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500 font-semibold">
            Loading system logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldAlert className="mx-auto text-amber-500/50" size={40} />
            <h3 className="font-bold text-zinc-800 text-sm">No activity logs found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Actions performed by staff and administrators will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-100 text-amber-900 uppercase tracking-wider font-black text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Action Performed</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id || Math.random()} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-500 flex items-center gap-1.5">
                      <Calendar size={13} className="text-amber-600" />
                      {log.created_at || log.timestamp ? new Date(log.created_at || log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      }) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-amber-800">
                      <span className="bg-amber-100/60 border border-amber-200 px-2 py-0.5 rounded-md text-[10px]">
                        {log.module || log.entity_type || 'System'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900">{log.action || log.activity || 'N/A'}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-800 font-semibold">{log.performed_by || log.user || log.user_name || 'Administrator'}</td>
                    <td className="py-3 px-4 text-zinc-500 truncate max-w-xs">{log.details || log.description || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}