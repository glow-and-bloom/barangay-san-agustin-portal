import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, HeartHandshake, 
  Sparkles, FileText, DollarSign, Printer, Home 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAdminActivity } from '../../lib/logger';
import './Reports.css';

export default function Reports({ adminName = 'Administrator' }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResidents: 0,
    householdLeadersCount: 0,
    pwdCount: 0,
    seniorCount: 0,
    youthCount: 0,
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    totalBudget: 0,
    totalExpenses: 0,
    remainingBalance: 0
  });

  const calculateAge = dateString => {
    if (!dateString) return 0;
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) age--;
    return age;
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const { data: residentsData } = await supabase.from('residents').select('*');
      const { data: requestsData } = await supabase.from('document_requests').select('*');

      let { data: projectsData } = await supabase.from('projects').select('*');
      if (!projectsData || projectsData.length === 0) {
        const res = await supabase.from('barangay_projects').select('*');
        projectsData = res.data || [];
      }

      let leaders = 0;
      let pwd = 0;
      let senior = 0;
      let youth = 0;

      if (residentsData) {
        residentsData.forEach(r => {
          if (r.is_head_of_household) leaders++;
          if (r.is_pwd) pwd++;
          const age = calculateAge(r.birth_date);
          if (age >= 60) senior++;
          if (age <= 30 && age > 0) youth++;
        });
      }

      const totalRes = residentsData ? residentsData.length : 0;
      const totalReqs = requestsData ? requestsData.length : 0;
      const completedReqs = requestsData 
        ? requestsData.filter(r => r.status === 'completed' || r.status === 'released').length 
        : 0;

      const tBudget = projectsData.reduce((sum, p) => sum + Number(p.allocated_budget || 0), 0);
      const tExpenses = projectsData.reduce((sum, p) => sum + Number(p.total_expenses || 0), 0);
      const rBalance = tBudget - tExpenses;

      setStats({
        totalResidents: totalRes,
        householdLeadersCount: leaders,
        pwdCount: pwd,
        seniorCount: senior,
        youthCount: youth,
        totalRequests: totalReqs,
        completedRequests: completedReqs,
        pendingRequests: totalReqs - completedReqs,
        totalBudget: tBudget,
        totalExpenses: tExpenses,
        remainingBalance: rBalance
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    await logAdminActivity(
      'Reports', 
      'Printed Official Summary Report', 
      adminName, 
      'Exported comprehensive demographic and financial summary report.'
    );

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow popups for this website to print reports.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barangay San Agustin - Official Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #18181b; }
            .header { text-align: center; border-bottom: 2px solid #18181b; padding-bottom: 15px; margin-bottom: 25px; }
            .header p { font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 3px 0; color: #52525b; }
            .header h1 { font-size: 16px; font-weight: 900; text-transform: uppercase; margin: 5px 0; }
            .header h3 { font-size: 12px; font-weight: 900; color: #b45309; text-transform: uppercase; margin: 3px 0; }
            .header span { font-size: 10px; font-style: italic; color: #71717a; }
            
            .grid-4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
            .card { border: 1px solid #d4d4d8; padding: 15px; border-radius: 8px; background: #fafafa; }
            .card span { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #52525b; display: block; }
            .card h2 { font-size: 22px; font-weight: 900; margin: 5px 0 0 0; }

            .section-box { border: 1px solid #d4d4d8; padding: 15px; border-radius: 8px; margin-bottom: 15px; background: #fafafa; }
            .section-box h3 { font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; margin-top: 0; }
            .row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f4f4f5; }
            .row:last-child { border-bottom: none; }
            
            .signatures { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 60px; text-align: center; font-size: 11px; }
            .sign-line { border-bottom: 1px solid #18181b; margin-top: 45px; margin-bottom: 5px; width: 80%; margin-left: auto; margin-right: auto; }
          </style>
        </head>
        <body>
          <div class="header">
            <p>Republic of the Philippines</p>
            <p>Province of Zambales • Municipality of Castillejos</p>
            <h1>BARANGAY SAN AGUSTIN</h1>
            <h3>OFFICIAL DEMOGRAPHIC & FINANCIAL SUMMARY REPORT</h3>
            <span>Generated on: ${currentDateFormatted}</span>
          </div>

          <div class="grid-4">
            <div class="card">
              <span>Total Residents</span>
              <h2>${stats.totalResidents.toLocaleString()}</h2>
            </div>
            <div class="card">
              <span>Household Leaders</span>
              <h2>${stats.householdLeadersCount.toLocaleString()}</h2>
            </div>
            <div class="card">
              <span>PWD Beneficiaries</span>
              <h2>${stats.pwdCount.toLocaleString()}</h2>
            </div>
            <div class="card">
              <span>Senior Citizens</span>
              <h2>${stats.seniorCount.toLocaleString()}</h2>
            </div>
          </div>
          <div class="card" style="margin-bottom: 20px;">
            <span>Youth Sector (30 & Below)</span>
            <h2>${stats.youthCount.toLocaleString()}</h2>
          </div>

          <div class="section-box">
            <h3>Document Requests Summary</h3>
            <div class="row"><span>Total Document Applications</span> <strong>${stats.totalRequests}</strong></div>
            <div class="row"><span>Completed & Released Documents</span> <strong>${stats.completedRequests}</strong></div>
            <div class="row"><span>Pending / In-Process Requests</span> <strong>${stats.pendingRequests}</strong></div>
          </div>

          <div class="section-box">
            <h3>Financial & Project Balance Breakdown</h3>
            <div class="row"><span>Total Approved Project Budget</span> <strong>₱${stats.totalBudget.toLocaleString()}</strong></div>
            <div class="row"><span>Total Recorded Project Expenses</span> <strong>₱${stats.totalExpenses.toLocaleString()}</strong></div>
            <div class="row"><span>Net Remaining Fund Balance</span> <strong>₱${stats.remainingBalance.toLocaleString()}</strong></div>
          </div>

          <div class="signatures">
            <div>
              <p>Prepared By:</p>
              <div class="sign-line"></div>
              <strong>BARANGAY SECRETARY / RECORD OFFICER</strong>
              <p style="margin:2px 0; color:#52525b;">Barangay San Agustin</p>
            </div>
            <div>
              <p>Approved & Certified By:</p>
              <div class="sign-line"></div>
              <strong>HON. PUNONG BARANGAY</strong>
              <p style="margin:2px 0; color:#52525b;">Barangay San Agustin</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">ANALYTICS & REPORTS</h2>
          <p className="text-xs text-zinc-500 mt-1">Real-time demographic overview, document request metrics, and financial project summaries.</p>
        </div>
        <button onClick={handlePrint} className="walkin-trigger-btn">
          <Printer size={16} />
          <span>Export / Print Official Report</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-900/80 font-black uppercase tracking-wider">Total Residents</span>
              <Users size={16} className="text-amber-600" />
            </div>
            <p className="text-3xl font-black text-zinc-900">{loading ? '...' : stats.totalResidents.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-900/80 font-black uppercase tracking-wider">Household Leaders</span>
              <Home size={16} className="text-amber-600" />
            </div>
            <p className="text-3xl font-black text-amber-600">{loading ? '...' : stats.householdLeadersCount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-rose-900/80 font-black uppercase tracking-wider">PWD Beneficiaries</span>
              <HeartHandshake size={16} className="text-rose-600" />
            </div>
            <p className="text-3xl font-black text-rose-600">{loading ? '...' : stats.pwdCount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-900/80 font-black uppercase tracking-wider">Senior Citizens</span>
              <UserCheck size={16} className="text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-900">{loading ? '...' : stats.seniorCount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-900/80 font-black uppercase tracking-wider">Kabataan / Youth</span>
              <Sparkles size={16} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-700">{loading ? '...' : stats.youthCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-xs text-zinc-900 border-b border-amber-100 pb-3 flex items-center gap-2 uppercase tracking-wider">
              <FileText size={16} className="text-amber-600" />Document Requests Summary
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="font-semibold text-zinc-700">Total Document Applications</span>
                <span className="font-mono font-black text-zinc-900">{stats.totalRequests}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="font-semibold text-emerald-800">Completed & Released Documents</span>
                <span className="font-mono font-black text-emerald-700">{stats.completedRequests}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-amber-800">Pending / In-Process Requests</span>
                <span className="font-mono font-black text-amber-700">{stats.pendingRequests}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-xs text-zinc-900 border-b border-amber-100 pb-3 flex items-center gap-2 uppercase tracking-wider">
              <DollarSign size={16} className="text-amber-600" />Financial & Project Balance Breakdown
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="font-semibold text-zinc-700">Total Approved Project Budget</span>
                <span className="font-mono font-black text-blue-900">₱{stats.totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="font-semibold text-rose-700">Total Recorded Project Expenses</span>
                <span className="font-mono font-black text-rose-600">₱{stats.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-emerald-800">Net Remaining Fund Balance</span>
                <span className={`font-mono font-black ${stats.remainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>₱{stats.remainingBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}