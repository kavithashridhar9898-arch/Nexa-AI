import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, GitBranch, Key, BarChart3, Bell, Settings, LogOut, Sun, Moon, 
  Sparkles, Menu, X, Check, Trash2, ArrowUpRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CustomCursor } from '../components/CustomCursor';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: boolean;
  created_at: string;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout, apiFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);

  // Private Route Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new alerts
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const markRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const deleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono text-zinc-500">Loading Nexus Console...</span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Workflows', path: '/dashboard/workflows', icon: GitBranch },
    { label: 'API Keys', path: '/dashboard/api-keys', icon: Key },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell, count: unreadCount },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings }
  ];

  // Get current breadcrumb
  const currentItem = menuItems.find(item => item.path === location.pathname);
  const breadcrumb = currentItem ? currentItem.label : 'Console';

  return (
    <div className="min-h-screen relative bg-zinc-950 text-zinc-100 flex overflow-hidden">
      
      {/* Background elements */}
      <div className="noise-overlay" />
      <div className="fixed inset-0 grid-bg opacity-[0.3] pointer-events-none z-0" />
      <CustomCursor />

      {/* 1. LEFT SIDEBAR PANEL - Desktop */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-zinc-900 bg-zinc-950 z-20 shrink-0">
        
        {/* Brand Logo */}
        <div className="h-16 px-6 border-b border-zinc-900 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-white">NEXUS CONSOLE</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) => 
                  `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-violet-600/10 border border-violet-500/20 text-violet-400' 
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white font-mono text-[9px]">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Profile */}
        <div className="p-4 border-t border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white shrink-0 uppercase">
              {user?.name.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
              <p className="text-[9px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>

      </aside>

      {/* 2. MAIN CONTAINER AREA */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Header Bar */}
        <header className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
          
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-zinc-900 rounded-md text-zinc-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <span>Console</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notification Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifPopoverOpen && (
                <div className="absolute right-0 mt-2 w-[320px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-premium p-4 z-50">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                    <h4 className="text-xs font-bold text-white">Latest Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[10px] text-violet-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-zinc-600 text-center py-4 italic">No alerts.</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div 
                          key={n.id} 
                          className={`p-2.5 rounded-xl border text-[11px] transition-colors relative group ${
                            n.is_read 
                              ? 'bg-zinc-900/10 border-zinc-900 text-zinc-400' 
                              : 'bg-violet-950/10 border-violet-950/50 text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold ${!n.is_read ? 'text-violet-400' : ''}`}>{n.title}</span>
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.is_read && (
                                <button 
                                  onClick={(e) => markRead(n.id, e)}
                                  className="text-zinc-500 hover:text-emerald-400"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={(e) => deleteNotif(n.id, e)}
                                className="text-zinc-500 hover:text-red-400"
                              >
                                  <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-zinc-800 pt-2 mt-3 text-center">
                    <button
                      onClick={() => { setNotifPopoverOpen(false); navigate('/dashboard/notifications'); }}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
                    >
                      View all notifications <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>

      </div>

      {/* 3. MOBILE SIDEBAR DROPDOWN OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          
          <div className="w-[260px] bg-zinc-950 border-r border-zinc-900 flex flex-col p-6 animate-slide-right">
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
              <span className="font-display font-black text-sm tracking-tight text-white">NEXUS AI</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-zinc-900 rounded-md text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-grow space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-violet-600/10 border border-violet-500/20 text-violet-400' 
                          : 'text-zinc-400 hover:bg-zinc-900'
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4.5 h-4.5" />
                      {item.label}
                    </span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white font-mono text-[9px]">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-zinc-900 pt-4 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white uppercase text-xs shrink-0">
                  {user?.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-lg"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
