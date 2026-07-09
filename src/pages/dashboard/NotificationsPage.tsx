import React, { useEffect, useState } from 'react';
import { 
  Bell, Check, Trash2, ShieldAlert, CheckCircle2, 
  AlertTriangle, Info 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: boolean;
  created_at: string;
}

export const NotificationsPage: React.FC = () => {
  const { apiFetch } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update notifications.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-white">Notifications</h2>
          <p className="text-xs text-zinc-500 mt-1">Review alerts, workflow triggers notices, and security updates.</p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 text-zinc-200 text-xs font-bold rounded-xl transition-all"
          >
            Mark All Read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Message Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-zinc-900/40 border border-zinc-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel border border-zinc-900 rounded-3xl p-12 text-center">
          <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="font-display font-bold text-md text-white">Inbox Zero</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            There are no messages in your alerts pipeline right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => {
            return (
              <div
                key={n.id}
                className={`glass-panel border rounded-2xl p-5 flex items-start gap-4 transition-all relative group ${
                  n.is_read 
                    ? 'border-zinc-900 bg-zinc-950/10 opacity-70' 
                    : 'border-violet-500/20 bg-violet-500/[0.02] shadow-glow'
                }`}
              >
                {/* Visual Status Indicator Icon */}
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  n.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                  n.type === 'WARNING' ? 'bg-amber-500/10 text-amber-400' :
                  n.type === 'ERROR' ? 'bg-red-500/10 text-red-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4" />}
                  {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4" />}
                  {n.type === 'ERROR' && <ShieldAlert className="w-4 h-4" />}
                  {n.type === 'INFO' && <Info className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className={`text-xs font-bold ${n.is_read ? 'text-zinc-400' : 'text-white'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[9px] font-mono text-zinc-600 shrink-0">
                      {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {/* Actions overlay */}
                <div className="absolute right-4 bottom-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-emerald-400 rounded-lg text-zinc-500 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-red-400 rounded-lg text-zinc-500 transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
