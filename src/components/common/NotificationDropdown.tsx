import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Dumbbell, 
  CheckSquare, 
  Utensils, 
  MessageSquare, 
  TrendingUp, 
  UserCheck, 
  Info, 
  X 
} from 'lucide-react';
import { useFitnessData } from '../../context/FitnessDataContext';
import { useAuth } from '../../context/AuthContext';
import { InAppNotification } from '../../types';

interface NotificationDropdownProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigate }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useFitnessData();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current user role and user ID
  const userNotifications = notifications.filter(n => {
    if (n.recipientRole && n.recipientRole !== user?.role) return false;
    if (n.userId && user?.uid && n.userId !== user.uid && user.role !== 'coach') return false;
    return true;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const filteredNotifications = userNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'workout_assigned':
        return <Dumbbell className="w-4 h-4 text-red-500" />;
      case 'checkin_feedback':
        return <CheckSquare className="w-4 h-4 text-emerald-400" />;
      case 'nutrition_updated':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'message_received':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case 'progress_logged':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-neutral-400" />;
    }
  };

  const handleNotificationClick = (notif: InAppNotification) => {
    markNotificationRead(notif.id);
    if (notif.actionTab && onNavigate) {
      onNavigate(notif.actionTab);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-black text-white bg-red-600 rounded-full shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-neutral-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead()}
                  className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-3 py-2 bg-neutral-50/80 border-b border-neutral-200 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                filter === 'all' 
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({userNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                filter === 'unread' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-84 overflow-y-auto divide-y divide-neutral-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                <p className="text-xs font-medium">No notifications in this view</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                    !notif.read ? 'bg-red-50/40' : 'bg-transparent'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-bold truncate ${!notif.read ? 'text-neutral-900' : 'text-neutral-700'}`}>
                        {notif.actorName ? (
                          <><span className="text-red-600">{notif.actorName}</span> — {notif.title}</>
                        ) : notif.title}
                      </p>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.changeDetail && (
                      <p className="text-[10px] text-neutral-400 mt-0.5 font-medium truncate">
                        📊 {notif.changeDetail}
                      </p>
                    )}
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1.5 shadow-xs" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-neutral-50 border-t border-neutral-200 text-center">
            <p className="text-[10px] text-neutral-500">
              BFL Automated System Alerts & Coaching Activity
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
