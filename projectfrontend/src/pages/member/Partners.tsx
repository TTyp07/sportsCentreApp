import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Search, Filter, MessageSquare, Check, X, Shield, Star, Clock, Bell, Send } from 'lucide-react';

interface PartnerProfile {
  isVisible: boolean;
  preferredSport: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  availability: string;
}

interface MatchableUser {
  _id: string;
  name: string;
  email: string;
  partnerProfile: PartnerProfile;
}

interface PartnerRequest {
  _id: string;
  sender: any;
  recipient: any;
  sport: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
}

export default function Partners() {
  const { user } = useAuth();
  const [members, setMembers] = useState<MatchableUser[]>([]);
  const [requests, setRequests] = useState<{ received: PartnerRequest[], sent: PartnerRequest[] }>({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState('All');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MatchableUser | null>(null);
  const [requestMessage, setRequestMessage] = useState("Hi! I'm looking for a partner to play with.");

  // Profile form state
  const [profileForm, setProfileForm] = useState<PartnerProfile>({
    isVisible: false,
    preferredSport: '',
    skillLevel: 'beginner',
    availability: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchData();
    if (user?.partnerProfile) {
      setProfileForm(user.partnerProfile as any);
    }
  }, [user]);

  async function fetchData() {
    try {
      const [membersData, requestsData] = await Promise.all([
        api.get<MatchableUser[]>(`/partners/members?sport=${filterSport}`),
        api.get<{ received: PartnerRequest[], sent: PartnerRequest[] }>('/partners/requests')
      ]);
      setMembers(membersData);
      setRequests(requestsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await api.put('/partners/profile', profileForm);
      alert('Profile updated successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handleSendRequest() {
    if (!selectedMember) return;

    try {
      await api.post('/partners/request', { 
        recipientId: selectedMember._id, 
        sport: selectedMember.partnerProfile.preferredSport, 
        message: requestMessage 
      });
      setShowModal(false);
      setRequestMessage("Hi! I'm looking for a partner to play with.");
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Request failed');
    }
  }

  async function handleRequestAction(requestId: string, status: 'accepted' | 'rejected') {
    try {
      await api.put(`/partners/request/${requestId}`, { status });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Find Partners</h1>
          <p className="text-slate-500 mt-2">Connect with other members and arrange shared sessions</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-3 text-slate-400">
            <Filter size={18} />
            <span className="text-sm font-medium">Sport:</span>
          </div>
          {['All', 'Badminton', 'Tennis', 'Basketball', 'Yoga'].map(sport => (
            <button
              key={sport}
              onClick={() => {setFilterSport(sport); setLoading(true); fetchData();}}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                filterSport === sport 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Setup & Requests */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-teal-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star size={20} className="fill-white" />
                My Sport Profile
              </h2>
              <p className="text-teal-100 text-sm mt-1">Make yourself discoverable to others</p>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Shield size={18} className={profileForm.isVisible ? 'text-teal-600' : 'text-slate-400'} />
                  <span className="text-sm font-bold text-slate-700">Visible to others</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileForm(p => ({ ...p, isVisible: !p.isVisible }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${profileForm.isVisible ? 'bg-teal-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profileForm.isVisible ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Preferred Sport</label>
                <select
                  value={profileForm.preferredSport}
                  onChange={e => setProfileForm(p => ({ ...p, preferredSport: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <option value="">Select sport</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Gym">Gym/Training</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Skill Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setProfileForm(p => ({ ...p, skillLevel: level }))}
                      className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border ${
                        profileForm.skillLevel === level 
                        ? 'bg-teal-50 border-teal-200 text-teal-700' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Availability</label>
                <input
                  type="text"
                  placeholder="e.g. Weekends, Evenings"
                  value={profileForm.availability}
                  onChange={e => setProfileForm(p => ({ ...p, availability: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Requests Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bell size={20} className="text-teal-600" />
                Requests
              </h2>
              {requests.received.filter(r => r.status === 'pending').length > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                  {requests.received.filter(r => r.status === 'pending').length} New
                </span>
              )}
            </div>
            <div className="p-6">
              {requests.received.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">No incoming requests yet</p>
              ) : (
                <div className="space-y-4">
                  {requests.received.map(req => (
                    <div key={req._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{req.sender?.name || 'Unknown'}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          req.status === 'accepted' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Wants to play <span className="font-bold text-slate-700">{req.sport}</span></p>
                      {req.message && <p className="text-xs italic text-slate-400">"{req.message}"</p>}
                      
                      {req.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleRequestAction(req._id, 'accepted')}
                            className="flex-1 py-1.5 bg-teal-600 text-white text-[10px] font-bold rounded-xl hover:bg-teal-700 transition-all"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRequestAction(req._id, 'rejected')}
                            className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-slate-50 transition-all"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {req.status === 'accepted' && (
                        <div className="pt-1">
                           <a href={`mailto:${req.sender?.email}`} className="text-[10px] font-bold text-teal-600 flex items-center gap-1 hover:underline">
                             <MessageSquare size={12} /> Contact via Email
                           </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Member Feed */}
        <div className="lg:col-span-2">
          {members.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center">
              <Users size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No matching members found</h3>
              <p className="text-slate-500 mt-2">Try changing your sport filter or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map(member => {
                const isSent = requests.sent.some(r => r.recipient === member._id && r.status === 'pending');
                return (
                <div key={member._id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:border-teal-200 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{member.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-tight">
                            {member.partnerProfile.preferredSport}
                          </span>
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-lg uppercase tracking-tight">
                            {member.partnerProfile.skillLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-xs">Available: <span className="text-slate-700 font-medium">{member.partnerProfile.availability}</span></span>
                    </div>
                  </div>

                  <button
                    disabled={isSent}
                    onClick={() => { setSelectedMember(member); setShowModal(true); }}
                    className={`w-full py-3 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                      isSent 
                      ? 'bg-slate-100 text-slate-400 cursor-default' 
                      : 'bg-slate-50 text-slate-900 hover:bg-teal-600 hover:text-white'
                    }`}
                  >
                    {isSent ? <Check size={16} /> : <MessageSquare size={16} />}
                    {isSent ? 'Request Sent' : 'Send Partner Request'}
                  </button>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-teal-600 p-8 text-white relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <Users size={40} className="mb-4 opacity-50" />
              <h3 className="text-2xl font-bold">Partner Request</h3>
              <p className="text-teal-100 text-sm mt-1">Send a message to {selectedMember.name}</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sport</p>
                <p className="text-sm font-bold text-slate-800">{selectedMember.partnerProfile.preferredSport}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Message</label>
                <textarea
                  value={requestMessage}
                  onChange={e => setRequestMessage(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:ring-2 focus:ring-teal-500 transition-all resize-none h-32"
                  placeholder="Tell them why you'd like to play together..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
