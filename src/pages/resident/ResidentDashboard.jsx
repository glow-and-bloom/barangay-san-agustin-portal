import React from 'react';
import {
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function ResidentDashboard({ requests = [] }) {
  const pendingCount = requests.filter(
    r => ['pending', 'submitted', 'under_review'].includes(r.status)
  ).length;

  const readyCount = requests.filter(
    r => r.status === 'ready_for_pickup'
  ).length;

  const completedCount = requests.filter(
    r => ['completed', 'released'].includes(r.status)
  ).length;

  const isPaidDocument = (docType) => {
    if (!docType) return false;
    const type = docType.toLowerCase();
    return type.includes('business') || type.includes('permit');
  };

  const statusStyle = (status) => {
    if (status === 'ready_for_pickup') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }

    if (['completed', 'released'].includes(status)) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }

    if (status === 'rejected') {
      return 'bg-red-100 text-red-800 border-red-200';
    }

    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';

    return status === 'ready_for_pickup'
      ? 'Ready for Pickup'
      : status.replace(/_/g, ' ');
  };

  const stats = [
    {
      label: 'Pending Requests',
      value: pendingCount,
      icon: Clock,
      iconStyle: 'bg-amber-100 text-amber-800'
    },
    {
      label: 'Ready for Pickup',
      value: readyCount,
      icon: CheckCircle2,
      iconStyle: 'bg-emerald-100 text-emerald-800'
    },
    {
      label: 'Completed Documents',
      value: completedCount,
      icon: FileText,
      iconStyle: 'bg-blue-100 text-blue-800'
    }
  ];

  return (
    <div className="w-full min-w-0 space-y-6 font-sans">

      {/* 1. RESIDENT DASHBOARD OVERVIEW BANNER */}
      <div className="relative bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg overflow-hidden flex flex-col justify-center">
        
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden flex items-center justify-center">
          <img 
            src="hall.jpg" 
            alt="Barangay San Agustin Hall" 
            className="w-full h-full object-cover filter brightness-125"
          />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase mb-1">
              <ShieldCheck size={13} />
              <span>Resident Portal • Barangay San Agustin</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Resident Dashboard
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Castillejos, Zambales • Monitor your document applications and request status in real time.
            </p>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3 min-w-0"
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${stat.iconStyle}`}>
                <Icon size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-500 uppercase font-bold">
                  {stat.label}
                </p>
                <p className="text-xl font-extrabold text-gray-900 mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}

      </div>

      {/* 3. REQUEST HISTORY & TRACKING SECTION (Manipis at compact ang padding) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm min-w-0">

        <div className="pb-3 mb-3 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
            Request History & Tracking
          </h3>

          <p className="text-xs text-gray-500 mt-0.5">
            View the status of your submitted document applications.
          </p>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-3">

            {requests.map((req) => {
              const requiresPayment = isPaidDocument(req.document_type);

              return (
                <div
                  key={req.id}
                  className="p-3.5 sm:p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition space-y-2.5"
                >

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                    <div className="min-w-0 space-y-1">

                      <div>
                        <span className="inline-block font-mono font-bold text-[11px] bg-black text-amber-400 px-2.5 py-1 rounded-md break-all">
                          {req.tracking_number || 'No Tracking Number'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-gray-900 uppercase break-words">
                        {req.document_type?.replace(/_/g, ' ') || 'Document Request'}
                      </h4>

                      <p className="text-[11px] text-gray-600 break-words">
                        Purpose:
                        <span className="font-semibold text-gray-800 ml-1">
                          {req.purpose || 'N/A'}
                        </span>
                      </p>

                      <p className="text-[10px] text-gray-400">
                        Submitted: {req.created_at
                          ? new Date(req.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </p>

                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${statusStyle(req.status)}`}>
                        {formatStatus(req.status)}
                      </span>
                    </div>

                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">

                    <span className="text-[11px] font-bold text-gray-500">
                      Document Fee
                    </span>

                    {requiresPayment ? (
                      <span className="text-[11px] font-extrabold text-red-600">
                        ₱{Number(req.fee_amount ?? 50).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-extrabold text-emerald-700">
                        Free / No Fee
                      </span>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        ) : (
          <div className="text-center py-10 px-4 space-y-2">
            <AlertCircle className="mx-auto text-gray-300" size={36} />

            <h4 className="text-xs font-bold text-gray-700">
              No Document Requests Found
            </h4>

            <p className="text-[11px] text-gray-400">
              Your submitted document applications will appear here.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}