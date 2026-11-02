import React from 'react';
import { Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export default function ResidentDashboard({ requests = [] }) {
  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'under_review').length;
  const readyCount = requests.filter(r => r.status === 'ready_for_pickup').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl"><Clock size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Pending Requests</p>
            <p className="text-2xl font-extrabold text-gray-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-800 rounded-xl"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Ready for Pickup</p>
            <p className="text-2xl font-extrabold text-gray-900">{readyCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-xl"><FileText size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Completed Documents</p>
            <p className="text-2xl font-extrabold text-gray-900">{completedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Request History & Tracking</h3>
        
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="p-4 border rounded-xl bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs bg-black text-gold-500 px-2 py-0.5 rounded">
                      {req.tracking_number}
                    </span>
                    <span className="font-bold text-sm uppercase text-gray-800">
                      {req.document_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Purpose: {req.purpose}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Submitted: {new Date(req.created_at).toLocaleDateString()}</p>
                </div>

                <div className="text-left md:text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    req.status === 'ready_for_pickup' ? 'bg-green-100 text-green-800 border border-green-300' :
                    req.status === 'completed' ? 'bg-gray-200 text-gray-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                  <p className="text-xs font-mono font-bold text-gray-700 mt-2">
                    Fee: ₱{Number(req.fee_amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 space-y-2">
            <AlertCircle className="mx-auto text-gray-400" size={32} />
            <p className="text-sm">No document requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}