import React from 'react';
import { User, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function ResidentProfile({ profile }) {
  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <div className="flex items-center space-x-4 border-b pb-6">
        <div className="w-16 h-16 rounded-full bg-black text-gold-500 font-bold text-2xl flex items-center justify-center border-2 border-gold-500">
          {profile?.first_name?.charAt(0) || 'R'}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">{profile?.first_name} {profile?.last_name}</h2>
          <span className="inline-flex items-center space-x-1 text-xs text-green-700 font-semibold bg-green-50 px-2.5 py-0.5 rounded-full mt-1 border border-green-200">
            <ShieldCheck size={14} />
            <span>Registered Resident</span>
          </span>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex items-center space-x-3 text-gray-700">
          <User size={18} className="text-gold-600" />
          <span>Role: <strong className="capitalize">{profile?.role || 'Resident'}</strong></span>
        </div>
        <div className="flex items-center space-x-3 text-gray-700">
          <Phone size={18} className="text-gold-600" />
          <span>Contact Number: <strong>{profile?.contact_number || 'N/A'}</strong></span>
        </div>
        <div className="flex items-center space-x-3 text-gray-700">
          <MapPin size={18} className="text-gold-600" />
          <span>Address: <strong>Barangay San Agustin, Castillejos, Zambales</strong></span>
        </div>
      </div>
    </div>
  );
}