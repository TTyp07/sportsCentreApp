import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { DashboardStats } from '../../types';
import { Users, Building2, Calendar, UserCheck, ClipboardList, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/admin/dashboard')
      .then(setStats)
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

  const cards = [
    { label: 'Total Members', value: stats?.totalMembers || 0, icon: Users, color: 'bg-teal-50 text-teal-600', link: '/admin/members' },
    { label: 'Total Staff', value: stats?.totalStaff || 0, icon: UserCheck, color: 'bg-cyan-50 text-cyan-600', link: '/admin/staff' },
    { label: 'Facilities', value: stats?.totalFacilities || 0, icon: Building2, color: 'bg-emerald-50 text-emerald-600', link: '/admin/facilities' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar, color: 'bg-sky-50 text-sky-600', link: '/staff/bookings' },
    { label: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: ClipboardList, color: 'bg-amber-50 text-amber-600', link: '/staff/requests' },
    { label: 'Pending Staff', value: stats?.pendingStaff || 0, icon: UserCheck, color: 'bg-orange-50 text-orange-600', link: '/admin/staff' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of the sports centre system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <Icon size={20} />
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
