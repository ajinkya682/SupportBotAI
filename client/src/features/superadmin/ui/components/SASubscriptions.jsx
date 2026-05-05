import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, TrendingUp, Zap, Users, 
  Calendar, ArrowUpRight, DollarSign, 
  PieChart as PieIcon, Loader2, Download,
  CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';

const SASubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({
    mrr: 0,
    activePro: 0,
    activeFree: 0,
    growth: '+15.2%',
    annualRevenue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const [subRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/super-admin/subscriptions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/super-admin/overview/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (subRes.data.success) setSubscriptions(subRes.data.subscriptions);
      if (statsRes.data.success) {
        const proCount = statsRes.data.stats.proBusinesses;
        setStats(prev => ({
          ...prev,
          activePro: proCount,
          activeFree: statsRes.data.stats.freeBusinesses,
          mrr: proCount * 49,
          annualRevenue: proCount * 49 * 12
        }));
      }
    } catch (err) {
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSubscriptions = async () => {
    setIsExporting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/super-admin/export-subscriptions`, {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SupportBot_Revenue_Report.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Revenue report exported');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sa-loading-view">
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Calculating Platform Revenue...</p>
      </div>
    );
  }

  return (
    <div className="sa-view-container animate-fade-in">
      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>Revenue & Plans</h1>
          <p>Subscription management, billing cycles, and MRR tracking.</p>
        </div>
        <button 
          className="btn-download" 
          onClick={handleDownloadSubscriptions}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          <span>Export Revenue Report</span>
        </button>
      </header>

      <div className="sa-stats-grid">
        <motion.div 
          className="sa-stat-card card premium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
              <DollarSign size={20} />
            </div>
            <div className="sa-stat-trend up" style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
              <ArrowUpRight size={12} /> {stats.growth}
            </div>
          </div>
          <div className="sa-stat-body">
            <span className="sa-stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Estimated MRR</span>
            <h2 className="sa-stat-value" style={{ color: 'white' }}>${stats.mrr.toLocaleString()}</h2>
            <div className="sa-stat-footer" style={{ color: 'rgba(255,255,255,0.5)' }}>
              ARR: ${stats.annualRevenue.toLocaleString()}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="sa-stat-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
              <Zap size={20} />
            </div>
          </div>
          <div className="sa-stat-body">
            <span className="sa-stat-label">Active Pro Plans</span>
            <h2 className="sa-stat-value">{stats.activePro}</h2>
            <div className="sa-stat-footer">
              <ShieldCheck size={12} /> Verified Accounts
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="sa-stat-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="sa-stat-body">
            <span className="sa-stat-label">Free Tier Users</span>
            <h2 className="sa-stat-value">{stats.activeFree}</h2>
            <div className="sa-stat-footer">
              <TrendingUp size={12} /> Potential Upgrades
            </div>
          </div>
        </motion.div>
      </div>

      <div className="sa-table-card card">
        <div className="card-header">
          <h3>Billing Ledger</h3>
          <span className="ledger-badge">{subscriptions.length} active licenses</span>
        </div>
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Plan</th>
                <th>Activation</th>
                <th>Billing</th>
                <th>Status</th>
                <th>Est. Revenue</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {subscriptions.map((s, idx) => (
                  <motion.tr 
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td>
                      <div className="sa-acc-cell">
                        <span className="name">{s.businessName}</span>
                        <span className="email">{s.ownerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-plan-badge ${s.plan}`}>
                        {s.plan === 'pro' && <Zap size={10} />}
                        {s.plan.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="sa-date-cell">
                        <Calendar size={14} />
                        <span>{new Date(s.startDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sa-billing-type">Monthly Auto-renew</span>
                    </td>
                    <td>
                      <span className="sa-status-tag online">
                        <CheckCircle2 size={12} />
                        ACTIVE
                      </span>
                    </td>
                    <td>
                      <span className={`sa-revenue ${s.plan}`}>
                        {s.plan === 'pro' ? '$49.00' : '$0.00'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .sa-view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .btn-download { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; color: #1e293b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .btn-download:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
        
        .sa-stat-card.premium { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); border: none; }
        .sa-stat-footer { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 600; color: #94a3b8; margin-top: 12px; }

        .card-header { display: flex; justify-content: space-between; align-items: center; padding: 0 0 20px 0; }
        .ledger-badge { background: #f1f5f9; color: #64748b; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; border: 1px solid #e2e8f0; }

        .sa-acc-cell { display: flex; flex-direction: column; }
        .sa-acc-cell .name { font-weight: 700; font-size: 0.85rem; color: var(--on-surface); }
        .sa-acc-cell .email { font-size: 0.75rem; color: var(--outline); }

        .sa-date-cell { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 600; }
        .sa-billing-type { font-size: 0.75rem; color: #64748b; font-weight: 600; }

        .sa-status-tag.online { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; gap: 6px; }
        
        .sa-revenue { font-weight: 800; font-size: 0.9rem; }
        .sa-revenue.pro { color: #059669; }
        .sa-revenue.free { color: #94a3b8; }
      `}</style>
    </div>
  );
};

export default SASubscriptions;

