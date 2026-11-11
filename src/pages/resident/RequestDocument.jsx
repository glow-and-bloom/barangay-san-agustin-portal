import React, { useState } from 'react';

export default function RequestDocument({
  onSubmitRequest,
  loading,
  successMsg
}) {
  const [docType, setDocType] = useState('barangay_clearance');
  const [purpose, setPurpose] = useState('Local Employment Requirement');

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  const isBusinessPermit = docType === 'business_permit_clearance';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isBusinessPermit && (!businessName.trim() || !businessType.trim() || !businessAddress.trim())) {
      return;
    }

    onSubmitRequest(docType, purpose, {
      business_name: isBusinessPermit ? businessName.trim() : null,
      business_type: isBusinessPermit ? businessType.trim() : null,
      business_address: isBusinessPermit ? businessAddress.trim() : null
    });
  };

  const inputClass = "w-full min-w-0 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition";

  const labelClass = "block text-xs font-bold text-gray-700 mb-2";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">

        <div className="mb-6 pb-5 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Online Document Application
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Select your document type and provide the official purpose of your request.
          </p>
        </div>

        {successMsg && (
          <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-medium border border-green-200 mb-5 break-words">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className={labelClass}>
              Document Type
            </label>

            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className={inputClass}
              required
            >
              <option value="barangay_clearance">Barangay Clearance</option>
              <option value="indigency">Certificate of Indigency</option>
              <option value="residency">Certificate of Residency</option>
              <option value="business_permit_clearance">Business Permit Clearance</option>
              <option value="first_time_job_seeker">
                First-Time Job Seeker Clearance (RA 11261 - Free)
              </option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Purpose of Request
            </label>

            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className={inputClass}
              required
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

          {isBusinessPermit && (
            <div className="pt-5 border-t border-gray-200 space-y-5">

              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-700">
                  Business Information Details
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Please provide the required information about your business.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Business Name *
                </label>

                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter business name"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                  <label className={labelClass}>
                    Business Type / Nature *
                  </label>

                  <input
                    type="text"
                    required
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Retail Store"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Business Location / Address *
                  </label>

                  <input
                    type="text"
                    required
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="e.g. Purok 2"
                    className={inputClass}
                  />
                </div>

              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  <strong>In-Person Fee Notice:</strong> Document fees (₱50.00 standard) for Business Permit Clearance are paid strictly in cash at the Barangay Hall upon physical pickup.
                </p>
              </div>

            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 font-extrabold py-3.5 px-4 rounded-xl border border-amber-500 shadow-sm transition text-sm"
            >
              {loading ? 'Submitting Application...' : 'Submit Document Request'}
            </button>

            <p className="text-center text-[11px] text-gray-400 mt-3">
              Please review your information before submitting.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}