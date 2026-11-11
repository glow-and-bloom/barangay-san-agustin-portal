import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus, Edit } from 'lucide-react';

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*');
    if (data) setServices(data);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('services').insert([{ title, description }]);
    setTitle(''); setDescription('');
    fetchServices();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this service?')) {
      await supabase.from('services').delete().eq('id', id);
      fetchServices();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <h1 className="text-2xl font-black text-zinc-900">Manage Services</h1>
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Service Title</label>
          <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2.5 rounded-xl text-xs" placeholder="Certificate of Residency" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Description</label>
          <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2.5 rounded-xl text-xs" placeholder="Service description..." />
        </div>
        <button disabled={loading} className="bg-amber-500 text-zinc-950 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow">
          {loading ? 'Adding...' : 'Add Service'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
        <h3 className="font-bold text-sm mb-4">Active Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map(s => (
            <div key={s.id} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex justify-between items-start">
              <div>
                <h4 className="font-bold text-xs text-zinc-900">{s.title}</h4>
                <p className="text-xs text-zinc-600 mt-1">{s.description}</p>
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}