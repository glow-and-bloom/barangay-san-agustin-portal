import React, { useState } from 'react';
import { Search, UserPlus, X, MapPin, ShieldAlert, Eye, Trash2, Home, Edit3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ResidentRecords({ residents = [], onRefresh }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null); 
  const [editingResident, setEditingResident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const initialFormState = {
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
    residency_type: 'since_birth',
    years_of_residency: '',
    is_head_of_household: false,
    household_leader_id: '',
    voter_status: 'registered',
    is_pwd: false,
    pwd_id_number: '',
    is_4ps: false,
    four_ps_id: '',
    vital_status: 'alive',
    date_of_death: '',
    death_certificate_no: '',
    guardian_id: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // AUTOMATIC DYNAMIC AGE COMPUTATION (Nagdadagdag kada taon)
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

  // AUTOMATIC DYNAMIC RESIDENCY COMPUTATION (Since Birth = Age)
  const calculateResidencyText = (res) => {
    if (!res) return '0 yrs';
    if (res.residency_type === 'since_birth') {
      const age = calculateAge(res.birth_date);
      return `${age} yrs`;
    }
    return `${res.years_of_residency || 0} yrs`;
  };

  const isMinor = calculateAge(formData.birth_date) < 18 && formData.birth_date !== '';

  const householdLeaders = residents.filter(res => res.is_head_of_household);

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

  const handleOpenEdit = (res) => {
    setEditingResident(res);
    setFormData({
      first_name: res.first_name || '',
      middle_name: res.middle_name || '',
      last_name: res.last_name || '',
      suffix: res.suffix || '',
      birth_date: res.birth_date || '',
      gender: res.gender || 'Male',
      civil_status: res.civil_status || 'single',
      contact_number: res.contact_number || '',
      email: res.email || '',
      household_number: res.household_number || '',
      street_address: res.street_address || '',
      purok: res.purok || 'Purok 1',
      residency_type: res.residency_type || 'since_birth',
      years_of_residency: res.years_of_residency || '',
      is_head_of_household: Boolean(res.is_head_of_household),
      household_leader_id: res.household_leader_id || '',
      voter_status: res.voter_status || 'registered',
      is_pwd: Boolean(res.is_pwd),
      pwd_id_number: res.pwd_id_number || '',
      is_4ps: Boolean(res.is_4ps),
      four_ps_id: res.four_ps_id || '',
      vital_status: res.vital_status || 'alive',
      date_of_death: res.date_of_death || '',
      death_certificate_no: res.death_certificate_no || '',
      guardian_id: res.guardian_id || ''
    });
  };

  const handleSaveResident = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = {
      full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
      first_name: formData.first_name.trim(),
      middle_name: formData.middle_name.trim() || null,
      last_name: formData.last_name.trim(),
      suffix: formData.suffix.trim() || null,
      birth_date: formData.birth_date,
      gender: formData.gender,
      civil_status: formData.civil_status,
      contact_number: formData.contact_number.trim() || null,
      email: formData.email.trim() || null,
      household_number: formData.household_number.trim(),
      street_address: formData.street_address.trim() || null,
      purok: formData.purok,
      residency_type: formData.residency_type,
      years_of_residency: formData.residency_type === 'since_birth' ? null : (parseInt(formData.years_of_residency) || 0),
      is_head_of_household: formData.is_head_of_household,
      household_leader_id: formData.is_head_of_household ? null : (formData.household_leader_id || null),
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

    let result;
    if (editingResident) {
      result = await supabase.from('residents').update(payload).eq('id', editingResident.id);
    } else {
      result = await supabase.from('residents').insert([payload]);
    }

    if (result.error) {
      setErrorMsg(result.error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setIsModalOpen(false);
      setEditingResident(null);
      setFormData(initialFormState);
      if (onRefresh) onRefresh();
    }
  };

const handleDeleteResident = async (id, residentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the record for ${residentName}? This will also delete all associated document requests.`
    );
    if (!confirmed) return;

    try {
      // 1. Burahin muna ang kaugnay na document requests ng residente
      const { error: docError } = await supabase
        .from('document_requests')
        .delete()
        .eq('resident_id', id);

      if (docError) throw docError;

      // 2. Burahin ang mismong resident record
      const { error: resError } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);

      if (resError) throw resError;

      if (onRefresh) onRefresh();
      alert('Resident record and associated requests successfully deleted.');
    } catch (err) {
      alert(`Failed to delete resident record: ${err.message}`);
    }
  };

  const getHouseholdDetails = (resident) => {
    if (resident.is_head_of_household) {
      const members = residents.filter(r => 
        (r.household_leader_id === resident.id || (r.household_number && r.household_number === resident.household_number)) && 
        r.id !== resident.id
      );
      return { leader: resident, members };
    } 
    
    let leader = null;
    if (resident.household_leader_id) {
      leader = residents.find(r => r.id === resident.household_leader_id);
    }
    if (!leader && resident.household_number) {
      leader = residents.find(r => r.household_number === resident.household_number && r.is_head_of_household);
    }

    const members = residents.filter(r => 
      r.household_number === resident.household_number && r.id !== resident.id
    );

    return { leader, members };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Resident Records</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Comprehensive resident database, household listings, and demographic classifications for Barangay San Agustin[cite: 8, 12].
          </p>
        </div>

        <button
          onClick={() => {
            setEditingResident(null);
            setFormData(initialFormState);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-black text-amber-400 font-extrabold px-4 py-2.5 rounded-xl border border-amber-500/50 shadow-md transition-all text-xs cursor-pointer"
        >
          <UserPlus size={16} className="text-amber-400" />
          <span>Add New Resident</span>
        </button>
      </div>

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
                <th className="p-3.5 font-bold">Residency</th>
                <th className="p-3.5 font-bold">Age</th>
                <th className="p-3.5 font-bold">Classifications</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredResidents.length > 0 ? (
                filteredResidents.map((res) => {
                  const age = calculateAge(res.birth_date);
                  const fullNameStr = `${res.first_name} ${res.last_name}`;
                  return (
                    <tr key={res.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-zinc-900">
                        {res.first_name} {res.middle_name ? `${res.middle_name[0]}.` : ''} {res.last_name} {res.suffix || ''}
                        {res.is_head_of_household && (
                          <span className="ml-2 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 font-extrabold uppercase">
                            Leader
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
                      <td className="p-3.5 font-semibold text-zinc-800">
                        <span className="text-emerald-700 font-bold">
                          {calculateResidencyText(res)}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-700">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{age > 0 ? `${age} yrs old` : 'N/A'}</span>
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
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setSelectedResident(res)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-900 hover:text-amber-400 text-zinc-700 font-bold rounded-lg text-xs transition-all shadow-sm"
                            title="View Record"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(res)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-lg text-xs transition-all shadow-sm border border-blue-200"
                            title="Edit Record"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteResident(res.id, fullNameStr)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold rounded-lg text-xs transition-all shadow-sm border border-rose-200"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
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
      {selectedResident && (() => {
        const { leader, members } = getHouseholdDetails(selectedResident);
        return (
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
                      <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Length of Residency</span>
                      <span className="font-bold text-emerald-800 uppercase">
                        {calculateResidencyText(selectedResident)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Contact Number</span>
                      <span className="font-mono text-zinc-800">{selectedResident.contact_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Email Address</span>
                      <span className="font-mono text-zinc-800">{selectedResident.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Address & Household Structure */}
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-3">
                  <h4 className="font-extrabold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
                    <Home size={14} /> Address & Household Structure
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-zinc-200/60">
                    <div>
                      <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Household Number</span>
                      <span className="font-mono font-bold text-zinc-900">{selectedResident.household_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Status in Household</span>
                      <span className="font-bold text-zinc-800">
                        {selectedResident.is_head_of_household ? 'Household Leader / Head' : 'Household Member'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Complete Address</span>
                      <span className="font-bold text-zinc-800">{selectedResident.street_address || 'No street specified'}, {selectedResident.purok}, Barangay San Agustin, Castillejos, Zambales</span>
                    </div>
                  </div>

                  {/* HOUSEHOLD LEADER INFO */}
                  <div className="pt-1">
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px] mb-1">Household Leader / Head</span>
                    {selectedResident.is_head_of_household ? (
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 font-bold">
                        👑 This resident is the Household Leader.
                      </div>
                    ) : leader ? (
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg flex justify-between items-center">
                        <span className="font-bold text-amber-900">
                          👑 {leader.first_name} {leader.last_name}
                        </span>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          {leader.contact_number || 'No contact'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic">No designated household leader linked.</span>
                    )}
                  </div>

                  {/* HOUSEHOLD MEMBERS LIST */}
                  <div className="pt-1">
                    <span className="text-zinc-400 block font-semibold uppercase text-[10px] mb-1">
                      {selectedResident.is_head_of_household ? 'Household Members under this Leader:' : 'Other Members in same Household:'}
                    </span>
                    {members.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {members.map(m => (
                          <div key={m.id} className="p-2 bg-white border border-zinc-200 rounded-lg flex justify-between items-center text-xs">
                            <span className="font-bold text-zinc-800">
                              • {m.first_name} {m.last_name} {m.is_head_of_household ? '(Co-Head)' : ''}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {calculateAge(m.birth_date)} yrs old • {m.gender} • {m.purok}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic">No other members recorded in this household.</span>
                    )}
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
        );
      })()}

      {/* ADD / EDIT RESIDENT MODAL */}
      {(isModalOpen || editingResident) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-amber-500/30 max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-zinc-900 text-amber-400 rounded-lg">
                  {editingResident ? <Edit3 size={18} /> : <UserPlus size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingResident ? 'Edit Resident Record' : 'Add Resident Profile'}
                  </h3>
                  <p className="text-xs text-zinc-500">Record complete personal, demographic, and household information.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingResident(null);
                }}
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

            <form onSubmit={handleSaveResident} className="space-y-6">
              
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 border-b pb-1">
                  1. Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">First Name *</label>
                    <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Middle Name</label>
                    <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Last Name *</label>
                    <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Suffix</label>
                    <input type="text" name="suffix" value={formData.suffix} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" />
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
              </div>

              {/* SECTION 2: HOUSEHOLD & RESIDENCY */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 border-b pb-1">
                  2. Household & Residency Length
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Household Number *</label>
                    <input type="text" name="household_number" required value={formData.household_number} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" />
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
                    <input type="text" name="street_address" value={formData.street_address} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs" />
                  </div>
                </div>

                {/* LENGTH OF RESIDENCY INPUT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Length of Residency *</label>
                    <select
                      name="residency_type"
                      value={formData.residency_type}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-300 p-2 rounded-lg text-xs bg-white"
                    >
                      <option value="since_birth">Since Birth</option>
                      <option value="custom">Specify Years (Custom)</option>
                    </select>
                  </div>
                  {formData.residency_type === 'custom' && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Number of Years *</label>
                      <input
                        type="number"
                        name="years_of_residency"
                        required
                        min="1"
                        max="100"
                        value={formData.years_of_residency}
                        onChange={handleInputChange}
                        className="w-full border border-zinc-300 p-2 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input type="checkbox" id="is_head_of_household" name="is_head_of_household" checked={formData.is_head_of_household} onChange={handleInputChange} className="rounded text-amber-500" />
                  <label htmlFor="is_head_of_household" className="text-xs font-bold text-zinc-800">Set as Head / Leader of Household</label>
                </div>

                {!formData.is_head_of_household && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Select Household Leader</label>
                    <select name="household_leader_id" value={formData.household_leader_id} onChange={handleInputChange} className="w-full border border-zinc-300 p-2 rounded-lg text-xs bg-white">
                      <option value="">-- Select Household Leader --</option>
                      {householdLeaders.map(leader => (
                        <option key={leader.id} value={leader.id}>
                          {leader.first_name} {leader.last_name} (HH: {leader.household_number || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingResident(null);
                  }}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-amber-400 font-extrabold rounded-xl border border-amber-500/50 shadow text-xs"
                >
                  {loading ? 'Saving...' : editingResident ? 'Update Resident Record' : 'Save Resident Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}