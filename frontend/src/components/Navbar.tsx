import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, LogOut, ShieldAlert, Award, Calendar, BookOpen, Layers, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { apiCall } from '../utils/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await apiCall<any[]>('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await apiCall(`/notifications/${notifId}/read`, 'PUT');
      setNotifications(notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'ACADEMIC': return <BookOpen className="h-4 w-4 text-brand-500" />;
      case 'EVENT': return <Calendar className="h-4 w-4 text-emerald-500" />;
      case 'PLACEMENT': return <Award className="h-4 w-4 text-amber-500" />;
      default: return <ShieldAlert className="h-4 w-4 text-rose-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/30 bg-white/20 backdrop-blur-lg shadow-xl dark:bg-slate-900/50 dark:border-white/10 transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand Label */}
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-brand-500 animate-float" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
            CampusConnect
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200/50 dark:border-slate-700 rounded-xl leading-5 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white/90 dark:focus:bg-slate-800/80 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all duration-300 backdrop-blur-xl shadow-inner"
            placeholder="Search across CampusConnect..."
          />
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
                  <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
                  <span className="text-xs font-medium text-brand-700 dark:text-brand-200 bg-brand-100 dark:bg-brand-900/50 px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                        className={`flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-brand-50 dark:bg-brand-950/20' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notif.isRead && (
                          <span className="mt-1 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* User Profile Badge */}
          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs font-medium text-brand-600 dark:text-brand-400 capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>

              {/* Log Out */}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-5 w-5 text-rose-500" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
