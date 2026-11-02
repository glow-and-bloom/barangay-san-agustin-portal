import React from 'react';

export default function ProjectsFinancials({ projects = [] }) {
  const totalBudget = projects.reduce((acc, curr) => acc + Number(curr.allocated_budget || 0), 0);
  const totalExpenses = projects.reduce((acc, curr) => acc + Number(curr.total_expenses || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Financial Monitoring</h1>
        <p className="text-xs text-gray-500 mt-1">Record barangay project budgets, expenses, and remaining fund balances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Total Budget</p>
          <p className="text-2xl font-black text-blue-900 mt-1">₱{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Total Expenses</p>
          <p className="text-2xl font-black text-red-600 mt-1">₱{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Remaining Fund Balance</p>
          <p className="text-2xl font-black text-green-700 mt-1">₱{(totalBudget - totalExpenses).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 border-b pb-2">Active Infrastructure Projects</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase border-b">
                <th className="p-3">Project Title</th>
                <th className="p-3">Location</th>
                <th className="p-3">Allocated Budget</th>
                <th className="p-3">Expenses</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 font-semibold">{p.project_title}</td>
                  <td className="p-3">{p.location_purok}</td>
                  <td className="p-3 font-mono">₱{Number(p.allocated_budget).toLocaleString()}</td>
                  <td className="p-3 font-mono text-red-600">₱{Number(p.total_expenses).toLocaleString()}</td>
                  <td className="p-3 uppercase font-bold text-blue-700">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}