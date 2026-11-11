import React, { useState, useRef } from 'react';
import {
  Search, UserPlus, X, MapPin, ShieldAlert, Eye, Trash2,
  Home, Edit3, Camera, Upload
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAdminActivity } from '../../lib/logger';
import './ResidentRecords.css';

const initialFormState = {
  first_name: '', middle_name: '', last_name: '', suffix: '',
  birth_date: '', gender: 'Male', civil_status: 'single',
  contact_number: '', email: '', household_number: '',
  street_address: '', purok: 'Purok 1', residency_type: 'since_birth',
  years_of_residency: '', is_head_of_household: false,
  household_leader_id: '', voter_status: 'registered',
  is_pwd: false, pwd_id_number: '', is_4ps: false,
  four_ps_id: '', vital_status: 'alive', date_of_death: '',
  death_certificate_no: '', guardian_id: '', photo_url: ''
};

export default function ResidentRecords({ residents = [], onRefresh, adminName = 'Administrator' }) {
  const [search, setSearch] = useState('');
  const [selectedLeaderFilter, setSelectedLeaderFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [editingResident, setEditingResident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const calculateAge = date => {
    if (!date) return 0;
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();

    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) age--;

    return age;
  };

  const calculateResidencyText = res => {
    if (!res) return '0 YRS';
    return `${res.residency_type === 'since_birth'
      ? calculateAge(res.birth_date)
      : res.years_of_residency || 0} YRS`;
  };

  const isMinor = formData.birth_date && calculateAge(formData.birth_date) < 18;
  const householdLeaders = residents.filter(r => r.is_head_of_household);

  const filteredResidents = residents.filter(res => {
    const name = `${res.first_name || ''} ${res.middle_name || ''} ${res.last_name || ''}`.toLowerCase();
    const query = search.toLowerCase();

    return (
      (name.includes(query) ||
        (res.purok || '').toLowerCase().includes(query) ||
        (res.household_number || '').toLowerCase().includes(query)) &&
      (!selectedLeaderFilter || res.id === selectedLeaderFilter)
    );
  });

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const closeForm = () => {
    stopCamera();
    setIsModalOpen(false);
    setEditingResident(null);
    setPreviewPhoto(null);
    setErrorMsg('');
    setFormData(initialFormState);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert(`Camera error: ${err.message}`);
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewPhoto(dataUrl);
    stopCamera();
  };

  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      setPreviewPhoto(event.target.result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenEdit = res => {
    setEditingResident(res);
    setPreviewPhoto(res.photo_url || null);
    setErrorMsg('');
    setFormData({
      ...initialFormState,
      ...res,
      is_head_of_household: Boolean(res.is_head_of_household),
      is_pwd: Boolean(res.is_pwd),
      is_4ps: Boolean(res.is_4ps)
    });
  };

  const handleSaveResident = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const f = formData;

      const payload = {
        full_name: `${(f.first_name || '').trim()} ${(f.last_name || '').trim()}`,
        first_name: (f.first_name || '').trim(),
        middle_name: (f.middle_name || '').trim() || null,
        last_name: (f.last_name || '').trim(),
        suffix: (f.suffix || '').trim() || null,
        birth_date: f.birth_date,
        gender: f.gender,
        civil_status: f.civil_status,
        contact_number: (f.contact_number || '').trim() || null,
        email: (f.email || '').trim() || null,
        household_number: (f.household_number || '').trim(),
        street_address: (f.street_address || '').trim() || null,
        purok: f.purok,
        residency_type: f.residency_type,
        years_of_residency: f.residency_type === 'since_birth'
          ? null : parseInt(f.years_of_residency) || 0,
        is_head_of_household: f.is_head_of_household,
        household_leader_id: f.is_head_of_household
          ? null : f.household_leader_id || null,
        voter_status: f.voter_status,
        is_pwd: f.is_pwd,
        pwd_id_number: f.is_pwd ? (f.pwd_id_number || '').trim() : null,
        is_4ps: f.is_4ps,
        four_ps_id: f.is_4ps ? (f.four_ps_id || '').trim() : null,
        vital_status: f.vital_status,
        date_of_death: f.vital_status === 'deceased' ? f.date_of_death : null,
        death_certificate_no: f.vital_status === 'deceased'
          ? (f.death_certificate_no || '').trim() : null,
        guardian_id: isMinor && f.guardian_id ? f.guardian_id : null,
        photo_url: previewPhoto || formData.photo_url || null
      };

      const result = editingResident
        ? await supabase.from('residents').update(payload).eq('id', editingResident.id)
        : await supabase.from('residents').insert([payload]);

      if (result.error) throw result.error;

      const residentFullName = `${f.first_name} ${f.last_name}`;
      await logAdminActivity(
        'Residents',
        editingResident ? 'Updated Resident Profile' : 'Registered New Resident',
        adminName,
        `${editingResident ? 'Updated profile for' : 'Registered new resident'} ${residentFullName} (Purok ${f.purok})`
      );

      closeForm();
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Save resident error:', err);
      setErrorMsg(err.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResident = async (id, name) => {
    if (!window.confirm(
      `Are you sure you want to delete ${name}? This will also delete associated document requests.`
    )) return;

    try {
      const { error: requestError } = await supabase
        .from('document_requests').delete().eq('resident_id', id);

      if (requestError) throw requestError;

      const { error } = await supabase.from('residents').delete().eq('id', id);
      if (error) throw error;

      await logAdminActivity(
        'Residents',
        'Deleted Resident Record',
        adminName,
        `Deleted resident profile and associated records for: ${name}`
      );

      if (onRefresh) await onRefresh();
      alert('Resident record and associated requests successfully deleted.');
    } catch (err) {
      alert(`Failed to delete resident record: ${err.message}`);
    }
  };

  const getHouseholdDetails = resident => {
    if (!resident) return { leader: null, members: [] };
    const members = residents.filter(r =>
      r.household_number === resident.household_number && r.id !== resident.id
    );

    const leader = resident.is_head_of_household
      ? resident
      : residents.find(r => r.id === resident.household_leader_id) ||
        residents.find(r =>
          r.household_number === resident.household_number && r.is_head_of_household
        );

    return { leader, members };
  };

  const openAddModal = () => {
    setEditingResident(null);
    setPreviewPhoto(null);
    setErrorMsg('');
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const sectionHeading = (number, title) => (
    <h4 className="rr-section-title">
      {number}. {title}
    </h4>
  );

  const { leader, members } = selectedResident
    ? getHouseholdDetails(selectedResident)
    : { leader: null, members: [] };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-3xl font-black text-zinc-900 tracking-tight">RECORDS</h1></div>
        <button onClick={openAddModal} className="walkin-trigger-btn">
          <UserPlus size={15} />
          <span>Add New Resident</span>
        </button>
      </div>

      <div className="rr-table-card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-zinc-400" />
            <input type="text" placeholder="Search by full name, household no, or purok..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="rr-search-input" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <select value={selectedLeaderFilter}
              onChange={e => setSelectedLeaderFilter(e.target.value)}
              className="rr-filter-select">
              <option value="">-- Filter Household Leader --</option>
              {householdLeaders.map(leader => (
                <option key={leader.id} value={leader.id}>
                  {leader.first_name} {leader.last_name} (HH: {leader.household_number || 'N/A'})
                </option>
              ))}
            </select>

            <div className="text-xs font-semibold text-zinc-500 whitespace-nowrap flex items-center gap-2">
              <span>Total Residents: <strong className="text-zinc-900">{filteredResidents.length}</strong></span>
              <span className="h-3 w-px bg-zinc-300" />
              <span className="bg-[#facc15] text-emerald-950 px-2.5 py-1 rounded-lg border border-yellow-400 font-extrabold shadow-2xs">
                Total Leaders: {householdLeaders.length}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-100">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                {['Photo', 'Full Name', 'Household No.', 'Purok Address', 'Residency', 'Age', 'Classifications', 'Actions'].map(item => (
                  <th key={item} className={`p-3.5 font-bold ${item === 'Actions' ? 'text-right' : ''}`}>{item}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filteredResidents.length ? filteredResidents.map(res => {
                const age = calculateAge(res.birth_date);
                const fullName = `${res.first_name} ${res.last_name}`;

                return (
                  <tr key={res.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-3.5">
                      {res.photo_url ? (
                        <img src={res.photo_url} alt="Profile"
                          onClick={() => setViewingPhotoUrl(res.photo_url)}
                          className="w-9 h-9 rounded-full object-cover border border-yellow-400 cursor-pointer shadow-xs" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#facc15] text-emerald-950 border border-yellow-400 flex items-center justify-center font-black text-xs shadow-xs">
                          {(res.first_name?.[0] || 'R').toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-zinc-900">
                      {res.first_name} {res.middle_name ? `${res.middle_name[0]}.` : ''} {res.last_name} {res.suffix || ''}
                      {res.is_head_of_household && (<span className="rr-badge-leader">LEADER</span>)}
                    </td>
                    <td className="p-3.5 font-mono text-zinc-700">{res.household_number || 'N/A'}</td>
                    <td className="p-3.5 text-zinc-700">
                      <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-[#facc15]" />{res.purok || 'San Agustin'}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-950">{calculateResidencyText(res)}</td>
                    <td className="p-3.5 font-bold text-zinc-700">{age > 0 ? `${age} yrs old` : 'N/A'}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {res.is_pwd && <span className="rr-badge-yellow">PWD</span>}
                        {res.is_4ps && <span className="rr-badge-yellow">4Ps</span>}
                        <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 text-[9px] font-bold rounded uppercase">{res.voter_status || 'Registered'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button onClick={() => setSelectedResident(res)} title="View Profile" className="p-2 bg-yellow-100 hover:bg-[#facc15] text-emerald-950 rounded-lg transition border border-yellow-300">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleOpenEdit(res)} title="Edit Record" className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg transition border border-blue-200">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDeleteResident(res.id, fullName)} title="Delete Record" className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg transition border border-rose-200">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} className="p-10 text-center text-zinc-400">No matching resident records found in database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedResident && (
        <div className="rr-modal-backdrop">
          <div className="rr-modal-container max-w-2xl">
            <div className="rr-modal-header">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#facc15] text-emerald-950 rounded-xl border border-yellow-400 shadow-xs"><Eye size={18} className="text-emerald-950" /></div>
                <div>
                  <h3 className="text-sm font-extrabold text-emerald-950">Resident Profile Details</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Official demographic and household record overview.</p>
                </div>
              </div>
              <button onClick={() => setSelectedResident(null)} className="text-zinc-400 hover:text-emerald-950 p-1"><X size={18} /></button>
            </div>

            <div className="rr-modal-body space-y-3 custom-modal-scroll">
              <div className="bg-yellow-50/50 p-3.5 rounded-xl border border-yellow-200 space-y-2">
                <h4 className="rr-section-title">PERSONAL INFORMATION</h4>
                <div className="flex items-start gap-4">
                  {selectedResident.photo_url ? (
                    <img src={selectedResident.photo_url} alt="Resident Profile" onClick={() => setViewingPhotoUrl(selectedResident.photo_url)} className="w-16 h-16 rounded-xl object-cover border-2 border-yellow-400 cursor-pointer shadow shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#facc15] text-emerald-950 border-2 border-yellow-400 flex items-center justify-center font-black text-2xl shadow shrink-0">
                      {(selectedResident.first_name?.[0] || 'R').toUpperCase()}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full text-zinc-800">
                    {[
                      ['FULL NAME', `${selectedResident.first_name || ''} ${selectedResident.middle_name || ''} ${selectedResident.last_name || ''} ${selectedResident.suffix || ''}`],
                      ['GENDER & CIVIL STATUS', `${selectedResident.gender || 'N/A'} • ${selectedResident.civil_status || 'N/A'}`],
                      ['BIRTH DATE & AGE', `${selectedResident.birth_date || 'N/A'} (${calculateAge(selectedResident.birth_date)} years old)`],
                      ['LENGTH OF RESIDENCY', calculateResidencyText(selectedResident)],
                      ['CONTACT NUMBER', selectedResident.contact_number || 'N/A'],
                      ['EMAIL ADDRESS', selectedResident.email || 'N/A']
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span className="rr-label-main">{label}</span>
                        <strong className="block text-zinc-900 font-bold">{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50/50 p-3.5 rounded-xl border border-yellow-200 space-y-2">
                <h4 className="rr-section-title flex items-center gap-1.5"><Home size={13} className="text-[#facc15]" /> ADDRESS & HOUSEHOLD STRUCTURE</h4>
                <div className="grid grid-cols-2 gap-2.5 pb-2 border-b border-yellow-200 text-zinc-800">
                  <div>
                    <span className="rr-label-main">HOUSEHOLD NUMBER</span>
                    <strong className="block text-zinc-900">{selectedResident.household_number || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="rr-label-main">STATUS IN HOUSEHOLD</span>
                    <strong className="block text-zinc-900">{selectedResident.is_head_of_household ? 'Household Leader / Head' : 'Household Member'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="rr-label-main">COMPLETE ADDRESS</span>
                    <strong className="block text-zinc-900">{selectedResident.street_address || 'No street specified'}, {selectedResident.purok || 'San Agustin'}, Barangay San Agustin, Castillejos, Zambales</strong>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50/50 p-3.5 rounded-xl border border-yellow-200 space-y-2">
                <h4 className="rr-section-title">DEMOGRAPHIC CLASSIFICATIONS</h4>
                <div className="grid grid-cols-3 gap-2.5 text-zinc-800">
                  <div>
                    <span className="rr-label-main">VOTER STATUS</span>
                    <strong className="block uppercase text-zinc-900">{selectedResident.voter_status || 'REGISTERED'}</strong>
                  </div>
                  <div>
                    <span className="rr-label-main">PWD BENEFICIARY</span>
                    <strong className="block text-zinc-900">{selectedResident.is_pwd ? `Yes (${selectedResident.pwd_id_number || 'No ID'})` : 'No'}</strong>
                  </div>
                  <div>
                    <span className="rr-label-main">4PS BENEFICIARY</span>
                    <strong className="block text-zinc-900">{selectedResident.is_4ps ? `Yes (${selectedResident.four_ps_id || 'No ID'})` : 'No'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="rr-modal-footer">
              <button onClick={() => setSelectedResident(null)} className="walkin-trigger-btn">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {(isModalOpen || editingResident) && (
        <div className="rr-modal-backdrop">
          <div className="rr-modal-container max-w-3xl">
            <div className="rr-modal-header">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#facc15] text-emerald-950 rounded-xl border border-yellow-400 shadow-xs">
                  {editingResident ? <Edit3 size={18} className="text-emerald-950" /> : <UserPlus size={18} className="text-emerald-950" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-emerald-950">{editingResident ? 'Edit Resident Record' : 'Add Resident Profile'}</h3>
                  <p className="text-xs text-zinc-500 font-medium">Record complete personal, demographic, and household information.</p>
                </div>
              </div>
              <button onClick={closeForm} className="text-zinc-400 hover:text-emerald-950 p-1"><X size={18} /></button>
            </div>

            <form id="resident-form" onSubmit={handleSaveResident} className="rr-modal-body space-y-4 custom-modal-scroll">
              {errorMsg && (
                <div className="bg-rose-50 text-rose-700 p-3 rounded-xl mb-3 text-xs font-semibold border border-rose-200 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600" /><span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-yellow-50/50 border border-yellow-200 rounded-xl">
                {previewPhoto ? (
                  <img src={previewPhoto} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#facc15] text-emerald-950 border-2 border-yellow-400 flex items-center justify-center font-black text-sm shadow-sm">
                    {(formData.first_name?.[0] || 'R').toUpperCase()}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={startCamera} className="walkin-trigger-btn text-xs py-1.5 px-3">
                    <Camera size={13} /> Snap Photo
                  </button>
                  <label className="px-3 py-1.5 bg-white border border-yellow-300 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-yellow-50 transition shadow-2xs">
                    <Upload size={13} className="text-emerald-950" /> Upload File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                {sectionHeading(1, 'PERSONAL INFORMATION')}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {[
                    ['first_name', 'FIRST NAME *', true],
                    ['middle_name', 'MIDDLE NAME'],
                    ['last_name', 'LAST NAME *', true],
                    ['suffix', 'SUFFIX']
                  ].map(([name, label, required]) => (
                    <div key={name}>
                      <label className="rr-label-main">{label}</label>
                      <input name={name} required={required} value={formData[name] || ''} onChange={handleInputChange} className="rr-input-field" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="rr-label-main">BIRTH DATE *</label>
                    <input type="date" name="birth_date" required value={formData.birth_date || ''} onChange={handleInputChange} className="rr-input-field custom-date-input" />
                  </div>
                  {[
                    ['gender', 'GENDER *', ['Male', 'Female']],
                    ['civil_status', 'CIVIL STATUS', ['single', 'married', 'widowed', 'separated']]
                  ].map(([name, label, options]) => (
                    <div key={name}>
                      <label className="rr-label-main">{label}</label>
                      <select name={name} value={formData[name] || ''} onChange={handleInputChange} className="rr-input-field">
                        {options.map(option => <option key={option} value={option} className="bg-white text-zinc-900">{option}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {sectionHeading(2, 'HOUSEHOLD & RESIDENCY LENGTH')}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="rr-label-main">HOUSEHOLD NUMBER *</label>
                    <input name="household_number" required value={formData.household_number || ''} onChange={handleInputChange} className="rr-input-field" />
                  </div>
                  <div>
                    <label className="rr-label-main">PUROK *</label>
                    <select name="purok" value={formData.purok || 'Purok 1'} onChange={handleInputChange} className="rr-input-field">
                      {['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'].map(p => <option key={p} className="bg-white text-zinc-900">{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="rr-label-main">STREET ADDRESS</label>
                    <input name="street_address" value={formData.street_address || ''} onChange={handleInputChange} className="rr-input-field" />
                  </div>
                </div>
              </div>
            </form>

            <div className="rr-modal-footer">
              <button type="button" onClick={closeForm} className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 font-bold rounded-xl text-xs border border-zinc-300 transition-all shadow-2xs">Cancel</button>
              <button type="submit" form="resident-form" disabled={loading} className="walkin-trigger-btn">
                {loading ? 'Saving...' : editingResident ? 'Update Resident Record' : 'Save Resident Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingPhotoUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setViewingPhotoUrl(null)}>
          <div className="relative max-w-lg w-full bg-white p-3 rounded-2xl shadow-2xl border-2 border-yellow-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingPhotoUrl(null)} className="absolute -top-3 -right-3 bg-[#facc15] text-emerald-950 p-1.5 rounded-full shadow border border-yellow-400"><X size={18} /></button>
            <img src={viewingPhotoUrl} alt="Resident Full Photo" className="w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-4 max-w-md w-full space-y-3 text-center shadow-2xl border-2 border-yellow-300">
            <h3 className="text-sm font-black text-emerald-950 uppercase">Capture Profile Photo</h3>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={stopCamera} className="px-4 py-2 bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={capturePhoto} className="walkin-trigger-btn">Snap Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}