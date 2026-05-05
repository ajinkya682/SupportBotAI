import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, Filter, Mail, Calendar, 
  ChevronRight, ExternalLink, ShieldCheck, Zap, 
  MoreVertical, User, MessageSquare, Loader2, Download,
  ShieldBan, Trash2, CheckCircle
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
      confirmText: biz.isBlocked ? 'Restore Access' : 'Suspend Access',
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
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                         b.ownerEmail.toLowerCase().includes(search.toLowerCase());
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

      <div className="sa-filters-bar card">
        <div className="sa-search-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search business or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sa-filter-actions">
          <div className="sa-select-wrapper">
            <Filter size={16} />
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
              <option value="all">All Plans</option>
              <option value="pro">Pro Only</option>
              <option value="free">Free Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sa-table-card card">
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Volume</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filtered.map((b) => (
                  <motion.tr 
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={b.isBlocked ? 'row-blocked' : ''}
                  >
                    <td>
                      <div className="sa-biz-cell">
                        <div className="sa-biz-logo">
                          {b.logo ? <img src={b.logo} alt="" /> : <Building2 size={16} />}
                        </div>
                        <div className="sa-biz-info">
                          <span className="name">{b.name}</span>
                          <span className="id">ID: {b.id.slice(-6)}</span>
                        </div>
                        {b.isBlocked && <span className="blocked-badge">SUSPENDED</span>}
                      </div>
                    </td>
                    <td>
                      <div className="sa-owner-cell">
                        <span className="name">{b.ownerName}</span>
                        <span className="email">{b.ownerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-plan-badge ${b.plan}`}>
                        {b.plan === 'pro' ? <Zap size={10} /> : null}
                        {b.plan.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="sa-volume-cell">
                        <div className="v-item"><MessageSquare size={12} /> {b.convCount}</div>
                        <div className="v-item"><User size={12} /> {b.agentCount}</div>
                      </div>
                    </td>
                    <td>
                      <span className="sa-date">{new Date(b.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <ThreeDotMenu actions={[
                        {
                          label: b.plan === 'pro' ? 'Downgrade to Free' : 'Upgrade to Pro',
                          icon: <ShieldCheck />,
                          type: 'primary',
                          onClick: () => handleUpdatePlan(b.id, b.plan === 'pro' ? 'free' : 'pro')
                        },
                        {
                          label: b.isBlocked ? 'Restore Business' : 'Suspend Business',
                          icon: b.isBlocked ? <CheckCircle /> : <ShieldBan />,
                          type: b.isBlocked ? 'success' : 'danger',
                          onClick: () => handleBlockBusiness(b)
                        },
                        {
                          label: 'Remove Client',
                          icon: <Trash2 />,
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
            <Building2 size={48} opacity={0.2} />
            <p>No businesses found matching your criteria.</p>
          </div>
        )}
      </div>

      <style>{`
        .sa-view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .btn-download { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; color: #1e293b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .btn-download:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
        .btn-download:disabled { opacity: 0.5; cursor: not-allowed; }

        .sa-biz-cell { display: flex; align-items: center; gap: 12px; position: relative; }
        .sa-biz-logo { width: 36px; height: 36px; background: var(--surface-container); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .sa-biz-logo img { width: 100%; height: 100%; object-fit: cover; }
        .sa-biz-info { display: flex; flex-direction: column; }
        .sa-biz-info .name { font-weight: 700; font-size: 0.9rem; color: var(--on-surface); }
        .sa-biz-info .id { font-size: 0.7rem; color: var(--outline); font-family: monospace; }
        
        .row-blocked { background: #fef2f2; }
        .blocked-badge { background: #ef4444; color: white; font-size: 0.55rem; font-weight: 900; padding: 2px 6px; border-radius: 4px; margin-left: 4px; }

        .sa-owner-cell { display: flex; flex-direction: column; }
        .sa-owner-cell .name { font-weight: 600; font-size: 0.85rem; }
        .sa-owner-cell .email { font-size: 0.8rem; color: var(--on-surface-variant); }
        
        .sa-plan-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; }
        .sa-plan-badge.pro { background: #dcfce7; color: #15803d; }
        .sa-plan-badge.free { background: var(--surface-container); color: var(--on-surface-variant); }
        
        .sa-volume-cell { display: flex; flex-direction: column; gap: 4px; }
        .sa-volume-cell .v-item { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 600; }
        
        .sa-date { font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 500; }
      `}</style>
    </div>
  );
};

export default SABusinessOwners;

