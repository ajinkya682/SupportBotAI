import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, Filter, Mail, Calendar, 
  ChevronRight, ExternalLink, ShieldCheck, Zap, 
  MoreVertical, User, MessageSquare, Loader2
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';

const SABusinessOwners = () => {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');

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
      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>Client Accounts</h1>
          <p>Manage and monitor all business owners on the platform.</p>
        </div>
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
              <AnimatePresence>
                {filtered.map((b) => (
                  <motion.tr 
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                      <div className="sa-actions">
                        <button 
                          className="sa-action-btn" 
                          title={b.plan === 'pro' ? 'Downgrade to Free' : 'Upgrade to Pro'}
                          onClick={() => handleUpdatePlan(b.id, b.plan === 'pro' ? 'free' : 'pro')}
                        >
                          <ShieldCheck size={18} color={b.plan === 'pro' ? 'var(--primary)' : 'var(--outline)'} />
                        </button>
                        <button className="sa-action-btn"><MoreVertical size={18} /></button>
                      </div>
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
        .sa-view-container { display: flex; flex-direction: column; gap: 24px; }
        .sa-view-header { margin-bottom: 8px; }
        .sa-filters-bar { display: flex; gap: 16px; padding: 12px 20px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
        
        .sa-search-input { display: flex; align-items: center; gap: 12px; background: var(--surface-container-low); padding: 0 16px; border-radius: 12px; border: 1px solid var(--outline-variant); flex: 1; min-width: 280px; }
        .sa-search-input input { border: none; background: transparent; padding: 12px 0; font-size: 0.9rem; }
        .sa-search-input input:focus { box-shadow: none; }
        
        .sa-select-wrapper { display: flex; align-items: center; gap: 8px; background: var(--surface-container-low); padding: 0 12px; border-radius: 10px; border: 1px solid var(--outline-variant); }
        .sa-select-wrapper select { border: none; background: transparent; padding: 8px 4px; font-size: 0.85rem; font-weight: 600; cursor: pointer; min-width: 120px; }

        .sa-data-table { width: 100%; border-collapse: collapse; }
        .sa-data-table th { text-align: left; padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--outline); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--outline-variant); }
        .sa-data-table td { padding: 16px; border-bottom: 1px solid var(--surface-container-highest); vertical-align: middle; }
        
        .sa-biz-cell { display: flex; align-items: center; gap: 12px; }
        .sa-biz-logo { width: 36px; height: 36px; background: var(--surface-container); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .sa-biz-logo img { width: 100%; height: 100%; object-fit: cover; }
        .sa-biz-info { display: flex; flex-direction: column; }
        .sa-biz-info .name { font-weight: 700; font-size: 0.9rem; color: var(--on-surface); }
        .sa-biz-info .id { font-size: 0.7rem; color: var(--outline); font-family: monospace; }
        
        .sa-owner-cell { display: flex; flex-direction: column; }
        .sa-owner-cell .name { font-weight: 600; font-size: 0.85rem; }
        .sa-owner-cell .email { font-size: 0.8rem; color: var(--on-surface-variant); }
        
        .sa-plan-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; }
        .sa-plan-badge.pro { background: #dcfce7; color: #15803d; }
        .sa-plan-badge.free { background: var(--surface-container); color: var(--on-surface-variant); }
        
        .sa-volume-cell { display: flex; flex-direction: column; gap: 4px; }
        .sa-volume-cell .v-item { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 600; }
        
        .sa-date { font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 500; }
        
        .sa-actions { display: flex; gap: 8px; }
        .sa-action-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; color: var(--outline); }
        .sa-action-btn:hover { background: var(--surface-container); color: var(--primary); }
        
        .sa-empty-state { padding: 60px; text-align: center; color: var(--outline); }
        .sa-empty-state p { margin-top: 16px; font-weight: 600; }
        
        .sa-loading-view { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; gap: 20px; }
        .sa-loading-view p { font-weight: 700; color: var(--outline); }
      `}</style>
    </div>
  );
};

export default SABusinessOwners;
