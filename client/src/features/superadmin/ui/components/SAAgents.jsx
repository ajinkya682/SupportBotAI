import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Mail, Building2, 
  Shield, CheckCircle2, XCircle, MoreVertical, 
  MessageSquare, Loader2, Calendar
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../shared/services/config';
import toast from 'react-hot-toast';

const SAAgents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/super-admin/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (err) {
      toast.error('Failed to load agent directory');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = agents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                         a.email.toLowerCase().includes(search.toLowerCase()) ||
                         a.businessName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="sa-loading-view">
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Indexing Support Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="sa-view-container animate-fade-in">
      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>Agent Directory</h1>
          <p>Global view of all support agents active across the platform.</p>
        </div>
      </header>

      <div className="sa-filters-bar card">
        <div className="sa-search-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search name, email, or business..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sa-filter-actions">
          <div className="sa-select-wrapper">
            <Filter size={16} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="busy">Busy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sa-table-card card">
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Affiliation</th>
                <th>Status</th>
                <th>Workload</th>
                <th>Resolution</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((a) => (
                  <motion.tr 
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>
                      <div className="sa-agent-cell">
                        <div className="sa-avatar-sm">
                          {a.name.charAt(0)}
                        </div>
                        <div className="sa-agent-info">
                          <span className="name">{a.name}</span>
                          <span className="email">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sa-biz-affiliation">
                        <Building2 size={14} />
                        <span>{a.businessName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-status-tag ${a.status}`}>
                        <span className="dot" />
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="sa-workload">
                        <span className="current">{a.activeConvs}</span>
                        <span className="sep">/</span>
                        <span className="total">{a.totalConvs}</span>
                        <span className="label">Active</span>
                      </div>
                    </td>
                    <td>
                      <div className="sa-res-stat">
                        <CheckCircle2 size={14} color="#10b981" />
                        <span>{a.resolvedTickets}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sa-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <button className="sa-action-btn"><MoreVertical size={18} /></button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="sa-empty-state">
            <Users size={48} opacity={0.2} />
            <p>No agents found matching your criteria.</p>
          </div>
        )}
      </div>

      <style>{`
        .sa-agent-cell { display: flex; align-items: center; gap: 12px; }
        .sa-avatar-sm { width: 32px; height: 32px; background: var(--primary-fixed); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; }
        .sa-agent-info { display: flex; flex-direction: column; }
        .sa-agent-info .name { font-weight: 700; font-size: 0.85rem; color: var(--on-surface); }
        .sa-agent-info .email { font-size: 0.75rem; color: var(--on-surface-variant); }
        
        .sa-biz-affiliation { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: var(--on-surface-variant); }
        
        .sa-status-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; }
        .sa-status-tag.online { background: #dcfce7; color: #15803d; }
        .sa-status-tag.offline { background: var(--surface-container); color: var(--outline); }
        .sa-status-tag.busy { background: #fef3c7; color: #b45309; }
        .sa-status-tag .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        
        .sa-workload { display: flex; align-items: baseline; gap: 3px; }
        .sa-workload .current { font-weight: 800; font-size: 0.9rem; color: var(--on-surface); }
        .sa-workload .sep { color: var(--outline); font-size: 0.75rem; }
        .sa-workload .total { font-weight: 600; font-size: 0.75rem; color: var(--on-surface-variant); }
        .sa-workload .label { font-size: 0.65rem; color: var(--outline); text-transform: uppercase; margin-left: 4px; font-weight: 700; }
        
        .sa-res-stat { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default SAAgents;
