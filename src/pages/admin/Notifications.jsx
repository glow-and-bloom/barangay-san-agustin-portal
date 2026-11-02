import React from 'react';
import { Bell } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
        <p className="text-xs text-gray-500 mt-1">System alerts and resident document request notifications.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-3">
        <Bell className="mx-auto text-gray-300" size={40} />
        <h3 className="font-bold text-gray-800 text-sm">No new notifications</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">All system alerts and document requests have been viewed and processed.</p>
      </div>
    </div>
  );
}