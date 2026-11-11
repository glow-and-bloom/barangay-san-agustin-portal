import React, { useState, useEffect } from 'react';
import { Bell, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription para kusa itong mag-update kapag may bagong request o alert
    const subscription = supabase
      .channel('admin_notifications_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'document_requests' }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Kinukuha ang mga document requests kasama ang pangalan ng residente mula sa database
      const { data, error } = await supabase
        .from('document_requests')
        .select('*, residents(first_name, last_name, purok)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
        <p className="text-xs text-gray-500 mt-1">System alerts and resident document request notifications.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-3">
          <p className="text-xs text-gray-500">Loading notifications...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {notifications.map((notif) => {
            const residentName = notif.residents 
              ? `${notif.residents.first_name} ${notif.residents.last_name}` 
              : 'A resident';
            
            const docType = notif.document_type ? notif.document_type.replace(/_/g, ' ') : 'document';
            const formattedDate = notif.created_at ? new Date(notif.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recently';

            return (
              <div key={notif.id} className="p-4 sm:p-5 flex items-start space-x-3 hover:bg-gray-50/70 transition">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 flex-shrink-0 mt-0.5">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-gray-900 uppercase">
                      New Request: {docType}
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap ml-2">
                      {formattedDate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    <strong className="text-gray-900">{residentName}</strong> requested a {docType} with tracking number <span className="font-mono font-bold text-blue-700">{notif.tracking_number}</span>.
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      notif.status === 'completed' ? 'bg-green-100 text-green-800' :
                      notif.status === 'ready_for_pickup' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      Status: {notif.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center space-y-3">
          <Bell className="mx-auto text-gray-300" size={40} />
          <h3 className="font-bold text-gray-800 text-sm">No new notifications</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">All system alerts and document requests have been viewed and processed.</p>
        </div>
      )}
    </div>
  );
}