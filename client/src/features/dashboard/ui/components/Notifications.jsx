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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("list"); // list, settings
  const [prefs, setPrefs] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      if (!token) return;

      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPrefs(res.data.user.notificationPreferences || {
            newTickets: true,
            agentOfflineAlerts: true,
            conversationResolved: true,
            teamActivity: true,
            subscriptionAlerts: true,
            monthlyReports: true,
            ticketAssigned: true,
            newMessages: true,
            reassignmentAlerts: true,
            enableSounds: true,
            quietHours: { enabled: false, start: '23:00', end: '07:00' }
        });
      }
    } catch (err) {
      console.error("Error fetching preferences", err);
    }
  };

  const handleSavePrefs = async (newPrefs) => {
    setIsSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      await axios.put(`${API_URL}/notifications/preferences`, {
        preferences: newPrefs
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrefs(newPrefs);
      toast.success("Preferences updated!");
    } catch (err) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      await axios.post(`${API_URL}/notifications/test-push`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Test notification sent!");
    } catch (err) {
      toast.error("Subscription not found or permission denied.");
    }
  };

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
        <div className="header-actions">
          <div className="tab-switcher">
            <button 
              className={`tab-btn ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => setActiveView('list')}
            >
              Inbox
            </button>
            <button 
              className={`tab-btn ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              Settings
            </button>
          </div>
          {activeView === 'list' && (
            <button 
              className="btn btn-outline btn-sm" 
              onClick={handleMarkAllAsRead}
              disabled={!notifications.some(n => !n.isRead)}
            >
              Mark all as read
            </button>
          )}
        </div>

      {activeView === 'list' ? (
        <>
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="notifications-settings animate-fade-in">
            <div className="settings-section card">
                <h3><Bell size={18} /> Notification Channels</h3>
                <p className="section-desc">Choose which events trigger real-time desktop & mobile notifications.</p>
                
                <div className="pref-grid">
                    <div className="pref-group">
                        <h4>Ticket Activity</h4>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">New Tickets</span>
                                <span className="pref-sub">Notify when a customer creates a new request.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.newTickets} onChange={(e) => handleSavePrefs({...prefs, newTickets: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Ticket Assigned</span>
                                <span className="pref-sub">Notify when a ticket is assigned to you.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.ticketAssigned} onChange={(e) => handleSavePrefs({...prefs, ticketAssigned: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">New Messages</span>
                                <span className="pref-sub">Notify on new customer replies in active chats.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.newMessages} onChange={(e) => handleSavePrefs({...prefs, newMessages: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Reassignment Alerts</span>
                                <span className="pref-sub">Notify when a ticket is moved between agents.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.reassignmentAlerts} onChange={(e) => handleSavePrefs({...prefs, reassignmentAlerts: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="pref-group">
                        <h4>Team & System</h4>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Team Activity</span>
                                <span className="pref-sub">Notify when agents join or leave the floor.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.teamActivity} onChange={(e) => handleSavePrefs({...prefs, teamActivity: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Agent Offline Alerts</span>
                                <span className="pref-sub">Notify owners when agents go offline during peak hours.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.agentOfflineAlerts} onChange={(e) => handleSavePrefs({...prefs, agentOfflineAlerts: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Monthly Reports</span>
                                <span className="pref-sub">Summary of team performance and AI savings.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.monthlyReports} onChange={(e) => handleSavePrefs({...prefs, monthlyReports: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Subscription Alerts</span>
                                <span className="pref-sub">Billing, plan usage, and invoice reminders.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.subscriptionAlerts} onChange={(e) => handleSavePrefs({...prefs, subscriptionAlerts: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-grid">
                <div className="settings-section card">
                    <div className="section-header-flex">
                        <h3><Clock size={18} /> Quiet Hours</h3>
                        <label className="switch">
                            <input type="checkbox" checked={prefs?.quietHours?.enabled} onChange={(e) => handleSavePrefs({...prefs, quietHours: {...prefs.quietHours, enabled: e.target.checked}})} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <p className="section-desc">Silence all non-urgent notifications during specific times.</p>
                    
                    {prefs?.quietHours?.enabled ? (
                        <div className="quiet-hours-box animate-fade-in">
                            <div className="time-range">
                                <div className="time-input">
                                    <label>From</label>
                                    <input type="time" value={prefs.quietHours.start} onChange={(e) => handleSavePrefs({...prefs, quietHours: {...prefs.quietHours, start: e.target.value}})} />
                                </div>
                                <div className="time-input">
                                    <label>To</label>
                                    <input type="time" value={prefs.quietHours.end} onChange={(e) => handleSavePrefs({...prefs, quietHours: {...prefs.quietHours, end: e.target.value}})} />
                                </div>
                            </div>
                            <p className="quiet-note">Notifications will be delivered silently to your inbox but won't trigger device alerts.</p>
                        </div>
                    ) : (
                        <div className="quiet-disabled">
                            <Clock size={32} className="ghost-icon" />
                            <p>Quiet hours are currently disabled.</p>
                        </div>
                    )}
                </div>

                <div className="settings-section card">
                    <h3><Zap size={18} /> Device Management</h3>
                    <p className="section-desc">Verify your connection and test notification delivery.</p>
                    <div className="troubleshoot-box">
                        <button className="btn btn-secondary btn-block" onClick={sendTestNotification}>
                            Send Test Notification
                        </button>
                        <div className="device-info-pill">
                            <div className="dot online"></div>
                            <span>Browser Push: <strong>Active</strong></span>
                        </div>
                        <div className="ios-guide">
                            <strong>Apple Device?</strong>
                            <p>To receive notifications on iOS, use "Add to Home Screen" from Safari's Share menu.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

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
          .header-actions { width: 100%; display: flex; flex-direction: column; gap: 12px; }
          .tab-switcher { width: 100%; }
          .header-actions .btn { width: 100%; }
          .search-box { min-width: 100%; }
          .card-top { flex-direction: column; gap: 4px; }
          .notif-card { padding: 12px 16px; }
        }

        /* Settings Styles */
        .tab-switcher { display: flex; background: var(--surface-container-low); padding: 4px; border-radius: 12px; border: 1px solid var(--outline-variant); }
        .tab-btn { padding: 6px 16px; border-radius: 8px; border: none; background: transparent; font-size: 0.85rem; font-weight: 700; color: var(--on-surface-variant); cursor: pointer; transition: 0.2s; }
        .tab-btn.active { background: white; color: var(--primary); box-shadow: var(--shadow-1); }

        .notifications-settings { display: flex; flex-direction: column; gap: 24px; }
        .section-desc { color: var(--on-surface-variant); font-size: 0.85rem; margin: -16px 0 24px; }
        
        .pref-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
        @media (min-width: 768px) { .pref-grid { grid-template-columns: 1fr 1fr; } }
        
        .pref-group h4 { font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--outline-variant); }
        
        .pref-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
        .pref-info { display: flex; flex-direction: column; gap: 2px; }
        .pref-label { font-weight: 700; color: var(--on-surface); font-size: 0.9rem; }
        .pref-sub { font-size: 0.75rem; color: var(--on-surface-variant); line-height: 1.4; }

        .settings-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 24px; }
        @media (min-width: 1024px) { .settings-grid { grid-template-columns: repeat(2, 1fr); } }

        .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-header-flex h3 { margin: 0; }

        .quiet-hours-box { background: var(--surface-container-low); border-radius: 12px; padding: 20px; border: 1px solid var(--outline-variant); }
        .time-range { display: flex; gap: 16px; margin-bottom: 16px; }
        .time-input { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .time-input label { font-size: 0.7rem; font-weight: 800; color: var(--on-surface-variant); text-transform: uppercase; }
        .time-input input { padding: 10px; border-radius: 10px; border: 1px solid var(--outline-variant); font-weight: 700; font-family: inherit; font-size: 0.9rem; width: 100%; }
        .quiet-note { font-size: 0.75rem; color: var(--on-surface-variant); margin: 0; font-style: italic; }

        .quiet-disabled { padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--surface-container-low); border-radius: 12px; border: 1px dashed var(--outline-variant); color: var(--outline); text-align: center; }
        .quiet-disabled p { font-size: 0.85rem; margin-top: 12px; font-weight: 600; }
        .ghost-icon { opacity: 0.2; }

        .troubleshoot-box { display: flex; flex-direction: column; gap: 16px; }
        .device-info-pill { display: flex; align-items: center; gap: 10px; background: var(--surface-container-low); padding: 10px 16px; border-radius: 12px; font-size: 0.85rem; border: 1px solid var(--outline-variant); }
        .device-info-pill .dot { width: 8px; height: 8px; border-radius: 50%; }
        .device-info-pill .dot.online { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); }

        .ios-guide { background: #fffbeb; padding: 16px; border-radius: 12px; border: 1px solid #fef3c7; }
        .ios-guide strong { display: block; font-size: 0.85rem; margin-bottom: 4px; color: #92400e; }
        .ios-guide p { font-size: 0.8rem; color: #b45309; margin: 0; line-height: 1.4; }

        /* Switch UI */
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background-color: #cbd5e1; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
      `}</style>
    </div>
  );
};

export default Notifications;
