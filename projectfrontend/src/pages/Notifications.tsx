import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Notification } from '../types';
import { Bell, CheckCheck, Trash2, Calendar, Wrench, Users, Mail } from 'lucide-react';

const TYPE_ICONS: Record<string, typeof Bell> = {
  booking_approved: Calendar,
  booking_rejected: Calendar,
  alternative_suggested: Calendar,
  session_completed: Calendar,
  equipment_status: Wrench,
  partner_request: Users,
};

const TYPE_COLORS: Record<string, string> = {
  booking_approved: 'bg-green-50 text-green-600',
  booking_rejected: 'bg-red-50 text-red-600',
  alternative_suggested: 'bg-blue-50 text-blue-600',
  session_completed: 'bg-teal-50 text-teal-600',
  equipment_status: 'bg-amber-50 text-amber-600',
  partner_request: 'bg-cyan-50 text-cyan-600',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  async function loadNotifications() {
    try {
      const data = await api.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch {}
    setLoading(false);
  }

  async function markRead(id: string) {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  }

  async function deleteNotif(id: string) {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Bell size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const Icon = TYPE_ICONS[notif.type] || Mail;
            const colorClass = TYPE_COLORS[notif.type] || 'bg-gray-50 text-gray-600';
            return (
              <div
                key={notif._id}
                className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-all duration-200 ${
                  notif.isRead ? 'border-gray-100 opacity-70' : 'border-gray-200 shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markRead(notif._id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif._id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
