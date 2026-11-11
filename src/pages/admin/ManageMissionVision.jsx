import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function ManageMissionVision() {
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadMV() {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setMission(data.mission || '');
        setVision(data.vision || '');
      }
    }
    loadMV();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    const { error } = await supabase.from('settings').upsert({ id: 1, mission, vision });
    
    if (!error) {
      setSuccessMsg('Mission and Vision successfully updated!');
    } else {
      alert('Error updating: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Mission & Vision Management</h1>
        <p className="text-xs text-zinc-500 mt-1">Update the official barangay core values displayed on the public landing page.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-sm space-y-6 max-w-2xl">
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <Sparkles size={15} className="text-amber-600" /> Barangay Mission
          </label>
          <textarea 
            rows={4} 
            value={mission} 
            onChange={e => setMission(e.target.value)} 
            className="w-full bg-amber-50/30 border border-amber-300 p-3.5 rounded-2xl text-xs text-zinc-900 outline-none focus:border-amber-500 leading-relaxed" 
            placeholder="Enter barangay mission statement..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-amber-600" /> Barangay Vision
          </label>
          <textarea 
            rows={4} 
            value={vision} 
            onChange={e => setVision(e.target.value)} 
            className="w-full bg-amber-50/30 border border-amber-300 p-3.5 rounded-2xl text-xs text-zinc-900 outline-none focus:border-amber-500 leading-relaxed" 
            placeholder="Enter barangay vision statement..."
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-zinc-950 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer border border-amber-300"
        >
          {loading ? 'Saving Changes...' : 'Save Mission & Vision'}
        </button>
      </form>
    </div>
  );
}