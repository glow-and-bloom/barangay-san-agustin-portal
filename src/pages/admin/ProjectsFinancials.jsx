import React, { useState, useEffect } from 'react';
import { PlusCircle, X, ShieldAlert, MapPin, TrendingUp, CheckCircle, Trash2, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ProjectsFinancials({ projects: initialProjects = [], onRefresh }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    project_title: '',
    location_purok: 'Purok 1',
    allocated_budget: '',
    total_expenses: '0',
    status: 'planned'
  });

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const fetchProjectsDirectly = async () => {
    const { data, error } = await supabase.from('projects').select('*');
    if (!error && data) {
      setProjects(data);
    }
  };

  useEffect(() => {
    if (!initialProjects || initialProjects.length === 0) {
      fetchProjectsDirectly();
    }
  }, []);

  const totalBudget = projects.reduce((acc, curr) => acc + Number(curr.allocated_budget || 0), 0);
  const totalExpenses = projects.reduce((acc, curr) => acc + Number(curr.total_expenses || 0), 0);
  const remainingBalance = totalBudget - totalExpenses;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

      const { data, error } = await supabase.from('projects').insert([payload]).select();
      if (error) throw error;

      setLoading(false);
      setIsModalOpen(false);
      setFormData({
        project_title: '',
        location_purok: 'Purok 1',
        allocated_budget: '',
        total_expenses: '0',
        status: 'planned'
      });

      if (data) {
        setProjects(prev => [data[0], ...prev]);
      }

      if (onRefresh) onRefresh();
      fetchProjectsDirectly();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to save project finance record.');
    }
  };

  // Function para i-update ang status (Approve / Completed)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Function para i-delete ang proyekto
  const handleDeleteProject = async (id, title) => {
    const confirmed = window.confirm(`Sigurado ka bang gusto mong burahin ang proyektong "${title}"?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER & ADD BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Financial & Project Monitoring</h1>
          <p className="text-xs text-zinc-500 mt-1">Record barangay project budgets, expenses, and remaining fund balances.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-black text-amber-400 font-extrabold px-4 py-2.5 rounded-xl border border-amber-500/50 shadow-md transition-all text-xs cursor-pointer"
        >
          <PlusCircle size={16} className="text-amber-400" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total Budget</p>
          <p className="text-2xl font-black text-blue-900">₱{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total Expenses</p>
          <p className="text-2xl font-black text-rose-600">₱{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Remaining Fund Balance</p>
          <p className={`text-2xl font-black ${remainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            ₱{remainingBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* PROJECTS TABLE */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 border-b pb-2 flex items-center gap-2">
          <TrendingUp size={16} className="text-amber-600" /> Active Infrastructure & Barangay Projects
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                <th className="p-3.5 font-bold">Project Title</th>
                <th className="p-3.5 font-bold">Location</th>
                <th className="p-3.5 font-bold">Allocated Budget</th>
                <th className="p-3.5 font-bold">Expenses</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {projects.length > 0 ? (
                projects.map((p) => (
                  <tr key={p.id || Math.random()} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-zinc-900">{p.project_title || p.name || 'Untitled Project'}</td>
                    <td className="p-3.5 text-zinc-700">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-zinc-400" />
                        {p.location_purok || p.location || 'Barangay Wide'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-zinc-900">₱{Number(p.allocated_budget || 0).toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-bold text-rose-600">₱{Number(p.total_expenses || 0).toLocaleString()}</td>
                    <td className="p-3.5 uppercase font-bold">
                      <span className={`px-2 py-1 rounded text-[10px] ${
                        p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status || 'planned'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {p.status !== 'ongoing' && p.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'ongoing')}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-lg transition-all border border-blue-200"
                            title="Approve / Set Ongoing"
                          >
                            Approve
                          </button>
                        )}
                        {p.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'completed')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold rounded-lg transition-all border border-emerald-200"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProject(p.id, p.project_title || p.name)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold rounded-lg transition-all border border-rose-200"
                          title="Delete Project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-zinc-400">
                    No project financial records found. Click "Add New Project" to encode.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-amber-500/30 max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <PlusCircle size={18} className="text-amber-600" /> Add New Project & Budget
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold border border-rose-200 flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Project Title *</label>
                <input
                  type="text"
                  name="project_title"
                  required
                  value={formData.project_title}
                  onChange={handleInputChange}
                  placeholder="e.g. Barangay Hall Solar Light Installation"
                  className="w-full border border-zinc-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Location / Purok *</label>
                  <select
                    name="location_purok"
                    value={formData.location_purok}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-300 p-2.5 rounded-xl bg-white outline-none"
                  >
                    <option value="Purok 1">Purok 1</option>
                    <option value="Purok 2">Purok 2</option>
                    <option value="Purok 3">Purok 3</option>
                    <option value="Purok 4">Purok 4</option>
                    <option value="Purok 5">Purok 5</option>
                    <option value="Purok 6">Purok 6</option>
                    <option value="Whole Barangay">Whole Barangay</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Project Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-300 p-2.5 rounded-xl bg-white outline-none"
                  >
                    <option value="planned">Planned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Allocated Budget (₱) *</label>
                  <input
                    type="number"
                    name="allocated_budget"
                    required
                    min="0"
                    step="0.01"
                    value={formData.allocated_budget}
                    onChange={handleInputChange}
                    placeholder="50000"
                    className="w-full border border-zinc-300 p-2.5 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Current Expenses (₱)</label>
                  <input
                    type="number"
                    name="total_expenses"
                    min="0"
                    step="0.01"
                    value={formData.total_expenses}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full border border-zinc-300 p-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-zinc-900 hover:bg-black text-amber-400 font-extrabold rounded-xl border border-amber-500/50 shadow"
                >
                  {loading ? 'Saving Project...' : 'Save Project & Finance'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}