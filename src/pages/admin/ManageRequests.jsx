import React, { useState } from 'react';
import { Search, CheckCircle2, Eye, FileText, X, Printer } from 'lucide-react';

export default function ManageRequests({ requests = [], onUpdateStatus }) {
  const [search, setSearch] = useState('');
  const [selectedPayReq, setSelectedPayReq] = useState(null);
  const [viewCertReq, setViewCertReq] = useState(null);
  
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [orNo, setOrNo] = useState('');

  const filtered = requests.filter(r => 
    r.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
    r.document_type?.toLowerCase().includes(search.toLowerCase())
  );

  const isPaidDocument = (docType) => {
    if (!docType) return false;
    const type = docType.toLowerCase();
    return type.includes('business') || type.includes('permit');
  };

  const handlePrintAndReady = () => {
    if (!pickupDate || !pickupTime) {
      return alert('Please select both Pickup Date and Time before printing.');
    }

    const combinedDateTime = new Date(`${pickupDate}T${pickupTime}`).toISOString();

    onUpdateStatus(viewCertReq.id, 'ready_for_pickup', { 
      pickup_date: combinedDateTime 
    });

    window.print();
    setViewCertReq(null);
    setPickupDate('');
    setPickupTime('09:00');
  };

  const handleReleasePayment = () => {
    if (!orNo) return alert('Please enter Official Receipt (OR) Number.');
    onUpdateStatus(selectedPayReq.id, 'completed', { orNo });
    setSelectedPayReq(null);
    setOrNo('');
  };

  const handleDirectRelease = (reqId) => {
    onUpdateStatus(reqId, 'completed', {});
  };

  return (
    <div className="space-y-6">
      {/* STRICT PRINT CONFIGURATION TO HIDE EVERYTHING EXCEPT THE CERTIFICATE */}
      <style>{`
        @page {
          size: portrait;
          margin: 10mm;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Document Requests</h1>
        <p className="text-xs text-gray-500 mt-1">Review, process, and monitor resident document requests.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 no-print">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tracking no or type..."
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
                <th className="p-3">Date Requested</th>
                <th className="p-3">Pickup Schedule</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map((req) => {
                  const requiresPayment = isPaidDocument(req.document_type);

                  return (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold">{req.tracking_number}</td>
                      <td className="p-3 font-medium">
                        {req.residents ? `${req.residents.first_name} ${req.residents.last_name}` : 'Resident'}
                      </td>
                      <td className="p-3 uppercase font-semibold">{req.document_type?.replace(/_/g, ' ')}</td>
                      <td className="p-3 text-gray-500">
                        {new Date(req.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-3 font-bold text-blue-700">
                        {req.pickup_date ? (
                          <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                            {new Date(req.pickup_date).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">Not Scheduled</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          req.status === 'completed' ? 'bg-green-100 text-green-800' :
                          req.status === 'ready_for_pickup' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'ready_for_pickup' ? 'Ready for Pickup' : req.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        {requiresPayment ? (
                          req.is_paid ? (
                            <span className="text-green-700">Paid (OR: {req.payment_reciept_no})</span>
                          ) : (
                            <span className="text-red-600">Unpaid (₱{req.fee_amount || 50})</span>
                          )
                        ) : (
                          <span className="text-gray-500 font-normal">Free / No Fee</span>
                        )}
                      </td>
                      <td className="p-3 space-x-1.5 flex items-center">
                        <button
                          onClick={() => {
                            setViewCertReq(req);
                            if (req.pickup_date) {
                              const d = new Date(req.pickup_date);
                              setPickupDate(d.toISOString().split('T')[0]);
                              setPickupTime(d.toTimeString().slice(0, 5));
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded shadow flex items-center space-x-1"
                        >
                          <Eye size={12} />
                          <span>View Document</span>
                        </button>

                        {req.status === 'ready_for_pickup' && (
                          requiresPayment ? (
                            <button 
                              onClick={() => setSelectedPayReq(req)} 
                              className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded shadow"
                            >
                              Pay & Release
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleDirectRelease(req.id)} 
                              className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded shadow flex items-center space-x-1"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Collected</span>
                            </button>
                          )
                        )}

                        {req.status === 'completed' && (
                          <span className="text-gray-400 font-semibold italic text-[11px]">Released</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-400">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CONTAINER: SEPARATED CERTIFICATE AND CONTROLS */}
      {viewCertReq && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-transparent max-w-3xl w-full space-y-4 relative my-8">
            
            {/* CLOSE BUTTON FOR MODAL */}
            <button 
              onClick={() => setViewCertReq(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 no-print bg-black/50 p-2 rounded-full"
            >
              <X size={20} />
            </button>

            {/* ISOLATED PRINTABLE CERTIFICATE CONTAINER */}
            <div id="printable-certificate" className="bg-white p-10 space-y-6 text-black border border-gray-200 rounded-2xl shadow-2xl">
              <div className="text-center space-y-1 border-b-2 border-black pb-4">
                <p className="text-xs uppercase font-bold tracking-widest text-gray-700">Republic of the Philippines</p>
                <p className="text-xs uppercase font-semibold text-gray-700">Province of Zambales • Municipality of Castillejos</p>
                <h2 className="text-xl font-black tracking-wider text-black pt-1">BARANGAY SAN AGUSTIN</h2>
                <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wide">
                  OFFICE OF THE PUNONG BARANGAY
                </h3>
                <h4 className="text-2xl font-black uppercase text-black pt-4 tracking-wider underline underline-offset-4">
                  {viewCertReq.document_type?.replace(/_/g, ' ')}
                </h4>
              </div>

              <div className="space-y-5 text-sm text-black leading-relaxed pt-2">
                <p className="italic text-xs font-mono text-gray-600">Tracking No: {viewCertReq.tracking_number}</p>
                
                <p className="font-bold pt-2">TO WHOM IT MAY CONCERN:</p>
                
                <p className="text-justify indent-8 leading-loose">
                  This is to certify that <span className="font-bold underline uppercase">{viewCertReq.residents ? `${viewCertReq.residents.first_name} ${viewCertReq.residents.last_name}` : 'Resident'}</span>, 
                  of legal age, is a permanent resident of Purok {viewCertReq.residents?.purok || '---'}, Barangay San Agustin, Castillejos, Zambales[cite: 2].
                </p>

                {viewCertReq.document_type?.toLowerCase().includes('business') && (
                  <p className="text-justify indent-8 leading-loose">
                    This certification is granted for the operation and establishment of their business enterprise within the jurisdiction of Barangay San Agustin, subject to existing local ordinances[cite: 2].
                  </p>
                )}

                {viewCertReq.document_type?.toLowerCase().includes('indigency') && (
                  <p className="text-justify indent-8 leading-loose">
                    This further certifies that the above-named resident belongs to an indigent family in this community and is in need of financial or medical assistance[cite: 2].
                  </p>
                )}

                <p className="text-justify indent-8 leading-loose">
                  This certification/clearance is issued upon the request of the interested party for <span className="font-bold italic">"{viewCertReq.purpose || 'Legal/Official Purposes'}"</span> and for whatever legal intent it may serve.
                </p>

                <p className="text-right pt-8 font-semibold">
                  Given this {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at Barangay San Agustin, Castillejos, Zambales[cite: 2].
                </p>
              </div>

              <div className="pt-12 flex justify-end text-center">
                <div className="w-64 space-y-1">
                  <div className="border-b-2 border-black pb-1 font-bold uppercase">HON. BARANGAY CAPTAIN</div>
                  <p className="text-xs text-gray-600 font-medium">Punong Barangay</p>
                </div>
              </div>
            </div>

            {/* SEPARATED CONTROL PANEL FOR ADMIN (COMPLETELY HIDDEN DURING PRINT) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 no-print shadow-xl">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Set Pickup Schedule & Ready for Print:</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Pickup Date</label>
                  <input 
                    type="date" 
                    value={pickupDate} 
                    onChange={(e) => setPickupDate(e.target.value)} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Pickup Time</label>
                  <input 
                    type="time" 
                    value={pickupTime} 
                    onChange={(e) => setPickupTime(e.target.value)} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white" 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button 
                  onClick={() => setViewCertReq(null)} 
                  className="px-4 py-2 border border-gray-300 text-xs rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-100"
                >
                  Close
                </button>
                <button 
                  onClick={handlePrintAndReady} 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl font-bold shadow flex items-center space-x-1.5"
                >
                  <Printer size={14} />
                  <span>Print & Set Ready for Pickup</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {selectedPayReq && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base border-b pb-2 text-gray-800">Record Business Permit Payment</h3>
            <p className="text-xs text-gray-500">
              Enter Official Receipt (OR) Number for tracking <span className="font-mono font-bold text-black">{selectedPayReq.tracking_number}</span>[cite: 2].
            </p>
            <input 
              type="text" 
              placeholder="Official Receipt (OR) No." 
              value={orNo} 
              onChange={(e) => setOrNo(e.target.value)} 
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-black font-mono" 
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setSelectedPayReq(null)} 
                className="px-3 py-1.5 border border-gray-300 text-xs rounded-lg font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleReleasePayment} 
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-bold shadow"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}