import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, TrendingUp, Zap, Users, 
  Calendar, ArrowUpRight, DollarSign, 
  PieChart as PieIcon, Download,
  CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';
import Loader from '../../../../shared/ui/components/Loader';
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
      <div className="sa-loading-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <Loader fullPage label="Calculating Platform Revenue..." />
      </div>
    );
  }

  return (
    <div className="sa-view-container animate-fade-in">
      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>Revenue & Subscriptions</h1>
          <p>Global financial overview and business plan management.</p>
        </div>
        <button 
          className="btn-download" 
          onClick={handleDownloadSubscriptions}
          disabled={isExporting}
        >
          {isExporting ? <Loader size={18} /> : <Download size={18} />}
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
            <span className="sa-stat-label">Active Pro Plans</span>
          </div>
          <div className="sa-stat-body">
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
            <span className="sa-stat-label">Free Tier Users</span>
          </div>
          <div className="sa-stat-body">
            <h2 className="sa-stat-value">{stats.activeFree}</h2>
            <div className="sa-stat-footer">
              <TrendingUp size={12} /> Potential Upgrades
            </div>
          </div>
        </motion.div>
      </div>

      <div className="sa-table-card card">
        <div className="sa-card-header">
          <h3>Billing Ledger</h3>
          <span className="ledger-badge">{subscriptions.length} active licenses</span>
        </div>
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>ACCOUNT</th>
                <th>PLAN</th>
                <th>ACTIVATION</th>
                <th>BILLING</th>
                <th>STATUS</th>
                <th className="text-right">EST. REVENUE</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {subscriptions.map((s, idx) => (
                  <motion.tr 
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <td data-label="ACCOUNT">
                      <div className="sa-acc-cell">
                        <span className="name">{s.businessName}</span>
                        <span className="email">{s.ownerEmail || 'Unknown'}</span>
                      </div>
                    </td>
                    <td data-label="PLAN">
                      <div className="sa-plan-group">
                        <span className={`sa-plan-badge ${s.plan}`}>
                          {s.plan === 'pro' ? <Zap size={10} /> : <ShieldCheck size={10} />}
                          {s.plan.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td data-label="ACTIVATION">
                      <div className="sa-date-cell">
                        <Calendar size={14} />
                        <span>{new Date(s.startDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    </td>
                    <td data-label="BILLING">
                      <span className="sa-billing-type">Monthly Auto-renew</span>
                    </td>
                    <td data-label="STATUS">
                      <span className="sa-status-tag active">
                        <CheckCircle2 size={12} />
                        ACTIVE
                      </span>
                    </td>
                    <td data-label="EST. REVENUE" className="text-right">
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
        {subscriptions.length === 0 && !isLoading && (
          <div className="sa-empty-state">
            <div className="empty-icon-wrap">
              <CreditCard size={48} />
            </div>
            <h3>No subscriptions found</h3>
            <p>Once businesses start subscribing, they will appear here in the billing ledger.</p>
          </div>
        )}
      </div>

      <style>{`
        .sa-view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .btn-download { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; color: #1e293b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .btn-download:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
        
        .sa-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .sa-stat-card { padding: 24px; position: relative; overflow: hidden; }
        .sa-stat-card.premium { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); border: none; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4); }
        .sa-stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .sa-stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .sa-stat-trend { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; }
        .sa-stat-label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .sa-stat-value { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 8px 0; }
        .sa-stat-footer { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; color: #94a3b8; }

        .sa-card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
        .sa-card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #1e293b; }
        .ledger-badge { background: #eff6ff; color: #2563eb; font-size: 0.7rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; border: 1px solid #dbeafe; }

        .sa-data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .sa-data-table thead th { background: #f8fafc; padding: 16px 24px; text-align: left; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; }
        .sa-data-table tbody td { padding: 18px 24px; vertical-align: middle; border-bottom: 1px solid #f1f5f9; }
        .sa-data-table tbody tr:hover { background: #f8fafc; }

        .sa-acc-cell { display: flex; flex-direction: column; gap: 2px; }
        .sa-acc-cell .name { font-weight: 700; font-size: 0.95rem; color: #1e293b; }
        .sa-acc-cell .email { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

        .sa-plan-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; }
        .sa-plan-badge.pro { background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }
        .sa-plan-badge.free { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        .sa-date-cell { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #475569; font-weight: 600; }
        .sa-billing-type { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }

        .sa-status-tag.active { display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; border: 1px solid #d1fae5; }
        
        .sa-revenue { font-weight: 800; font-size: 1rem; font-family: monospace; }
        .sa-revenue.pro { color: #059669; }
        .sa-revenue.free { color: #94a3b8; }
        .text-right { text-align: right; }

        .sa-empty-state { padding: 80px 20px; text-align: center; }
        .empty-icon-wrap { width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #cbd5e1; }
        .sa-empty-state h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .sa-empty-state p { color: #64748b; margin-bottom: 24px; }

        @media (max-width: 768px) {
          .sa-stats-grid { grid-template-columns: 1fr; gap: 12px; }
          .sa-data-table thead { display: none; }
          .sa-data-table tr { display: block; margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: white; }
          .sa-data-table td { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; }
          .sa-data-table td:last-child { border-bottom: none; }
          .sa-data-table td::before { content: attr(data-label); font-weight: 800; color: #64748b; font-size: 0.7rem; text-align: left; }
          .sa-acc-cell, .sa-plan-group, .sa-date-cell, .sa-status-tag { justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
};

export default SASubscriptions;

