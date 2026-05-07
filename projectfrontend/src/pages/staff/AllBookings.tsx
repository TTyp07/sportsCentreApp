import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Booking, Facility, User } from '../../types';
import { Calendar, Clock, User as UserIcon, Filter } from 'lucide-react';

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed', 'alternative_suggested'];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-teal-50 text-teal-700',
  alternative_suggested: 'bg-blue-50 text-blue-700',
};

export default function AllBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get<Booking[]>('/bookings/requests/all')
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 mt-1">View all booking records</p>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter size={14} className="text-gray-400 flex-shrink-0" />
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors capitalize ${
              filter === s
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? `All (${bookings.length})` : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Member</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Facility</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Activity</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date & Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(booking => {
                  const facility = booking.facility as Facility;
                  const member = booking.member as User;
                  return (
                    <tr key={booking._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold">
                            {(member?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-900 font-medium">{member?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{facility?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{booking.intendedActivity}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-0.5">
                          <Clock size={10} className="text-gray-300" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[booking.status] || ''}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {booking.status === 'approved' && (
                          <button
                            onClick={async () => {
                              if (window.confirm('Mark this session as completed?')) {
                                try {
                                  await api.put(`/bookings/${booking._id}/complete`);
                                  window.location.reload();
                                } catch (err: any) {
                                  alert(err.message || 'Failed to complete booking');
                                }
                              }
                            }}
                            className="text-teal-600 hover:text-teal-700 text-xs font-bold px-2 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
