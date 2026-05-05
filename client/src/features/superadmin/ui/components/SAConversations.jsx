import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Search, Filter, Building2, 
  User, Bot, Clock, ChevronRight, 
  ExternalLink, Loader2, Calendar, AlertCircle,
  Download, X, Send, UserCircle, Bot as BotIcon, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';

const SAConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  
  // Chat Viewer State
  const [selectedConv, setSelectedConv] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.get(`${API_URL}/super-admin/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      toast.error('Failed to load global logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadLogs = async () => {
    setIsExporting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const response = await axios.get(`${API_URL}/super-admin/export-conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SupportBot_Global_Logs.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Conversation logs exported');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const viewConversation = async (id) => {
    setIsLoadingDetails(true);
    setIsViewing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const { data } = await axios.get(`${API_URL}/super-admin/conversations/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (data.success) {
        setSelectedConv(data.conversation);
      }
    } catch (err) {
      toast.error('Failed to load conversation details');
      setIsViewing(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const filtered = conversations.filter(c => {
    const bizName = c.businessName || '';
    const sid = c.sessionId || '';
    const matchesSearch = bizName.toLowerCase().includes(search.toLowerCase()) || 
                         sid.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    resolved: conversations.filter(c => c.status === 'ai_resolved').length,
    escalated: conversations.filter(c => c.status === 'human_needed').length
  };

  if (isLoading) {
    return (
      <div className="sa-loading-view">
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Streaming Global Event Log...</p>
      </div>
    );
  }

  return (
    <div className="sa-view-container animate-fade-in">
      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>Global Logs</h1>
          <p>Real-time stream of all AI and Human interactions across the network.</p>
        </div>
        <button 
          className="btn-download" 
          onClick={handleDownloadLogs}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          <span>Download Detailed Audit</span>
        </button>
      </header>

      <div className="sa-stats-grid">
        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(53, 37, 205, 0.1)', color: 'var(--primary)' }}>
              <MessageSquare size={20} />
            </div>
            <span className="sa-stat-label">Total Sessions</span>
          </div>
          <h2 className="sa-stat-value">{stats.total}</h2>
        </motion.div>
        
        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
              <BotIcon size={20} />
            </div>
            <span className="sa-stat-label">Live AI Chats</span>
          </div>
          <h2 className="sa-stat-value">{stats.active}</h2>
        </motion.div>

        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle size={20} />
            </div>
            <span className="sa-stat-label">AI Resolved</span>
          </div>
          <h2 className="sa-stat-value">{stats.resolved}</h2>
        </motion.div>

        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertCircle size={20} />
            </div>
            <span className="sa-stat-label">Human Escalations</span>
          </div>
          <h2 className="sa-stat-value">{stats.escalated}</h2>
        </motion.div>
      </div>

      <div className="sa-filters-bar card">
        <div className="sa-search-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by business name, email or session ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sa-filter-group">
          <div className="sa-select-wrapper">
            <Filter size={16} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Filter: All Status</option>
              <option value="active">Active Sessions</option>
              <option value="ai_resolved">AI Resolved Only</option>
              <option value="human_needed">Needs Human Intervention</option>
              <option value="in_progress">Agent Handling</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sa-table-card card">
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>BUSINESS ENTITY</th>
                <th>OWNERSHIP / PARTICIPANT</th>
                <th>RESOLUTION STATUS</th>
                <th>VOLUME STATS</th>
                <th>ACTIVATION / TIMELINE</th>
                <th className="text-right">MANAGE</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filtered.map((c, idx) => (
                  <motion.tr 
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.02 }}
                    className={c.status === 'human_needed' ? 'sa-row-alert' : ''}
                  >
                    <td data-label="BUSINESS ENTITY">
                      <div className="sa-entity-cell">
                        <div className="sa-entity-icon">
                          <Building2 size={16} />
                        </div>
                        <div className="sa-entity-info">
                          <span className="entity-name">{c.businessName}</span>
                          <span className="entity-ref">REF: {c.sessionId.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="OWNERSHIP / PARTICIPANT">
                      <div className="sa-owner-cell">
                        {c.humanJoined ? (
                          <>
                            <span className="owner-name">{c.agentName || 'Support Agent'}</span>
                            <span className="owner-sub">Human Representative</span>
                          </>
                        ) : (
                          <>
                            <span className="owner-name">Support Bot v2.0</span>
                            <span className="owner-sub">AI Automation</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td data-label="RESOLUTION STATUS">
                      <div className="sa-status-group">
                        <span className={`sa-status-pill ${c.humanJoined ? 'pro' : 'free'}`}>
                          {c.humanJoined ? 'AGENT' : 'AI'}
                        </span>
                        <span className={`sa-action-badge ${c.status}`}>
                          {c.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td data-label="VOLUME STATS">
                      <div className="sa-volume-group">
                        <div className="volume-box">
                          <MessageSquare size={12} />
                          <span>{c.messageCount}</span>
                        </div>
                        <div className="volume-box">
                          <Clock size={12} />
                          <span>{c.duration || 0}m</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="ACTIVATION / TIMELINE">
                      <div className="sa-date-cell">
                        <Calendar size={14} />
                        <span>{new Date(c.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td data-label="MANAGE" className="text-right">
                      <button 
                        className="sa-manage-btn"
                        onClick={() => viewConversation(c.id)}
                        title="View Audit Trail"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="sa-empty-state">
            <div className="empty-icon-wrap">
              <MessageSquare size={48} />
            </div>
            <h3>No logs found</h3>
            <p>No conversation logs match your current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Chat History Panel */}
      <AnimatePresence>
        {isViewing && (
          <div className="chat-view-overlay" onClick={() => setIsViewing(false)}>
            <motion.div 
              className="chat-view-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="chat-panel-header">
                <div className="chat-info">
                  <div className="chat-icon">
                    <MessageSquare size={20} color="white" />
                  </div>
                  <div>
                    <h3>Audit Trail</h3>
                    <span>{selectedConv?.business?.name || 'Loading session...'}</span>
                  </div>
                </div>
                <button className="close-panel" onClick={() => setIsViewing(false)}>
                  <X size={20} />
                </button>
              </header>

              <div className="chat-body">
                {isLoadingDetails ? (
                  <div className="chat-loading">
                    <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                    <p>Fetching encrypted logs...</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {selectedConv?.messages.map((m, idx) => (
                      <div key={idx} className={`msg-group ${m.senderType}`}>
                        <div className="msg-meta">
                          {m.senderType === 'ai' ? <BotIcon size={14} /> : <UserCircle size={14} />}
                          <span>
                            {m.senderName || (m.senderType === 'user' ? (selectedConv.userName || 'Customer') : (m.senderType === 'ai' ? 'AI Assistant' : (m.senderType === 'owner' ? 'Admin' : 'Human Agent')))}
                          </span>
                          <span className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="msg-bubble">
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <footer className="chat-panel-footer">
                <div className="footer-stats">
                  <div className="stat"><Clock size={14} /> Session: {new Date(selectedConv?.createdAt).toLocaleString()}</div>
                  <div className="stat"><AlertCircle size={14} /> Outcome: {selectedConv?.status?.toUpperCase().replace('_', ' ')}</div>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .sa-view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .btn-download { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; color: #1e293b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .btn-download:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
        .btn-download:disabled { opacity: 0.5; cursor: not-allowed; }

        .sa-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .sa-stat-card { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .sa-stat-header { display: flex; align-items: center; gap: 12px; }
        .sa-stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .sa-stat-label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.02em; }
        .sa-stat-value { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0; }

        .sa-filters-bar { display: flex; gap: 20px; padding: 16px 24px; margin-bottom: 24px; align-items: center; }
        .sa-search-group { flex: 1; display: flex; align-items: center; gap: 12px; background: #f1f5f9; padding: 10px 16px; border-radius: 12px; border: 1px solid transparent; transition: 0.2s; }
        .sa-search-group:focus-within { background: white; border-color: var(--primary); }
        .sa-search-group input { background: transparent; border: none; flex: 1; outline: none; font-size: 0.9rem; color: var(--on-surface); font-weight: 500; }
        
        .sa-select-wrapper { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; }
        .sa-select-wrapper select { border: none; outline: none; font-size: 0.85rem; font-weight: 600; color: #475569; background: transparent; cursor: pointer; appearance: none; padding-right: 20px; }

        .sa-table-card { border: 1px solid #f1f5f9; overflow: hidden; border-radius: 16px; }
        .sa-data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .sa-data-table thead th { background: #f8fafc; padding: 16px 24px; text-align: left; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; }
        .sa-data-table tbody tr { transition: 0.2s; }
        .sa-data-table tbody tr:hover { background: #f8fafc; }
        .sa-data-table tbody td { padding: 16px 24px; vertical-align: middle; border-bottom: 1px solid #f1f5f9; }

        .sa-row-alert { background: #fff1f2 !important; }
        .sa-row-alert:hover { background: #ffe4e6 !important; }

        .sa-entity-cell { display: flex; align-items: center; gap: 16px; }
        .sa-entity-icon { width: 40px; height: 40px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .entity-name { display: block; font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .entity-ref { display: block; font-size: 0.7rem; font-weight: 700; color: #94a3b8; font-family: monospace; margin-top: 2px; }

        .sa-owner-cell { display: flex; flex-direction: column; }
        .owner-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
        .owner-sub { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

        .sa-status-group { display: flex; align-items: center; gap: 12px; }
        .sa-status-pill { padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; border: 1px solid transparent; }
        .sa-status-pill.free { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }
        .sa-status-pill.pro { background: #ecfdf5; color: #10b981; border-color: #d1fae5; }
        
        .sa-action-badge { padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; background: #ef4444; color: white; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2); }
        .sa-action-badge.ai_resolved { background: #10b981; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
        .sa-action-badge.human_needed { background: #ef4444; }
        .sa-action-badge.active { background: #3b82f6; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2); }
        .sa-action-badge.in_progress { background: #f59e0b; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.2); }

        .sa-volume-group { display: flex; gap: 8px; }
        .volume-box { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: #475569; }

        .sa-date-cell { display: flex; align-items: center; gap: 10px; color: #64748b; font-weight: 600; font-size: 0.85rem; }

        .sa-manage-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .sa-manage-btn:hover { background: var(--primary); color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(61, 43, 224, 0.2); }

        /* Audit Panel */
        .chat-view-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 9999; display: flex; justify-content: flex-end; }
        .chat-view-panel { width: 100%; max-width: 520px; background: white; height: 100%; display: flex; flex-direction: column; box-shadow: -20px 0 50px rgba(0,0,0,0.15); }
        .chat-panel-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: white; }
        .chat-info { display: flex; gap: 16px; align-items: center; }
        .chat-icon { width: 44px; height: 44px; background: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(61, 43, 224, 0.2); }
        .chat-info h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #1e293b; }
        .chat-info span { font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .close-panel { background: #f8fafc; border: none; padding: 10px; border-radius: 12px; cursor: pointer; color: #64748b; transition: 0.2s; }
        .close-panel:hover { background: #fee2e2; color: #ef4444; }

        .chat-body { flex: 1; overflow-y: auto; padding: 24px; background: #f8fafc; }
        .messages-list { display: flex; flex-direction: column; gap: 16px; }
        .msg-group { display: flex; flex-direction: column; gap: 6px; max-width: 60%; }
        .msg-group.user { align-self: flex-start; align-items: flex-start; }
        .msg-group.ai, .msg-group.agent, .msg-group.owner { align-self: flex-end; align-items: flex-end; }
        .msg-meta { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 700; color: #94a3b8; }
        .msg-bubble { padding: 12px 16px; border-radius: 18px; font-size: 0.95rem; line-height: 1.5; font-weight: 500; word-break: break-word; }
        .user .msg-bubble { background: white; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; }
        .ai .msg-bubble { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
        .agent .msg-bubble, .owner .msg-bubble { background: var(--primary); color: white; border-bottom-right-radius: 4px; }

        .chat-panel-footer { padding: 20px 24px; border-top: 1px solid #f1f5f9; background: white; }
        .stat { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #475569; font-weight: 700; background: #f8fafc; padding: 10px 16px; border-radius: 10px; border: 1px solid #f1f5f9; margin-bottom: 8px; }

        @media (max-width: 768px) {
          .sa-data-table thead { display: none; }
          .sa-data-table tr { display: block; margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: white; }
          .sa-data-table td { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
          .sa-data-table td:last-child { border-bottom: none; }
          .sa-data-table td::before { content: attr(data-label); font-weight: 800; color: #64748b; font-size: 0.7rem; }
          .sa-entity-cell, .sa-owner-cell, .sa-status-group, .sa-volume-group, .sa-date-cell { justify-content: flex-end; }
          .sa-manage-btn { width: 100%; margin-top: 12px; }
        }
      `}</style>
    </div>
  );
};

export default SAConversations;
