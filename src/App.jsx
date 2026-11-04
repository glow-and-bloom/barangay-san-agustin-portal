import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

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

    console.log("Submitting update for ID:", reqId, "Payload:", payload);

    const { data, error } = await supabase
      .from('document_requests')
      .update(payload)
      .eq('id', reqId)
      .select();

    if (error) {
      console.error('Supabase Update Error Details:', error);
      alert(`Update failed: ${error.message}`);
    } else {
      console.log('Successfully updated in Supabase:', data);
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