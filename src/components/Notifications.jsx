'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCircle } from 'lucide-react';
import { apiGet, apiPut } from '../lib/api-client';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const data = await apiGet('/api/notifications');
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      const data = await apiGet('/api/notifications/unread/count');
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }

  async function markAsRead(notificationId) {
    try {
      await apiPut(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      ));
      
      // Update unread count
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      setError(err.message);
    }
  }

  async function markAllAsRead() {
    try {
      await apiPut('/api/notifications/read-all');
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  }

  function getNotificationIcon(kind) {
    switch (kind) {
      case 'case_assigned': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'appointment_reminder': return <Bell className="w-5 h-5 text-green-500" />;
      case 'payment_completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'payment_failed': return <Bell className="w-5 h-5 text-red-500" />;
      case 'comment_added': return <Bell className="w-5 h-5 text-gray-500" />;
      case 'document_uploaded': return <CheckCircle className="w-5 h-5 text-cyan-500" />;
      case 'ai_suggestion_ready': return <Bell className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  }

  function getNotificationColor(kind) {
    switch (kind) {
      case 'case_assigned': return '#007bff';
      case 'appointment_reminder': return '#28a745';
      case 'payment_completed': return '#28a745';
      case 'payment_failed': return '#dc3545';
      case 'comment_added': return '#6c757d';
      case 'document_uploaded': return '#17a2b8';
      case 'ai_suggestion_ready': return '#6f42c1';
      default: return '#6c757d';
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  }

  const NotificationDropdown = () => (
    <motion.div
      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              icon={<Check className="w-4 h-4" />}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center text-red-700">
            <Bell className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {loading && (
        <div className="p-8 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600">Loading notifications...</p>
        </div>
      )}

      {notifications.length === 0 && !loading && !error && (
        <div className="p-8 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications</p>
        </div>
      )}

      <div className="overflow-y-auto max-h-64">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
              !notification.read_at ? 'bg-blue-50' : ''
            }`}
            onClick={() => !notification.read_at && markAsRead(notification.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.kind)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {notification.title}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {notification.body}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatTime(notification.created_at)}
                </div>
              </div>
              {!notification.read_at && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      <motion.button
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDropdown(false)}
            />
            <NotificationDropdown />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
