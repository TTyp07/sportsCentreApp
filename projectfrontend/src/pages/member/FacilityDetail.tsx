import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Facility } from '../../types';
import {
  Building2, MapPin, Users, Clock, ArrowLeft, Calendar,
  BookOpen, CheckCircle2, AlertCircle, Info
} from 'lucide-react';

export default function FacilityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    intendedActivity: '',
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<Facility>(`/facilities/${id}`)
      .then(setFacility)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function getImageUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setBookingError('');
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        facility: id,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        intendedActivity: bookingForm.intendedActivity,
      });
      setBookingSuccess(true);
      setShowBooking(false);
      setBookingForm({ date: '', startTime: '', endTime: '', intendedActivity: '' });
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Facility not found</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {bookingSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Booking request submitted!</p>
            <p className="text-xs text-green-600 mt-0.5">A staff member will review your request shortly.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center relative overflow-hidden">
              {facility.image ? (
                <img
                  src={getImageUrl(facility.image)}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 size={64} className="text-white/30" />
              )}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-sm font-medium text-white">
                  {facility.type}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">{facility.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                {facility.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" /> {facility.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" /> Capacity: {facility.capacityLimit}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" /> {facility.timeSlotDuration} min slots
                </span>
              </div>

              {facility.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{facility.description}</p>
                </div>
              )}

              {facility.usageGuidelines && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={16} className="text-amber-600" />
                    <h3 className="text-sm font-semibold text-amber-800">Usage Guidelines</h3>
                  </div>
                  <p className="text-sm text-amber-700 leading-relaxed">{facility.usageGuidelines}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Available slots */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-teal-600" />
              Available Time Slots
            </h3>
            {facility.availableSlots && facility.availableSlots.length > 0 ? (
              <div className="space-y-2">
                {facility.availableSlots.map((slot, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                    <span className="font-medium text-gray-700">{slot.day}</span>
                    <span className="text-gray-500">{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No scheduled slots</p>
            )}
          </div>

          {/* Booking form */}
          {user?.role === 'member' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              {!showBooking ? (
                <button
                  onClick={() => setShowBooking(true)}
                  className="w-full py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <BookOpen size={16} />
                  Request Booking
                </button>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Book this facility</h3>

                  {bookingError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                      {bookingError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      lang="en-US"
                      value={bookingForm.date}
                      onChange={e => setBookingForm(p => ({ ...p, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        required
                        value={bookingForm.startTime}
                        onChange={e => setBookingForm(p => ({ ...p, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        required
                        value={bookingForm.endTime}
                        onChange={e => setBookingForm(p => ({ ...p, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Intended Activity</label>
                    <textarea
                      required
                      value={bookingForm.intendedActivity}
                      onChange={e => setBookingForm(p => ({ ...p, intendedActivity: e.target.value }))}
                      placeholder="Describe what you plan to do..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBooking(false)}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
