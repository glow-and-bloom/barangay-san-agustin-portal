import React, { useState, useEffect } from 'react';
import {
  PlusCircle, X, ShieldAlert, MapPin, TrendingUp, Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAdminActivity } from '../../lib/logger';
import './ProjectsFinancials.css';

const initialForm = {
  project_title: '',
  location_purok: 'Purok 1',
  allocated_budget: '',
  total_expenses: '0',
  status: 'planned'
};

export default function ProjectsFinancials({ projects: initialProjects = [], onRefresh, adminName = 'Administrator' }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const fetchProjectsDirectly = async () => {
    const { data, error } = await supabase.from('projects').select('*');
    if (!error && data) setProjects(data);
  };

  useEffect(() => {
    if (!initialProjects || initialProjects.length === 0) {
      fetchProjectsDirectly();
    }
  }, []);

  const totalBudget = projects.reduce((sum, p) => sum + Number(p.allocated_budget || 0), 0);
  const totalExpenses = projects.reduce((sum, p) => sum + Number(p.total_expenses || 0), 0);
  const remainingBalance = totalBudget - totalExpenses;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.project_title.trim(),
        project_title: formData.project_title.trim(),
        location_purok: formData.location_purok,
        allocated_budget: parseFloat(formData.allocated_budget) || 0,
        total_expenses: parseFloat(formData.total_expenses) || 0,
        status: formData.status
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([payload])
        .select();

      if (error) throw error;

      await logAdminActivity(
        'Projects', 
        'Created New Project', 
        adminName, 
        `Added project "${formData.project_title.trim()}" at ${formData.location_purok} with budget ₱${Number(formData.allocated_budget).toLocaleString()}`
      );

      setIsModalOpen(false);
      setFormData(initialForm);
      if (data) setProjects(prev => [data[0], ...prev]);
      if (onRefresh) onRefresh();
      fetchProjectsDirectly();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save project finance record.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus, projectTitle) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      const actionLabel = newStatus === 'completed' ? 'Completed Project' : 'Approved / Set Ongoing Project';
      await logAdminActivity(
        'Projects', 
        actionLabel, 
        adminName, 
        `Updated project "${projectTitle || 'Untitled'}" status to ${newStatus}`
      );

      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Sigurado ka bang gusto mong burahin ang proyektong "${title}"?`)) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;

      await logAdminActivity(
        'Projects', 
        'Deleted Project', 
        adminName, 
        `Deleted project record: "${title}"`
      );

      setProjects(prev => prev.filter(p => p.id !== id));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-3xl font-black text-zinc-900 tracking-tight">PROJECT MONITORING</h1></div>
        <button onClick={() => setIsModalOpen(true)} className="walkin-trigger-btn">
          <PlusCircle size={16} />
          <span>Add New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-1">
          <p className="text-xs text-amber-800/70 font-bold uppercase tracking-wider">Total Budget</p>
          <p className="text-2xl font-black text-blue-900">₱{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-1">
          <p className="text-xs text-amber-800/70 font-bold uppercase tracking-wider">Total Expenses</p>
          <p className="text-2xl font-black text-rose-600">₱{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-1">
          <p className="text-xs text-amber-800/70 font-bold uppercase tracking-wider">Remaining Fund Balance</p>
          <p className={`text-2xl font-black ${remainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>₱{remainingBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-200/60 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 border-b border-amber-100 pb-2 flex items-center gap-2">
          <TrendingUp size={16} className="text-amber-600" />Active Infrastructure & Barangay Projects
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-amber-50/50 text-amber-900 uppercase tracking-wider border-b border-amber-100">
                <th className="p-3.5 font-bold">Project Title</th>
                <th className="p-3.5 font-bold">Location</th>
                <th className="p-3.5 font-bold">Allocated Budget</th>
                <th className="p-3.5 font-bold">Expenses</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {projects.length > 0 ? projects.map(p => {
                const pTitle = p.project_title || p.name || 'Untitled Project';
                return (
                  <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-zinc-900">{pTitle}</td>
                    <td className="p-3.5 text-zinc-700">
                      <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-amber-600" />{p.location_purok || p.location || 'Barangay Wide'}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-zinc-900">₱{Number(p.allocated_budget || 0).toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-bold text-rose-600">₱{Number(p.total_expenses || 0).toLocaleString()}</td>
                    <td className="p-3.5 uppercase font-bold">
                      <span className={`px-2 py-1 rounded text-[10px] ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : p.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                        {p.status || 'planned'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {p.status !== 'ongoing' && p.status !== 'completed' && (
                          <button onClick={() => handleUpdateStatus(p.id, 'ongoing', pTitle)} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-lg transition-all border border-blue-200 cursor-pointer" title="Approve / Set Ongoing">Approve</button>
                        )}
                        {p.status !== 'completed' && (
                          <button onClick={() => handleUpdateStatus(p.id, 'completed', pTitle)} className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold rounded-lg transition-all border border-emerald-200 cursor-pointer" title="Mark as Completed">Complete</button>
                        )}
                        <button onClick={() => handleDeleteProject(p.id, pTitle)} className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold rounded-lg transition-all border border-rose-200 cursor-pointer" title="Delete Project">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} className="p-10 text-center text-zinc-400">No project financial records found. Click "Add New Project" to encode.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-amber-300 max-w-lg w-full p-6 shadow-2xl relative space-y-4 project-modal">
            <div className="flex justify-between items-center border-b border-amber-100 pb-3 project-modal-header">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2 project-modal-title">
                <PlusCircle size={18} className="text-amber-600" />Add New Project & Budget
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 cursor-pointer"><X size={18} /></button>
            </div>
            {errorMsg && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold border border-rose-200 flex items-center gap-2"><ShieldAlert size={16} /><span>{errorMsg}</span></div>
            )}
            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Project Title *</label>
                <input type="text" name="project_title" required value={formData.project_title} onChange={handleInputChange} placeholder="e.g. Barangay Hall Solar Light Installation" className="w-full border border-zinc-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Location / Purok *</label>
                  <select name="location_purok" value={formData.location_purok} onChange={handleInputChange} className="w-full border border-zinc-300 p-2.5 rounded-xl bg-white outline-none">
                    {['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6', 'Whole Barangay'].map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Project Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-zinc-300 p-2.5 rounded-xl bg-white outline-none">
                    <option value="planned">Planned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Allocated Budget (₱) *</label>
                  <input type="number" name="allocated_budget" required min="0" step="0.01" value={formData.allocated_budget} onChange={handleInputChange} placeholder="50000" className="w-full border border-zinc-300 p-2.5 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Current Expenses (₱)</label>
                  <input type="number" name="total_expenses" min="0" step="0.01" value={formData.total_expenses} onChange={handleInputChange} placeholder="0" className="w-full border border-zinc-300 p-2.5 rounded-xl outline-none" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-amber-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="walkin-trigger-btn">{loading ? 'Saving Project...' : 'Save Project & Finance'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}