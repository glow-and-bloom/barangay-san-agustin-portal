import React, { useState } from 'react';

export default function RequestDocument({ onSubmitRequest, loading, successMsg }) {
  const [docType, setDocType] = useState('barangay_clearance');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRequest(docType, purpose);
    setPurpose('');
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Online Document Application</h2>
        <p className="text-xs text-gray-500 mt-1">Select document type and provide purpose for official processing.</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-800 p-4 rounded-xl text-xs font-medium border border-green-200">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Document Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="barangay_clearance">Barangay Clearance</option>
            <option value="indigency">Certificate of Indigency</option>
            <option value="residency">Certificate of Residency</option>
            <option value="business_permit_clearance">Business Permit Clearance</option>
            <option value="first_time_job_seeker">First-Time Job Seeker Clearance (RA 11261 - Free)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Purpose of Request</label>
          <textarea
            required
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Local employment requirement, Scholarship application, Postal ID application"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-gold-500 focus:border-gold-500"
          />
        </div>

        <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-800 border border-amber-200">
          <strong>In-Person Fee Notice:</strong> Document fees (₱50.00 standard) are paid strictly in cash at the Barangay Hall upon physical pickup.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 text-gold-500 font-extrabold py-3.5 rounded-xl border border-gold-500 shadow transition"
        >
          {loading ? 'Submitting Application...' : 'Submit Document Request'}
        </button>
      </form>
    </div>
  );
}