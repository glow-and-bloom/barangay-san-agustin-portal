import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Wallet,
  Bell,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Printer,
  Eye,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

export default function AdminDashboard({
  requests = [],
  residents = [],
  projects: initialProjects = [],
  notifications = [],
  onNavigate
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // States para sa Voters Modal at Resident Details View Modal
  const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const { data, error } = await supabase
          .from('document_requests')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!isMounted) return;

        const databaseRequests = data || [];
        const displayRequests = databaseRequests.length > 0
          ? databaseRequests
          : requests.filter(req => String(req.status || '').toLowerCase() === 'pending');

        const sortedRequests = [...displayRequests].sort(
          (a, b) =>
            new Date(b.created_at || 0) -
            new Date(a.created_at || 0)
        );

        setRecentRequests(sortedRequests);
        setPendingCount(sortedRequests.length);
        setLoadingRequests(false);
      } catch (error) {
        console.error('Unable to load dashboard requests:', error);

        if (!isMounted) return;

        const fallbackRequests = requests.filter(req =>
          String(req.status || '').toLowerCase() === 'pending'
        );

        const sortedRequests = [...fallbackRequests].sort(
          (a, b) =>
            new Date(b.created_at || 0) -
            new Date(a.created_at || 0)
        );

        setRecentRequests(sortedRequests);
        setPendingCount(sortedRequests.length);
        setLoadingRequests(false);
      }
    };

    fetchDashboardData();

    const channel = supabase
      .channel('admin-dashboard-document-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_requests'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [requests]);

  useEffect(() => {
    if (initialProjects?.length > 0) {
      setProjects(initialProjects);
      return;
    }

    const fetchProjects = async () => {
      let { data, error } = await supabase
        .from('barangay_projects')
        .select('*');

      if (error || !data?.length) {
        const result = await supabase
          .from('projects')
          .select('*');

        data = result.data;
      }

      if (data) setProjects(data);
    };

    fetchProjects();
  }, [initialProjects]);

  const totalResidents = residents.length;
  const registeredVoters = residents.filter(r => 
    !r.voter_status || String(r.voter_status).toLowerCase().includes('registered') || true
  );

  const totalBudget = projects.reduce(
    (acc, curr) => acc + Number(curr.allocated_budget || 0),
    0
  );

  const totalNotifications = pendingCount;

  const budgetCompleted = projects
    .filter(p => p.status?.toLowerCase() === 'completed')
    .reduce((acc, curr) => acc + Number(curr.allocated_budget || 0), 0);

  const budgetOngoing = projects
    .filter(p =>
      ['ongoing', 'in_progress'].includes(p.status?.toLowerCase())
    )
    .reduce((acc, curr) => acc + Number(curr.allocated_budget || 0), 0);

  const budgetPlanned = projects
    .filter(p =>
      ['planned', undefined].includes(p.status?.toLowerCase())
    )
    .reduce((acc, curr) => acc + Number(curr.allocated_budget || 0), 0);

  const safeTotalBudget = totalBudget > 0 ? totalBudget : 1;

  const pctCompleted = (budgetCompleted / safeTotalBudget) * 100;
  const pctOngoing = (budgetOngoing / safeTotalBudget) * 100;
  const pctPlanned = (budgetPlanned / safeTotalBudget) * 100;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentRequests = recentRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(recentRequests.length / itemsPerPage) || 1;

  const handleRoute = target => {
    if (onNavigate) onNavigate(target);
  };

  const formatStatus = status =>
    String(status || 'pending').replace(/_/g, ' ');

  // Function para sa pormal at kumpletong print format na may header at lagda
  const handlePrintVoters = () => {
    const printContent = document.getElementById('voters-printable-table').innerHTML;
    const printWindow = window.open('', '', 'height=800,width=1000');
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    printWindow.document.write('<html><head><title>List of Barangay San Agustin Voters</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: sans-serif; padding: 30px; color: #000; background: #fff; }
      .print-header { text-align: center; margin-bottom: 25px; }
      .print-header p { font-size: 11px; font-weight: bold; margin: 2px 0; letter-spacing: 0.5px; }
      .print-header h2 { font-size: 15px; font-weight: 900; margin: 6px 0 2px 0; }
      .print-header h3 { font-size: 13px; font-weight: 800; color: #c2410c; margin-bottom: 4px; }
      .print-header .gen-date { font-size: 10px; font-style: italic; color: #555; margin-top: 4px; }
      hr { border: none; border-top: 1.5px solid #000; margin: 15px 0 20px 0; }
      
      table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
      th, td { border: 1px solid #d1d5db; padding: 8px 12px; font-size: 11px; text-align: left; }
      th { background-color: #facc15 !important; color: #1f1e1e !important; text-transform: uppercase; font-weight: bold; -webkit-print-color-adjust: exact; }
      
      .signatures-container { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 30px; page-break-inside: avoid; }
      .signature-box { text-align: center; width: 220px; }
      .signature-box p { font-size: 11px; margin-bottom: 35px; text-align: left; }
      .signature-line { border-top: 1px solid #000; margin-bottom: 5px; }
      .signatory-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
      .signatory-sub { font-size: 9px; color: #555; }
      .no-print { display: none !important; }
    `);
    printWindow.document.write('</style></head><body>');
    
    // Opisyal na Header
    printWindow.document.write(`
      <div class="print-header">
        <p>REPUBLIC OF THE PHILIPPINES</p>
        <p>PROVINCE OF ZAMBALES • MUNICIPALITY OF CASTILLEJOS</p>
        <h2>BARANGAY SAN AGUSTIN</h2>
        <h3>OFFICIAL LIST OF REGISTERED VOTERS</h3>
        <div class="gen-date">Generated on: ${currentDate}</div>
      </div>
      <hr/>
    `);

    // Talaan ng mga Botante
    printWindow.document.write(printContent);

    // Signatures sa ibaba (Prepared By & Approved & Certified By)
    printWindow.document.write(`
      <div class="signatures-container">
        <div class="signature-box">
          <p>Prepared By:</p>
          <div class="signature-line"></div>
          <div class="signatory-title">BARANGAY SECRETARY / RECORD OFFICER</div>
          <div class="signatory-sub">Barangay San Agustin</div>
        </div>
        <div class="signature-box">
          <p>Approved & Certified By:</p>
          <div class="signature-line"></div>
          <div class="signatory-title">HON. PUNONG BARANGAY</div>
          <div class="signatory-sub">Barangay San Agustin</div>
        </div>
      </div>
    `);

    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-6 dashboard-container font-sans">

      {/* BANNER OVERVIEW */}
      <div className="banner-container">
        <div className="banner-watermark">
          <img src="hall.jpg" alt="Barangay San Agustin Hall" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase mb-1">
              <ShieldCheck size={13} />
              <span>Admin Portal • Barangay San Agustin</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              Dashboard Overview
            </h1>

            <p className="text-xs text-zinc-400 mt-0.5">
              Castillejos, Zambales • Monitoring resident database and document application requests in real time.
            </p>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div
          onClick={() => handleRoute('requested-documents')}
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group dashboard-card"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold border border-amber-200 group-hover:scale-105 transition">
              <FileText size={20} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100/80 text-amber-800 rounded-md border border-amber-200">
              Inbox
            </span>
          </div>

          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Document Requests
          </p>

          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-black text-zinc-900">
              {pendingCount}
            </p>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5 group-hover:underline">
              View inbox <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        <div
          onClick={() => handleRoute('financials')}
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group dashboard-card"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold border border-emerald-200 group-hover:scale-105 transition">
              <Wallet size={20} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              Budget
            </span>
          </div>

          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Financial Monitoring
          </p>

          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-emerald-800">
              ₱{totalBudget.toLocaleString()}
            </p>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 group-hover:underline">
              View budget <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        {/* NOTIFICATION / VOTERS CARD */}
        <div
          onClick={() => setIsVotersModalOpen(true)}
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-sky-400 transition-all cursor-pointer group dashboard-card"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold border border-sky-200 group-hover:scale-105 transition">
              <Bell size={20} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md border border-sky-200">
              Voters List
            </span>
          </div>

          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Notification / Voters
          </p>

          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-black text-zinc-900">
              {registeredVoters.length}
            </p>
            <span className="text-xs font-bold text-sky-600 flex items-center gap-0.5 group-hover:underline">
              View voters <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        <div
          onClick={() => handleRoute('residents')}
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group dashboard-card"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold border border-purple-200 group-hover:scale-105 transition">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
              Database
            </span>
          </div>

          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Registered Residents
          </p>

          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-black text-zinc-900">
              {totalResidents}
            </p>
            <span className="text-xs font-bold text-purple-600 flex items-center gap-0.5 group-hover:underline">
              Total profiles <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* VOTERS LIST MODAL */}
      {isVotersModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-end pr-45 p-4">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 relative font-sans voters-modal-content">
            
            <div className="flex justify-between items-center border-b pb-3 no-print">
              <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
                List of Barangay San Agustin Voters
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintVoters}
                  className="voters-btn-print flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => setIsVotersModalOpen(false)}
                  className="voters-btn-close cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            <div id="voters-printable-table" className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="voters-table-header">
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Birthdate</th>
                    <th className="p-3">Civil Status</th>
                    <th className="p-3">Voter Status</th>
                    <th className="p-3 text-center no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium text-zinc-800">
                  {residents.length > 0 ? (
                    residents.map((res, index) => {
                      const fullName = `${res.last_name || ''}, ${res.first_name || ''} ${res.middle_name || ''}`.trim();
                      return (
                        <tr key={res.id || index} className="voters-table-row transition">
                          <td className="p-3 font-bold">{fullName || 'N/A'}</td>
                          <td className="p-3">{res.gender || 'N/A'}</td>
                          <td className="p-3">{res.birthdate || res.date_of_birth || 'N/A'}</td>
                          <td className="p-3">{res.civil_status || 'Single'}</td>
                          <td className="p-3 font-bold text-amber-500">Registered Voter</td>
                          <td className="p-3 text-center no-print">
                            <button
                              onClick={() => setSelectedResident(res)}
                              className="voters-action-view inline-flex items-center gap-1"
                            >
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-400 font-semibold">
                        No registered residents found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* INDIVIDUAL RESIDENT DETAILS VIEW MODAL */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative font-sans">
            <button
              onClick={() => setSelectedResident(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-base font-black text-zinc-900 border-b pb-2 uppercase">
              Resident Voter Details
            </h3>
            <div className="space-y-2 text-xs text-zinc-700">
              <p><strong>Full Name:</strong> {selectedResident.last_name}, {selectedResident.first_name} {selectedResident.middle_name || ''}</p>
              <p><strong>Gender:</strong> {selectedResident.gender || 'N/A'}</p>
              <p><strong>Birthdate:</strong> {selectedResident.birthdate || selectedResident.date_of_birth || 'N/A'}</p>
              <p><strong>Civil Status:</strong> {selectedResident.civil_status || 'Single'}</p>
              <p><strong>Address / Purok:</strong> {selectedResident.address || selectedResident.purok || 'Barangay San Agustin'}</p>
              <p><strong>Contact No.:</strong> {selectedResident.contact_number || selectedResident.phone || 'N/A'}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedResident(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECENT DOCUMENT APPLICATIONS & FINANCIALS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                <Activity size={16} className="text-amber-600" />
                Recent Document Applications ({recentRequests.length})
              </h3>

              <p className="text-xs text-zinc-500 mt-0.5">
                Latest pending document requests from the Requested Documents Inbox.
              </p>
            </div>

            <button
              onClick={() => handleRoute('requested-documents')}
              className="text-xs font-extrabold text-amber-800 hover:underline bg-amber-100/60 px-3 py-1 rounded-lg border border-amber-300 cursor-pointer"
            >
              View Inbox
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-amber-50/50 text-amber-900 uppercase tracking-wider border-b border-amber-200 font-black text-[10px]">
                  <th className="p-3.5">Tracking No.</th>
                  <th className="p-3.5">Document Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date Submitted</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 font-medium">
                {loadingRequests ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-400 font-semibold">
                      Loading pending requests...
                    </td>
                  </tr>
                ) : currentRequests.length > 0 ? (
                  currentRequests.map(req => (
                    <tr key={req.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-zinc-900">
                        {req.tracking_number || 'N/A'}
                      </td>

                      <td className="p-3.5 font-bold text-zinc-800 uppercase">
                        {String(req.document_type || 'N/A').replace(/_/g, ' ')}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-md font-black text-[10px] uppercase tracking-wider inline-block bg-amber-100 text-amber-800 border border-amber-200">
                          {formatStatus(req.status)}
                        </span>
                      </td>

                      <td className="p-3.5 text-zinc-500 font-mono">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-400 font-semibold">
                      No pending document requests found in the inbox.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {recentRequests.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
              <p className="text-xs text-zinc-500">
                Showing{' '}
                <span className="font-bold text-zinc-800">
                  {indexOfFirstItem + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-zinc-800">
                  {Math.min(indexOfLastItem, recentRequests.length)}
                </span>{' '}
                of{' '}
                <span className="font-bold text-zinc-800">
                  {recentRequests.length}
                </span>{' '}
                entries
              </p>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-xs font-black text-zinc-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FINANCIAL DONUT CHART */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="w-full sm:w-1/2 space-y-2">
            <div className="flex items-center space-x-2">
              <Wallet className="text-emerald-600" size={20} />
              <h3 className="text-base font-black text-zinc-900">
                Project Budget Distribution
              </h3>
            </div>

            <p className="text-xs text-zinc-500">
              Breakdown of allocated barangay funds by project execution status.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-zinc-700 font-bold">Completed Projects</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">
                  {pctCompleted.toFixed(1)}% (₱{budgetCompleted.toLocaleString()})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-zinc-700 font-bold">Ongoing Projects</span>
                </div>
                <span className="font-mono font-bold text-amber-700">
                  {pctOngoing.toFixed(1)}% (₱{budgetOngoing.toLocaleString()})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                  <span className="text-zinc-700 font-bold">Planned Projects</span>
                </div>
                <span className="font-mono font-bold text-sky-700">
                  {pctPlanned.toFixed(1)}% (₱{budgetPlanned.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
            <svg className="donut-svg" viewBox="0 0 36 36">
              <path
                className="donut-bg"
                strokeWidth="4.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 donut-segment"
                strokeDasharray={`${pctCompleted}, 100`}
                strokeWidth="4.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500 donut-segment"
                strokeDasharray={`${pctOngoing}, 100`}
                strokeDashoffset={`-${pctCompleted}`}
                strokeWidth="4.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-sky-500 donut-segment"
                strokeDasharray={`${pctPlanned}, 100`}
                strokeDashoffset={`-${pctCompleted + pctOngoing}`}
                strokeWidth="4.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Total Budget
              </p>
              <p className="text-sm font-black text-zinc-900 mt-0.5">
                ₱{totalBudget > 1000
                  ? `${(totalBudget / 1000).toFixed(1)}k`
                  : totalBudget}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}