import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, TrendingUp, Zap, Users, 
  Calendar, ArrowUpRight, DollarSign, 
  PieChart as PieIcon, Loader2 
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../shared/services/config';
import toast from 'react-hot-toast';

const SASubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    mrr: 4850,
    activePro: 0,
    activeFree: 0,
    growth: '+12.5%'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [subRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/super-admin/subscriptions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/super-admin/overview/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (subRes.data.success) setSubscriptions(subRes.data.subscriptions);
      if (statsRes.data.success) {
        setStats(prev => ({
          ...prev,
          activePro: statsRes.data.stats.proBusinesses,
          activeFree: statsRes.data.stats.freeBusinesses,
          mrr: statsRes.data.stats.proBusinesses * 49 // Mock calculation based on $49 price
        }));
      }
    } catch (err) {
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
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
      </header>

      <div className="sa-stats-grid">
        <div className="sa-stat-card card">
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
            <div className="sa-stat-trend up">
              <ArrowUpRight size={12} /> {stats.growth}
            </div>
          </div>
          <div className="sa-stat-body">
            <span className="sa-stat-label">Estimated MRR</span>
            <h2 className="sa-stat-value">${stats.mrr.toLocaleString()}</h2>
          </div>
        </div>

        <div className="sa-stat-card card">
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(53, 37, 205, 0.1)', color: 'var(--primary)' }}>
              <Zap size={20} />
            </div>
          </div>
          <div className="sa-stat-body">
            <span className="sa-stat-label">Active Pro Plans</span>
            <h2 className="sa-stat-value">{stats.activePro}</h2>
          </div>
        </div>

        <div className="sa-stat-card card">
          <div className="sa-stat-header">
            <div className="sa-stat-icon" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="sa-stat-body">
            <span className="sa-stat-label">Active Free Plans</span>
            <h2 className="sa-stat-value">{stats.activeFree}</h2>
          </div>
        </div>
      </div>

      <div className="sa-table-card card">
        <h3>Active Subscriptions</h3>
        <div className="table-responsive">
          <table className="sa-data-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner Email</th>
                <th>Plan Type</th>
                <th>Billing Cycle</th>
                <th>Status</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.businessName}</strong></td>
                  <td>{s.ownerEmail}</td>
                  <td>
                    <span className={`sa-plan-badge ${s.plan}`}>{s.plan.toUpperCase()}</span>
                  </td>
                  <td>
                    <div className="sa-cycle">
                      <Calendar size={14} />
                      <span>{new Date(s.startDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className="sa-status-tag online">ACTIVE</span>
                  </td>
                  <td>
                    <span className="sa-revenue">{s.plan === 'pro' ? '$49.00' : '$0.00'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .sa-cycle { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 600; }
        .sa-revenue { font-weight: 800; color: var(--on-surface); font-size: 0.9rem; }
      `}</style>
    </div>
  );
};

export default SASubscriptions;
