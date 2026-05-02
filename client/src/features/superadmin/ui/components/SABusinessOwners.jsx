import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, Filter, Mail, Calendar, 
  ChevronRight, ExternalLink, ShieldCheck, Zap, 
  MoreVertical, User, MessageSquare, Loader2, Download,
  ShieldBan, Trash2, CheckCircle, TrendingUp, Users,
  Globe, Briefcase
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';
import ThreeDotMenu from '../../../../shared/ui/components/ThreeDotMenu';
import ConfirmModal from '../../../../shared/ui/components/ConfirmModal';

const SABusinessOwners = () => {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pro: 0,
    activeAgents: 0,
    totalConv: 0
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.get(`${API_URL}/super-admin/businesses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setBusinesses(data.businesses);
        // Calculate local stats
        setStats({
          total: data.businesses.length,
          pro: data.businesses.filter(b => b.plan === 'pro').length,
          activeAgents: data.businesses.reduce((acc, b) => acc + (b.agentCount || 0), 0),
          totalConv: data.businesses.reduce((acc, b) => acc + (b.convCount || 0), 0)
        });
      }
    } catch (err) {
      toast.error('Failed to load business accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBusinesses = async () => {
    setIsExporting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const response = await axios.get(`${API_URL}/super-admin/export-businesses`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SupportBot_Client_Accounts.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Client database exported');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdatePlan = async (id, newPlan) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.patch(`${API_URL}/super-admin/businesses/${id}/plan`, 
        { plan: newPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Plan updated to ${newPlan}`);
        fetchBusinesses();
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleBlockBusiness = (biz) => {
    setModalConfig({
      isOpen: true,
      type: biz.isBlocked ? 'primary' : 'danger',
      title: biz.isBlocked ? 'Unblock Business' : 'Block Business',
      message: `Are you sure you want to ${biz.isBlocked ? 'unblock' : 'block'} ${biz.name}? This will ${biz.isBlocked ? 'restore' : 'suspend'} all AI services and agent access for this client.`,
      confirmText: biz.isBlocked ? 'Reactivate Account' : 'Suspend Access',
      onConfirm: async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const { data } = await axios.post(`${API_URL}/super-admin/businesses/${biz.id}/block`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (data.success) {
            toast.success(data.message);
            fetchBusinesses();
          }
        } catch (err) {
          toast.error('Action failed');
        }
      }
    });
  };

  const handleDeleteBusiness = (biz) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Remove Business',
      message: `CRITICAL: This will permanently delete ${biz.name}, its entire knowledge base, and all conversation logs. This cannot be undone.`,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const { data } = await axios.delete(`${API_URL}/super-admin/businesses/${biz.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (data.success) {
            toast.success(data.message);
            fetchBusinesses();
          }
        } catch (err) {
          toast.error('Deletion failed');
        }
      }
    });
  };

  const filtered = businesses.filter(b => {
    const bizName = b.name || '';
    const ownerEmail = b.ownerEmail || '';
    const matchesSearch = bizName.toLowerCase().includes(search.toLowerCase()) || 
                         ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterPlan === 'all' || b.plan === filterPlan;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="sa-loading-view">
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Retrieving platform partners...</p>
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
          <h1>Client Accounts</h1>
          <p>Manage and monitor all business owners on the platform.</p>
        </div>
        <button 
          className="btn-download" 
          onClick={handleDownloadBusinesses}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          <span>Export Database</span>
        </button>
      </header>

      {/* Professional Stats Cards */}
      <div className="sa-stats-grid">
        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(53, 37, 205, 0.1)', color: 'var(--primary)' }}>
              <Briefcase size={20} />
            </div>
            <span className="sa-stat-label">Total Partners</span>
          </div>
          <h2 className="sa-stat-value">{stats.total}</h2>
        </motion.div>
        
        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Zap size={20} />
            </div>
            <span className="sa-stat-label">Pro Licenses</span>
          </div>
          <h2 className="sa-stat-value">{stats.pro}</h2>
        </motion.div>

        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Users size={20} />
            </div>
            <span className="sa-stat-label">Managed Agents</span>
          </div>
          <h2 className="sa-stat-value">{stats.activeAgents}</h2>
        </motion.div>

        <motion.div className="sa-stat-card card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
              <MessageSquare size={20} />
            </div>
            <span className="sa-stat-label">Platform Traffic</span>
          </div>
          <h2 className="sa-stat-value">{stats.totalConv.toLocaleString()}</h2>
        </motion.div>
      </div>

      <div className="sa-filters-bar card">
        <div className="sa-search-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by business name or owner email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sa-filter-group">
          <div className="sa-select-wrapper">
            <Filter size={16} />
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
              <option value="all">Filter: All Plans</option>
              <option value="pro">Pro Tier Only</option>
              <option value="free">Free Tier Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sa-table-card card">
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>Business Entity</th>
                <th>Ownership</th>
                <th>Status</th>
                <th>Volume Stats</th>
                <th>Activation Date</th>
                <th className="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filtered.map((b, idx) => (
                  <motion.tr 
                    key={b.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.03 }}
                    className={b.isBlocked ? 'row-suspended' : ''}
                  >
                    <td data-label="Business Entity">
                      <div className="sa-biz-cell">
                        <div className="sa-biz-avatar">
                          {b.logo ? <img src={b.logo} alt="" /> : <Building2 size={18} />}
                        </div>
                        <div className="sa-biz-meta">
                          <span className="name">{b.name || 'Unnamed Business'}</span>
                          <span className="id">REF: {b.id.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Ownership">
                      <div className="sa-owner-cell">
                        <span className="name">{b.ownerName || <span className="text-muted">Unknown</span>}</span>
                        <span className="email">{b.ownerEmail || <span className="text-muted">No Email</span>}</span>
                      </div>
                    </td>
                    <td data-label="Status">
                      <div className="sa-status-group">
                        <span className={`sa-plan-badge ${b.plan}`}>
                          {b.plan === 'pro' ? <Zap size={10} fill="currentColor" /> : null}
                          {b.plan.toUpperCase()}
                        </span>
                        {b.isBlocked && <span className="sa-tag-critical">SUSPENDED</span>}
                      </div>
                    </td>
                    <td data-label="Volume Stats">
                      <div className="sa-volume-grid">
                        <div className="v-pill">
                          <Users size={12} />
                          <span>{b.agentCount}</span>
                        </div>
                        <div className="v-pill">
                          <MessageSquare size={12} />
                          <span>{b.convCount}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Activation Date">
                      <div className="sa-date-cell">
                        <Calendar size={14} />
                        <span>{new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td data-label="Manage" className="text-right">
                      <ThreeDotMenu actions={[
                        {
                          label: b.plan === 'pro' ? 'Downgrade Account' : 'Upgrade to Pro',
                          icon: <ShieldCheck size={16} />,
                          type: 'primary',
                          onClick: () => handleUpdatePlan(b.id, b.plan === 'pro' ? 'free' : 'pro')
                        },
                        {
                          label: b.isBlocked ? 'Reactivate Account' : 'Suspend Access',
                          icon: b.isBlocked ? <CheckCircle size={16} /> : <ShieldBan size={16} />,
                          type: b.isBlocked ? 'success' : 'danger',
                          onClick: () => handleBlockBusiness(b)
                        },
                        {
                          label: 'Purge Records',
                          icon: <Trash2 size={16} />,
                          type: 'danger',
                          onClick: () => handleDeleteBusiness(b)
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
              <Globe size={48} />
            </div>
            <h3>No results found</h3>
            <p>We couldn't find any business accounts matching "{search}"</p>
            <button className="btn btn-secondary btn-sm" onClick={() => {setSearch(''); setFilterPlan('all');}}>Clear all filters</button>
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
        .sa-data-table tbody tr:hover { background: #f8fafc; }
        .sa-data-table td { padding: 16px 20px; vertical-align: middle; }

        .sa-biz-cell { display: flex; align-items: center; gap: 16px; }
        .sa-biz-avatar { width: 44px; height: 44px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #94a3b8; overflow: hidden; border: 1px solid #e2e8f0; }
        .sa-biz-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .sa-biz-meta { display: flex; flex-direction: column; }
        .sa-biz-meta .name { font-weight: 700; color: var(--on-surface); font-size: 0.95rem; }
        .sa-biz-meta .id { font-size: 0.7rem; font-weight: 700; color: var(--outline); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

        .sa-owner-cell .name { display: block; font-weight: 700; color: var(--on-surface); font-size: 0.85rem; }
        .sa-owner-cell .email { font-size: 0.8rem; color: #64748b; font-weight: 500; }
        .text-muted { color: #94a3b8; font-style: italic; }

        .sa-status-group { display: flex; align-items: center; gap: 8px; }
        .sa-plan-badge { padding: 5px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; }
        .sa-plan-badge.pro { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
        .sa-plan-badge.free { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
        .sa-tag-critical { background: #ef4444; color: white; border: 1px solid #dc2626; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2); }

        .sa-volume-grid { display: flex; gap: 8px; }
        .v-pill { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px 10px; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; color: #475569; transition: 0.2s; }
        .v-pill:hover { background: white; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .v-pill svg { color: #94a3b8; }

        .sa-date-cell { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .text-right { text-align: right; }
        
        .row-suspended { background: #fff1f2 !important; border-left: 4px solid #ef4444; }
        .row-suspended .sa-biz-avatar { filter: grayscale(1); opacity: 0.5; }

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
          .sa-data-table td { border: none; padding: 8px 0; display: flex; justify-content: space-between; align-items: center; text-align: right; border-bottom: 1px solid #f1f5f9; }
          .sa-data-table td:last-child { border-bottom: none; }
          .sa-data-table td::before { content: attr(data-label); font-weight: 700; color: #64748b; font-size: 0.75rem; text-transform: uppercase; text-align: left; }
          
          .sa-biz-cell, .sa-owner-cell, .sa-status-group, .sa-volume-grid, .sa-date-cell { justify-content: flex-end; width: auto; }
          .sa-biz-cell { text-align: right; }
          .sa-biz-avatar { width: 32px; height: 32px; min-width: 32px; }
          .sa-biz-meta .name { font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
};

export default SABusinessOwners;



