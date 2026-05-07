import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { EquipmentReport, Facility } from '../../types';
import { Wrench, Plus, X, CheckCircle2, AlertTriangle, Clock, Loader2 } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  noted: { bg: 'bg-blue-50', text: 'text-blue-700' },
  repair_in_progress: { bg: 'bg-orange-50', text: 'text-orange-700' },
  resolved: { bg: 'bg-green-50', text: 'text-green-700' },
};

export default function EquipmentReports() {
  const [reports, setReports] = useState<EquipmentReport[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    facility: '',
    equipmentDescription: '',
    issueDescription: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<EquipmentReport[]>('/equipment/my'),
      api.get<Facility[]>('/facilities'),
    ]).then(([r, f]) => {
      setReports(r);
      setFacilities(f);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await api.post('/equipment', form);
      const data = await api.get<EquipmentReport[]>('/equipment/my');
      setReports(data);
      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setForm({ facility: '', equipmentDescription: '', issueDescription: '' });
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    }
    setSubmitting(false);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Reports</h1>
          <p className="text-gray-500 mt-1">Report faulty or damaged equipment</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Report'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
              <select
                required
                value={form.facility}
                onChange={e => setForm(p => ({ ...p, facility: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select facility</option>
                {facilities.map(f => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Description</label>
              <input
                type="text"
                required
                value={form.equipmentDescription}
                onChange={e => setForm(p => ({ ...p, equipmentDescription: e.target.value }))}
                placeholder="e.g. Treadmill #3, Basketball hoop"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
              <textarea
                required
                value={form.issueDescription}
                onChange={e => setForm(p => ({ ...p, issueDescription: e.target.value }))}
                placeholder="Describe the issue in detail..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} />
                Report submitted successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || success}
              className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm"
            >
              {submitting ? 'Submitting...' : success ? 'Submitted!' : 'Submit Report'}
            </button>
          </form>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Wrench size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No equipment reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => {
            const facility = report.facility as Facility;
            const style = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
            return (
              <div key={report._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{report.equipmentDescription}</h3>
                    <p className="text-xs text-gray-400">{facility?.name || 'Unknown Facility'}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text} whitespace-nowrap`}>
                    {report.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{report.issueDescription}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Reported {new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
