import React from 'react';
import { Settings as SettingsIcon, Shield, Database, Lock } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm">
        <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2">
          <SettingsIcon className="text-amber-500" size={24} />
          Portal Settings
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Manage system configurations, admin security credentials, and barangay portal information.
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
          <Shield className="text-zinc-600" size={20} />
          <div>
            <h4 className="text-xs font-bold text-zinc-900">Account Credentials</h4>
            <p className="text-[11px] text-zinc-500">Update username and password authentication settings.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
          <Database className="text-zinc-600" size={20} />
          <div>
            <h4 className="text-xs font-bold text-zinc-900">Database & Backups</h4>
            <p className="text-[11px] text-zinc-500">Manage local data registries and document record logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}