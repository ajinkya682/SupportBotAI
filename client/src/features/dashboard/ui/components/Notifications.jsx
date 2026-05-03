import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, 
  CheckCircle2, 
  Circle, 
  Inbox, 
  Trash2, 
  MoreVertical, 
  Filter,
  Search,
  Calendar,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../../../shared/services/config";
import toast from "react-hot-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
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
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error("Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to update notifications");
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  }).filter(n => 
    n.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFullDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications Center</h1>
          <p>Stay updated with your platform's activity</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline btn-sm" 
            onClick={handleMarkAllAsRead}
            disabled={!notifications.some(n => !n.isRead)}
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="notifications-controls">
        <div className="filter-group">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="count-dot"></span>
            )}
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="notifications-view">
        {isLoading ? (
          <div className="loading-notifications">
            <div className="pulse-loader"></div>
            <p>Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <Inbox size={64} />
            </div>
            <h2>Clear horizons</h2>
            <p>No notifications found matching your current filters.</p>
            {filter !== 'all' && (
              <button className="btn btn-text" onClick={() => setFilter('all')}>
                Show all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="notifications-list-detailed">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((n) => (
                <motion.div
                  layout
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`notif-card ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleMarkAsRead(n.id, n.isRead)}
                >
                  <div className="card-indicator"></div>
                  <div className="card-icon">
                    {n.isRead ? (
                      <CheckCircle2 size={20} className="icon-read" />
                    ) : (
                      <Bell size={20} className="icon-unread" />
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-top">
                      <h3 className="card-subject">{n.subject}</h3>
                      <div className="card-meta">
                        <Clock size={12} />
                        <span>{formatFullDate(n.createdAt)}</span>
                      </div>
                    </div>
                    <p className="card-message">{n.message}</p>
                  </div>
                  <div className="card-actions">
                    {!n.isRead && (
                       <button className="dot-action" title="Mark as read">
                         <Circle size={8} fill="currentColor" />
                       </button>
                    )}
                    <button className="more-btn">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
        .notifications-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 8px;
        }

        .header-left h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--on-surface);
          margin: 0 0 4px 0;
        }

        .header-left p {
          color: var(--on-surface-variant);
          font-size: 0.95rem;
          margin: 0;
        }

        .notifications-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          background: var(--surface-container-low);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--outline-variant);
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--on-surface-variant);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .filter-btn.active {
          background: white;
          color: var(--primary);
          box-shadow: var(--shadow-1);
        }

        .count-dot {
          width: 6px;
          height: 6px;
          background: var(--error);
          border-radius: 50%;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          max-width: 400px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box svg {
          position: absolute;
          left: 14px;
          color: var(--outline);
        }

        .search-box input {
          width: 100%;
          padding: 10px 16px 10px 42px;
          border-radius: 12px;
          border: 1px solid var(--outline-variant);
          background: white;
          font-size: 0.9rem;
          transition: 0.2s;
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-low);
        }

        .notifications-view {
          min-height: 400px;
        }

        .loading-notifications {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--outline);
          gap: 16px;
        }

        .pulse-loader {
          width: 40px;
          height: 40px;
          background: var(--primary-low);
          border-radius: 50%;
          animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
          background: white;
          border-radius: 24px;
          border: 1px dashed var(--outline-variant);
        }

        .empty-illustration {
          color: var(--outline-variant);
          margin-bottom: 24px;
        }

        .empty-state h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: var(--on-surface-variant);
          max-width: 300px;
          margin-bottom: 20px;
        }

        .notifications-list-detailed {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notif-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid var(--outline-variant);
          cursor: pointer;
          transition: 0.2s;
          position: relative;
          overflow: hidden;
        }

        .notif-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-2);
          border-color: var(--primary-low);
        }

        .notif-card.unread {
          background: var(--primary-fixed-dim);
          border-color: var(--primary-low);
        }

        .card-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: transparent;
        }

        .unread .card-indicator {
          background: var(--primary);
        }

        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: var(--surface-container-low);
        }

        .unread .card-icon {
          background: white;
        }

        .icon-unread { color: var(--primary); }
        .icon-read { color: var(--outline); }

        .card-body {
          flex: 1;
          min-width: 0;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
          gap: 12px;
        }

        .card-subject {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
          color: var(--on-surface);
        }

        .unread .card-subject {
          color: var(--primary);
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--on-surface-variant);
          font-weight: 600;
          white-space: nowrap;
        }

        .card-message {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--on-surface-variant);
          margin: 0;
        }

        .unread .card-message {
          color: var(--on-surface);
          font-weight: 500;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: 0.2s;
        }

        .notif-card:hover .card-actions {
          opacity: 1;
        }

        .dot-action {
          background: transparent;
          border: none;
          color: var(--primary);
          cursor: pointer;
        }

        .more-btn {
          background: transparent;
          border: none;
          color: var(--outline);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .more-btn:hover {
          background: var(--surface-container-low);
        }

        @media (max-width: 600px) {
          .notifications-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .header-actions { width: 100%; }
          .header-actions .btn { width: 100%; }
          .search-box { min-width: 100%; }
          .card-top { flex-direction: column; gap: 4px; }
          .notif-card { padding: 12px 16px; }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
