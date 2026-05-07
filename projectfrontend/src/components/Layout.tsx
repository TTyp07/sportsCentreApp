import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home, Calendar, Clock, Users, Wrench, Bell, Search,
  LogOut, Menu, X, ChevronDown, Shield, Building2, UserCheck,
  ClipboardList, Activity
} from 'lucide-react';

const memberLinks = [
  { to: '/facilities', label: 'Facilities', icon: Building2 },
  { to: '/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/history', label: 'Booking History', icon: Clock },
  { to: '/partners', label: 'Find Partners', icon: Users },
  { to: '/equipment', label: 'Equipment Reports', icon: Wrench },
];

const staffLinks = [
  { to: '/staff/requests', label: 'Booking Requests', icon: ClipboardList },
  { to: '/staff/bookings', label: 'All Bookings', icon: Calendar },
  { to: '/staff/equipment', label: 'Equipment Reports', icon: Wrench },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: Home },
  { to: '/admin/facilities', label: 'Manage Facilities', icon: Building2 },
  { to: '/admin/staff', label: 'Manage Staff', icon: UserCheck },
  { to: '/admin/members', label: 'Manage Members', icon: Users },
  { to: '/staff/requests', label: 'Booking Requests', icon: ClipboardList },
  { to: '/staff/bookings', label: 'All Bookings', icon: Calendar },
];

export default function Layout() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'staff' ? staffLinks
    : memberLinks;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-4 lg:px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <Activity className="h-7 w-7 text-teal-600" />
          <span className="text-lg font-bold text-gray-900 hidden sm:inline">SportsCentre</span>
        </Link>

        <div className="flex-1" />

        {/* Notifications */}
        <Link
          to="/notifications"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative mr-2"
        >
          <Bell size={20} className="text-gray-600" />
        </Link>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.name}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-teal-50 text-teal-700 capitalize">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <nav className="p-4 space-y-1">
          {links.map(link => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={active ? 'text-teal-600' : 'text-gray-400'} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {profile?.role === 'member' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield size={14} />
              <span>Membership: {profile.membershipActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
