import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  ChevronRight, 
  Search, 
  Building2,
  Sparkles,
  ArrowUpRight,
  MapPin, 
  Phone, 
  Mail,
  Bell,
  ShieldCheck,
  Menu,
  X,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ApplyDocumentModal from '../components/ApplyDocumentModal';

export default function LandingPage({ onNavigate, projects = [] }) {
  const [searchTracking, setSearchTracking] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Application Modal States
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState('Certificate of Indigency');

  const [announcements, setAnnouncements] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [services, setServices] = useState([]);
  const [approvedFeedbacks, setApprovedFeedbacks] = useState([]);
  const [mv, setMv] = useState({ mission: '', vision: '' });
  
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  useEffect(() => {
    async function loadLandingData() {
      try {
        const { data: ann } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (ann) setAnnouncements(ann);

        const { data: off } = await supabase.from('officials').select('*');
        if (off) setOfficials(off);

        const { data: srv } = await supabase.from('services').select('*');
        if (srv && srv.length > 0) {
          setServices(srv);
        } else {
          setServices([
            { id: 1, title: 'Certificate of Residency', description: 'Official proof of residence for local verification.' },
            { id: 2, title: 'Certificate of Indigency', description: 'For financial, medical, or educational assistance.' },
            { id: 3, title: 'Barangay Clearance', description: 'Essential clearance requirement for local employment.' },
            { id: 4, title: 'Business Permit', description: 'Clearance required to operate local businesses.' }
          ]);
        }

        const { data: settings } = await supabase.from('settings').select('*').maybeSingle();
        if (settings) setMv({ mission: settings.mission || '', vision: settings.vision || '' });

        const { data: fdb } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
        if (fdb) setApprovedFeedbacks(fdb);
      } catch (err) {
        console.error("Error loading landing data:", err);
      }
    }
    loadLandingData();
  }, []);

  const handleQuickSearch = async (e) => {
    e.preventDefault();
    if (!searchTracking.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const { data, error } = await supabase
        .from('document_requests')
        .select('*')
        .ilike('tracking_number', searchTracking.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSearchResult({
          id: data.tracking_number,
          status: data.status,
          document: data.document_type?.replace(/_/g, ' ').toUpperCase(),
          pickupDate: data.pickup_date ? new Date(data.pickup_date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : null
        });
      } else {
        setSearchError('No request found with this Tracking ID.');
      }
    } catch (err) {
      setSearchError('An error occurred while searching.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;

    const { error } = await supabase.from('feedbacks').insert([{
      resident_name: feedbackName || 'Anonymous Resident',
      message: feedbackMsg,
      rating: 5,
      status: 'pending'
    }]);

    if (!error) {
      setFeedbackSuccess('Feedback submitted successfully! Waiting for admin approval.');
      setFeedbackMsg('');
      setFeedbackName('');
    } else {
      alert('Failed to send feedback: ' + error.message);
    }
  };

  const openServiceModal = (serviceTitle) => {
    setSelectedServiceTitle(serviceTitle || 'Certificate of Indigency');
    setIsApplyModalOpen(true);
  };

  // Grouping officials accurately
  const captain = officials.find(o => o.position?.toLowerCase().includes('captain') || o.position?.toLowerCase().includes('punong')) || null;
  const councilors = officials.filter(o => o.position?.toLowerCase().includes('councilor') || o.position?.toLowerCase().includes('kagawad'));
  const skChairman = officials.find(o => 
    o.position?.toLowerCase().includes('sk') || 
    o.position?.toLowerCase().includes('sangguniang kabataan') ||
    o.position?.toLowerCase().includes('youth')
  ) || null;
  const secretary = officials.find(o => o.position?.toLowerCase().includes('secretary')) || null;
  const treasurer = officials.find(o => o.position?.toLowerCase().includes('treasurer')) || null;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-amber-400 selection:text-zinc-950">
      
      {/* NAVIGATION BAR */}
      <nav className="bg-white border-b border-amber-300 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => onNavigate('landing')}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center text-zinc-950 font-black text-base shadow-xs border border-amber-300">
                SA
              </div>
              <div>
                <span className="font-black text-sm sm:text-lg tracking-tight text-zinc-950 block leading-tight">BARANGAY SAN AGUSTIN</span>
                <span className="text-[9px] sm:text-[10px] text-amber-700 font-extrabold tracking-widest uppercase block">Castillejos, Zambales • E-Portal</span>
              </div>
            </div>

            <div className="hidden xl:flex items-center space-x-5 text-[11px] font-black uppercase tracking-wider text-zinc-700">
              <a href="#home" className="hover:text-amber-700 transition">Home</a>
              <a href="#announcements" className="hover:text-amber-700 transition">Announcements</a>
              <a href="#mission" className="hover:text-amber-700 transition">Mission & Vision</a>
              <a href="#officials" className="hover:text-amber-700 transition">Officials</a>
              <a href="#services" className="hover:text-amber-700 transition">Services</a>
              <a href="#transparency" className="hover:text-amber-700 transition">Transparency</a>
              <a href="#feedback" className="hover:text-amber-700 transition">Feedback</a>
            </div>

            <div className="hidden sm:flex items-center space-x-2 shrink-0">
              <button onClick={() => onNavigate('login')} className="text-zinc-900 hover:text-amber-800 font-black text-xs uppercase tracking-wider px-3 py-2 transition cursor-pointer">Sign In</button>
              <button onClick={() => onNavigate('register')} className="bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition border border-amber-300 cursor-pointer">Sign Up</button>
            </div>

            <div className="flex items-center xl:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 cursor-pointer">
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-amber-300 px-4 pt-3 pb-6 space-y-3 font-black text-xs uppercase tracking-wider text-zinc-800 shadow-xl">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-amber-100">Home</a>
            <a href="#announcements" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-amber-100">Announcements</a>
            <a href="#mission" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-amber-100">Mission & Vision</a>
            <a href="#officials" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-amber-100">Officials</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-amber-100">Services</a>
            <a href="#transparency" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-amber-100">Transparency</a>
            <a href="#feedback" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-amber-100">Feedback</a>
            <div className="pt-2 flex flex-col gap-2">
              <button onClick={() => onNavigate('login')} className="w-full py-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-300 cursor-pointer">Sign In</button>
              <button onClick={() => onNavigate('register')} className="w-full py-3 bg-amber-400 text-zinc-950 rounded-xl border border-amber-300 shadow cursor-pointer">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="relative bg-gradient-to-b from-amber-50/50 via-white to-white py-12 sm:py-16 lg:py-24 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-full text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="text-amber-700" /> <span>Empowering Barangay San Agustin Digitally</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-[1.15]">
                Seamless, Honest & <br />
                <span className="text-amber-600">Modern Governance</span>
              </h1>
              <p className="text-zinc-600 text-sm sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Apply for official barangay clearances, certificates, and monitor public project expenditures online.
              </p>
              <div className="flex justify-center lg:justify-start pt-2">
                <button onClick={() => openServiceModal('Certificate of Indigency')} className="bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black py-4 px-8 rounded-xl shadow-sm flex items-center space-x-2 transition uppercase tracking-wider text-xs border border-amber-300 cursor-pointer">
                  <span>Apply For Document</span> <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5" id="tracking">
              <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-8 shadow-md relative">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900 flex items-center space-x-2 mb-4 border-b border-amber-200 pb-3">
                  <Search size={18} className="text-amber-600" /> <span>Quick Status Lookup</span>
                </h3>
                <form onSubmit={handleQuickSearch} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">Enter Request Tracking ID</label>
                    <div className="relative">
                      <input 
                        type="text" placeholder="REQ-2026-XXXXXX"
                        value={searchTracking} onChange={(e) => setSearchTracking(e.target.value)}
                        className="w-full bg-amber-50/40 border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-amber-500 font-mono"
                      />
                      <button type="submit" disabled={isSearching} className="absolute right-1.5 top-1.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider cursor-pointer">
                        {isSearching ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>
                </form>
                {searchError && <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-bold">{searchError}</div>}
                {searchResult && (
                  <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-zinc-600 font-semibold">Tracking Code:</span> <strong className="text-zinc-900 font-mono">{searchResult.id}</strong></div>
                    <div className="flex justify-between"><span className="text-zinc-600 font-semibold">Document:</span> <strong className="text-amber-800">{searchResult.document}</strong></div>
                    <div className="flex justify-between"><span className="text-zinc-600 font-semibold">Status:</span> <strong className="text-emerald-700 uppercase">{searchResult.status}</strong></div>
                    {searchResult.pickupDate && (
                      <div className="flex justify-between pt-1 border-t border-amber-200"><span className="text-zinc-600 font-semibold">Pick-up Schedule:</span> <strong className="text-blue-700 font-mono">{searchResult.pickupDate}</strong></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS SECTION */}
      <section id="announcements" className="py-14 sm:py-20 bg-white border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] sm:text-xs font-extrabold text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">LATEST UPDATES</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 mt-2 uppercase tracking-tight">Barangay Announcements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.length > 0 ? announcements.map(a => (
              <div key={a.id} className="p-6 rounded-3xl bg-white border-2 border-amber-300 shadow-xs flex flex-col items-center text-center space-y-4">
                <h4 className="font-black text-sm sm:text-base text-zinc-950">{a.title}</h4>
                {a.image_url ? (
                  <div className="w-full h-56 bg-zinc-50 rounded-2xl overflow-hidden border border-amber-200 shadow-inner">
                    <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-amber-50/50 rounded-2xl flex items-center justify-center text-xs text-zinc-400 border border-amber-200 font-medium">
                    Announcement Notice
                  </div>
                )}
                {a.content && <p className="text-xs text-zinc-600 leading-relaxed">{a.content}</p>}
              </div>
            )) : (
              <div className="col-span-3 text-center py-10 bg-amber-50/20 rounded-3xl border border-amber-200 text-xs text-zinc-500 font-semibold">
                No announcements posted at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MISSION & VISION SECTION */}
      <section id="mission" className="py-14 sm:py-20 bg-amber-50/20 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] sm:text-xs font-extrabold text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">CORE VALUES</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 mt-2 uppercase tracking-tight">Mission & Vision</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-300 shadow-xs space-y-3">
              <h3 className="text-base sm:text-lg font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={18} className="text-amber-600" /> Barangay Mission
              </h3>
              <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed">{mv.mission || 'To provide fast, transparent, and responsive public service.'}</p>
            </div>
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-400 shadow-xs space-y-3">
              <h3 className="text-base sm:text-lg font-black text-amber-800 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-600" /> Barangay Vision
              </h3>
              <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed">{mv.vision || 'A progressive, united, and secure community.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* OFFICIALS SECTION */}
      <section id="officials" className="py-16 bg-white border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">LEADERSHIP DIRECTORY</span>
            <h2 className="text-3xl font-black text-zinc-950 mt-3 uppercase tracking-tight">Barangay San Agustin Officials</h2>
          </div>

          {/* 1. BARANGAY CAPTAIN */}
          <div className="text-center space-y-4">
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-2 inline-block px-6">Barangay Captain</h3>
            <div className="max-w-xs mx-auto p-6 rounded-3xl bg-amber-50/50 border-2 border-amber-300 text-center space-y-3 shadow-xs">
              <h4 className="font-extrabold text-sm text-zinc-900">{captain ? captain.name : 'No Captain Assigned'}</h4>
              <div className="w-28 h-28 rounded-full bg-amber-100 font-black text-2xl flex items-center justify-center mx-auto shadow-inner border-2 border-amber-400 overflow-hidden text-amber-900">
                {captain?.image_url ? <img src={captain.image_url} alt={captain.name} className="w-full h-full object-cover" /> : (captain?.name ? captain.name[0] : 'C')}
              </div>
              <div>
                <p className="text-xs text-amber-800 font-black uppercase tracking-wider">{captain?.position || 'Barangay Captain'}</p>
                {captain?.committee && <p className="text-[11px] text-zinc-600 font-medium mt-0.5">{captain.committee}</p>}
              </div>
            </div>
          </div>

          <hr className="border-amber-200 my-8" />

          {/* 2. BARANGAY COUNCILOR */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-2 inline-block px-6">Barangay Councilor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {councilors.length > 0 ? councilors.map(o => (
                <div key={o.id} className="p-5 rounded-3xl bg-amber-50/30 border border-amber-300 text-center space-y-2.5 shadow-2xs">
                  <h4 className="font-extrabold text-xs text-zinc-900">{o.name}</h4>
                  <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-900 font-black text-lg flex items-center justify-center mx-auto shadow border border-amber-300 overflow-hidden">
                    {o.image_url ? <img src={o.image_url} alt={o.name} className="w-full h-full object-cover" /> : o.name[0]}
                  </div>
                  <p className="text-[10px] text-zinc-600 font-semibold">{o.committee || 'Councilor'}</p>
                </div>
              )) : (
                <p className="text-center text-xs text-zinc-400 font-semibold col-span-full">No councilors registered yet.</p>
              )}
            </div>
          </div>

          <hr className="border-amber-200 my-8" />

          {/* 3. BARANGAY SANGGUNIANG KABATAAN */}
          <div className="text-center space-y-4">
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-2 inline-block px-6">Barangay Sangguniang Kabataan</h3>
            <div className="max-w-xs mx-auto p-6 rounded-3xl bg-amber-50/50 border-2 border-amber-300 text-center space-y-3 shadow-xs">
              <h4 className="font-extrabold text-sm text-zinc-900">{skChairman ? skChairman.name : 'No SK Chairman Assigned'}</h4>
              <div className="w-28 h-28 rounded-full bg-amber-100 font-black text-2xl flex items-center justify-center mx-auto shadow-inner border-2 border-amber-400 overflow-hidden text-amber-900">
                {skChairman?.image_url ? <img src={skChairman.image_url} alt={skChairman.name} className="w-full h-full object-cover" /> : (skChairman?.name ? skChairman.name[0] : 'SK')}
              </div>
              <div>
                <p className="text-xs text-amber-800 font-black uppercase tracking-wider">{skChairman?.position || 'Sangguniang Kabataan Chairman'}</p>
                {skChairman?.committee && <p className="text-[11px] text-zinc-600 font-medium mt-0.5">{skChairman.committee}</p>}
              </div>
            </div>
          </div>

          <hr className="border-amber-200 my-8" />

          {/* 4. BARANGAY SECRETARY AND BARANGAY TREASURER */}
          <div className="space-y-4 text-center">
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-2 inline-block px-6">Barangay Secretary and Barangay Treasurer</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {secretary && (
                <div className="w-64 p-6 rounded-3xl bg-amber-50/50 border-2 border-amber-300 text-center space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-xs text-zinc-900">{secretary.name}</h4>
                  <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-900 font-black text-xl flex items-center justify-center mx-auto shadow border border-amber-300 overflow-hidden">
                    {secretary.image_url ? <img src={secretary.image_url} alt={secretary.name} className="w-full h-full object-cover" /> : secretary.name[0]}
                  </div>
                  <p className="text-xs text-amber-800 font-black uppercase tracking-wider">{secretary.position}</p>
                </div>
              )}
              {treasurer && (
                <div className="w-64 p-6 rounded-3xl bg-amber-50/50 border-2 border-amber-300 text-center space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-xs text-zinc-900">{treasurer.name}</h4>
                  <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-900 font-black text-xl flex items-center justify-center mx-auto shadow border border-amber-300 overflow-hidden">
                    {treasurer.image_url ? <img src={treasurer.image_url} alt={treasurer.name} className="w-full h-full object-cover" /> : treasurer.name[0]}
                  </div>
                  <p className="text-xs text-amber-800 font-black uppercase tracking-wider">{treasurer.position}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SERVICES DIRECTORY SECTION */}
      <section id="services" className="py-14 sm:py-20 bg-amber-50/20 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-2">
            <span className="text-[10px] sm:text-xs font-extrabold text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">E-SERVICES DIRECTORY</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight">Barangay San Agustin Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {services.map(s => (
              <div key={s.id || s.title} className="p-6 rounded-3xl bg-white border border-amber-300 shadow-2xs hover:border-amber-500 transition flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950 flex items-center justify-center font-black text-xl shadow border border-amber-400">
                  SA
                </div>
                <h3 className="font-black text-base text-zinc-900">{s.title}</h3>
                <p className="text-zinc-600 text-xs leading-relaxed">{s.description || 'Official document provided by Barangay San Agustin.'}</p>
                
                <button 
                  onClick={() => openServiceModal(s.title)} 
                  className="mt-auto bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase px-6 py-2.5 rounded-xl shadow cursor-pointer border border-amber-300 transition"
                >
                  Proceed
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARENCY DASHBOARD SECTION (Alternating table row colors) */}
      <section id="transparency" className="py-14 sm:py-20 bg-white border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-[10px] sm:text-xs font-extrabold text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">GOOD GOVERNANCE</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 mt-2 uppercase tracking-tight">Public Transparency Dashboard</h2>
          </div>
          <div className="bg-white rounded-3xl shadow-md border border-amber-300 overflow-hidden">
            <div className="p-4 sm:p-6 bg-amber-400 text-zinc-950 flex justify-between items-center border-b border-amber-300">
              <span className="font-extrabold text-zinc-950 text-xs uppercase tracking-wider">Infrastructure & Community Projects</span>
              <span className="text-[10px] bg-white text-zinc-950 font-black px-3 py-1 rounded-full border border-amber-300 uppercase tracking-wider">FY 2026 Disclosure</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-amber-100/70 text-amber-950 uppercase tracking-wider font-black text-[10px] border-b border-amber-200">
                    <th className="p-4">Project Title</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Allocated Budget</th>
                    <th className="p-4">Total Expenses</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                  {projects.length > 0 ? projects.map((p, index) => (
                    <tr key={p.id} className={index % 2 === 0 ? 'bg-white hover:bg-amber-50/40' : 'bg-amber-50/30 hover:bg-amber-50/60'}>
                      <td className="p-4 font-bold text-zinc-950">{p.project_title || p.name}</td>
                      <td className="p-4 text-zinc-600">{p.location_purok}</td>
                      <td className="p-4 font-mono font-bold text-zinc-900">₱{Number(p.allocated_budget || 0).toLocaleString()}</td>
                      <td className="p-4 font-mono font-bold text-rose-600">₱{Number(p.total_expenses || 0).toLocaleString()}</td>
                      <td className="p-4"><span className="px-2.5 py-1 rounded-full font-black text-[10px] uppercase bg-amber-100 text-amber-800 border border-amber-300">{p.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-8 text-center text-zinc-400 font-medium">No project records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FEEDBACK SECTION */}
      <section id="feedback" className="py-14 sm:py-20 bg-amber-50/20 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[10px] sm:text-xs font-extrabold text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">USER EXPERIENCE</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 mt-2 uppercase tracking-tight">Resident Feedbacks</h2>
            <p className="text-xs text-zinc-600 mt-1 font-medium">Testimonials and feedback shared by residents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {approvedFeedbacks.length > 0 ? approvedFeedbacks.map(f => (
              <div key={f.id} className="bg-white p-6 rounded-3xl border border-amber-300 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-zinc-950 font-black flex items-center justify-center text-sm border border-amber-300">
                    {f.resident_name ? f.resident_name[0] : 'R'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">{f.resident_name}</h4>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1"><Star size={10} className="text-amber-500 fill-amber-500" /> Resident</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-700 italic">"{f.message}"</p>
                <span className="text-[10px] text-zinc-400 text-right">{new Date(f.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            )) : (
              <div className="col-span-3 text-center py-8 bg-white rounded-3xl border border-amber-200 text-xs text-zinc-500 font-semibold">
                No feedbacks available at the moment.
              </div>
            )}
          </div>

          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-amber-300 shadow-md">
            <h3 className="text-lg font-black text-zinc-900 mb-2 text-center uppercase">Submit Your Feedback</h3>
            <p className="text-xs text-zinc-500 text-center mb-6">Share your thoughts or comments regarding barangay services.</p>
            
            <form onSubmit={handleSendFeedback} className="space-y-4">
              {feedbackSuccess && <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs text-center font-bold">{feedbackSuccess}</div>}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">Your Name (Optional)</label>
                <input type="text" placeholder="Juan Dela Cruz" value={feedbackName} onChange={e => setFeedbackName(e.target.value)} className="w-full bg-amber-50/30 border border-amber-300 p-3 rounded-xl text-xs text-zinc-900 outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">Message / Comments</label>
                <textarea required rows={4} placeholder="Type your feedback here..." value={feedbackMsg} onChange={e => setFeedbackMsg(e.target.value)} className="w-full bg-amber-50/30 border border-amber-300 p-3 rounded-xl text-xs text-zinc-900 outline-none focus:border-amber-500" />
              </div>
              <button type="submit" className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition cursor-pointer border border-amber-300">Submit Feedback</button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-zinc-700 pt-12 sm:pt-16 pb-8 border-t-2 border-amber-400 mt-auto font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-zinc-950 font-black text-lg border border-amber-300">SA</div>
                <span className="font-bold text-zinc-900 text-lg">Barangay San Agustin</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">Official E-Governance & Resident Information Portal of Barangay San Agustin, Castillejos, Zambales.</p>
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-4">Quick Navigation</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li><button onClick={() => onNavigate('login')} className="hover:text-amber-700 transition cursor-pointer">Sign In</button></li>
                <li><button onClick={() => onNavigate('register')} className="hover:text-amber-700 transition cursor-pointer">Sign Up</button></li>
                <li><a href="#transparency" className="hover:text-amber-700 transition">Transparency Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-4">Document Services</h4>
              <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                <li>Barangay Clearance</li>
                <li>Certificate of Indigency</li>
                <li>Certificate of Residency</li>
                <li>Business Permit</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-4">Barangay Hall Address</h4>
              <ul className="space-y-3 text-xs font-medium">
                <li className="flex items-center space-x-2"><MapPin size={16} className="text-amber-600 shrink-0" /><span>San Agustin, Castillejos, Zambales</span></li>
                <li className="flex items-center space-x-2"><Phone size={16} className="text-amber-600 shrink-0" /><span>+63 (047) 123-4567</span></li>
                <li className="flex items-center space-x-2"><Mail size={16} className="text-amber-600 shrink-0" /><span>info@barangaysanagustin.gov.ph</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-amber-200 text-xs text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© 2026 Barangay San Agustin E-Governance Portal. All rights reserved.</p>
            <p className="text-amber-800 font-extrabold">Capstone Thesis Research Project</p>
          </div>
        </div>
      </footer>

      {/* APPLICATION WIZARD MODAL COMPONENT */}
      <ApplyDocumentModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        documentTitle={selectedServiceTitle} 
      />

    </div>
  );
}