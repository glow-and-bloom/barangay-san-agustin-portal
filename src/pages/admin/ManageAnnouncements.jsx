import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Plus, Trash2, Sparkles, ShieldCheck, Save, Upload } from 'lucide-react';

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Mission & Vision states
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [mvLoading, setMvLoading] = useState(false);
  const [mvSuccess, setMvSuccess] = useState('');

  useEffect(() => {
    fetchAnnouncements();
    fetchMissionVision();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  };

  const fetchMissionVision = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) {
      setMission(data.mission || '');
      setVision(data.vision || '');
    }
  };

  // Convert selected file to Base64 (No Supabase Storage configuration needed!)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('announcements').insert([{ 
      title, 
      content, 
      image_url: imageUrl 
    }]);

    if (error) {
      alert('Error adding announcement: ' + error.message);
    } else {
      setTitle('');
      setContent('');
      setImageUrl('');
      fetchAnnouncements();
    }
    setLoading(false);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await supabase.from('announcements').delete().eq('id', id);
      fetchAnnouncements();
    }
  };

  const handleSaveMissionVision = async (e) => {
    e.preventDefault();
    setMvLoading(true);
    setMvSuccess('');

    const { error } = await supabase.from('settings').upsert({ id: 1, mission, vision });
    if (!error) {
      setMvSuccess('Mission and Vision successfully updated!');
    } else {
      alert('Error updating: ' + error.message);
    }
    setMvLoading(false);
  };

  return (
    <div className="space-y-10 font-sans">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Announcements & Core Values</h1>
        <p className="text-xs text-zinc-500 mt-1">Manage public announcements and update the official barangay Mission & Vision.</p>
      </div>

      {/* MISSION & VISION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-amber-200 pb-3">
          <Sparkles className="text-amber-600" size={20} />
          <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900">Barangay Mission & Vision Editor</h3>
        </div>

        <form onSubmit={handleSaveMissionVision} className="space-y-5 max-w-2xl">
          {mvSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
              {mvSuccess}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-600" /> Barangay Mission
            </label>
            <textarea 
              rows={3} 
              value={mission} 
              onChange={e => setMission(e.target.value)} 
              className="w-full bg-amber-50/30 border border-amber-300 p-3 rounded-2xl text-xs text-zinc-900 outline-none focus:border-amber-500 leading-relaxed" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-600" /> Barangay Vision
            </label>
            <textarea 
              rows={3} 
              value={vision} 
              onChange={e => setVision(e.target.value)} 
              className="w-full bg-amber-50/30 border border-amber-300 p-3 rounded-2xl text-xs text-zinc-900 outline-none focus:border-amber-500 leading-relaxed" 
            />
          </div>

          <button 
            type="submit" 
            disabled={mvLoading} 
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-zinc-950 font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer border border-amber-300 flex items-center gap-2"
          >
            <Save size={15} /> {mvLoading ? 'Saving...' : 'Save Mission & Vision'}
          </button>
        </form>
      </div>

      {/* ANNOUNCEMENTS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
          <Bell className="text-amber-600" size={20} />
          <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900">Post & Manage Announcements</h3>
        </div>

        <form onSubmit={handleSaveAnnouncement} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">Announcement Title</label>
            <input 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-amber-50/30 border border-amber-300 p-3 rounded-xl text-xs text-zinc-900 outline-none focus:border-amber-500" 
              placeholder="e.g. Pisces (February 20-March 20)" 
            />
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">Select Image from Device</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} 
              className="w-full bg-amber-50/30 border border-amber-300 p-2.5 rounded-xl text-xs text-zinc-900 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-400 file:text-zinc-950 hover:file:bg-amber-500 cursor-pointer outline-none focus:border-amber-500" 
            />
            {imageUrl && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Image attached successfully!</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">Announcement Details / Content</label>
            <textarea 
              required 
              rows={3} 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="w-full bg-amber-50/30 border border-amber-300 p-3 rounded-xl text-xs text-zinc-900 outline-none focus:border-amber-500" 
              placeholder="Detailed text description..." 
            />
          </div>
          <button 
            disabled={loading} 
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer border border-amber-400 flex items-center gap-2"
          >
            <Plus size={16} /> {loading ? 'Posting...' : '+ Announcement'}
          </button>
        </form>

        <div className="pt-4 border-t border-amber-200">
          <h4 className="font-black text-xs uppercase tracking-wider text-amber-900 mb-4">Posted Announcements List</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.length > 0 ? announcements.map(a => (
              <div key={a.id} className="p-4 rounded-3xl bg-white border-2 border-amber-300 shadow-sm flex flex-col justify-between space-y-3">
                {a.image_url ? (
                  <div className="w-full h-36 bg-zinc-100 rounded-2xl overflow-hidden border border-amber-200 flex items-center justify-center">
                    <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-36 bg-amber-50 rounded-2xl flex items-center justify-center text-xs text-zinc-400 border border-amber-200">
                    No Image
                  </div>
                )}
                <div>
                  <h4 className="font-black text-xs text-zinc-900 text-center">{a.title}</h4>
                  <p className="text-xs text-zinc-600 mt-1 line-clamp-2 text-center">{a.content}</p>
                </div>
                <div className="flex justify-end pt-2 border-t border-amber-100">
                  <button 
                    onClick={() => handleDeleteAnnouncement(a.id)} 
                    className="text-rose-600 px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-xs text-zinc-400 font-medium col-span-3">No announcements posted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}