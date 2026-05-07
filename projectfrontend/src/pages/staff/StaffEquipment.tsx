import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { EquipmentReport, Facility, User } from '../../types';
import { Wrench, User as UserIcon, Loader2, Filter } from 'lucide-react';

const STATUSES = ['pending', 'noted', 'repair_in_progress', 'resolved'] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  noted: { bg: 'bg-blue-50', text: 'text-blue-700' },
  repair_in_progress: { bg: 'bg-orange-50', text: 'text-orange-700' },
  resolved: { bg: 'bg-green-50', text: 'text-green-700' },
};

export default function StaffEquipment() {
  const [reports, setReports] = useState<EquipmentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get<EquipmentReport[]>('/equipment')
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await api.put(`/equipment/${id}/status`, { status });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: status as any } : r));
    } catch {}
    setUpdatingId(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Equipment Reports</h1>
        <p className="text-gray-500 mt-1">View and update equipment issue reports from members</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Wrench size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No equipment reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => {
            const facility = report.facility as Facility;
            const reporter = report.reportedBy as User;
            const style = STATUS_STYLES[report.status] || STATUS_STYLES.pending;

            return (
              <div key={report._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.equipmentDescription}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {facility?.name || 'Unknown'} -- Reported by {reporter?.name || 'Unknown'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${style.bg} ${style.text}`}>
                    {report.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{report.issueDescription}</p>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 mr-2">Update status:</span>
                  {STATUSES.filter(s => s !== report.status).map(s => {
                    const btnStyle = STATUS_STYLES[s];
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(report._id, s)}
                        disabled={updatingId === report._id}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 capitalize ${btnStyle.bg} ${btnStyle.text} border-current/10 hover:opacity-80`}
                      >
                        {updatingId === report._id ? <Loader2 size={12} className="animate-spin" /> : s.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
