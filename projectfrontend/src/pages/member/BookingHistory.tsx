import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { BookingHistory as BH, Facility } from '../../types';
import { Clock, Calendar, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

const OUTCOME_ICON = {
  completed: { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
  cancelled: { icon: MinusCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
};

export default function BookingHistory() {
  const [history, setHistory] = useState<BH[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<BH[]>('/bookings/history')
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
        <p className="text-gray-500 mt-1">Your past booking records</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Clock size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No booking history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(record => {
            const facility = record.facility as Facility;
            const meta = OUTCOME_ICON[record.outcome] || OUTCOME_ICON.cancelled;
            const Icon = meta.icon;
            return (
              <div
                key={record._id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4"
              >
                <div className={`p-2 rounded-lg ${meta.bg}`}>
                  <Icon size={20} className={meta.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{facility?.name || 'Unknown'}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${meta.bg} ${meta.color}`}>
                      {record.outcome}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {record.startTime && record.endTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {record.startTime} - {record.endTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
