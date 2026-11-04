import React, { useState } from 'react';

export default function RequestDocument({ onSubmitRequest, loading, successMsg }) {
  const [docType, setDocType] = useState('barangay_clearance');
  const [purpose, setPurpose] = useState('Local Employment Requirement');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRequest(docType, purpose);
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Online Document Application</h2>
        <p className="text-xs text-gray-500 mt-1">Select document type and official purpose for processing.</p>
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
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-amber-500 focus:border-amber-500"
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
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="Local Employment Requirement">Local Employment Requirement</option>
            <option value="Scholarship Application">Scholarship Application</option>
            <option value="Postal ID / Valid ID Application">Postal ID / Valid ID Application</option>
            <option value="Bank / Financial Transaction">Bank / Financial Transaction</option>
            <option value="Medical / Hospital Assistance">Medical / Hospital Assistance</option>
            <option value="Business Registration / Permit">Business Registration / Permit</option>
            <option value="Other Official Purposes">Other Official Purposes</option>
          </select>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-800 border border-amber-200">
          <strong>In-Person Fee Notice:</strong> Document fees (₱50.00 standard) are paid strictly in cash at the Barangay Hall upon physical pickup.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 text-amber-400 font-extrabold py-3.5 rounded-xl border border-amber-500 shadow transition"
        >
          {loading ? 'Submitting Application...' : 'Submit Document Request'}
        </button>
      </form>
    </div>
  );
}