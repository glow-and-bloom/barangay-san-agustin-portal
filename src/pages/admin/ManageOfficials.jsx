import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Image as ImageIcon, Trash2, X } from 'lucide-react';

export default function ManageOfficials() {
  const [officials, setOfficials] = useState([]);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [committee, setCommittee] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    const { data, error } = await supabase.from('officials').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      setOfficials(data);
    }
  };

  const handleImageFileChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = (defaultPosition = 'Barangay Councilor') => {
    setSelectedOfficial(null);
    setFullName('');
    setPosition(defaultPosition);
    setCommittee('');
    setContact('');
    setImageUrl('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (official) => {
    setSelectedOfficial(official);
    setFullName(official.name || '');
    setPosition(official.position || '');
    setCommittee(official.committee || '');
    setContact(official.contact || '');
    setImageUrl(official.image_url || '');
    setIsEditModalOpen(true);
  };

  const handleSaveOfficial = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: fullName,
      position,
      committee,
      contact,
      image_url: imageUrl
    };

    let error;
    if (selectedOfficial) {
      const res = await supabase.from('officials').update(payload).eq('id', selectedOfficial.id);
      error = res.error;
    } else {
      const res = await supabase.from('officials').insert([payload]);
      error = res.error;
    }

    if (error) {
      alert('Error saving official: ' + error.message);
    } else {
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
      fetchOfficials();
    }
    setLoading(false);
  };

  const handleQuickImageUpdate = async (officialId, newBase64Image) => {
    const { error } = await supabase.from('officials').update({ image_url: newBase64Image }).eq('id', officialId);
    if (!error) {
      fetchOfficials();
    } else {
      alert('Failed to update image: ' + error.message);
    }
  };

  const handleDeleteOfficial = async (id) => {
    if (window.confirm('Are you sure you want to delete this official?')) {
      await supabase.from('officials').delete().eq('id', id);
      fetchOfficials();
    }
  };

  // Official Groupings
  const captain = officials.find(o => o.position?.toLowerCase().includes('captain') || o.position?.toLowerCase().includes('punong')) || null;
  const councilors = officials.filter(o => o.position?.toLowerCase().includes('councilor') || o.position?.toLowerCase().includes('kagawad'));
  const skChairman = officials.find(o => o.position?.toLowerCase().includes('sk') || o.position?.toLowerCase().includes('sangguniang kabataan')) || null;
  
  // Hiwalay na pag-filter para sa Secretary at Treasurer para matiyak na dalawa sila (kung naka-register)
  const secretary = officials.find(o => o.position?.toLowerCase().includes('secretary')) || null;
  const treasurer = officials.find(o => o.position?.toLowerCase().includes('treasurer')) || null;

  return (
    <div className="space-y-12 font-sans bg-zinc-50/50 p-4 sm:p-6 rounded-3xl min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-amber-300 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-900 tracking-tight text-center sm:text-left">Barangay San Agustin Officials</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage leadership hierarchy and profiles shown on the public portal.</p>
        </div>
      </div>

      {/* SECTION 1: BARANGAY CAPTAIN */}
      <div className="text-center space-y-4">
        <h2 className="text-sm font-black text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-1 inline-block">Barangay Captain</h2>
        
        {captain ? (
          <div className="max-w-xs mx-auto bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-md flex flex-col items-center space-y-3 relative">
            <h3 className="font-extrabold text-sm text-zinc-900">{captain.name}</h3>
            
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 shadow-inner bg-zinc-100 flex items-center justify-center">
              {captain.image_url ? (
                <img src={captain.image_url} alt={captain.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-zinc-400 text-xs font-bold">No Photo</span>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs font-black text-amber-800 uppercase">{captain.position}</p>
              {captain.committee && <p className="text-[11px] text-zinc-600 font-medium mt-0.5">{captain.committee}</p>}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => openEditModal(captain)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Edit size={12} /> Edit
              </button>
              
              <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer">
                <ImageIcon size={12} /> Edit Img
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageFileChange(e, (base64) => handleQuickImageUpdate(captain.id, base64))} 
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="py-6 bg-white rounded-3xl border border-dashed border-amber-300 max-w-xs mx-auto">
            <button onClick={() => openAddModal('Barangay Captain')} className="text-xs font-bold text-amber-700 hover:underline">+ Set Barangay Captain</button>
          </div>
        )}
      </div>

      <hr className="border-amber-200" />

      {/* SECTION 2: BARANGAY COUNCILORS */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-amber-200 pb-2">
          <h2 className="text-sm font-black text-amber-900 uppercase tracking-widest">Barangay Councilor</h2>
          <button onClick={() => openAddModal('Barangay Councilor')} className="bg-emerald-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded border border-emerald-700 hover:bg-emerald-700 cursor-pointer">+ Councilor</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {councilors.length > 0 ? councilors.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-3xl border border-amber-300 shadow-sm flex flex-col items-center text-center space-y-2 relative">
              <h4 className="font-extrabold text-xs text-zinc-900 line-clamp-1">{c.name}</h4>
              
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 bg-zinc-100 shadow-inner flex items-center justify-center">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-zinc-400 font-bold">No Photo</span>
                )}
              </div>

              {c.committee && <p className="text-[10px] text-zinc-500 font-semibold line-clamp-1">{c.committee}</p>}

              <div className="flex items-center gap-1 pt-1">
                <button onClick={() => openEditModal(c)} className="bg-blue-600 text-white text-[9px] font-bold uppercase px-2 py-1 rounded hover:bg-blue-700 cursor-pointer">Edit</button>
                <label className="bg-emerald-600 text-white text-[9px] font-bold uppercase px-2 py-1 rounded hover:bg-emerald-700 cursor-pointer">
                  Img
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, (b64) => handleQuickImageUpdate(c.id, b64))} />
                </label>
                <button onClick={() => handleDeleteOfficial(c.id)} className="bg-rose-600 text-white text-[9px] font-bold uppercase px-2 py-1 rounded hover:bg-rose-700 cursor-pointer">Del</button>
              </div>
            </div>
          )) : (
            <p className="text-xs text-zinc-400 font-semibold col-span-5 text-center">No councilors registered yet.</p>
          )}
        </div>
      </div>

      <hr className="border-amber-200" />

      {/* SECTION 3: SANGGUNIANG KABATAAN */}
      <div className="text-center space-y-4">
        <h2 className="text-sm font-black text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-1 inline-block">Barangay Sangguniang Kabataan</h2>
        
        {skChairman ? (
          <div className="max-w-xs mx-auto bg-white p-5 rounded-3xl border border-amber-300 shadow-sm flex flex-col items-center space-y-3">
            <h3 className="font-extrabold text-xs text-zinc-900">{skChairman.name}</h3>
            
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400 bg-zinc-100 flex items-center justify-center">
              {skChairman.image_url ? <img src={skChairman.image_url} alt={skChairman.name} className="w-full h-full object-cover" /> : <span className="text-zinc-400 text-xs">No Photo</span>}
            </div>

            <div className="text-center">
              <p className="text-xs font-black text-amber-800 uppercase">{skChairman.position}</p>
              {skChairman.committee && <p className="text-[11px] text-zinc-600 font-medium mt-0.5">{skChairman.committee}</p>}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => openEditModal(skChairman)} className="bg-blue-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded hover:bg-blue-700 cursor-pointer">Edit</button>
              <label className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded hover:bg-emerald-700 cursor-pointer">
                Edit Img
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, (b64) => handleQuickImageUpdate(skChairman.id, b64))} />
              </label>
            </div>
          </div>
        ) : (
          <div className="py-6 bg-white rounded-3xl border border-dashed border-amber-300 max-w-xs mx-auto">
            <button onClick={() => openAddModal('Sangguniang Kabataan Chairman')} className="text-xs font-bold text-amber-700 hover:underline">+ Set SK Chairman</button>
          </div>
        )}
      </div>

      <hr className="border-amber-200" />

      {/* SECTION 4: SECRETARY & TREASURER (PINAGHIWALAY PARA SIGURADONG DALAWA) */}
      <div className="text-center space-y-4">
        <h2 className="text-sm font-black text-amber-900 uppercase tracking-widest border-b border-amber-200 pb-1 inline-block">Barangay Secretary and Barangay Treasurer</h2>
        
        <div className="flex flex-wrap justify-center gap-8">
          
          {/* Secretary Card */}
          {secretary ? (
            <div className="w-60 bg-white p-5 rounded-3xl border border-amber-300 shadow-sm flex flex-col items-center space-y-3">
              <h3 className="font-extrabold text-xs text-zinc-900">{secretary.name}</h3>
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400 bg-zinc-100 flex items-center justify-center">
                {secretary.image_url ? <img src={secretary.image_url} alt={secretary.name} className="w-full h-full object-cover" /> : <span className="text-zinc-400 text-xs">No Photo</span>}
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-amber-800 uppercase">{secretary.position}</p>
                {secretary.committee && <p className="text-[10px] text-zinc-600">{secretary.committee}</p>}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => openEditModal(secretary)} className="bg-blue-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded hover:bg-blue-700 cursor-pointer">Edit</button>
                <label className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded hover:bg-emerald-700 cursor-pointer">
                  Img
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, (b64) => handleQuickImageUpdate(secretary.id, b64))} />
                </label>
              </div>
            </div>
          ) : (
            <div className="w-60 p-6 bg-white rounded-3xl border border-dashed border-amber-300 flex flex-col items-center justify-center">
              <button onClick={() => openAddModal('Barangay Secretary')} className="text-xs font-bold text-amber-700 hover:underline">+ Add Secretary</button>
            </div>
          )}

          {/* Treasurer Card */}
          {treasurer ? (
            <div className="w-60 bg-white p-5 rounded-3xl border border-amber-300 shadow-sm flex flex-col items-center space-y-3">
              <h3 className="font-extrabold text-xs text-zinc-900">{treasurer.name}</h3>
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400 bg-zinc-100 flex items-center justify-center">
                {treasurer.image_url ? <img src={treasurer.image_url} alt={treasurer.name} className="w-full h-full object-cover" /> : <span className="text-zinc-400 text-xs">No Photo</span>}
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-amber-800 uppercase">{treasurer.position}</p>
                {treasurer.committee && <p className="text-[10px] text-zinc-600">{treasurer.committee}</p>}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => openEditModal(treasurer)} className="bg-blue-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded hover:bg-blue-700 cursor-pointer">Edit</button>
                <label className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded hover:bg-emerald-700 cursor-pointer">
                  Img
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, (b64) => handleQuickImageUpdate(treasurer.id, b64))} />
                </label>
              </div>
            </div>
          ) : (
            <div className="w-60 p-6 bg-white rounded-3xl border border-dashed border-amber-300 flex flex-col items-center justify-center">
              <button onClick={() => openAddModal('Barangay Treasurer')} className="text-xs font-bold text-amber-700 hover:underline">+ Add Treasurer</button>
            </div>
          )}

        </div>
      </div>

      {/* UPDATE / ADD OFFICIAL MODAL */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
              <h3 className="text-sm font-black text-emerald-800 uppercase">
                {isEditModalOpen ? 'Update Official' : 'Add New Official'}
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} className="text-zinc-400 hover:text-zinc-800"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveOfficial} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">Full Name</label>
                <input 
                  required 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  className="w-full bg-amber-50/30 border border-zinc-300 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-600" 
                  placeholder="e.g. Nagato Uzumaki"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">Position</label>
                <input 
                  required 
                  type="text" 
                  value={position} 
                  onChange={e => setPosition(e.target.value)} 
                  className="w-full bg-amber-50/30 border border-zinc-300 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-600" 
                  placeholder="e.g. Barangay Captain / Councilor / SK"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">Committee / Office</label>
                <input 
                  type="text" 
                  value={committee} 
                  onChange={e => setCommittee(e.target.value)} 
                  className="w-full bg-amber-50/30 border border-zinc-300 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-600" 
                  placeholder="e.g. Peace and Order / Youth & Sports"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">Contact No. (Optional)</label>
                <input 
                  type="text" 
                  value={contact} 
                  onChange={e => setContact(e.target.value)} 
                  className="w-full bg-amber-50/30 border border-zinc-300 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-600" 
                  placeholder="Enter Contact"
                />
              </div>

              <div className="flex justify-center gap-2 pt-3">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2 rounded-xl text-xs uppercase shadow transition cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} 
                  className="bg-zinc-800 hover:bg-zinc-900 text-white font-black px-5 py-2 rounded-xl text-xs uppercase shadow transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}