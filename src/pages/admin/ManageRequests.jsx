import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function ManageRequests({ requests = [], onUpdateStatus }) {
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [orNo, setOrNo] = useState('');

  const filtered = requests.filter(r => r.tracking_number?.toLowerCase().includes(search.toLowerCase()));

  const handleRelease = () => {
    if (!orNo) return alert('Please enter Official Receipt (OR) Number.');
    onUpdateStatus(selectedReq.id, 'completed', orNo);
    setSelectedReq(null);
    setOrNo('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Document Requests</h1>
        <p className="text-xs text-gray-500 mt-1">Review, process, and monitor resident document requests.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tracking no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase border-b">
                <th className="p-3">Tracking No.</th>
                <th className="p-3">Resident</th>
                <th className="p-3">Document Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono font-bold">{req.tracking_number}</td>
                  <td className="p-3">{req.residents ? `${req.residents.first_name} ${req.residents.last_name}` : 'Resident'}</td>
                  <td className="p-3 uppercase font-semibold">{req.document_type?.replace(/_/g, ' ')}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800 text-[10px]">
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold">
                    {req.is_paid ? <span className="text-green-700">Paid (OR: {req.payment_reciept_no})</span> : <span className="text-red-600">Unpaid</span>}
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => onUpdateStatus(req.id, 'ready_for_pickup')} className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded">Set Ready</button>
                    <button onClick={() => setSelectedReq(req)} className="bg-green-600 text-white font-bold px-2.5 py-1 rounded">Pay & Release</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-base border-b pb-2">Record In-Person Cash Payment</h3>
            <input type="text" placeholder="Official Receipt (OR) No." value={orNo} onChange={(e) => setOrNo(e.target.value)} className="w-full border rounded-xl p-2.5 text-xs" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setSelectedReq(null)} className="px-3 py-1.5 border text-xs rounded-lg font-bold">Cancel</button>
              <button onClick={handleRelease} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-bold">Confirm Release</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}