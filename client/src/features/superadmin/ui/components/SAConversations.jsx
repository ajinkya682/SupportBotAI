import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Search, Filter, Building2, 
  User, Bot, Clock, ChevronRight, 
  ExternalLink, Loader2, Calendar, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../shared/services/config';
import toast from 'react-hot-toast';

const SAConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
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
              <AnimatePresence>
                {filtered.map((c) => (
                  <motion.tr 
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                      <button className="sa-action-btn"><ExternalLink size={16} /></button>
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

      <style>{`
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
      `}</style>
    </div>
  );
};

export default SAConversations;
