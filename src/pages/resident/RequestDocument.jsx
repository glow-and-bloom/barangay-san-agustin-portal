import React, { useState } from 'react';

export default function RequestDocument({ onSubmitRequest, loading, successMsg }) {
  const [docType, setDocType] = useState('barangay_clearance');
  const [purpose, setPurpose] = useState('Local Employment Requirement');

  // Business Specific Form Fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ipapasa ang mga karagdagang business details kapag business_permit_clearance ang napili
    onSubmitRequest(docType, purpose, {
      business_name: docType === 'business_permit_clearance' ? businessName.trim() : null,
      business_type: docType === 'business_permit_clearance' ? businessType.trim() : null,
      business_address: docType === 'business_permit_clearance' ? businessAddress.trim() : null,
    });
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 font-sans">
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
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-amber-500 focus:border-amber-500 outline-none"
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
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-amber-500 focus:border-amber-500 outline-none"
          >
            <option value="Local Employment Requirement">Local Employment Requirement</option>
            <option value="Scholarship Application">Scholarship Application</option>
            <option value="Financial Assistance">Financial Assistance</option>
            <option value="Postal ID / Valid ID Application">Postal ID / Valid ID Application</option>
            <option value="Bank / Financial Transaction">Bank / Financial Transaction</option>
            <option value="Medical / Hospital Assistance">Medical / Hospital Assistance</option>
            <option value="Business Registration / Permit">Business Registration / Permit</option>
            <option value="Other Official Purposes">Other Official Purposes</option>
          </select>
        </div>

        {/* ADDITIONAL FIELDS FOR BUSINESS PERMIT CLEARANCE ONLY */}
        {docType === 'business_permit_clearance' && (
          <div className="space-y-4 pt-3 border-t border-gray-100">
            <h3 className="text-xs font-extrabold uppercase text-amber-600 tracking-wider">
              Business Information Details
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. San Agustin General Merchandise"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Business Type / Nature *</label>
                <input
                  type="text"
                  required
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g. Retail Store, Eatery, Welding Shop"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Business Location / Address *</label>
                <input
                  type="text"
                  required
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="e.g. Purok 2, Main Street"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-800 border border-amber-200">
              <strong>In-Person Fee Notice:</strong> Document fees (₱50.00 standard) for Business Permit Clearance are paid strictly in cash at the Barangay Hall upon physical pickup.
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 text-amber-400 font-extrabold py-3.5 rounded-xl border border-amber-500 shadow transition cursor-pointer text-sm"
        >
          {loading ? 'Submitting Application...' : 'Submit Document Request'}
        </button>
      </form>
    </div>
  );
}