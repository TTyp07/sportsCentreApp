import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Booking, Facility } from '../../types';
import { Calendar, Clock, MapPin, XCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
  completed: 'bg-teal-50 text-teal-700 border-teal-200',
  alternative_suggested: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    try {
      const data = await api.get<Booking[]>('/bookings/my');
      setBookings(data);
    } catch {}
    setLoading(false);
  }

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      await loadBookings();
    } catch {}
    setCancellingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">View and manage your facility bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No bookings yet</p>
          <p className="text-sm text-gray-400 mt-1">Browse facilities to make your first booking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => {
            const facility = booking.facility as Facility;
            const altFacility = booking.alternativeFacility as Facility | undefined;
            return (
              <div
                key={booking._id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{facility?.name || 'Unknown Facility'}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{booking.intendedActivity}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(booking.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {booking.startTime} - {booking.endTime}
                      </span>
                      {facility?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {facility.location}
                        </span>
                      )}
                    </div>

                    {booking.status === 'alternative_suggested' && altFacility && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-700">
                          Staff suggested an alternative: <span className="font-semibold">{altFacility.name}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {(booking.status === 'pending' || booking.status === 'approved') && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === booking._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
