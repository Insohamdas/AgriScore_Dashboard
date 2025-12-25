import React, { useState } from 'react';
import { 
  Bell, CheckCircle, AlertTriangle, Info, Clock, 
  Filter, Search, MoreHorizontal, Trash2, Check,
  Droplets, Sprout, Sun, Shield
} from 'lucide-react';
import { SectionHeader, Card, StatusBadge } from '../components/ui';

type NotificationType = 'alert' | 'success' | 'info' | 'warning';
type NotificationCategory = 'system' | 'crop' | 'weather' | 'task';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  timestamp: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Irrigation System Alert',
    message: 'Zone B moisture levels dropped below 20%. Automated irrigation started.',
    type: 'warning',
    category: 'system',
    timestamp: '10 min ago',
    isRead: false,
  },
  {
    id: '2',
    title: 'Harvest Goal Reached',
    message: 'Congratulations! You have reached 100% of your wheat production goal for this season.',
    type: 'success',
    category: 'crop',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: '3',
    title: 'Weather Warning',
    message: 'Heavy rain expected in the next 24 hours. Please secure loose equipment.',
    type: 'alert',
    category: 'weather',
    timestamp: '5 hours ago',
    isRead: true,
  },
  {
    id: '4',
    title: 'New Task Assigned',
    message: 'Dr. Sarah assigned a new task: "Inspect corn field for pest markers".',
    type: 'info',
    category: 'task',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: '5',
    title: 'System Update',
    message: 'AgriScore platform will undergo maintenance on Sunday at 2:00 AM.',
    type: 'info',
    category: 'system',
    timestamp: '2 days ago',
    isRead: true,
  },
];

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');

  const getIcon = (type: NotificationType, category: NotificationCategory) => {
    if (category === 'weather') return <Sun className="w-5 h-5 text-orange-500" />;
    if (category === 'crop') return <Sprout className="w-5 h-5 text-green-500" />;
    if (category === 'system') return <Shield className="w-5 h-5 text-blue-500" />;
    
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'alert': return 'bg-red-50 border-red-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'success': return 'bg-emerald-50 border-emerald-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false;
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Notifications" 
        subtitle="Stay updated with your farm's activities and alerts"
        rightElement={
          <div className="flex items-center gap-3">
            <button 
              onClick={markAllAsRead}
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 px-2">Filters</h3>
            
            <button
              onClick={() => setFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                All Notifications
              </div>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-slate-100 shadow-sm">
                {notifications.length}
              </span>
            </button>

            <button
              onClick={() => setFilter('unread')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'unread' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Unread
              </div>
              {unreadCount > 0 && (
                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          </Card>

          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 px-2">Categories</h3>
            {['all', 'system', 'crop', 'weather', 'task'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  selectedCategory === cat 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? <Filter className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>}
                {cat}
              </button>
            ))}
          </Card>
        </div>

        {/* Notification List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No notifications found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-1">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`group relative flex gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                  notification.isRead 
                    ? 'bg-white border-slate-100' 
                    : 'bg-white border-emerald-100 shadow-sm ring-1 ring-emerald-50'
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></div>
                )}

                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getBgColor(notification.type)}`}>
                  {getIcon(notification.type, notification.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {notification.timestamp}
                        <span className="mx-1">•</span>
                        <span className="capitalize">{notification.category}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${notification.isRead ? 'text-slate-500' : 'text-slate-600'} leading-relaxed`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
