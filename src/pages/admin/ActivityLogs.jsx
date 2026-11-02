import React from 'react';
import { Activity } from 'lucide-react';

export default function ActivityLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Activity Logs</h1>
        <p className="text-xs text-gray-500 mt-1">Audit trails and administrative actions for system accountability.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-3">
        <Activity className="mx-auto text-gray-300" size={40} />
        <h3 className="font-bold text-gray-800 text-sm">No audit logs recorded yet</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">Actions performed by staff and administrators will be logged here automatically.</p>
      </div>
    </div>
  );
}