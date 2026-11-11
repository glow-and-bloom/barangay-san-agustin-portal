import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, Trash2, Star } from 'lucide-react';

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    if (data) setFeedbacks(data);
  };

  const handleApprove = async (id) => {
    await supabase.from('feedbacks').update({ status: 'approved' }).eq('id', id);
    fetchFeedbacks();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this feedback?')) {
      await supabase.from('feedbacks').delete().eq('id', id);
      fetchFeedbacks();
    }
  };

  const approvedList = feedbacks.filter(f => f.status === 'approved');
  const pendingList = feedbacks.filter(f => f.status === 'pending' || !f.status);

  return (
    <div className="space-y-8 font-sans">
      <h1 className="text-2xl font-black text-zinc-900">Manage Resident Feedbacks</h1>

      {/* Pending Feedbacks */}
      <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
        <h3 className="font-bold text-sm mb-4 text-amber-800 uppercase tracking-wider">Pending Feedbacks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingList.length > 0 ? pendingList.map(f => (
            <div key={f.id} className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-xs text-zinc-900">{f.resident_name}</h4>
                <p className="text-xs text-zinc-600 italic mt-1">"{f.message}"</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-amber-100">
                <button onClick={() => handleApprove(f.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => handleDelete(f.id)} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          )) : <p className="text-xs text-zinc-400">No pending feedbacks.</p>}
        </div>
      </div>

      {/* Approved Feedbacks */}
      <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
        <h3 className="font-bold text-sm mb-4 text-emerald-800 uppercase tracking-wider">Approved Feedbacks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {approvedList.length > 0 ? approvedList.map(f => (
            <div key={f.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-xs text-zinc-900">{f.resident_name}</h4>
                <p className="text-xs text-zinc-600 italic mt-1">"{f.message}"</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Approved</span>
                <button onClick={() => handleDelete(f.id)} className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
          )) : <p className="text-xs text-zinc-400">No approved feedbacks yet.</p>}
        </div>
      </div>
    </div>
  );
}