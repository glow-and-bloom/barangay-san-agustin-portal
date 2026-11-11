
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, CheckCircle2, Check, Eye, X, Printer, Edit3,
  Building2, Trash2, UserPlus, FileText, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import emailjs from '@emailjs/browser';
import './ManageRequests.css';

const EMAILJS_SERVICE_ID = 'service_7p37ngs';
const EMAILJS_TEMPLATE_ID_RESIDENT = 'template_30v2pth';
const EMAILJS_PUBLIC_KEY = 'l7wGC4bm9gnhdlvcb';
const ADMIN_EMAIL = 'brgy.sanagustin301@gmail.com';

let approvedRequestsCache = null;

const formatDate = date => date
  ? new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  : 'N/A';

const localDateTime = date => {
  if (!date) return { date: '', time: '10:00' };

  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');

  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
  };
};

const getResidentName = (req, residents = []) => {
  const resident = Array.isArray(req?.residents)
    ? req.residents[0]
    : req?.residents;

  const matchedResident = residents.find(
    item => item.id === req?.resident_id
  );

  return req?.full_name ||
    [resident?.first_name, resident?.last_name].filter(Boolean).join(' ') ||
    [
      matchedResident?.first_name,
      matchedResident?.middle_name,
      matchedResident?.last_name
    ].filter(Boolean).join(' ') ||
    'Resident';
};

const Field = ({
  label,
  value,
  onChange,
  multiline = false,
  disabled = false,
  children
}) => {
  const Tag = multiline ? 'textarea' : 'input';

  return (
    <div className="edit-field relative">
      <label>{label}</label>
      <Tag
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={multiline ? 3 : undefined}
        disabled={disabled}
        className="edit-input"
      />
      {children}
    </div>
  );
};

const RequestSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, index) => (
      <tr key={index} className="request-skeleton-row">
        <td className="p-3">
          <div className="skeleton skeleton-checkbox" />
        </td>
        {[110, 125, 115, 100, 120, 90, 100, 45, 75].map((width, i) => (
          <td key={i} className="p-3">
            <div
              className="skeleton skeleton-line"
              style={{ width }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default function ManageRequests({ residents = [] }) {
  const [approvedRequests, setApprovedRequests] = useState(
    () => approvedRequestsCache || []
  );
  const [search, setSearch] = useState('');
  const [selectedPayReq, setSelectedPayReq] = useState(null);
  const [viewCertReq, setViewCertReq] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [orNo, setOrNo] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(
    () => approvedRequestsCache === null
  );
  const [selectedIds, setSelectedIds] = useState([]);

  const [isWalkinSelectorOpen, setIsWalkinSelectorOpen] = useState(false);
  const [isResidentDropdownOpen, setIsResidentDropdownOpen] = useState(false);

  const mountedRef = useRef(false);

  const [certDetails, setCertDetails] = useState({
    residentName: '',
    purok: '',
    purpose: '',
    issueDate: '',
    captainName: 'HON. BARANGAY CAPTAIN',
    businessName: '',
    businessType: '',
    businessAddress: ''
  });

  const updateApprovedRequests = updater => {
    setApprovedRequests(prev => {
      const updated = typeof updater === 'function'
        ? updater(prev)
        : updater;

      approvedRequestsCache = updated;
      return updated;
    });
  };

  const updateCert = (field, value) => {
    setCertDetails(prev => ({ ...prev, [field]: value }));
  };

  const isBusinessPermit = /business|permit/i.test(
    viewCertReq?.document_type || ''
  );

  const isPaidDocument = type => /business|permit/i.test(type || '');

  const isPaid = req =>
    req?.payment_status === 'paid' ||
    req?.is_paid === true ||
    ['released', 'completed'].includes(
      (req?.status || '').toLowerCase()
    );

  const getOR = req => req?.payment_reciept_no || '';

  const isCompleted = req => {
    const current = req?.id
      ? approvedRequests.find(item => item.id === req.id) || req
      : req;

    const status = (current?.status || '').toLowerCase();

    return Boolean(
      current &&
      (
        status === 'released' ||
        status === 'completed' ||
        (isPaidDocument(current.document_type) && isPaid(current))
      )
    );
  };

  const completed = isCompleted(viewCertReq);

  const fetchAllApproved = async ({ showLoading = false } = {}) => {
    if (showLoading && mountedRef.current) {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('document_requests')
        .select(`
          id,
          resident_id,
          tracking_number,
          full_name,
          email,
          address,
          document_type,
          purpose,
          business_name,
          business_type,
          business_address,
          status,
          payment_status,
          is_paid,
          fee,
          fee_amount,
          payment_reciept_no,
          pickup_date,
          created_at
        `)
        .in('status', [
          'approved',
          'ready_for_pickup',
          'released',
          'completed'
        ])
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const updatedRequests = data || [];

      approvedRequestsCache = updatedRequests;

      if (mountedRef.current) {
        setApprovedRequests(updatedRequests);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Unable to load approved requests:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      if (showLoading && mountedRef.current) {
        alert(error.message || 'Unable to load approved requests.');
      }
    } finally {
      if (showLoading && mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    fetchAllApproved({
      showLoading: approvedRequestsCache === null
    });

    const channel = supabase
      .channel('manage-approved-document-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_requests'
        },
        () => {
          fetchAllApproved();
        }
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!viewCertReq) return;

    const schedule = viewCertReq.pickup_date
      ? localDateTime(viewCertReq.pickup_date)
      : null;

    const resident = viewCertReq.isWalkin
      ? viewCertReq.residentName || ''
      : getResidentName(viewCertReq, residents);

    setCertDetails({
      residentName: resident,
      purok: viewCertReq.address ||
        viewCertReq.purok ||
        viewCertReq.residents?.purok ||
        'Purok 1',
      purpose: viewCertReq.purpose ||
        (/business/i.test(viewCertReq.document_type || '')
          ? 'Business Registration / Permit'
          : 'General Purpose'),
      issueDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      captainName: 'HON. BARANGAY CAPTAIN',
      businessName: viewCertReq.business_name || 'N/A',
      businessType: viewCertReq.business_type || 'N/A',
      businessAddress: viewCertReq.business_address ||
        viewCertReq.address ||
        'Barangay San Agustin'
    });

    setPickupDate(schedule?.date || '');
    setPickupTime(schedule?.time || '10:00');
  }, [viewCertReq, residents]);

  const filtered = approvedRequests.filter(req => {
    const name = getResidentName(req, residents);
    const keyword = search.toLowerCase();

    return [
      req.tracking_number,
      req.document_type,
      req.business_name,
      name
    ].some(value =>
      String(value || '').toLowerCase().includes(keyword)
    );
  });

  const sendEmailAlertToResident = async (
    recipientEmail,
    residentName,
    trackingNo,
    docType,
    status,
    scheduleText = '',
    customMsg = ''
  ) => {
    const residentEmail = recipientEmail?.trim();

    if (!residentEmail) {
      console.warn('Resident email is missing. No notification was sent.');
      return false;
    }

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_RESIDENT,
        {
          to_email: residentEmail,
          to_name: residentName,
          from_name: 'Barangay San Agustin Office',
          reply_to: ADMIN_EMAIL,
          resident_name: residentName,
          resident_email: residentEmail,
          tracking_number: trackingNo,
          document_type: docType?.replace(/_/g, ' ').toUpperCase(),
          status,
          pickup_schedule: scheduleText || 'Not scheduled',
          message: customMsg
        },
        EMAILJS_PUBLIC_KEY
      );

      console.log('Resident email notification sent:', response.status);
      return true;
    } catch (error) {
      console.error('Resident email notification failed:', error?.text || error);
      return false;
    }
  };

  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(req => req.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = id => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSingle = async (id, trackingNo) => {
    if (!window.confirm(
      `Are you sure you want to delete request ${trackingNo || id}?`
    )) return;

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('document_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      updateApprovedRequests(prev =>
        prev.filter(req => req.id !== id)
      );

      setSelectedIds(prev =>
        prev.filter(item => item !== id)
      );
    } catch (error) {
      alert(error.message || 'Failed to delete request.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;

    if (!window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected request(s)?`
    )) return;

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('document_requests')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      updateApprovedRequests(prev =>
        prev.filter(req => !selectedIds.includes(req.id))
      );

      setSelectedIds([]);
    } catch (error) {
      alert(error.message || 'Failed to delete selected requests.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintAndReady = async () => {
    if (!viewCertReq || processing) return;

    if (viewCertReq.isWalkin) {
      window.print();
      return;
    }

    if (isCompleted(viewCertReq)) {
      alert('This document request is already completed.');
      return;
    }

    if (!pickupDate || !pickupTime) {
      alert('Please select both Pickup Date and Time.');
      return;
    }

    try {
      setProcessing(true);

      const formattedPickup = new Date(
        `${pickupDate}T${pickupTime}:00`
      ).toISOString();

      const humanSchedule = `${pickupDate} at ${pickupTime}`;

      const { error } = await supabase
        .from('document_requests')
        .update({
          status: 'ready_for_pickup',
          pickup_date: formattedPickup
        })
        .eq('id', viewCertReq.id);

      if (error) throw error;

      updateApprovedRequests(prev =>
        prev.map(req =>
          req.id === viewCertReq.id
            ? {
                ...req,
                status: 'ready_for_pickup',
                pickup_date: formattedPickup
              }
            : req
        )
      );

      setViewCertReq(prev => ({
        ...prev,
        status: 'ready_for_pickup',
        pickup_date: formattedPickup
      }));

      const emailSent = await sendEmailAlertToResident(
        viewCertReq.email,
        certDetails.residentName,
        viewCertReq.tracking_number,
        viewCertReq.document_type,
        'READY FOR PICKUP',
        humanSchedule,
        `Your ${viewCertReq.document_type?.replace(/_/g, ' ')} is ready for pickup on ${humanSchedule} at the Barangay San Agustin Hall. Please bring your tracking number when claiming your document.`
      );

      if (!emailSent) {
        alert('The request was updated, but the resident email notification could not be sent. Please check the resident email and EmailJS settings.');
      }

      window.print();
    } catch (error) {
      alert(error.message || 'Unable to update document request.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReleasePayment = async () => {
    if (!orNo.trim()) {
      alert('Please enter the Official Receipt (OR) Number.');
      return;
    }

    if (!selectedPayReq || processing) return;

    try {
      setProcessing(true);

      const receiptNumber = orNo.trim();

      const { error } = await supabase
        .from('document_requests')
        .update({
          status: 'released',
          is_paid: true,
          payment_reciept_no: receiptNumber
        })
        .eq('id', selectedPayReq.id);

      if (error) throw error;

      updateApprovedRequests(prev =>
        prev.map(req =>
          req.id === selectedPayReq.id
            ? {
                ...req,
                status: 'released',
                is_paid: true,
                payment_reciept_no: receiptNumber
              }
            : req
        )
      );

      const emailSent = await sendEmailAlertToResident(
        selectedPayReq.email,
        getResidentName(selectedPayReq, residents),
        selectedPayReq.tracking_number,
        selectedPayReq.document_type,
        'RELEASED',
        'Collected',
        `Your document has been successfully collected and paid. OR No: ${receiptNumber}. Thank you!`
      );

      if (!emailSent) {
        alert('Payment was recorded, but the resident email notification could not be sent.');
      }

      setSelectedPayReq(null);
      setOrNo('');
    } catch (error) {
      alert(error.message || 'Unable to record payment.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDirectRelease = async req => {
    if (processing || !window.confirm('Mark this document as collected?')) {
      return;
    }

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('document_requests')
        .update({
          status: 'released',
          is_paid: true
        })
        .eq('id', req.id);

      if (error) throw error;

      updateApprovedRequests(prev =>
        prev.map(item =>
          item.id === req.id
            ? { ...item, status: 'released', is_paid: true }
            : item
        )
      );

      const emailSent = await sendEmailAlertToResident(
        req.email,
        getResidentName(req, residents),
        req.tracking_number,
        req.document_type,
        'RELEASED',
        'Collected',
        'Your document has been marked as collected/released. Thank you!'
      );

      if (!emailSent) {
        alert('The document was released, but the resident email notification could not be sent.');
      }
    } catch (error) {
      alert(error.message || 'Unable to release document.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectWalkinDoc = docType => {
    const newWalkinObj = {
      id: `walkin_${Date.now()}`,
      tracking_number: `REQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      document_type: docType,
      purpose: docType.includes('business')
        ? 'Business Registration / Permit'
        : 'General Purpose',
      business_name: 'N/A',
      business_type: 'N/A',
      created_at: new Date().toISOString(),
      status: 'completed',
      isWalkin: true,
      residentName: '',
      purok: 'Purok 2'
    };

    setIsWalkinSelectorOpen(false);
    setViewCertReq(newWalkinObj);
  };

  const filteredResidentsList = residents.filter(res => {
    const fullName = `${res.first_name || ''} ${res.last_name || ''}`.toLowerCase();

    return fullName.includes(
      (certDetails.residentName || '').toLowerCase()
    );
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            MANAGE APPROVED REQUESTS
          </h1>
        </div>

<div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchAllApproved({ showLoading: true })}
            title="Refresh List"
            aria-label="Refresh List"
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setIsWalkinSelectorOpen(true)}
            title="Walk-in / Issue Document"
            aria-label="Walk-in / Issue Document"
            className="walkin-trigger-btn !p-2.5 !min-w-0 !justify-center"
          >
            <UserPlus size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-1 border-amber-300 p-6 shadow-sm space-y-4 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
  value={search}
  onChange={e => setSearch(e.target.value)}
  placeholder="Search tracking no, resident, type..."
  className="w-full pl-9 pr-4 py-3 border-1 border-amber-300 rounded-xl text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
/>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={processing}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 size={15} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-amber-200/70 text-black-700 uppercase border-b">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filtered.length > 0 &&
                      filtered.every(req => selectedIds.includes(req.id))
                    }
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </th>

                {[
                  'Tracking No.',
                  'Resident Name',
                  'Document Type',
                  'Date Requested',
                  'Pickup Schedule',
                  'Status',
                  'Payment',
                  'Documents',
                  'Action'
                ].map(item => (
                  <th key={item} className="p-3">{item}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <RequestSkeleton />
              ) : filtered.length > 0 ? (
                filtered.map(req => {
                  const requiresPayment = isPaidDocument(req.document_type);
                  const paid = isPaid(req);
                  const done = isCompleted(req);
                  const name = getResidentName(req, residents);
                  const isSelected = selectedIds.includes(req.id);
                  const status = (req.status || '').toLowerCase();

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-gray-50 ${isSelected ? 'bg-amber-50/50' : ''}`}
                    >
                      <td className="p-3 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(req.id)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 font-mono font-bold align-middle whitespace-nowrap text-amber-900">
                        {req.tracking_number || 'N/A'}
                      </td>

                      <td className="p-3 font-bold text-zinc-900 align-middle">
                        <div>{name}</div>
                        {req.business_name && (
                          <span className="block text-[10px] text-amber-700 font-bold mt-0.5">
                            <Building2 size={10} className="inline mr-1" />
                            {req.business_name}
                          </span>
                        )}
                      </td>

                      <td className="p-3 uppercase font-extrabold text-amber-800 align-middle">
                        {req.document_type?.replace(/_/g, ' ')}
                      </td>

                      <td className="p-3 text-gray-500 align-middle whitespace-nowrap">
                        {formatDate(req.created_at)}
                      </td>

                      <td className="p-3 font-bold text-blue-700 align-middle whitespace-nowrap">
                        {req.pickup_date ? (
                          <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                            {formatDate(req.pickup_date)}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">
                            Not Scheduled
                          </span>
                        )}
                      </td>

                      <td className="p-3 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                            done
                              ? 'bg-green-100 text-green-800'
                              : status === 'ready_for_pickup'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {done
                            ? 'Completed'
                            : status === 'ready_for_pickup'
                              ? 'Ready for Pickup'
                              : status}
                        </span>
                      </td>

                      <td className="p-3 font-bold align-middle whitespace-nowrap">
                        {requiresPayment ? (
                          paid ? (
                            <span className="text-green-700">
                              Paid {getOR(req) ? `(OR: ${getOR(req)})` : ''}
                            </span>
                          ) : (
                            <span className="text-red-600">
                              Unpaid (₱{req.fee || req.fee_amount || 50})
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500 font-normal">
                            Free / No Fee
                          </span>
                        )}
                      </td>

                      <td className="p-3 align-middle whitespace-nowrap">
                        <button
                          onClick={() => setViewCertReq(req)}
                          title="View / Print Document"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg shadow inline-flex items-center justify-center cursor-pointer transition"
                        >
                          <Eye size={15} />
                        </button>
                      </td>

                      <td className="p-3 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteSingle(req.id, req.tracking_number)}
                            disabled={processing}
                            title="Delete Request"
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold p-2 rounded-lg shadow-sm transition cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>

                          {done ? (
                            <button
                              disabled
                              title="Collected / Completed"
                              className="bg-emerald-800 text-white font-bold p-2 rounded-lg shadow inline-flex items-center justify-center opacity-90 cursor-not-allowed"
                            >
                              <Check size={15} />
                            </button>
                          ) : requiresPayment ? (
                            <button
                              onClick={() => setSelectedPayReq(req)}
                              title="Pay & Release"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded-lg shadow inline-flex items-center justify-center cursor-pointer"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDirectRelease(req)}
                              title="Mark as Collected"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded-lg shadow inline-flex items-center justify-center cursor-pointer"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-400 font-bold">
                    No approved or completed requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isWalkinSelectorOpen && (
        <div className="walkin-selection-overlay no-print">
          <div className="walkin-selection-card">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-gray-900">
                Select Walk-in Document
              </h3>
              <button
                onClick={() => setIsWalkinSelectorOpen(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              Choose a type of document for the walk-in resident:
            </p>

            <div className="walkin-grid-options">
              {[
                ['barangay_clearance', 'Barangay Clearance'],
                ['certificate_of_indigency', 'Certificate of Indigency'],
                ['certificate_of_residency', 'Certificate of Residency'],
                ['business_permit', 'Barangay Business Clearance']
              ].map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleSelectWalkinDoc(type)}
                  className="walkin-option-btn"
                >
                  <FileText size={22} className="text-amber-500" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewCertReq && (
        <div className="request-modal no-print-wrapper">
          <div className="request-modal-content relative">
            <button
              onClick={() => {
                setViewCertReq(null);
                setIsResidentDropdownOpen(false);
              }}
              className="request-modal-close text-white bg-black/50 hover:text-gray-300 p-2 rounded-full no-print"
            >
              <X size={20} />
            </button>

            <div className="request-modal-grid grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-5 no-print edit-panel">
                <div className="edit-card">
                  <div className="edit-heading">
                    <div className="edit-heading-icon">
                      <Edit3 size={16} />
                    </div>
                    <div>
                      <h4>Edit Document Details</h4>
                      <p>Update information before printing</p>
                    </div>
                  </div>

                  <div className="edit-form-scroll">
                    <div className="edit-section-title">
                      Certificate Information
                    </div>

                    <Field
                      label="Owner / Resident Full Name"
                      value={certDetails.residentName}
                      onChange={value => {
                        updateCert('residentName', value);
                        if (viewCertReq.isWalkin) {
                          setIsResidentDropdownOpen(true);
                        }
                      }}
                    >
                      {viewCertReq.isWalkin &&
                        isResidentDropdownOpen &&
                        filteredResidentsList.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                            {filteredResidentsList.map(res => {
                              const fullName = [
                                res.first_name,
                                res.middle_name,
                                res.last_name
                              ].filter(Boolean).join(' ');

                              return (
                                <div
                                  key={res.id}
                                  onClick={() => {
                                    updateCert('residentName', fullName);
                                    updateCert('purok', res.purok || 'Purok 2');
                                    setIsResidentDropdownOpen(false);
                                  }}
                                  className="p-2.5 hover:bg-amber-50 cursor-pointer text-xs border-b border-gray-100 flex justify-between items-center"
                                >
                                  <span className="font-bold text-gray-800">
                                    {fullName}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-semibold">
                                    {res.purok || 'Purok N/A'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </Field>

                    {isBusinessPermit ? (
                      <>
                        <Field
                          label="Business Name"
                          value={certDetails.businessName}
                          onChange={value => updateCert('businessName', value)}
                        />
                        <Field
                          label="Nature / Type of Business"
                          value={certDetails.businessType}
                          onChange={value => updateCert('businessType', value)}
                        />
                        <Field
                          label="Business Address"
                          value={certDetails.businessAddress}
                          onChange={value => updateCert('businessAddress', value)}
                        />
                      </>
                    ) : (
                      <Field
                        label="Purok / Resident Address"
                        value={certDetails.purok}
                        onChange={value => updateCert('purok', value)}
                      />
                    )}

                    <Field
                      label="Purpose / Reason"
                      value={certDetails.purpose}
                      onChange={value => updateCert('purpose', value)}
                      multiline
                    />

                    <Field
                      label="Date Issued"
                      value={certDetails.issueDate}
                      onChange={value => updateCert('issueDate', value)}
                    />

                    <Field
                      label="Signatory / Captain Name"
                      value={certDetails.captainName}
                      onChange={value => updateCert('captainName', value)}
                    />

                    {!viewCertReq.isWalkin && (
                      <div className="pickup-section">
                        <div className="edit-section-title">
                          Pickup Schedule
                        </div>

                        {completed && (
                          <div className="completed-notice">
                            <CheckCircle2 size={14} />
                            This request is completed. Schedule is locked.
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="edit-field">
                            <label>Pickup Date</label>
                            <input
                              type="date"
                              value={pickupDate}
                              onChange={e => setPickupDate(e.target.value)}
                              disabled={completed}
                              className="edit-input"
                            />
                          </div>

                          <div className="edit-field">
                            <label>Pickup Time</label>
                            <input
                              type="time"
                              value={pickupTime}
                              onChange={e => setPickupTime(e.target.value)}
                              disabled={completed}
                              className="edit-input"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="edit-footer">
                    <button
                      onClick={() => setViewCertReq(null)}
                      className="edit-close-button"
                    >
                      Close
                    </button>

                    <button
                      onClick={handlePrintAndReady}
                      disabled={processing}
                      className="edit-print-button"
                    >
                      <Printer size={14} />
                      {processing ? 'Processing...' : 'Print Document'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 document-preview">
                <div
                  id="printable-certificate"
                  className="certificate-paper bg-white text-black"
                >
                  <div className="certificate-header">
                    <p>REPUBLIC OF THE PHILIPPINES</p>
                    <p>PROVINCE OF ZAMBALES • MUNICIPALITY OF CASTILLEJOS</p>
                    <h2>BARANGAY SAN AGUSTIN</h2>
                    <h3>OFFICE OF THE PUNONG BARANGAY</h3>
                    <h4>
                      {isBusinessPermit
                        ? 'BARANGAY BUSINESS CLEARANCE'
                        : viewCertReq.document_type?.replace(/_/g, ' ')}
                    </h4>
                  </div>

                  <div className="certificate-body">
                    <p className="tracking-number">
                      Tracking No: {viewCertReq.tracking_number}
                      {viewCertReq.isWalkin && ' (WALK-IN)'}
                    </p>

                    <p className="font-bold">TO WHOM IT MAY CONCERN:</p>

                    {isBusinessPermit ? (
                      <>
                        <p className="certificate-paragraph">
                          Clearance is hereby granted to the business establishment
                          specified below pursuant to applicable Barangay ordinances
                          and regulations within the territorial jurisdiction of
                          Barangay San Agustin, Castillejos, Zambales.
                        </p>

                        <div className="business-details">
                          {[
                            ['BUSINESS NAME:', certDetails.businessName],
                            ['NATURE OF BUSINESS:', certDetails.businessType],
                            ['BUSINESS LOCATION:', certDetails.businessAddress],
                            ['OWNER / OPERATOR:', certDetails.residentName]
                          ].map(([label, value]) => (
                            <div key={label} className="business-detail-row">
                              <span>{label}</span>
                              <strong>{value}</strong>
                            </div>
                          ))}
                        </div>

                        <p className="certificate-paragraph">
                          This Business Clearance is issued upon request of the
                          interested party for <strong><em>
                            "{certDetails.purpose}"
                          </em></strong> and for securing necessary municipal
                          business permits and licenses.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="certificate-paragraph">
                          This is to certify that{' '}
                          <strong className="underlined-name">
                            {certDetails.residentName}
                          </strong>
                          , of legal age, is a resident of {certDetails.purok},
                          Barangay San Agustin, Castillejos, Zambales.
                        </p>

                        <p className="certificate-paragraph">
                          This certification is issued upon request of the
                          interested party for <strong><em>
                            "{certDetails.purpose}"
                          </em></strong> and for whatever legal purpose it may serve.
                        </p>
                      </>
                    )}

                    <p className="certificate-date">
                      Given this {certDetails.issueDate} at Barangay San Agustin,
                      Castillejos, Zambales.
                    </p>
                  </div>

                  <div className="certificate-signatures">
                    <div className="official-seal">
                      Official Seal / Thumb Mark
                    </div>
                    <div className="captain-signature">
                      <strong>{certDetails.captainName}</strong>
                      <span>Punong Barangay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPayReq && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100000] no-print">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base border-b pb-2 text-gray-800">
              Record Business Permit Payment
            </h3>

            <p className="text-xs text-gray-500">
              Enter Official Receipt (OR) Number for tracking
              <span className="font-mono font-bold text-black ml-1">
                {selectedPayReq.tracking_number}
              </span>.
            </p>

            <input
              value={orNo}
              onChange={e => setOrNo(e.target.value)}
              placeholder="Official Receipt (OR) No."
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:border-black font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedPayReq(null);
                  setOrNo('');
                }}
                disabled={processing}
                className="px-3 py-1.5 border border-gray-300 text-xs rounded-lg font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleReleasePayment}
                disabled={processing}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-bold shadow"
              >
                {processing ? 'Saving...' : 'Confirm Release'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
