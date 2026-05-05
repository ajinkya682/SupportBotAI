import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Search, Filter, Building2, 
  User, Bot, Clock, ChevronRight, 
  ExternalLink, Loader2, Calendar, AlertCircle,
  Download, X, Send, UserCircle, Bot as BotIcon
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
    const matchesSearch = c.businessName.toLowerCase().includes(search.toLowerCase()) || 
                         c.sessionId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <span>Export Logs</span>
        </button>
      </header>

      <div className="sa-filters-bar card">
        <div className="sa-search-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search business or session ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sa-filter-actions">
          <div className="sa-select-wrapper">
            <Filter size={16} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="ai_resolved">AI Resolved</option>
              <option value="human_needed">Needs Human</option>
              <option value="in_progress">Agent Joined</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sa-table-card card">
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>Business / Session</th>
                <th>Participant</th>
                <th>Status</th>
                <th>Activity</th>
                <th>Duration</th>
                <th>Time</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filtered.map((c) => (
                  <motion.tr 
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <td>
                      <div className="sa-log-biz-cell">
                        <span className="biz-name">{c.businessName}</span>
                        <span className="session-id">{c.sessionId}</span>
                      </div>
                    </td>
                    <td>
                      <div className="sa-participant-cell">
                        {c.humanJoined ? (
                          <div className="participant agent">
                            <User size={12} />
                            <span>{c.agentName || 'Agent'}</span>
                          </div>
                        ) : (
                          <div className="participant ai">
                            <Bot size={12} />
                            <span>Support AI</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`sa-status-tag ${c.status}`}>
                        {c.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="sa-msg-count">
                        <MessageSquare size={12} />
                        <span>{c.messageCount} messages</span>
                      </div>
                    </td>
                    <td>
                      <div className="sa-duration">
                        <Clock size={12} />
                        <span>{c.duration ? `${c.duration}m` : '--'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sa-date">{new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td>
                      <button 
                        className="sa-action-btn highlight"
                        onClick={() => viewConversation(c.id)}
                      >
                        <ExternalLink size={16} />
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
            <MessageSquare size={48} opacity={0.2} />
            <p>No conversation logs found.</p>
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
                    <h3>Conversation Log</h3>
                    <span>{selectedConv?.business?.name || 'Loading...'}</span>
                  </div>
                </div>
                <button className="close-panel" onClick={() => setIsViewing(false)}>
                  <X size={20} />
                </button>
              </header>

              <div className="chat-body">
                {isLoadingDetails ? (
                  <div className="chat-loading">
                    <Loader2 className="animate-spin" size={32} />
                    <p>Fetching full audit trail...</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {selectedConv?.messages.map((m, idx) => (
                      <div key={idx} className={`msg-group ${m.senderType}`}>
                        <div className="msg-meta">
                          {m.senderType === 'user' ? <UserCircle size={14} /> : <BotIcon size={14} />}
                          <span>{m.senderType === 'user' ? (selectedConv.userName || 'Visitor') : (m.senderType === 'ai' ? 'Support AI' : 'Agent')}</span>
                          <span className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="msg-bubble">
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <footer className="chat-panel-footer">
                <div className="footer-stats">
                  <div className="stat"><Clock size={14} /> Started: {new Date(selectedConv?.createdAt).toLocaleString()}</div>
                  <div className="stat"><AlertCircle size={14} /> Status: {selectedConv?.status}</div>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .sa-view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .btn-download { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; color: #1e293b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .btn-download:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
        .btn-download:disabled { opacity: 0.5; cursor: not-allowed; }

        .sa-log-biz-cell { display: flex; flex-direction: column; }
        .sa-log-biz-cell .biz-name { font-weight: 700; font-size: 0.85rem; color: var(--on-surface); }
        .sa-log-biz-cell .session-id { font-size: 0.7rem; color: var(--outline); font-family: monospace; }
        
        .sa-participant-cell { display: flex; gap: 8px; }
        .participant { display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
        .participant.agent { background: #dcfce7; color: #15803d; }
        .participant.ai { background: var(--primary-fixed); color: var(--primary); }
        
        .sa-status-tag.active { color: #2563eb; background: #dbeafe; }
        .sa-status-tag.ai_resolved { color: #059669; background: #d1fae5; }
        .sa-status-tag.human_needed { color: #dc2626; background: #fee2e2; }
        .sa-status-tag.in_progress { color: #d97706; background: #fef3c7; }
        
        .sa-msg-count, .sa-duration { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 600; }
        
        .sa-action-btn.highlight { color: var(--primary); background: var(--primary-fixed); }
        .sa-action-btn.highlight:hover { background: var(--primary-fixed-dim); }

        /* Chat View Panel */
        .chat-view-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 200; display: flex; justify-content: flex-end; }
        .chat-view-panel { width: 100%; max-width: 450px; background: white; height: 100%; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1); }
        .chat-panel-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .chat-info { display: flex; gap: 16px; align-items: center; }
        .chat-icon { width: 40px; height: 40px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .chat-info h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #1e293b; }
        .chat-info span { font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .close-panel { background: #f8fafc; border: none; padding: 8px; border-radius: 10px; cursor: pointer; color: #64748b; transition: 0.2s; }
        .close-panel:hover { background: #f1f5f9; color: #1e293b; }

        .chat-body { flex: 1; overflow-y: auto; padding: 24px; background: #f8fafc; }
        .chat-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: #94a3b8; }
        
        .messages-list { display: flex; flex-direction: column; gap: 24px; }
        .msg-group { display: flex; flex-direction: column; gap: 8px; max-width: 85%; }
        .msg-group.user { align-self: flex-start; }
        .msg-group.ai, .msg-group.agent { align-self: flex-end; }
        
        .msg-meta { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 700; color: #94a3b8; }
        .msg-group.ai .msg-meta, .msg-group.agent .msg-meta { flex-direction: row-reverse; }
        .msg-time { font-weight: 500; font-size: 0.65rem; }
        
        .msg-bubble { padding: 12px 16px; border-radius: 16px; font-size: 0.9rem; line-height: 1.5; font-weight: 500; }
        .user .msg-bubble { background: white; color: #1e293b; border-bottom-left-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; }
        .ai .msg-bubble { background: var(--primary); color: white; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2); }
        .agent .msg-bubble { background: #10b981; color: white; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }

        .chat-panel-footer { padding: 20px 24px; border-top: 1px solid #f1f5f9; background: white; }
        .footer-stats { display: flex; gap: 20px; }
        .stat { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default SAConversations;
