import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Auth Pages (Hiwalay)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Sidebars & Layout
import ResidentSidebar from './components/ResidentSidebar';
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
    const { data } = await supabase.from('barangay_projects').select('*').eq('is_public_disclosed', true);
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
    const { data: resData } = await supabase.from('residents').select('id').eq('profile_id', session.user.id).single();
    const trackingNumber = `REQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error } = await supabase.from('document_requests').insert([{
      tracking_number: trackingNumber,
      resident_id: resData ? resData.id : null,
      document_type: docType,
      purpose,
      status: 'pending',
      fee_amount: docType === 'first_time_job_seeker' ? 0.00 : 50.00
    }]);

    if (!error) {
      setSuccessMsg(`Document request submitted successfully! Tracking No: ${trackingNumber}`);
      fetchResidentRequests(session.user.id);
    } else {
      alert(`Error submitting request: ${error.message}`);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (reqId, status, orNo = '') => {
    const payload = { status };
    if (status === 'completed') {
      payload.is_paid = true;
      payload.payment_reciept_no = orNo;
      payload.paid_at = new Date().toISOString();
    }
    const { error } = await supabase.from('document_requests').update(payload).eq('id', reqId);
    if (!error) {
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
      <div className="min-h-screen bg-zinc-100 flex">
        <ResidentSidebar activeTab={residentTab} setActiveTab={setResidentTab} onLogout={handleLogout} userEmail={profile?.email || session?.user?.email} />
        <main className="flex-grow p-8 overflow-y-auto max-w-7xl">
          {residentTab === 'dashboard' && <ResidentDashboard requests={myRequests} />}
          {residentTab === 'request' && <RequestDocument onSubmitRequest={handleDocumentSubmit} loading={loading} successMsg={successMsg} />}
          {residentTab === 'profile' && <ResidentProfile profile={profile} />}
        </main>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-zinc-100 flex">
        <AdminSidebar activeTab={adminTab} setActiveTab={setAdminTab} onLogout={handleLogout} userEmail={profile?.email || session?.user?.email} />
        <main className="flex-grow p-8 overflow-y-auto max-w-7xl">
          {adminTab === 'dashboard' && <AdminDashboard requests={adminRequests} residents={residentsList} projects={projects} />}
          {adminTab === 'residents' && <ResidentRecords residents={residentsList} onRefresh={fetchResidents} />}
          {adminTab === 'requests' && <ManageRequests requests={adminRequests} onUpdateStatus={handleUpdateStatus} />}
          {adminTab === 'financials' && <ProjectsFinancials projects={projects} />}
          {adminTab === 'notifications' && <Notifications />}
          {adminTab === 'logs' && <ActivityLogs />}
        </main>
      </div>
    );
  }
}