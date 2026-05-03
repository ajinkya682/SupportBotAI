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
             <div className="settings-section card shadow-sm">
                <h3><Bell size={20} /> Notification Channels</h3>
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
                                <span className="pref-label">Assigned to Me</span>
                                <span className="pref-sub">Alert when a ticket is specifically assigned to you.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.ticketAssigned} onChange={(e) => handleSavePrefs({...prefs, ticketAssigned: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">New Messages</span>
                                <span className="pref-sub">Notify on new customer messages in active chats.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.newMessages} onChange={(e) => handleSavePrefs({...prefs, newMessages: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="pref-group">
                        <h4>Team & System</h4>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Team Activity</span>
                                <span className="pref-sub">Notifications for internal team messages and broadcasts.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.teamActivity} onChange={(e) => handleSavePrefs({...prefs, teamActivity: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Status Alerts</span>
                                <span className="pref-sub">Notify when agents go offline or come back online.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.agentOfflineAlerts} onChange={(e) => handleSavePrefs({...prefs, agentOfflineAlerts: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="pref-item">
                            <div className="pref-info">
                                <span className="pref-label">Audio Alerts</span>
                                <span className="pref-sub">Play a sound for every new notification received.</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={prefs?.enableSounds} onChange={(e) => handleSavePrefs({...prefs, enableSounds: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-section card shadow-sm">
                <h3><Clock size={20} /> Availability & Quiet Hours</h3>
                <p className="section-desc">Manage when you're available to receive system-wide notifications.</p>
                
                <div className="pref-item">
                    <div className="pref-info">
                        <span className="pref-label">Enable Quiet Hours</span>
                        <span className="pref-sub">Silence all notifications during a specific time range.</span>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={prefs?.quietHours?.enabled} onChange={(e) => handleSavePrefs({...prefs, quietHours: {...prefs.quietHours, enabled: e.target.checked}})} />
                        <span className="slider round"></span>
                    </label>
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
          padding: 20px;
        }

        .header-actions { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          gap: 20px; 
        }

        .tab-switcher { 
          display: flex; 
          background: #f1f5f9; 
          padding: 4px; 
          border-radius: 12px; 
          border: 1px solid #e2e8f0; 
        }

        .tab-btn { 
          padding: 8px 24px; 
          border-radius: 8px; 
          border: none; 
          background: transparent; 
          font-size: 0.9rem; 
          font-weight: 700; 
          color: #64748b; 
          cursor: pointer; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
        }

        .tab-btn.active { 
          background: white; 
          color: var(--primary); 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
        }

        .notifications-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 8px;
        }

        .filter-group {
          display: flex;
          gap: 8px;
          background: #f8fafc;
          padding: 4px;
          border-radius: 10px;
        }

        .filter-btn {
          padding: 6px 16px;
          border-radius: 6px;
          border: none;
          background: transparent;
          font-size: 0.8rem;
          font-weight: 700;
          color: #94a3b8;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
        }

        .filter-btn.active {
          background: white;
          color: var(--on-surface);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .count-dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          display: inline-block;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .search-box input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 0.9rem;
          transition: 0.2s;
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-low);
        }

        .notifications-list-detailed {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notif-card {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .notif-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: var(--primary-low);
        }

        .notif-card.unread {
          background: #fcfaff;
          border-color: var(--primary-low);
        }

        .card-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: transparent;
          transition: 0.2s;
        }

        .notif-card.unread .card-indicator {
          background: var(--primary);
        }

        .card-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 60px;
        }

        .role-tag {
          font-size: 0.6rem;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-align: center;
        }

        .role-tag.superadmin { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
        .role-tag.owner { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }

        .icon-unread { color: var(--primary); }
        .icon-read { color: #94a3b8; }

        .card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .card-subject {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #1e293b;
          line-height: 1.3;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
          white-space: nowrap;
        }

        .card-message {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #64748b;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border: 1px dashed #e2e8f0;
          border-radius: 24px;
        }

        .empty-illustration {
          margin-bottom: 24px;
          color: #cbd5e1;
        }

        .empty-state h2 {
          margin: 0 0 8px;
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
        }

        .empty-state p {
          margin: 0;
          color: #64748b;
          font-weight: 500;
        }

        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        /* Settings specific styles */
        .notifications-settings { 
          display: flex; 
          flex-direction: column; 
          gap: 24px; 
        }
        
        .settings-section { 
          padding: 32px; 
          border-radius: 20px; 
          background: white;
          border: 1px solid #e2e8f0;
        }
        
        .settings-section h3 { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin: 0 0 8px; 
          font-size: 1.25rem; 
          font-weight: 800; 
          color: #1e293b;
        }
        
        .section-desc { 
          color: #64748b; 
          font-size: 0.9rem; 
          margin: 0 0 32px; 
          font-weight: 500;
        }
        
        .pref-grid { 
          display: grid; 
          grid-template-columns: 1fr; 
          gap: 40px; 
        }
        
        @media (min-width: 768px) { 
          .pref-grid { 
            grid-template-columns: 1fr 1fr; 
          } 
        }
        
        .pref-group { 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
        }
        
        .pref-group h4 { 
          font-size: 0.75rem; 
          font-weight: 800; 
          color: #94a3b8; 
          text-transform: uppercase; 
          letter-spacing: 0.1em; 
          margin: 0; 
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .pref-item { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          gap: 20px; 
        }
        
        .pref-info { 
          display: flex; 
          flex-direction: column; 
          gap: 4px; 
        }
        
        .pref-label { 
          font-size: 1rem; 
          font-weight: 700; 
          color: #1e293b; 
        }
        
        .pref-sub { 
          font-size: 0.85rem; 
          color: #64748b; 
          font-weight: 500; 
          line-height: 1.4;
        }
        
        /* Switch styling */
        .switch { 
          position: relative; 
          display: inline-block; 
          width: 48px; 
          height: 26px; 
          flex-shrink: 0; 
        }
        
        .switch input { 
          opacity: 0; 
          width: 0; 
          height: 0; 
        }
        
        .slider { 
          position: absolute; 
          cursor: pointer; 
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0; 
          background-color: #e2e8f0; 
          transition: .4s; 
          border-radius: 24px; 
        }
        
        .slider:before { 
          position: absolute; 
          content: ""; 
          height: 20px; 
          width: 20px; 
          left: 3px; 
          bottom: 3px; 
          background-color: white; 
          transition: .4s; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        
        input:checked + .slider { 
          background-color: var(--primary); 
        }
        
        input:checked + .slider:before { 
          transform: translateX(22px); 
        }

        @media (max-width: 640px) {
          .notifications-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box {
            max-width: none;
          }
          .notif-card {
            flex-direction: column;
            gap: 12px;
          }
          .card-icon {
            flex-direction: row;
            justify-content: space-between;
            min-width: 0;
          }
          .card-top {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
