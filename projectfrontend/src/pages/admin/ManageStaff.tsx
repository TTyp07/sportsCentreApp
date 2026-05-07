import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { User } from '../../types';
import {
  UserCheck, UserX, UserPlus, Shield, ShieldOff,
  Loader2, Mail, Calendar, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function ManageStaff() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '', dateOfBirth: '', address: '', email: '', password: '',
  });
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState('');
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [selectedFacs, setSelectedFacs] = useState<string[]>([]);

  useEffect(() => { 
    loadStaff();
    api.get('/facilities').then((data: any) => setFacilities(data)).catch(() => {});
  }, []);

  async function loadStaff() {
    try {
      const data = await api.get<User[]>('/admin/staff');
      setStaff(data);
    } catch {}
    setLoading(false);
  }

  async function approve(id: string) {
    setProcessingId(id);
    try {
      await api.put(`/admin/staff/${id}/approve`);
      setStaff(prev => prev.map(s => s._id === id ? { ...s, isApproved: true } : s));
    } catch {}
    setProcessingId(null);
  }

  async function suspend(id: string) {
    setProcessingId(id);
    try {
      await api.put(`/admin/staff/${id}/suspend`);
      setStaff(prev => prev.map(s => s._id === id ? { ...s, isSuspended: true } : s));
    } catch {}
    setProcessingId(null);
  }

  async function unsuspend(id: string) {
    setProcessingId(id);
    try {
      await api.put(`/admin/staff/${id}/unsuspend`);
      setStaff(prev => prev.map(s => s._id === id ? { ...s, isSuspended: false } : s));
    } catch {}
    setProcessingId(null);
  }

  async function handleAssign(id: string) {
    setProcessingId(id);
    try {
      await api.put(`/admin/staff/${id}/assign-facilities`, { facilityIds: selectedFacs });
      await loadStaff();
      setShowAssign(null);
      alert('Assignment saved successfully!');
    } catch (err: any) {
      alert('Failed to save assignment: ' + (err.response?.data?.message || err.message));
    }
    setProcessingId(null);
  }

  async function registerStaff(e: React.FormEvent) {
    e.preventDefault();
    setRegError('');
    setRegistering(true);
    try {
      await api.post('/auth/register-staff', regForm);
      await loadStaff();
      setShowRegister(false);
      setRegForm({ name: '', dateOfBirth: '', address: '', email: '', password: '' });
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    }
    setRegistering(false);
  }

  const pendingStaff = staff.filter(s => !s.isApproved);
  const displayStaff = tab === 'pending' ? pendingStaff : staff;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Staff</h1>
          <p className="text-gray-500 mt-1">Approve, suspend, and register staff accounts</p>
        </div>
        <button
          onClick={() => setShowRegister(!showRegister)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          <UserPlus size={16} /> Register Staff
        </button>
      </div>

      {showRegister && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 animate-slide-down">
          <h3 className="font-semibold text-gray-900 mb-4">Register New Staff</h3>
          {regError && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{regError}</div>
          )}
          <form onSubmit={registerStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" required placeholder="Full Name" value={regForm.name}
              onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
            <input type="email" required placeholder="Email" value={regForm.email}
              onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
            <input type="date" required lang="en-US" value={regForm.dateOfBirth}
              onChange={e => setRegForm(p => ({ ...p, dateOfBirth: e.target.value }))}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
            <input type="text" required placeholder="Address" value={regForm.address}
              onChange={e => setRegForm(p => ({ ...p, address: e.target.value }))}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
            <input type="password" required placeholder="Password" value={regForm.password}
              onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
            <div className="flex items-end">
              <button type="submit" disabled={registering}
                className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm shadow-sm">
                {registering ? 'Registering...' : 'Register Staff'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          All Staff ({staff.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          Pending ({pendingStaff.length})
        </button>
      </div>

      {displayStaff.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <UserCheck size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No staff found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayStaff.map(s => (
            <div key={s._id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-semibold flex-shrink-0 shadow-inner">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    {!s.isApproved && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Pending</span>
                    )}
                    {s.isSuspended && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600">Suspended</span>
                    )}
                    {s.isApproved && !s.isSuspended && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700">Active</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Mail size={11} /> {s.email}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setShowAssign(s._id);
                      setSelectedFacs((s.assignedFacilities as any[] || []).map(f => typeof f === 'string' ? f : f._id));
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    Assign Facilities
                  </button>
                  {!s.isApproved && (
                    <button
                      onClick={() => approve(s._id)}
                      disabled={processingId === s._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      {processingId === s._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                      Approve
                    </button>
                  )}
                  {s.isApproved && !s.isSuspended && (
                    <button
                      onClick={() => suspend(s._id)}
                      disabled={processingId === s._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <ShieldOff size={12} /> Suspend
                    </button>
                  )}
                  {s.isSuspended && (
                    <button
                      onClick={() => unsuspend(s._id)}
                      disabled={processingId === s._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50"
                    >
                      <Shield size={12} /> Unsuspend
                    </button>
                  )}
                </div>
              </div>

              {/* Show currently assigned facilities as tags */}
              {s.assignedFacilities && (s.assignedFacilities as any[]).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(s.assignedFacilities as any[]).map((f: any) => (
                    <span key={f._id || f} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md border border-slate-200">
                      {f.name || 'Facility'}
                    </span>
                  ))}
                </div>
              )}

              {/* Assignment UI */}
              {showAssign === s._id && (
                <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Assign Facilities to {s.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {facilities.map(f => (
                      <label key={f._id} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFacs.includes(f._id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedFacs(prev => [...prev, f._id]);
                            else setSelectedFacs(prev => prev.filter(id => id !== f._id));
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-xs text-gray-700">{f.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowAssign(null)}
                      className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAssign(s._id)}
                      disabled={processingId === s._id}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {processingId === s._id && <Loader2 size={12} className="animate-spin" />}
                      Save Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
