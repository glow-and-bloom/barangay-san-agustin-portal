import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Menu, X } from 'lucide-react';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Layouts & Sidebars
import ResidentLayout from './layouts/ResidentLayout';
import AdminSidebar from './components/AdminSidebar';

// Pages
import LandingPage from './pages/LandingPage';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import RequestDocument from './pages/resident/RequestDocument';
import ResidentProfile from './pages/resident/ResidentProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentRecords from './pages/admin/ResidentRecords';
import ManageRequests from './pages/admin/ManageRequests';
import ProjectsFinancials from './pages/admin/ProjectsFinancials';
import Notifications from './pages/admin/Notifications';
import ActivityLogs from './pages/admin/ActivityLogs';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [residentTab, setResidentTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const [myRequests, setMyRequests] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [residentsList, setResidentsList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && !isRegistering) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && !isRegistering) {
        fetchProfile(session.user.id);
      } else if (!session) {
        setProfile(null);
      }
    });

    fetchProjects();
    fetchResidents();

    return () => subscription.unsubscribe();
  }, [isRegistering]);

  const fetchProfile = async (userId) => {
    let { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      if (data.role === 'admin' || data.role === 'staff') {
        setCurrentView('admin');
        fetchAdminRequests();
      } else {
        setCurrentView('resident');
        fetchResidentRequests(userId);
      }
    }
  };

  const fetchProjects = async () => {
    let { data } = await supabase.from('barangay_projects').select('*');
    if (!data || data.length === 0) {
      const res = await supabase.from('projects').select('*');
      data = res.data;
    }
    if (data) setProjects(data);
  };

  const fetchResidents = async () => {
    const { data } = await supabase.from('residents').select('*').order('created_at', { ascending: false });
    if (data) setResidentsList(data);
  };

  const fetchResidentRequests = async (userId) => {
    const { data } = await supabase
      .from('document_requests')
      .select('*, residents!inner(profile_id)')
      .eq('residents.profile_id', userId);
    if (data) setMyRequests(data);
  };

  const fetchAdminRequests = async () => {
    const { data } = await supabase
      .from('document_requests')
      .select('*, residents(first_name, last_name, purok)')
      .order('created_at', { ascending: false });
    if (data) setAdminRequests(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setCurrentView('landing');
  };

  const handleDocumentSubmit = async (docType, purpose) => {
    setLoading(true);
    setSuccessMsg('');

    try {
      const { data: resData } = await supabase
        .from('residents')
        .select('id')
        .eq('profile_id', session.user.id)
        .single();

      const trackingNumber = `REQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const payload = {
        tracking_number: trackingNumber,
        resident_id: resData ? resData.id : null,
        requested_by: session.user.id,
        document_type: docType,
        purpose,
        status: 'pending',
        fee_amount: docType === 'first_time_job_seeker' ? 0.00 : 50.00
      };

      const { error } = await supabase.from('document_requests').insert([payload]);

      if (error) throw error;

      setSuccessMsg(`Document request submitted successfully! Tracking No: ${trackingNumber}`);
      fetchResidentRequests(session.user.id);
    } catch (err) {
      console.error('Error submitting request:', err.message);
      alert(`Error submitting request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reqId, status, extraData = {}) => {
    const payload = { status };

    if (extraData.pickup_date) {
      payload.pickup_date = extraData.pickup_date;
    }

    if (status === 'completed') {
      payload.is_paid = true;
      if (extraData.orNo) {
        payload.payment_reciept_no = extraData.orNo;
      }
      payload.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('document_requests')
      .update(payload)
      .eq('id', reqId)
      .select();

    if (error) {
      alert(`Update failed: ${error.message}`);
    } else {
      fetchAdminRequests();
    }
  };

  if (currentView === 'landing') {
    return <LandingPage onNavigate={(view) => setCurrentView(view)} projects={projects} />;
  }

  if (currentView === 'login') {
    return <LoginPage onNavigate={(view) => setCurrentView(view)} onLoginSuccess={fetchProfile} />;
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
        {residentTab === 'dashboard' && <ResidentDashboard requests={myRequests} />}
        {residentTab === 'request' && <RequestDocument onSubmitRequest={handleDocumentSubmit} loading={loading} successMsg={successMsg} />}
        {residentTab === 'profile' && <ResidentProfile profile={profile} />}
      </ResidentLayout>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row relative">
        
        {/* Mobile Header na may Hamburger Menu Button */}
        <div className="md:hidden bg-black text-white p-4 flex justify-between items-center border-b border-amber-500 z-30 sticky top-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-extrabold text-sm">
              SA
            </div>
            <span className="font-bold text-sm tracking-wider">ADMIN PORTAL</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-amber-400 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar para sa Desktop at Mobile Drawer */}
        <div className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <AdminSidebar 
            activeTab={adminTab} 
            setActiveTab={(tab) => {
              setAdminTab(tab);
              setIsMobileMenuOpen(false); // Automatic na isasara ang menu kapag pinindot sa mobile
            }} 
            onLogout={handleLogout} 
            userEmail={profile?.email || session?.user?.email} 
          />
        </div>

        {/* Overlay para sa mobile kapag bukas ang menu */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
        
        {/* Main Content Area na may Colored Watermark Logo sa Likod */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full md:max-w-7xl relative">
          
          {/* Malaki at Colored Watermark Logo sa Likod */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
            <img 
              src="/logo.jfif" 
              alt="Watermark Logo" 
              className="w-[350px] sm:w-[500px] md:w-[650px] h-[350px] sm:h-[500px] md:h-[650px] object-contain opacity-15"
            />
          </div>

          {/* Lahat ng Active Components ay nakapatong sa ibabaw (z-10) */}
          <div className="relative z-10 space-y-6">
            {adminTab === 'dashboard' && (
              <AdminDashboard 
                requests={adminRequests} 
                residents={residentsList} 
                projects={projects} 
                onNavigate={(route) => {
                  if (route === 'managerequests') setAdminTab('requests');
                  else if (route === 'projectfinancial') setAdminTab('financials');
                  else if (route === 'notification') setAdminTab('notifications');
                  else if (route === 'residentrecords') setAdminTab('residents');
                  else setAdminTab(route);
                }} 
              />
            )}
            {adminTab === 'residents' && <ResidentRecords residents={residentsList} onRefresh={fetchResidents} />}
            {adminTab === 'requests' && <ManageRequests requests={adminRequests} onUpdateStatus={handleUpdateStatus} />}
            {adminTab === 'financials' && <ProjectsFinancials projects={projects} onRefresh={fetchProjects} />}
            {adminTab === 'notifications' && <Notifications />}
            {adminTab === 'logs' && <ActivityLogs />}
          </div>

        </main>
      </div>
    );
  }
}