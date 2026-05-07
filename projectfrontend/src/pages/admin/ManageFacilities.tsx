import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Facility } from '../../types';
import { Building2, Plus, Pencil, Trash2, X, Loader2, MapPin, Users, Clock, Upload, ImageIcon } from 'lucide-react';

const EMPTY_FORM = {
  name: '', type: '', description: '', image: '', usageGuidelines: '',
  location: '', latitude: 50.9352, longitude: -1.3980,
  capacityLimit: 1, timeSlotDuration: 60,
  availableSlots: [] as { day: string; startTime: string; endTime: string }[],
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ManageFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { loadFacilities(); }, []);

  async function loadFacilities() {
    try {
      const data = await api.get<Facility[]>('/facilities');
      setFacilities(data);
    } catch {}
    setLoading(false);
  }

  function startEdit(f: Facility) {
    setForm({
      name: f.name,
      type: f.type,
      description: f.description || '',
      image: f.image || '',
      usageGuidelines: f.usageGuidelines || '',
      location: f.location || '',
      latitude: f.latitude || 50.9352,
      longitude: f.longitude || -1.3980,
      capacityLimit: f.capacityLimit,
      timeSlotDuration: f.timeSlotDuration,
      availableSlots: f.availableSlots || [],
    });
    setEditing(f._id);
    setShowForm(true);
  }

  function cancelForm() {
    setForm({ ...EMPTY_FORM });
    setEditing(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/facilities/${editing}`, form);
      } else {
        await api.post('/facilities', form);
      }
      await loadFacilities();
      cancelForm();
    } catch {}
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/facilities/${id}`);
      setFacilities(prev => prev.filter(f => f._id !== id));
    } catch {}
    setDeletingId(null);
  }

  function addSlot() {
    setForm(p => ({
      ...p,
      availableSlots: [...p.availableSlots, { day: 'Monday', startTime: '09:00', endTime: '10:00' }],
    }));
  }

  function removeSlot(i: number) {
    setForm(p => ({
      ...p,
      availableSlots: p.availableSlots.filter((_, idx) => idx !== i),
    }));
  }

  function updateSlot(i: number, field: string, value: string) {
    setForm(p => ({
      ...p,
      availableSlots: p.availableSlots.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setSubmitting(true);
    try {
      const { imageUrl } = await api.upload<{ imageUrl: string }>('/upload/facility', formData);
      setForm(p => ({ ...p, image: imageUrl }));
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }

  function getImageUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Facilities</h1>
          <p className="text-gray-500 mt-1">Create, edit, and remove sports facilities</p>
        </div>
        <button
          onClick={() => showForm ? cancelForm() : setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Facility'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Facility' : 'New Facility'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text" required value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  placeholder="e.g. Badminton Court, Football Pitch"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number" step="0.0001" value={form.latitude}
                    onChange={e => setForm(p => ({ ...p, latitude: parseFloat(e.target.value) || 50.9352 }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number" step="0.0001" value={form.longitude}
                    onChange={e => setForm(p => ({ ...p, longitude: parseFloat(e.target.value) || -1.3980 }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number" min="1" value={form.capacityLimit}
                    onChange={e => setForm(p => ({ ...p, capacityLimit: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot (min)</label>
                  <input
                    type="number" min="15" step="15" value={form.timeSlotDuration}
                    onChange={e => setForm(p => ({ ...p, timeSlotDuration: parseInt(e.target.value) || 60 }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Facility Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative group w-32 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0 transition-colors hover:border-teal-400">
                    {form.image ? (
                      <>
                        <img src={getImageUrl(form.image)} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setForm(p => ({ ...p, image: '' }))}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="text-slate-300" size={32} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-all active:scale-95 shadow-sm">
                      <Upload size={16} />
                      {form.image ? 'Change Image' : 'Upload Local Image'}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Support: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Guidelines</label>
              <textarea
                value={form.usageGuidelines}
                onChange={e => setForm(p => ({ ...p, usageGuidelines: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* Time slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Available Time Slots</label>
                <button type="button" onClick={addSlot} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  + Add Slot
                </button>
              </div>
              {form.availableSlots.length === 0 ? (
                <p className="text-xs text-gray-400">No slots added</p>
              ) : (
                <div className="space-y-2">
                  {form.availableSlots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={slot.day}
                        onChange={e => updateSlot(i, 'day', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
                      >
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input
                        type="time" value={slot.startTime}
                        onChange={e => updateSlot(i, 'startTime', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-xs text-gray-400">to</span>
                      <input
                        type="time" value={slot.endTime}
                        onChange={e => updateSlot(i, 'endTime', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
                      />
                      <button type="button" onClick={() => removeSlot(i)} className="text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm"
            >
              {submitting ? 'Saving...' : editing ? 'Update Facility' : 'Create Facility'}
            </button>
          </form>
        </div>
      )}

      {facilities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No facilities yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {facilities.map(f => (
            <div key={f._id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{f.name}</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-50 text-teal-700">{f.type}</span>
                  {!f.isActive && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600">Inactive</span>
                  )}
                </div>
                {f.description && <p className="text-sm text-gray-500 line-clamp-1">{f.description}</p>}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                  {f.location && <span className="flex items-center gap-1"><MapPin size={11} /> {f.location}</span>}
                  <span className="flex items-center gap-1"><Users size={11} /> Cap: {f.capacityLimit}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {f.timeSlotDuration}min</span>
                  <span>{f.availableSlots?.length || 0} slots</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => startEdit(f)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(f._id)}
                  disabled={deletingId === f._id}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === f._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
