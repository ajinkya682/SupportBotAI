import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, CheckCircle2, Inbox, ExternalLink, Sparkles } from 'lucide-react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../../../shared/services/config';

const formatTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const socket = io(API_URL);
    socket.on('new_notification', (data) => {
      setNotifications(prev => [{ id: data.id, subject: data.subject, message: data.message, createdAt: data.createdAt, isRead: false }, ...prev]);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const token = user?.token;
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setNotifications(res.data.notifications);
    } catch (error) { console.error('Error fetching notifications', error); }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const token = user?.token;
      if (!token) return;
      await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) { console.error('Error marking as read', error); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const token = user?.token;
      if (!token) return;
      await axios.patch(`${API_URL}/api/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.error('Error marking all as read', error); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative', width: '44px', height: '44px',
          background: isOpen ? 'var(--color-primary-light)' : 'var(--color-surface-container-low)',
          border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isOpen ? '0 0 0 2px var(--color-primary-light)' : 'none',
        }}
      >
        <Bell size={20} style={{ color: isOpen ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '18px', height: '18px',
            background: 'var(--color-error)',
            color: 'white', fontSize: '10px', fontWeight: 'var(--weight-bold)',
            borderRadius: 'var(--radius-full)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'absolute', right: 0, top: 'calc(100% + 12px)',
              width: '380px', background: 'white',
              borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-2xl)',
              overflow: 'hidden', zIndex: 100, border: '1px solid var(--color-surface-container)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-6) var(--space-6)',
              borderBottom: '1px solid var(--color-surface-container-low)',
              background: 'var(--color-surface-container-lowest)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>Updates</h3>
                {unreadCount > 0 && (
                  <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{unreadCount} NEW</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
                    <Inbox size={28} style={{ color: 'var(--color-on-surface-muted)' }} />
                  </div>
                  <h4 style={{ fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>All caught up!</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)' }}>You have no new notifications at the moment.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                      style={{
                        padding: 'var(--space-5) var(--space-6)',
                        display: 'flex', gap: 'var(--space-4)', cursor: 'pointer',
                        background: notification.isRead ? 'transparent' : 'var(--color-primary-light)',
                        borderBottom: '1px solid var(--color-surface-container-low)',
                        transition: 'all 0.2s',
                      }}
                      className="notification-item"
                    >
                      <div style={{ marginTop: '2px' }}>
                        {notification.isRead ? (
                          <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-muted)' }}>
                            <CheckCircle2 size={16} />
                          </div>
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Sparkles size={16} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: notification.isRead ? 'var(--weight-medium)' : 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>{notification.subject}</span>
                          <span style={{ fontSize: '10px', color: 'var(--color-on-surface-muted)', fontWeight: 'bold' }}>{formatTime(notification.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', lineHeight: 1.5, margin: 0 }}>{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', borderTop: '1px solid var(--color-surface-container-low)' }}>
                <button style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-on-surface-muted)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', background: 'none', border: 'none', cursor: 'pointer' }}>
                  VIEW ALL HISTORY <ExternalLink size={12} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .notification-item:hover { background: var(--color-surface-container-low) !important; }
      `}</style>
    </div>
  );
};

export default NotificationBell;
