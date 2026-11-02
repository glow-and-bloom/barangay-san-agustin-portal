import React, { useState } from 'react';
import { Search, UserPlus, X, Phone, MapPin, CheckCircle2, ShieldAlert, Heart, HeartOff, Users, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ResidentRecords({ residents = [], onRefresh }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null); // State para sa View Record Modal
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Comprehensive Resident Form State
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    birth_date: '',
    gender: 'Male',
    civil_status: 'single',
    contact_number: '',
    email: '',
    household_number: '',
    street_address: '',
    purok: 'Purok 1',
    is_head_of_household: false,
    voter_status: 'registered',
    is_pwd: false,
    pwd_id_number: '',
    is_4ps: false,
    four_ps_id: '',
    vital_status: 'alive',
    date_of_death: '',
    death_certificate_no: '',
    guardian_id: ''
  });

  // Calculate age dynamically
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = calculateAge(formData.birth_date) < 18 && formData.birth_date !== '';
  const isSenior = calculateAge(formData.birth_date) >= 60;

  // Filter adult residents for guardian selection
  const adultResidents = residents.filter(res => {
    const age = calculateAge(res.birth_date);
    return age >= 18 || !res.birth_date;
  });

  // Filter residents based on search
  const filteredResidents = residents.filter((res) => {
    const fullName = `${res.first_name || ''} ${res.middle_name || ''} ${res.last_name || ''}`.toLowerCase();
    const purok = (res.purok || '').toLowerCase();
    const hhNo = (res.household_number || '').toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || purok.includes(query) || hhNo.includes(query);
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddResident = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Pre-validation: Check for potential duplicate record
    const { data: duplicate } = await supabase
      .from('residents')
      .select('id')
      .ilike('first_name', formData.first_name.trim())
      .ilike('last_name', formData.last_name.trim())
      .eq('birth_date', formData.birth_date)
      .maybeSingle();

    if (duplicate) {
      setErrorMsg('A resident with the exact same name and birth date already exists in the database.');
      setLoading(false);
      return;
    }

    const payload = {
      full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
      first_name: formData.first_name.trim(),
      middle_name: formData.middle_name.trim(),
      last_name: formData.last_name.trim(),
      suffix: formData.suffix.trim(),
      birth_date: formData.birth_date,
      gender: formData.gender,
      civil_status: formData.civil_status,
      contact_number: formData.contact_number.trim(),
      email: formData.email.trim(),
      household_number: formData.household_number.trim(),
      street_address: formData.street_address.trim(),
      purok: formData.purok,
      is_head_of_household: formData.is_head_of_household,
      voter_status: formData.voter_status,
      is_pwd: formData.is_pwd,
      pwd_id_number: formData.is_pwd ? formData.pwd_id_number.trim() : null,
      is_4ps: formData.is_4ps,
      four_ps_id: formData.is_4ps ? formData.four_ps_id.trim() : null,
      vital_status: formData.vital_status,
      date_of_death: formData.vital_status === 'deceased' ? formData.date_of_death : null,
      death_certificate_no: formData.vital_status === 'deceased' ? formData.death_certificate_no.trim() : null,
      guardian_id: isMinor && formData.guardian_id ? formData.guardian_id : null
    };

    const { error } = await supabase.from('residents').insert([payload]);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Resident Records</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Comprehensive resident database, household listings, and demographic classifications for Barangay San Agustin.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-black text-amber-400 font-extrabold px-4 py-2.5 rounded-xl border border-amber-500/50 shadow-md transition-all text-xs cursor-pointer"
        >
          <UserPlus size={16} className="text-amber-400" />
          <span>Add New Resident</span>
        </button>
      </div>

      {/* TABLE CONTAINER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by full name, household no, or purok..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div className="text-xs font-semibold text-zinc-500 self-end sm:self-center">
            Total Records: <span className="font-bold text-zinc-900">{filteredResidents.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-100">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                <th className="p-3.5 font-bold">Full Name</th>
                <th className="p-3.5 font-bold">Household No.</th>
                <th className="p-3.5 font-bold">Purok Address</th>
                <th className="p-3.5 font-bold">Age / Demographics</th>
                <th className="p-3.5 font-bold">Classifications</th>
                <th className="p-3.5 font-bold">Vital Status</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredResidents.length > 0 ? (
                filteredResidents.map((res) => {
                  const age = calculateAge(res.birth_date);
                  return (
                    <tr key={res.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-zinc-900">
                        {res.first_name} {res.middle_name ? `${res.middle_name[0]}.` : ''} {res.last_name} {res.suffix || ''}
                        {res.is_head_of_household && (
                          <span className="ml-2 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 font-extrabold uppercase">
                            Head
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-700">
                        {res.household_number || 'N/A'}
                      </td>
                      <td className="p-3.5 text-zinc-700">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-zinc-400" />
                          {res.purok || 'San Agustin'}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-700">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{age > 0 ? `${age} yrs` : 'N/A'}</span>
                          {age >= 60 && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold uppercase">Senior</span>
                          )}
                          {age < 18 && age > 0 && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold uppercase">Minor</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {res.is_pwd && <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 text-[9px] font-extrabold rounded">PWD</span>}
                          {res.is_4ps && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded">4Ps</span>}
                          <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 text-[9px] font-bold rounded uppercase">{res.voter_status || 'Registered'}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {res.vital_status === 'deceased' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 font-extrabold rounded-md text-[10px] tracking-wider uppercase border border-rose-200">
                            <HeartOff size={11} /> DECEASED
                          </span>
                        ) : res.vital_status === 'relocated' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 text-zinc-700 font-extrabold rounded-md text-[10px] tracking-wider uppercase">
                            RELOCATED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold rounded-md text-[10px] tracking-wider uppercase">
                            <CheckCircle2 size={11} /> ALIVE
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedResident(res)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-900 hover:text-amber-400 text-zinc-700 font-bold rounded-lg text-xs transition-all shadow-sm"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-zinc-400">
                    No matching resident records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW INDIVIDUAL RESIDENT RECORD MODAL */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-amber-500/30 max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-8 space-y-6">
            
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-zinc-900 text-amber-400 rounded-lg">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Resident Profile Details</h3>
                  <p className="text-xs text-zinc-500">Official demographic and household record overview.</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Personal Info */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-2">
                <h4 className="font-extrabold uppercase tracking-wider text-amber-600 mb-2">Personal Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Full Name</span>
                    <span className="font-bold text-zinc-900 text-sm">
                      {selectedResident.first_name} {selectedResident.middle_name || ''} {selectedResident.last_name} {selectedResident.suffix || ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Gender & Civil Status</span>
                    <span className="font-bold text-zinc-800 uppercase">{selectedResident.gender} • {selectedResident.civil_status}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Birth Date & Age</span>
                    <span className="font-bold text-zinc-800">{selectedResident.birth_date} ({calculateAge(selectedResident.birth_date)} years old)</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Contact Number / Email</span>
                    <span className="font-mono text-zinc-800">{selectedResident.contact_number || 'N/A'} • {selectedResident.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Household & Address */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-2">
                <h4 className="font-extrabold uppercase tracking-wider text-amber-600 mb-2">Household & Address</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Household Number</span>
                    <span className="font-mono font-bold text-zinc-900">{selectedResident.household_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Household Head Status</span>
                    <span className="font-bold text-zinc-800">{selectedResident.is_head_of_household ? 'Yes (Head of Household)' : 'Member'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Complete Address</span>
                    <span className="font-bold text-zinc-800">{selectedResident.street_address || ''}, {selectedResident.purok}, Barangay San Agustin, Castillejos, Zambales</span>
                  </div>
                </div>
              </div>

              {/* Classifications & Programs */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-2">
                <h4 className="font-extrabold uppercase tracking-wider text-amber-600 mb-2">Demographic Classifications</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Voter Status</span>
                    <span className="font-bold text-zinc-800 uppercase">{selectedResident.voter_status || 'Registered'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">PWD Beneficiary</span>
                    <span className="font-bold text-zinc-800">{selectedResident.is_pwd ? `Yes (${selectedResident.pwd_id_number || 'No ID'})` : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">4Ps Beneficiary</span>
                    <span className="font-bold text-zinc-800">{selectedResident.is_4ps ? `Yes (${selectedResident.four_ps_id || 'No ID'})` : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Vital Status */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-2">
                <h4 className="font-extrabold uppercase tracking-wider text-amber-600 mb-2">Vital Status Record</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Current Status</span>
                    <span className="font-extrabold uppercase text-zinc-900">{selectedResident.vital_status || 'Alive'}</span>
                  </div>
                  {selectedResident.vital_status === 'deceased' && (
                    <div>
                      <span className="text-rose-600 block font-semibold uppercase text-[10px]">Date of Death & Certificate No.</span>
                      <span className="font-bold text-rose-800">{selectedResident.date_of_death || 'N/A'} ({selectedResident.death_certificate_no || 'N/A'})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedResident(null)}
                className="px-5 py-2 bg-zinc-900 hover:bg-black text-amber-400 font-extrabold rounded-xl text-xs"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* COMPREHENSIVE ADD RESIDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-amber-500/30 max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-zinc-900 text-amber-400 rounded-lg">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Add Resident Profile</h3>
                  <p className="text-xs text-zinc-500">Record complete personal, demographic, and household information.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl mb-4 text-xs font-semibold border border-rose-200 flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddResident} className="space-y-6">
              
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 border-b pb-1">
                  1. Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">First Name *</label>
                    <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" placeholder="Juan" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Middle Name</label>
                    <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" placeholder="Reyes" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Last Name *</label>
                    <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" placeholder="Dela Cruz" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Suffix</label>
                    <input type="text" name="suffix" value={formData.suffix} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" placeholder="Jr. / III" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Birth Date *</label>
                    <input type="date" name="birth_date" required value={formData.birth_date} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Civil Status</label>
                    <select name="civil_status" value={formData.civil_status} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs">
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="separated">Separated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Contact Number</label>
                    <input type="text" name="contact_number" value={formData.contact_number} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" placeholder="09123456789" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" placeholder="resident@gmail.com" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: HOUSEHOLD & ADDRESS */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 border-b pb-1">
                  2. Household & Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Household Number *</label>
                    <input type="text" name="household_number" required value={formData.household_number} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" placeholder="HH-2026-001" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Purok *</label>
                    <select name="purok" value={formData.purok} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs">
                      <option value="Purok 1">Purok 1</option>
                      <option value="Purok 2">Purok 2</option>
                      <option value="Purok 3">Purok 3</option>
                      <option value="Purok 4">Purok 4</option>
                      <option value="Purok 5">Purok 5</option>
                      <option value="Purok 6">Purok 6</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Street Address</label>
                    <input type="text" name="street_address" value={formData.street_address} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" placeholder="Main St., San Agustin" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input type="checkbox" id="is_head_of_household" name="is_head_of_household" checked={formData.is_head_of_household} onChange={handleInputChange} className="rounded text-amber-500 focus:ring-amber-500" />
                  <label htmlFor="is_head_of_household" className="text-xs font-bold text-zinc-800">Set as Head of Household</label>
                </div>
              </div>

              {/* SECTION 3: GUARDIAN LINKING FOR MINORS */}
              {isMinor && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <Users size={15} />
                    <span>Minor Detected (Age under 18) — Link Adult Household Guardian</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Select Guardian / Parent</label>
                    <select name="guardian_id" value={formData.guardian_id} onChange={handleInputChange} className="w-full border border-blue-300 p-2 rounded-lg text-xs bg-white">
                      <option value="">-- Select Registered Adult Resident --</option>
                      {adultResidents.map(adult => (
                        <option key={adult.id} value={adult.id}>
                          {adult.first_name} {adult.last_name} ({adult.purok})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* SECTION 4: DEMOGRAPHIC & PROGRAM CLASSIFICATIONS */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 border-b pb-1">
                  3. Demographic & Assistance Programs
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Voter Status</label>
                    <select name="voter_status" value={formData.voter_status} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs">
                      <option value="registered">Registered Voter</option>
                      <option value="non_registered">Non-Registered</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-2 border rounded-lg bg-zinc-50">
                    <span className="text-xs font-bold text-zinc-700">Senior Citizen Status</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${isSenior ? 'bg-purple-100 text-purple-800' : 'bg-zinc-200 text-zinc-600'}`}>
                      {isSenior ? 'AUTO-DETECTED (60+)' : 'NOT APPLICABLE'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3 border rounded-xl space-y-2 bg-sky-50/40">
                    <div className="flex items-center justify-between">
                      <label htmlFor="is_pwd" className="text-xs font-bold text-sky-900">Person with Disability (PWD)</label>
                      <input type="checkbox" id="is_pwd" name="is_pwd" checked={formData.is_pwd} onChange={handleInputChange} className="rounded text-sky-600" />
                    </div>
                    {formData.is_pwd && (
                      <input type="text" name="pwd_id_number" value={formData.pwd_id_number} onChange={handleInputChange} className="w-full border border-sky-300 p-1.5 rounded text-xs bg-white" placeholder="PWD ID Number" />
                    )}
                  </div>

                  <div className="p-3 border rounded-xl space-y-2 bg-emerald-50/40">
                    <div className="flex items-center justify-between">
                      <label htmlFor="is_4ps" className="text-xs font-bold text-emerald-900">4Ps Household Beneficiary</label>
                      <input type="checkbox" id="is_4ps" name="is_4ps" checked={formData.is_4ps} onChange={handleInputChange} className="rounded text-emerald-600" />
                    </div>
                    {formData.is_4ps && (
                      <input type="text" name="four_ps_id" value={formData.four_ps_id} onChange={handleInputChange} className="w-full border border-emerald-300 p-1.5 rounded text-xs bg-white" placeholder="4Ps Household ID Number" />
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 5: VITAL STATUS */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 border-b pb-1">
                  4. Vital Status Record
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Vital Status</label>
                    <select name="vital_status" value={formData.vital_status} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs">
                      <option value="alive">Alive</option>
                      <option value="deceased">Deceased</option>
                      <option value="relocated">Relocated</option>
                    </select>
                  </div>

                  {formData.vital_status === 'deceased' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-rose-800 uppercase mb-1">Date of Death</label>
                        <input type="date" name="date_of_death" value={formData.date_of_death} onChange={handleInputChange} className="w-full border border-rose-300 p-2 rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-rose-800 uppercase mb-1">Death Certificate No.</label>
                        <input type="text" name="death_certificate_no" value={formData.death_certificate_no} onChange={handleInputChange} className="w-full border border-rose-300 p-2 rounded-lg text-xs" placeholder="DC-2026-XXXX" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-amber-400 font-extrabold rounded-xl border border-amber-500/50 shadow text-xs"
                >
                  {loading ? 'Validating & Saving...' : 'Save Resident Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}