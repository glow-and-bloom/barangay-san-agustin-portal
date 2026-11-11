import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Menu, X, Bell, Loader2 } from 'lucide-react';
import { logAdminActivity } from './lib/logger';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import ResidentLayout from './layouts/ResidentLayout';
import AdminSidebar from './components/AdminSidebar';

import LandingPage from './pages/LandingPage';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import RequestDocument from './pages/resident/RequestDocument';
import ResidentProfile from './pages/resident/ResidentProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentRecords from './pages/admin/ResidentRecords';
import ManageRequests from './pages/admin/ManageRequests';
import RequestedDocuments from './pages/admin/RequestedDocuments';
import ProjectsFinancials from './pages/admin/ProjectsFinancials';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageOfficials from './pages/admin/ManageOfficials';
import ManageServices from './pages/admin/ManageServices';
import ManageFeedback from './pages/admin/ManageFeedback';
import ActivityLogs from './pages/admin/ActivityLogs';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [residentTab, setResidentTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('dashboard');

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [myRequests, setMyRequests] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [residentsList, setResidentsList] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const prevRequestsLengthRef = useRef(0);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [slidingId, setSlidingId] = useState(null);

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return `${seconds <= 0 ? 1 : seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  const notifications = adminRequests
    .filter((req) => !dismissedIds.includes(req.id))
    .map((req) => {
      const residentName = req.residents 
        ? `${req.residents.first_name} ${req.residents.last_name}` 
        : 'Resident';
      const docType = req.document_type ? req.document_type.replace(/_/g, ' ') : 'Document';

      return {
        id: req.id,
        text: `${residentName} requested a ${docType} (${req.status})`,
        time: getRelativeTime(req.created_at),
        status: req.status
      };
    });

  useEffect(() => {
    if (notifications.length > prevRequestsLengthRef.current) {
      setHasUnreadNotifs(true);
    }
    prevRequestsLengthRef.current = notifications.length;
  }, [notifications.length]);

  const handleDismissNotification = (id) => {
    setDismissedIds((prev) => [...prev, id]);
    setSlidingId(null);
  };

  const onTouchStart = (e, id) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSlidingId(id);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (id) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    if (isLeftSwipe) {
      handleDismissNotification(id);
    } else {
      setSlidingId(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        setSession(existingSession);
        if (existingSession) {
          await fetchProfile(existingSession.user.id);
        }
      } catch (err) {
        console.error("Auth session fetch error:", err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (newSession) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
        setCurrentView('landing');
      }
      setIsAuthChecking(false);
    });

    fetchProjects();
    fetchResidents();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [adminTab]);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return;

      setProfile(data);

      if (data.role === 'admin' || data.role === 'staff') {
        setCurrentView('admin');
        fetchAdminRequests();
      } else {
        setCurrentView('resident');
        fetchResidentRequests(userId);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      let { data } = await supabase.from('barangay_projects').select('*');
      if (!data || data.length === 0) {
        const result = await supabase.from('projects').select('*');
        data = result.data;
      }
      if (data) setProjects(data);
    } catch (err) {
      console.error("Fetch projects error:", err);
    }
  };

  const fetchResidents = async () => {
    try {
      const { data } = await supabase.from('residents').select('*').order('created_at', { ascending: false });
      if (data) setResidentsList(data);
    } catch (err) {
      console.error("Fetch residents error:", err);
    }
  };

  const fetchResidentRequests = async (userId) => {
    try {
      const { data } = await supabase
        .from('document_requests')
        .select('*, residents!inner(profile_id)')
        .eq('residents.profile_id', userId);

      if (data) setMyRequests(data);
    } catch (err) {
      console.error("Fetch resident requests error:", err);
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const { data } = await supabase
        .from('document_requests')
        .select('*, residents(first_name, last_name, purok)')
        .order('created_at', { ascending: false });

      if (data) setAdminRequests(data);
    } catch (err) {
      console.error("Fetch admin requests error:", err);
    }
  };

  const handleLogout = async () => {
    const adminName = profile?.first_name ? `${profile.first_name} ${profile.last_name}` : (session?.user?.email || 'Administrator');
    if (profile?.role === 'admin' || profile?.role === 'staff') {
      await logAdminActivity('Authentication', 'Admin Signed Out', adminName, 'Signed out from the portal.');
    }
    
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setCurrentView('landing');
    setMobileMenuOpen(false);
  };

  const handleDocumentSubmit = async (docType, purpose) => {
    setLoading(true);
    setSuccessMsg('');

    try {
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('id')
        .eq('profile_id', session.user.id)
        .single();

      if (residentError) throw residentError;

      const trackingNumber = `REQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const payload = {
        tracking_number: trackingNumber,
        resident_id: residentData.id,
        requested_by: session.user.id,
        document_type: docType,
        purpose,
        status: 'pending',
        fee_amount: docType === 'first_time_job_seeker' ? 0 : 50
      };

      const { error } = await supabase.from('document_requests').insert([payload]);
      if (error) throw error;

      setSuccessMsg(`Document request submitted successfully! Tracking No: ${trackingNumber}`);
      await fetchResidentRequests(session.user.id);
    } catch (err) {
      alert(`Error submitting request: ${err.message || 'Failed to fetch network request.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reqId, status, extraData = {}) => {
    const payload = { status };

    if (extraData.pickup_date) {
      payload.pickup_date = extraData.pickup_date;
    }

    if (status === 'completed' || status === 'released') {
      payload.is_paid = true;
      payload.paid_at = new Date().toISOString();

      if (extraData.orNo) {
        payload.payment_reciept_no = extraData.orNo;
      }
    }

    const { error } = await supabase
      .from('document_requests')
      .update(payload)
      .eq('id', reqId);

    if (error) {
      alert(`Update failed: ${error.message}`);
    } else {
      const adminName = profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'Administrator';
      await logAdminActivity('Documents', 'Processed & Released Document', adminName, `Updated request ID ${reqId} status to ${status}`);
      await fetchAdminRequests();
    }
  };

  const handleAdminNavigation = (route) => {
    const routes = {
      'requested-documents': 'requested-documents',
      managerequests: 'requests',
      projectfinancial: 'financials',
      residentrecords: 'residents',
      announcements: 'announcements',
      officials: 'officials',
      services: 'services',
      feedback: 'feedback',
      reports: 'reports',
      logs: 'logs',
      settings: 'settings'
    };

    setAdminTab(routes[route] || route);
    setMobileMenuOpen(false);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-amber-400 font-sans space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-xs font-bold tracking-widest uppercase">Authenticating session...</p>
      </div>
    );
  }

  if (currentView === 'landing') {
    return <LandingPage onNavigate={setCurrentView} projects={projects} />;
  }

  if (currentView === 'login') {
    return <LoginPage onNavigate={setCurrentView} onLoginSuccess={fetchProfile} />;
  }

  if (currentView === 'register') {
    return (
      <RegisterPage
        onNavigate={(view) => {
          setIsRegistering(false);
          setCurrentView(view);
        }}
        setIsRegistering={setIsRegistering}
      />
    );
  }

  if (currentView === 'resident') {
    return (
      <ResidentLayout
        activeTab={residentTab}
        setActiveTab={setResidentTab}
        onLogout={handleLogout}
        residentName={profile?.first_name || session?.user?.email}
        userEmail={session?.user?.email}
      >
        <div className="relative z-10">
          {residentTab === 'dashboard' && <ResidentDashboard requests={myRequests} />}
          {residentTab === 'request' && <RequestDocument onSubmitRequest={handleDocumentSubmit} loading={loading} successMsg={successMsg} />}
          {residentTab === 'profile' && <ResidentProfile profile={profile} />}
        </div>
      </ResidentLayout>
    );
  }

  if (currentView === 'admin') {
    const adminFullName = profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'Administrator';

    return (
      <div className="min-h-screen bg-zinc-100 flex overflow-hidden font-sans">
        {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

        <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 bg-gradient-to-b from-amber-50 via-white to-amber-100/60 shadow-xl transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-3 right-3 z-[60] md:hidden">
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-amber-100 text-amber-900 cursor-pointer"><X size={22} /></button>
          </div>
          <AdminSidebar activeTab={adminTab} setActiveTab={setAdminTab} onLogout={handleLogout} userEmail={profile?.email || session?.user?.email} />
        </aside>

        <main className="flex-1 min-w-0 h-screen overflow-y-auto relative">
          <header className="sticky top-0 z-30 bg-gradient-to-r from-amber-50 via-white to-amber-100/95 backdrop-blur-md border-b border-amber-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 md:hidden cursor-pointer border border-amber-300"><Menu size={22} /></button>
              <div className="min-w-0"><h1 className="text-sm sm:text-base font-extrabold text-zinc-900 uppercase tracking-tight">{adminTab.replace('-', ' ')}</h1></div>
            </div>

            <div className="flex items-center gap-3 relative">
              <button onClick={() => { setNotificationOpen(!notificationOpen); if (!notificationOpen) setHasUnreadNotifs(false); }} className="relative p-2.5 rounded-xl bg-amber-100/80 hover:bg-amber-200 text-amber-800 transition cursor-pointer border border-amber-300" title="Notifications">
                <Bell size={18} />
                {hasUnreadNotifs && notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">{notifications.length}</span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-amber-300 rounded-2xl shadow-2xl p-4 z-50 text-zinc-900">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-800">Resident Requests ({notifications.length})</h3>
                    <button onClick={() => setNotificationOpen(false)} className="text-zinc-400 hover:text-zinc-900"><X size={16} /></button>
                  </div>
                  <div className="py-3 space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} onTouchStart={(e) => onTouchStart(e, notif.id)} onTouchMove={onTouchMove} onTouchEnd={() => onTouchEnd(notif.id)} className={`p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between ${slidingId === notif.id ? '-translate-x-10 opacity-50' : 'translate-x-0'}`}>
                          <div><p className="text-zinc-800 font-medium">{notif.text}</p><span className="text-[10px] text-amber-700/80 mt-1 block">{notif.time}</span></div>
                          <button onClick={(e) => { e.stopPropagation(); handleDismissNotification(notif.id); }} className="text-[10px] text-red-600 px-2 py-1 bg-red-50 rounded-lg border border-red-200">Delete</button>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-xs text-zinc-500">No new resident requests at the moment.</div>
                    )}
                  </div>
                </div>
              )}
              <span className="hidden sm:inline-flex text-xs bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3.5 py-1.5 rounded-full font-black border border-amber-300 shadow-sm">ADMIN</span>
            </div>
          </header>

          <div className="fixed inset-y-0 right-0 left-0 md:left-72 pointer-events-none overflow-hidden z-0 flex items-center justify-center translate-y-9">
            <img src="logo.jfif" alt="Barangay Watermark" className="w-[min(85vw,550px)] md:w-[min(55vw,650px)] h-[min(85vw,550px)] md:h-[min(55vw,690px)] object-contain opacity-[0.08]" />
          </div>

          <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {adminTab === 'dashboard' && <AdminDashboard requests={adminRequests} residents={residentsList} projects={projects} onNavigate={handleAdminNavigation} />}
            {adminTab === 'requested-documents' && <RequestedDocuments />}
            {adminTab === 'residents' && <ResidentRecords residents={residentsList} onRefresh={fetchResidents} adminName={adminFullName} />}
            {adminTab === 'requests' && <ManageRequests requests={adminRequests} residents={residentsList} onUpdateStatus={handleUpdateStatus} adminName={adminFullName} />}
            {adminTab === 'financials' && <ProjectsFinancials projects={projects} onRefresh={fetchProjects} adminName={adminFullName} />}
            {adminTab === 'announcements' && <ManageAnnouncements />}
            {adminTab === 'officials' && <ManageOfficials />}
            {adminTab === 'services' && <ManageServices />}
            {adminTab === 'feedback' && <ManageFeedback />}
            {adminTab === 'reports' && <Reports adminName={adminFullName} />}
            {adminTab === 'logs' && <ActivityLogs />}
            {adminTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    );
  }

  return null;
}