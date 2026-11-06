import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Info, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail,
  Search,
  Building2,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LandingPage({ onNavigate, projects = [] }) {
  const [searchTracking, setSearchTracking] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
          date: new Date(data.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          isPaid: data.is_paid
        });
      } else {
        setSearchError('Walang nakitang kahilingan gamit ang Tracking ID na ito.');
      }
    } catch (err) {
      console.error('Error searching request:', err.message);
      setSearchError('May naganap na error sa paghahanap.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-black text-amber-400 text-xs sm:text-sm py-2.5 px-4 text-center font-medium border-b border-amber-500/20 flex items-center justify-center space-x-2">
        <span className="bg-amber-500 text-black font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
          OFFICIAL NOTICE
        </span>
        <span className="truncate">
          Document processing fees are strictly paid <strong>in-person</strong> at the Barangay Hall during collection.
        </span>
      </div>

      {/* 2. NAVIGATION BAR */}
      <nav className="bg-black/95 backdrop-blur-md text-white border-b-2 border-amber-500 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => onNavigate('landing')}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-amber-500/20 border border-amber-300">
                SA
              </div>
              <div>
                <span className="font-black text-lg sm:text-xl tracking-tight text-white block leading-tight">
                  BARANGAY SAN AGUSTIN
                </span>
                <span className="text-[11px] text-amber-400 font-bold tracking-widest uppercase block">
                  Castillejos, Zambales • E-Portal
                </span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-300">
              <a href="#services" className="hover:text-amber-400 transition-colors">Services</a>
              <a href="#tracking" className="hover:text-amber-400 transition-colors">Track Request</a>
              <a href="#transparency" className="hover:text-amber-400 transition-colors">Transparency</a>
              <a href="#contact" className="hover:text-amber-400 transition-colors">Contact</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onNavigate('login')}
                className="text-white hover:text-amber-400 font-bold text-sm px-4 py-2.5 transition"
              >
                Log In
              </button>
              <button 
                onClick={() => onNavigate('register')}
                className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 transition transform hover:-translate-y-0.5 border border-amber-400"
              >
                Register Resident
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="relative bg-black text-white py-20 lg:py-28 overflow-hidden border-b border-amber-500/20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Empowering Barangay San Agustin Digitally</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                Seamless, Honest & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                  Modern Governance
                </span>
              </h1>
              
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Apply for official barangay clearances, certificates, and monitor public project expenditures from the comfort of your home.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={() => onNavigate('login')}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-4 px-8 rounded-xl shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span>Apply For Document</span>
                  <ChevronRight size={18} />
                </button>
                <a 
                  href="#transparency"
                  className="bg-white/5 hover:bg-white/10 text-amber-400 font-bold py-4 px-8 rounded-xl border border-amber-500/40 backdrop-blur-sm transition flex items-center justify-center space-x-2"
                >
                  <BarChart3 size={18} />
                  <span>Public Budget Portal</span>
                </a>
              </div>
            </div>

            {/* Right Quick Search / Card */}
            <div className="lg:col-span-5" id="tracking">
              <div className="bg-gradient-to-b from-neutral-900 to-black border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Search size={18} className="text-amber-400" />
                    <span>Quick Status Lookup</span>
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-full border border-amber-500/30 uppercase">
                    Live Portal
                  </span>
                </div>

                <form onSubmit={handleQuickSearch} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Enter Request Tracking ID</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="REQ-2026-XXXXXX"
                        value={searchTracking}
                        onChange={(e) => setSearchTracking(e.target.value)}
                        className="w-full bg-black/60 border border-amber-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                      />
                      <button 
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-2 top-2 bg-amber-500 text-black px-3 py-1.5 rounded-lg font-extrabold text-xs hover:bg-amber-600 transition"
                      >
                        {isSearching ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>
                </form>

                {searchError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 text-center">
                    {searchError}
                  </div>
                )}

                {searchResult && (
                  <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Tracking Code:</span>
                      <span className="font-mono font-bold text-white text-xs">{searchResult.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Document:</span>
                      <span className="font-bold text-amber-400 text-xs">{searchResult.document}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Date/Time:</span>
                      <span className="text-gray-300 text-xs">{searchResult.date}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-amber-500/20 text-xs">
                      <span className="text-gray-300">Status:</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        searchResult.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        searchResult.status === 'ready_for_pickup' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {searchResult.status === 'ready_for_pickup' ? 'Ready for Pickup' : searchResult.status}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-400">Average Release</p>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">24 - 48 Hours</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-400">Available Permits</p>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">5 Official Docs</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SERVICES GRID */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              E-SERVICES DIRECTORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black">
              Authorized Barangay Documents
            </h2>
            <p className="text-gray-600 text-sm">
              Request official barangay documentation online with verified identity control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-amber-500 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-black text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-lg text-black mb-2">Barangay Clearance</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                Official clearance requirement for local employment, postal ID, and background verification.
              </p>
              <button onClick={() => onNavigate('login')} className="text-xs font-bold text-amber-600 hover:text-black flex items-center space-x-1">
                <span>Apply Online</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-amber-500 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-black text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-lg text-black mb-2">Certificate of Indigency</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                For residents seeking financial, medical, or educational assistance from government agencies.
              </p>
              <button onClick={() => onNavigate('login')} className="text-xs font-bold text-amber-600 hover:text-black flex items-center space-x-1">
                <span>Apply Online</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-amber-500 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-black text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <h3 className="font-bold text-lg text-black mb-2">Business Clearance</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                Barangay clearance for opening or renewing commercial business operations in San Agustin.
              </p>
              <button onClick={() => onNavigate('login')} className="text-xs font-bold text-amber-600 hover:text-black flex items-center space-x-1">
                <span>Apply Online</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-amber-500 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-black text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>
              <h3 className="font-bold text-lg text-black mb-2">First-Time Job Seeker</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                Free clearance processing under Republic Act 11261 for first-time job-seeking residents.
              </p>
              <button onClick={() => onNavigate('login')} className="text-xs font-bold text-amber-600 hover:text-black flex items-center space-x-1">
                <span>Apply Online (Free)</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PUBLIC TRANSPARENCY DASHBOARD SECTION */}
      <section id="transparency" className="py-20 bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">GOOD GOVERNANCE & ACCOUNTABILITY</span>
              <h2 className="text-3xl font-extrabold text-black mt-1">Public Transparency Dashboard</h2>
            </div>
            <p className="text-xs text-gray-500 max-w-md">
              Real-time disclosure of barangay infrastructure projects, budget allocations, expenditures, and remaining balances.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 bg-black text-white flex justify-between items-center border-b border-amber-500">
              <span className="font-bold text-amber-400 text-sm tracking-wide">Infrastructure & Community Projects</span>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30">
                FY 2026 Disclosure
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-xs border-b">
                    <th className="p-4">Project Title</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Allocated Budget</th>
                    <th className="p-4">Total Expenses</th>
                    <th className="p-4">Fund Balance</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {projects.length > 0 ? (
                    projects.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900">{p.project_title}</td>
                        <td className="p-4 text-gray-600">{p.location_purok}</td>
                        <td className="p-4 font-mono font-semibold">₱{Number(p.allocated_budget).toLocaleString()}</td>
                        <td className="p-4 font-mono text-red-600 font-semibold">₱{Number(p.total_expenses).toLocaleString()}</td>
                        <td className="p-4 font-mono text-green-700 font-bold">₱{(p.allocated_budget - p.total_expenses).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase bg-blue-100 text-blue-800">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No public project records loaded yet. Connect to Supabase to display records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer id="contact" className="bg-black text-gray-400 pt-16 pb-8 border-t-2 border-amber-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-extrabold text-lg">
                  SA
                </div>
                <span className="font-bold text-white text-lg">Barangay San Agustin</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Official E-Governance & Resident Information Portal of Barangay San Agustin, Castillejos, Zambales.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-4">Quick Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onNavigate('login')} className="hover:text-white transition">Resident Login</button></li>
                <li><button onClick={() => onNavigate('register')} className="hover:text-white transition">Register Account</button></li>
                <li><a href="#transparency" className="hover:text-white transition">Transparency Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-4">Document Services</h4>
              <ul className="space-y-2 text-xs">
                <li>Barangay Clearance</li>
                <li>Certificate of Indigency</li>
                <li>Certificate of Residency</li>
                <li>First-Time Job Seeker Clearance</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest mb-4">Barangay Hall Address</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center space-x-2">
                  <MapPin size={16} className="text-amber-400 shrink-0" />
                  <span>San Agustin, Castillejos, Zambales, Philippines</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone size={16} className="text-amber-400 shrink-0" />
                  <span>+63 (047) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail size={16} className="text-amber-400 shrink-0" />
                  <span>info@barangaysanagustin.gov.ph</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© 2026 Barangay San Agustin E-Governance Portal. All rights reserved.</p>
            <p className="text-amber-400/80 font-semibold">Capstone Thesis Research Project</p>
          </div>
        </div>
      </footer>

    </div>
  );
}