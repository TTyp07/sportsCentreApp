import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Booking, Facility, User } from '../../types';
import {
  ClipboardList, CheckCircle2, XCircle, ArrowRightLeft,
  Calendar, Clock, MapPin, Loader2, AlertCircle, User as UserIcon
} from 'lucide-react';

export default function BookingRequests() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAltModal, setShowAltModal] = useState<string | null>(null);
  const [altFacilityId, setAltFacilityId] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Booking[]>('/bookings/requests'),
      api.get<Facility[]>('/facilities'),
    ]).then(([b, f]) => {
      setBookings(b);
      setFacilities(f);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function approve(id: string) {
    setProcessingId(id);
    try {
      await api.put(`/bookings/${id}/approve`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'approved' as const } : b));
    } catch {}
    setProcessingId(null);
  }

  async function reject(id: string) {
    setProcessingId(id);
    try {
      await api.put(`/bookings/${id}/reject`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'rejected' as const } : b));
    } catch {}
    setProcessingId(null);
  }

  async function suggestAlt(id: string) {
    if (!altFacilityId) return;
    setProcessingId(id);
    try {
      await api.put(`/bookings/${id}/suggest-alternative`, { alternativeFacilityId: altFacilityId });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'alternative_suggested' as const } : b));
      setShowAltModal(null);
      setAltFacilityId('');
    } catch {}
    setProcessingId(null);
  }

  async function complete(id: string) {
    setProcessingId(id);
    try {
      await api.put(`/bookings/${id}/complete`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'completed' as const } : b));
    } catch {}
    setProcessingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const approved = bookings.filter(b => b.status === 'approved');
  const others = bookings.filter(b => !['pending', 'approved'].includes(b.status));

  function renderBookingCard(booking: Booking) {
    const facility = booking.facility as Facility;
    const member = booking.member as User;
    const isPending = booking.status === 'pending';
    const isApproved = booking.status === 'approved';

    return (
      <div key={booking._id} className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{facility?.name || 'Unknown'}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <UserIcon size={11} /> {member?.name || 'Unknown Member'} ({member?.email})
            </p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize whitespace-nowrap ${
            booking.status === 'pending' ? 'bg-amber-50 text-amber-700' :
            booking.status === 'approved' ? 'bg-green-50 text-green-700' :
            booking.status === 'rejected' ? 'bg-red-50 text-red-600' :
            booking.status === 'completed' ? 'bg-teal-50 text-teal-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {booking.status.replace('_', ' ')}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">{booking.intendedActivity}</p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(booking.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {booking.startTime} - {booking.endTime}
          </span>
        </div>

        {(isPending || isApproved) && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            {isPending && (
              <>
                <button
                  onClick={() => approve(booking._id)}
                  disabled={processingId === booking._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {processingId === booking._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => reject(booking._id)}
                  disabled={processingId === booking._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  onClick={() => setShowAltModal(booking._id)}
                  disabled={processingId === booking._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <ArrowRightLeft size={14} /> Suggest Alternative
                </button>
              </>
            )}
            {isApproved && (
              <button
                onClick={() => complete(booking._id)}
                disabled={processingId === booking._id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50"
              >
                {processingId === booking._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Mark Completed
              </button>
            )}
          </div>
        )}

        {/* Alternative suggestion modal */}
        {showAltModal === booking._id && (
          <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Suggest Alternative Facility</h4>
            <select
              value={altFacilityId}
              onChange={e => setAltFacilityId(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm mb-3 bg-white focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select a facility</option>
              {facilities.filter(f => f._id !== (facility?._id)).map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.type})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAltModal(null); setAltFacilityId(''); }}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => suggestAlt(booking._id)}
                disabled={!altFacilityId || processingId === booking._id}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Send Suggestion
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-500 mt-1">Review and manage member booking requests</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No booking requests</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
                <AlertCircle size={14} /> Pending Requests ({pending.length})
              </h2>
              <div className="space-y-3">{pending.map(renderBookingCard)}</div>
            </div>
          )}
          {approved.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Approved ({approved.length})
              </h2>
              <div className="space-y-3">{approved.map(renderBookingCard)}</div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">Other ({others.length})</h2>
              <div className="space-y-3">{others.map(renderBookingCard)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
