import React from 'react';
import { Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export default function ResidentDashboard({ requests = [] }) {
  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'under_review').length;
  const readyCount = requests.filter(r => r.status === 'ready_for_pickup').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  // Helper function para malaman kung may bayad ang dokumento
  const isPaidDocument = (docType) => {
    if (!docType) return false;
    const type = docType.toLowerCase();
    return type.includes('business') || type.includes('permit');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl"><Clock size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Pending Requests</p>
            <p className="text-2xl font-extrabold text-gray-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Ready for Pickup</p>
            <p className="text-2xl font-extrabold text-gray-900">{readyCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl"><FileText size={24} /></div>
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
            {requests.map((req) => {
              const requiresPayment = isPaidDocument(req.document_type);

              return (
                <div key={req.id} className="p-4 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50/50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-xs bg-black text-amber-400 px-2.5 py-1 rounded-lg">
                        {req.tracking_number}
                      </span>
                      <span className="font-bold text-sm uppercase text-gray-800">
                        {req.document_type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5 font-medium">Purpose: <span className="text-gray-800">{req.purpose}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted: {req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                  </div>

                  <div className="text-left md:text-right space-y-1.5">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      req.status === 'ready_for_pickup' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      req.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {req.status === 'ready_for_pickup' ? 'Ready for Pickup' : req.status}
                    </span>
                    
                    <div>
                      {requiresPayment ? (
                        <p className="text-xs font-bold text-red-600">
                          Fee: ₱{req.fee_amount || 50.00} (Business Permit Fee)
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-emerald-700">
                          Free / No Fee
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <AlertCircle className="mx-auto text-gray-300" size={36} />
            <p className="text-sm font-medium">No document requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}