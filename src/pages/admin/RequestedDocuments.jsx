
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Eye, Search, Inbox, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import './RequestedDocuments.css';

const EMAILJS_SERVICE_ID = 'service_7p37ngs';
const EMAILJS_TEMPLATE_ID_RESIDENT = 'template_30v2pth';
const EMAILJS_PUBLIC_KEY = 'l7wGC4bm9gnhdlvcb';
const ADMIN_EMAIL = 'brgy.sanagustin301@gmail.com';

let pendingRequestsCache = null;

const RequestSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, index) => (
      <tr key={index} className="request-loading-row">
        {['100%', '85%', '90%', '75%', '55%', '80%'].map((width, i) => (
          <td key={i} className="request-cell">
            <div className="request-skeleton" style={{ width }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default function RequestedDocuments() {
  const [requests, setRequests] = useState(() => pendingRequestsCache || []);
  const [selectedReq, setSelectedReq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(() => pendingRequestsCache === null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Invalid Information');

  const mountedRef = useRef(false);

  // Fetch latest pending requests from Supabase
  const fetchPendingRequests = async ({
    showLoading = false,
    showError = false
  } = {}) => {
    if (showLoading && mountedRef.current) {
      setFetching(true);
    }

    try {
      const { data, error } = await supabase
        .from('document_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const updatedRequests = data || [];

      pendingRequestsCache = updatedRequests;

      if (mountedRef.current) {
        setRequests(updatedRequests);
      }

      return true;
    } catch (error) {
      console.error('Fetch error:', error);

      if (showError) {
        alert(
          'Unable to refresh requests. Please check your internet connection and Supabase settings.\n\n' +
          (error.message || 'Unknown error')
        );
      }

      return false;
    } finally {
      if (showLoading && mountedRef.current) {
        setFetching(false);
      }
    }
  };

  // Manual refresh button
  const handleRefresh = async () => {
    if (fetching) return;

    const success = await fetchPendingRequests({
      showLoading: true,
      showError: true
    });

    if (success && mountedRef.current) {
      console.log('Pending requests refreshed successfully.');
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    fetchPendingRequests({
      showLoading: pendingRequestsCache === null
    });

    const channel = supabase
      .channel('requested-documents-inbox')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_requests'
        },
        () => fetchPendingRequests()
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const updateRequestCache = updater => {
    setRequests(prev => {
      const updated =
        typeof updater === 'function' ? updater(prev) : updater;

      pendingRequestsCache = updated;
      return updated;
    });
  };

  // Send email notification
  const sendEmailToResident = async (req, newStatus, reason = '') => {
    const recipientEmail = req?.email?.trim();

    if (!recipientEmail) {
      console.warn('Resident email is missing. Notification was not sent.');
      return false;
    }

    const docName =
      req.document_type?.replace(/_/g, ' ').toUpperCase() ||
      'BARANGAY DOCUMENT';

    const isApproved = newStatus === 'approved';

    const customMessage = isApproved
      ? `Your requested ${docName} has been APPROVED. Please wait for the pickup schedule from Barangay San Agustin.`
      : `Your requested ${docName} has been REJECTED. Reason: ${reason || 'Invalid Information'}. Please contact the Barangay San Agustin Office for assistance.`;

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_RESIDENT,
        {
          to_email: recipientEmail,
          to_name: req.full_name || 'Resident',
          from_name: 'Barangay San Agustin Office',
          reply_to: ADMIN_EMAIL,
          resident_name: req.full_name || 'Resident',
          resident_email: recipientEmail,
          tracking_number: req.tracking_number || 'N/A',
          document_type: docName,
          status: isApproved ? 'APPROVED' : 'REJECTED',
          pickup_schedule: isApproved
            ? 'Waiting for pickup schedule'
            : 'N/A',
          message: customMessage,
          rejection_reason: isApproved ? '' : reason
        },
        EMAILJS_PUBLIC_KEY
      );

      console.log(`${newStatus} notification sent to resident.`);
      return true;
    } catch (error) {
      console.error('Resident email send failed:', error?.text || error);
      return false;
    }
  };

  // Approve request
  const handleApprove = async () => {
    if (!selectedReq || loading) return;

    if (!window.confirm('Are you sure you want to APPROVE this request?')) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('document_requests')
        .update({ status: 'approved' })
        .eq('id', selectedReq.id)
        .eq('status', 'pending')
        .select('*')
        .single();

      if (error) throw error;

      if (!data || data.status !== 'approved') {
        throw new Error('The request status was not changed to approved.');
      }

      updateRequestCache(prev =>
        prev.filter(item => item.id !== selectedReq.id)
      );

      setSelectedReq(null);

      const emailSent = await sendEmailToResident(data, 'approved');

      alert(
        emailSent
          ? 'Request approved. The resident has been notified by email.'
          : 'Request approved, but the resident email notification could not be sent. Please check the resident email and EmailJS settings.'
      );
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Unable to approve request: ' + (error.message || 'Unknown error'));
      await fetchPendingRequests();
    } finally {
      setLoading(false);
    }
  };

  // Reject request
  const handleConfirmReject = async () => {
    if (!selectedReq || loading) return;

    if (!rejectionReason.trim()) {
      alert('Please enter a reason for rejection.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('document_requests')
        .update({ status: 'rejected' })
        .eq('id', selectedReq.id)
        .eq('status', 'pending')
        .select('*')
        .single();

      if (error) throw error;

      if (!data || data.status !== 'rejected') {
        throw new Error('The request status was not changed to rejected.');
      }

      updateRequestCache(prev =>
        prev.filter(item => item.id !== selectedReq.id)
      );

      setRejectModalOpen(false);
      setSelectedReq(null);

      const emailSent = await sendEmailToResident(
        data,
        'rejected',
        rejectionReason.trim()
      );

      setRejectionReason('Invalid Information');

      alert(
        emailSent
          ? 'Request rejected. The resident has been notified by email.'
          : 'Request rejected, but the resident email notification could not be sent. Please check the resident email and EmailJS settings.'
      );
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('Error rejecting request: ' + (error.message || 'Unknown error'));
      await fetchPendingRequests();
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    (request.full_name || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (request.tracking_number || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="requested-documents">
      <header className="requested-header">
        <div>
          <h1>Requested Documents Inbox</h1>
          <p>
            Review incoming public applications. Approving here will automatically
            transfer them to Manage Requests.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={fetching}
          title="Refresh List"
          aria-label="Refresh List"
          className="refresh-requests-btn"
        >
          <RefreshCw
            size={18}
            className={fetching ? 'animate-spin' : ''}
          />
        </button>
      </header>

      <section className="requests-panel">
        <div className="requests-toolbar">
          <span className="pending-count">
            <Inbox size={17} />
            Pending Count: {fetching ? '...' : requests.length}
          </span>

          <div className="request-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search name or tracking ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="requests-table-card">
          <div className="requests-table-scroll">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Tracking No.</th>
                  <th>Resident Name</th>
                  <th>Document Type</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {fetching ? (
                  <RequestSkeleton />
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map(request => (
                    <tr key={request.id}>
                      <td className="tracking-number">
                        {request.tracking_number}
                      </td>
                      <td className="resident-name">
                        {request.full_name}
                      </td>
                      <td className="document-type">
                        {request.document_type?.replace(/_/g, ' ')}
                      </td>
                      <td className="request-purpose">
                        {request.purpose || 'N/A'}
                      </td>
                      <td>
                        <span className="pending-badge">Pending</span>
                      </td>
                      <td className="request-action-cell">
                        <button
                          type="button"
                          onClick={() => setSelectedReq(request)}
                          className="review-request-btn"
                        >
                          <Eye size={14} />
                          Review & Approve
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-requests">
                      No pending document requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedReq && (
        <div className="request-modal-overlay">
          <div className="request-review-modal">
            <div className="request-modal-header">
              <div>
                <h3>Review Application</h3>
                <p>
                  Tracking: <span>{selectedReq.tracking_number}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                disabled={loading}
                className="close-request-modal"
                aria-label="Close review"
              >
                ✕
              </button>
            </div>

            <div className="request-details-grid">
              <div>
                <span>Full Name:</span>
                <strong>{selectedReq.full_name}</strong>
              </div>

              <div>
                <span>Email:</span>
                <strong>{selectedReq.email}</strong>
              </div>

              <div>
                <span>Contact:</span>
                <strong>{selectedReq.contact_number || 'N/A'}</strong>
              </div>

              <div>
                <span>Purpose:</span>
                <strong>{selectedReq.purpose || 'N/A'}</strong>
              </div>

              <div className="request-address">
                <span>Address:</span>
                <strong>{selectedReq.address || 'N/A'}</strong>
              </div>
            </div>

            <div className="request-images-grid">
              <div className="request-image-card">
                <span>1x1 Photo</span>
                <div className="request-image-frame">
                  {selectedReq.photo_1x1 ? (
                    <img src={selectedReq.photo_1x1} alt="1x1" />
                  ) : (
                    <span className="no-request-image">No Image</span>
                  )}
                </div>
              </div>

              <div className="request-image-card">
                <span>Proof of Residence</span>
                <div className="request-image-frame">
                  {selectedReq.proof_residence ? (
                    <img
                      src={selectedReq.proof_residence}
                      alt="Proof of residence"
                    />
                  ) : (
                    <span className="no-request-image">No Image</span>
                  )}
                </div>
              </div>
            </div>

            <div className="request-modal-actions">
              <button
                type="button"
                disabled={loading}
                onClick={handleApprove}
                className="approve-request-btn"
              >
                <CheckCircle size={17} />
                {loading ? 'Processing...' : 'Approve Request'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setRejectModalOpen(true)}
                className="reject-request-btn"
              >
                <XCircle size={17} />
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModalOpen && (
        <div className="reject-modal-overlay">
          <div className="reject-reason-modal">
            <h3>Reason for Rejection</h3>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />

            <div className="reject-modal-actions">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                disabled={loading}
                className="cancel-rejection-btn"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmReject}
                className="confirm-rejection-btn"
              >
                {loading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
