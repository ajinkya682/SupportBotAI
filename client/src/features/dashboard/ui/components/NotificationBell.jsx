import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bell, CheckCircle2, Circle, Inbox, ExternalLink, X } from "lucide-react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../../../shared/services/config";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const socket = io(API_URL);

    socket.on("new_notification", (data) => {
      setNotifications((prev) => [
        {
          id: data.id,
          subject: data.subject,
          message: data.message,
          createdAt: data.createdAt,
          isRead: false,
        },
        ...prev,
      ]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      if (!token) return;
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      if (!token) return;
      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      if (!token) return;
      await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bell-btn ${isOpen ? 'active' : ''}`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="notifications-dropdown"
          >
            <div className="dropdown-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="new-tag">{unreadCount} New</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="mark-all-btn">
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notifications-list custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="empty-notifications">
                  <div className="empty-icon"><Inbox size={40} /></div>
                  <h4>No notifications yet</h4>
                  <p>When something important happens, we'll let you know here.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  >
                    <div className="notif-icon">
                      {notification.isRead ? (
                        <CheckCircle2 size={16} color="var(--outline)" />
                      ) : (
                        <Circle size={10} fill="var(--primary)" color="var(--primary)" />
                      )}
                    </div>
                    <div className="notif-content">
                      <div className="notif-header">
                        <span className="subject">{notification.subject}</span>
                        <span className="time">{formatTime(notification.createdAt)}</span>
                      </div>
                      <p className="message">{notification.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="dropdown-footer">
                <button>View All Notifications <ExternalLink size={12} /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .notification-bell-wrapper { position: relative; }
        .bell-btn { background: transparent; border: none; padding: 10px; border-radius: 12px; color: var(--on-surface-variant); cursor: pointer; transition: 0.2s; position: relative; }
        .bell-btn:hover, .bell-btn.active { background: var(--surface-container-low); color: var(--primary); }
        .unread-badge { position: absolute; top: 6px; right: 6px; background: var(--error); color: white; font-size: 0.65rem; font-weight: 800; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--surface-container-lowest); }
        
        .notifications-dropdown { position: absolute; top: 56px; right: 0; width: 380px; background: var(--surface-container-lowest); border-radius: 20px; box-shadow: var(--shadow-4); border: 1px solid var(--outline-variant); z-index: 1000; overflow: hidden; transform-origin: top right; }
        .dropdown-header { padding: 20px 24px; border-bottom: 1px solid var(--outline-variant); display: flex; justify-content: space-between; align-items: center; background: var(--surface-container-low); }
        .new-tag { background: var(--primary-fixed); color: var(--primary); font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; }
        .mark-all-btn { background: transparent; border: none; color: var(--primary); font-size: 0.8rem; font-weight: 700; cursor: pointer; }
        
        .notifications-list { max-height: 420px; overflow-y: auto; }
        .notification-item { padding: 16px 24px; display: flex; gap: 16px; cursor: pointer; transition: 0.2s; border-bottom: 1px solid var(--outline-variant); }
        .notification-item:hover { background: var(--surface-container-low); }
        .notification-item.unread { background: var(--primary-fixed); }
        .notif-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--surface-container-high); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .unread .notif-icon { background: white; }
        
        .notif-content { flex: 1; min-width: 0; }
        .notif-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .subject { font-weight: 700; font-size: 0.9rem; color: var(--on-surface); }
        .unread .subject { color: var(--primary); }
        .time { font-size: 0.7rem; color: var(--on-surface-variant); font-weight: 500; }
        .message { font-size: 0.85rem; color: var(--on-surface-variant); line-height: 1.5; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .unread .message { color: var(--on-surface); font-weight: 500; }
        
        .empty-notifications { padding: 60px 40px; text-align: center; color: var(--on-surface-variant); }
        .empty-icon { margin-bottom: 16px; opacity: 0.2; }
        .empty-notifications h4 { margin: 0 0 8px 0; color: var(--on-surface); }
        .empty-notifications p { font-size: 0.85rem; margin: 0; }
        
        .dropdown-footer { padding: 12px; background: var(--surface-container-low); border-top: 1px solid var(--outline-variant); text-align: center; }
        .dropdown-footer button { background: transparent; border: none; font-size: 0.75rem; font-weight: 700; color: var(--on-surface-variant); cursor: pointer; display: flex; align-items: center; gap: 8px; margin: 0 auto; }
        .dropdown-footer button:hover { color: var(--primary); }
      `}</style>
    </div>
  );
};

const formatTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default NotificationBell;
