import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Mail, Building2, 
  Shield, CheckCircle2, XCircle, MoreVertical, 
  MessageSquare, Loader2, Calendar, Download,
  ShieldBan, Trash2, CheckCircle, Zap, ShieldAlert,
  UserCheck, Ghost
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';
import ThreeDotMenu from '../../../../shared/ui/components/ThreeDotMenu';
import ConfirmModal from '../../../../shared/ui/components/ConfirmModal';

const SAAgents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    resolutions: 0,
    avgWorkload: 0
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.get(`${API_URL}/super-admin/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setAgents(data.agents);
        setStats({
          total: data.agents.length,
          online: data.agents.filter(a => a.status === 'online').length,
          resolutions: data.agents.reduce((acc, a) => acc + (a.resolvedTickets || 0), 0),
          avgWorkload: data.agents.length ? Math.round(data.agents.reduce((acc, a) => acc + (a.activeConvs || 0), 0) / data.agents.length) : 0
        });
      }
    } catch (err) {
      toast.error('Failed to load agent directory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAgents = async () => {
    setIsExporting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const response = await axios.get(`${API_URL}/super-admin/export-agents`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SupportBot_Agents_Directory.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Agent directory exported');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBlockAgent = (agent) => {
    setModalConfig({
      isOpen: true,
      type: agent.isBlocked ? 'primary' : 'danger',
      title: agent.isBlocked ? 'Restore Agent Access' : 'Suspend Agent',
      message: `Are you sure you want to ${agent.isBlocked ? 'restore' : 'suspend'} access for ${agent.name}? ${agent.isBlocked ? 'They will be able to log in and manage chats again.' : 'They will be immediately logged out and blocked from the platform.'}`,
      confirmText: agent.isBlocked ? 'Reactivate Agent' : 'Suspend Access',
      onConfirm: async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const { data } = await axios.post(`${API_URL}/super-admin/agents/${agent.id}/block`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (data.success) {
            toast.success(data.message);
            fetchAgents();
          }
        } catch (err) {
          toast.error('Action failed');
        }
      }
    });
  };

  const handleDeleteAgent = (agent) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Remove Agent Permanently',
      message: `CRITICAL: This will permanently delete agent ${agent.name} and all their history. This action is irreversible.`,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const { data } = await axios.delete(`${API_URL}/super-admin/agents/${agent.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (data.success) {
            toast.success(data.message);
            fetchAgents();
          }
        } catch (err) {
          toast.error('Deletion failed');
        }
      }
    });
  };

  const filtered = agents.filter(a => {
    const agentName = a.name || '';
    const agentEmail = a.email || '';
    const bizName = a.businessName || '';
    const matchesSearch = agentName.toLowerCase().includes(search.toLowerCase()) || 
                         agentEmail.toLowerCase().includes(search.toLowerCase()) ||
                         bizName.toLowerCase().includes(search.toLowerCase());
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
      <ConfirmModal 
        {...modalConfig} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />

      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>Agent Directory</h1>
          <p>Global view of all support agents active across the platform.</p>
        </div>
        <button 
          className="btn-download" 
          onClick={handleDownloadAgents}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          <span>Export Directory</span>
        </button>
      </header>

      {/* Professional Stats Cards */}
      <div className="sa-stats-grid">
        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(53, 37, 205, 0.1)', color: 'var(--primary)' }}>
              <Users size={20} />
            </div>
            <span className="sa-stat-label">Global Roster</span>
          </div>
          <h2 className="sa-stat-value">{stats.total}</h2>
        </motion.div>
        
        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <UserCheck size={20} />
            </div>
            <span className="sa-stat-label">Currently Active</span>
          </div>
          <h2 className="sa-stat-value">{stats.online}</h2>
        </motion.div>

        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Zap size={20} />
            </div>
            <span className="sa-stat-label">Total Resolutions</span>
          </div>
          <h2 className="sa-stat-value">{stats.resolutions.toLocaleString()}</h2>
        </motion.div>

        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
              <MessageSquare size={20} />
            </div>
            <span className="sa-stat-label">Avg. Load</span>
          </div>
          <h2 className="sa-stat-value">{stats.avgWorkload} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>chats/agent</span></h2>
        </motion.div>
      </div>

      <div className="sa-filters-bar card">
        <div className="sa-search-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search agents by name, email, or affiliated business..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sa-filter-group">
          <div className="sa-select-wrapper">
            <Filter size={16} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Filter: All Status</option>
              <option value="online">Online Only</option>
              <option value="offline">Offline Only</option>
              <option value="busy">Busy Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sa-table-card card">
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>Agent Identity</th>
                <th>Affiliation</th>
                <th>Platform Status</th>
                <th>Workload</th>
                <th>Performance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filtered.map((a, idx) => (
                  <motion.tr 
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.03 }}
                    className={a.isBlocked ? 'row-suspended' : ''}
                  >
                    <td data-label="Agent Identity">
                      <div className="sa-agent-cell">
                        <div className="sa-avatar-lg">
                          {a.name.charAt(0)}
                        </div>
                        <div className="sa-agent-meta">
                          <span className="name">{a.name}</span>
                          <span className="email">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Affiliation">
                      <div className="sa-affiliation-box">
                        <Building2 size={14} />
                        <span>{a.businessName}</span>
                      </div>
                    </td>
                    <td data-label="Platform Status">
                      <div className="sa-status-group">
                        <span className={`sa-status-tag ${a.status}`}>
                          <span className="dot" />
                          {a.status.toUpperCase()}
                        </span>
                        {a.isBlocked && <span className="sa-tag-critical">SUSPENDED</span>}
                      </div>
                    </td>
                    <td data-label="Workload">
                      <div className="sa-workload-pill">
                        <span className="current">{a.activeConvs}</span>
                        <span className="sep">active of</span>
                        <span className="total">{a.totalConvs}</span>
                      </div>
                    </td>
                    <td data-label="Performance">
                      <div className="sa-perf-cell">
                        <CheckCircle2 size={14} color="#10b981" />
                        <span>{a.resolvedTickets} resolved</span>
                      </div>
                    </td>
                    <td data-label="Actions" className="text-right">
                      <ThreeDotMenu actions={[
                        {
                          label: a.isBlocked ? 'Restore Agent Access' : 'Suspend Account',
                          icon: a.isBlocked ? <CheckCircle size={16} /> : <ShieldBan size={16} />,
                          type: a.isBlocked ? 'success' : 'danger',
                          onClick: () => handleBlockAgent(a)
                        },
                        {
                          label: 'Permanently Remove',
                          icon: <Trash2 size={16} />,
                          type: 'danger',
                          onClick: () => handleDeleteAgent(a)
                        }
                      ]} />
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
              <Ghost size={48} />
            </div>
            <h3>No agents found</h3>
            <p>We couldn't find any support agents matching "{search}"</p>
            <button className="btn btn-secondary btn-sm" onClick={() => {setSearch(''); setFilterStatus('all');}}>Clear filters</button>
          </div>
        )}
      </div>

      <style>{`
        .sa-view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .btn-download { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; color: #1e293b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .btn-download:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
        
        .sa-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .sa-stat-card { padding: 24px; }
        .sa-stat-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .sa-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .sa-stat-label { font-size: 0.75rem; font-weight: 700; color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.025em; }
        .sa-stat-value { font-size: 1.75rem; font-weight: 800; color: var(--on-surface); margin: 0; }

        .sa-filters-bar { display: flex; gap: 20px; padding: 16px 24px; margin-bottom: 24px; align-items: center; }
        .sa-search-group { flex: 1; display: flex; align-items: center; gap: 12px; background: #f1f5f9; padding: 10px 16px; border-radius: 12px; border: 1px solid transparent; transition: 0.2s; }
        .sa-search-group:focus-within { background: white; border-color: var(--primary); }
        .sa-search-group input { background: transparent; border: none; flex: 1; outline: none; font-size: 0.9rem; color: var(--on-surface); font-weight: 500; }
        
        .sa-select-wrapper { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; }
        .sa-select-wrapper select { border: none; outline: none; font-size: 0.85rem; font-weight: 600; color: var(--on-surface-variant); cursor: pointer; background: transparent; }

        .sa-data-table thead th { background: #f8fafc; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 16px 20px; border-bottom: 2px solid #f1f5f9; }
        .sa-data-table tbody tr { transition: 0.2s; }
        .sa-data-table td { padding: 16px 20px; vertical-align: middle; }

        .sa-agent-cell { display: flex; align-items: center; gap: 16px; }
        .sa-avatar-lg { width: 44px; height: 44px; background: var(--primary-fixed); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; border: 1px solid var(--primary-fixed-dim); }
        .sa-agent-meta { display: flex; flex-direction: column; }
        .sa-agent-meta .name { font-weight: 700; color: var(--on-surface); font-size: 0.95rem; }
        .sa-agent-meta .email { font-size: 0.8rem; color: #64748b; font-weight: 500; }

        .sa-affiliation-box { display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; color: #475569; width: fit-content; }
        .sa-affiliation-box svg { color: #94a3b8; }

        .sa-status-group { display: flex; align-items: center; gap: 8px; }
        .sa-status-tag { display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; }
        .sa-status-tag.online { background: #ecfdf5; color: #059669; }
        .sa-status-tag.offline { background: #f1f5f9; color: #64748b; }
        .sa-status-tag.busy { background: #fffbeb; color: #b45309; }
        .sa-status-tag .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        
        .sa-tag-critical { background: #ef4444; color: white; border: 1px solid #dc2626; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2); }

        .sa-workload-pill { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 700; color: #64748b; }
        .sa-workload-pill .current { color: var(--on-surface); font-size: 0.9rem; }
        .sa-workload-pill .sep { font-size: 0.7rem; font-weight: 500; opacity: 0.6; }

        .sa-perf-cell { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; color: #1e293b; }
        .text-right { text-align: right; }
        
        .row-suspended { background: #fff1f2 !important; border-left: 4px solid #ef4444; }
        .row-suspended .sa-avatar-lg { filter: grayscale(1); opacity: 0.5; }

        .sa-empty-state { padding: 80px 20px; text-align: center; }
        .empty-icon-wrap { width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #cbd5e1; }
        .sa-empty-state h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .sa-empty-state p { color: #64748b; margin-bottom: 24px; }

        @media (max-width: 768px) {
          .sa-stats-grid { grid-template-columns: 1fr; gap: 12px; }
          .sa-filters-bar { flex-direction: column; align-items: stretch; gap: 12px; }
          .sa-search-group { max-width: 100%; }
          
          .sa-data-table thead { display: none; }
          .sa-data-table, .sa-data-table tbody, .sa-data-table tr, .sa-data-table td { display: block; width: 100%; }
          .sa-data-table tr { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background: white; }
          .sa-data-table td { border: none; padding: 10px 0; display: flex; justify-content: space-between; align-items: center; text-align: right; border-bottom: 1px solid #f1f5f9; }
          .sa-data-table td:last-child { border-bottom: none; }
          .sa-data-table td::before { content: attr(data-label); font-weight: 700; color: #64748b; font-size: 0.75rem; text-transform: uppercase; text-align: left; }
          
          .sa-agent-cell, .sa-affiliation-box, .sa-status-group, .sa-workload-pill, .sa-perf-cell { justify-content: flex-end; width: auto; }
          .sa-agent-cell { text-align: right; }
          .sa-avatar-lg { width: 32px; height: 32px; font-size: 0.8rem; }
          .sa-agent-meta .name { font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
};

export default SAAgents;



