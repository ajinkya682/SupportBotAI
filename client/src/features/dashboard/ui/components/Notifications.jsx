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
  Clock,
  Send,
  Users,
  User,
  Megaphone,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { API_URL } from "../../../../shared/services/config";
import toast from "react-hot-toast";

const Notifications = () => {
  const { user } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("list"); // list, settings, compose
  const [prefs, setPrefs] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState("all");

  const [composeData, setComposeData] = useState({
    recipientId: "all",
    subject: "",
    message: ""
  });

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    if (user?.role === 'owner') fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/agents/list`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAgents(data);
    } catch (err) {}
  };

  const fetchPreferences = async () => {
    try {
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composeData.subject || !composeData.message) return toast.error("Please fill all fields");

    setIsSending(true);
    try {
      const isBroadcast = composeData.recipientId === "all";
      await axios.post(`${API_URL}/notifications/send-to-agents`, {
        recipientId: isBroadcast ? null : composeData.recipientId,
        subject: composeData.subject,
        message: composeData.message,
        isBroadcast
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      toast.success("Team message dispatched!");
      setComposeData({ recipientId: "all", subject: "", message: "" });
      setActiveView("list");
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
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

  const handleSavePrefs = async (newPrefs) => {
    setIsSaving(true);
    try {
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
            {user?.role === 'owner' && (
              <button 
                className={`tab-btn ${activeView === 'compose' ? 'active' : ''}`}
                onClick={() => setActiveView('compose')}
              >
                Team Messaging
              </button>
            )}
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
                        <div className={`role-tag ${n.senderRole}`}>
                           {n.senderRole === 'superadmin' ? 'SYSTEM' : 'OWNER'}
                        </div>
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
      ) : activeView === 'compose' ? (
        <div className="compose-view animate-fade-in">
          <div className="card compose-card">
            <div className="card-header-flex">
              <Megaphone size={24} className="header-icon" />
              <div>
                <h2>Team Announcement</h2>
                <p>Broadcast messages to your support staff instantly.</p>
              </div>
            </div>

            <form className="compose-form" onSubmit={handleSendMessage}>
              <div className="form-group">
                <label>Target Audience</label>
                <div className="audience-selector">
                  <label className={`audience-option ${composeData.recipientId === 'all' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="recipient" 
                      value="all" 
                      checked={composeData.recipientId === 'all'} 
                      onChange={() => setComposeData({...composeData, recipientId: 'all'})}
                    />
                    <Users size={18} />
                    <span>Entire Team</span>
                  </label>
                  <label className={`audience-option ${composeData.recipientId !== 'all' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="recipient" 
                      value="single" 
                      checked={composeData.recipientId !== 'all'} 
                      onChange={() => setComposeData({...composeData, recipientId: agents[0]?._id || ''})}
                    />
                    <User size={18} />
                    <span>Specific Agent</span>
                  </label>
                </div>
              </div>

              {composeData.recipientId !== 'all' && (
                <div className="form-group animate-slide-down">
                  <label>Select Agent</label>
                  <select 
                    value={composeData.recipientId}
                    onChange={(e) => setComposeData({...composeData, recipientId: e.target.value})}
                    required
                  >
                    <option value="">Choose an agent...</option>
                    {agents.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. System Maintenance Update"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message Content</label>
                <textarea 
                  rows="5"
                  placeholder="Type your message here..."
                  value={composeData.message}
                  onChange={(e) => setComposeData({...composeData, message: e.target.value})}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isSending}>
                {isSending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                <span>Send Real-Time Notification</span>
              </button>
            </form>
          </div>
        </div>
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
                        {/* ... more items ... */}
                    </div>
                </div>
            </div>
            {/* ... more settings ... */}
        </div>
      )}

      <style>{`
        .notifications-container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .tab-switcher { display: flex; background: var(--surface-container-low); padding: 4px; border-radius: 12px; border: 1px solid var(--outline-variant); }
        .tab-btn { padding: 8px 20px; border-radius: 8px; border: none; background: transparent; font-size: 0.9rem; font-weight: 700; color: var(--on-surface-variant); cursor: pointer; transition: 0.2s; }
        .tab-btn.active { background: white; color: var(--primary); box-shadow: var(--shadow-1); }

        .compose-card { padding: 32px; border-radius: 24px; }
        .card-header-flex { display: flex; gap: 16px; align-items: center; margin-bottom: 32px; }
        .header-icon { color: var(--primary); }
        .card-header-flex h2 { margin: 0; font-size: 1.5rem; font-weight: 800; }
        .card-header-flex p { margin: 4px 0 0; color: var(--on-surface-variant); font-size: 0.95rem; }

        .audience-selector { display: flex; gap: 12px; margin-top: 8px; }
        .audience-option { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border: 1.5px solid var(--outline-variant); border-radius: 12px; cursor: pointer; transition: 0.2s; font-weight: 700; color: var(--on-surface-variant); }
        .audience-option input { display: none; }
        .audience-option.active { border-color: var(--primary); background: var(--primary-fixed-dim); color: var(--primary); }

        .compose-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--on-surface); }
        .form-group input, .form-group select, .form-group textarea { padding: 12px 16px; border-radius: 12px; border: 1px solid var(--outline-variant); background: var(--surface-container-low); font-size: 0.95rem; transition: 0.2s; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-low); background: white; }

        .role-tag { font-size: 0.6rem; font-weight: 900; padding: 2px 6px; border-radius: 4px; margin-bottom: 4px; display: inline-block; }
        .role-tag.superadmin { background: #fef2f2; color: #ef4444; }
        .role-tag.owner { background: #eff6ff; color: #3b82f6; }

        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Notifications;
