import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Building2, MessageSquare, ArrowUpRight, ArrowDownRight, Globe, Zap, Download, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';

const SAOverview = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.get(`${API_URL}/super-admin/overview/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      toast.error('Failed to load global metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const response = await axios.get(`${API_URL}/super-admin/export-report`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SupportBotAI_Global_Report.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Report downloaded successfully');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const networkStatus = [
    { region: 'US-East (Virginia)', status: 'Optimal', latency: '24ms', load: '42%' },
    { region: 'EU-West (Ireland)', status: 'Optimal', latency: '38ms', load: '31%' },
    { region: 'AP-South (Mumbai)', status: 'Stable', latency: '112ms', load: '58%' },
    { region: 'Global Edge (CDN)', status: 'Active', latency: '12ms', load: '18%' }
  ];

  const statCards = [
    { label: 'Total Businesses', value: stats?.totalBusinesses || 0, trend: '+5.2%', icon: Building2, color: 'var(--primary)' },
    { label: 'Pro Accounts', value: stats?.proBusinesses || 0, trend: '+12.1%', icon: Zap, color: '#10b981' },
    { label: 'Global Agents', value: stats?.totalAgents || 0, trend: '+8.4%', icon: Users, color: '#8b5cf6' },
    { label: 'Total Conversations', value: stats?.totalConversations || 0, trend: '+24.5%', icon: MessageSquare, color: '#f59e0b' }
  ];

  if (isLoading) {
    return (
      <div className="sa-loading-view">
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Synchronizing Global Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="sa-overview-page animate-fade-in">
      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>Global Intelligence</h1>
          <p>Real-time network performance and metrics across all clusters.</p>
        </div>
        <div className="sa-header-actions">
          <button 
            className="btn btn-primary sa-dl-btn" 
            onClick={handleDownloadReport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span>Download Report</span>
          </button>
        </div>
      </header>

      <div className="sa-stats-grid">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i} 
            className="sa-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="sa-stat-header">
              <div className="sa-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <div className={`sa-stat-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="sa-stat-body">
              <span className="sa-stat-label">{stat.label}</span>
              <h2 className="sa-stat-value">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="sa-secondary-grid">
        <div className="card sa-network-card">
          <div className="sa-card-header">
            <h3><Globe size={18} /> Network Infra</h3>
            <span className="status-badge">GLOBAL STABLE</span>
          </div>
          <div className="sa-network-list">
            {networkStatus.map((item, i) => (
              <div key={i} className="sa-network-item">
                <div className="region-info">
                  <span className="region-name">{item.region}</span>
                  <span className="region-status">● {item.status}</span>
                </div>
                <div className="region-metrics">
                  <div className="metric">
                    <span className="m-label">Latency</span>
                    <span className="m-value">{item.latency}</span>
                  </div>
                  <div className="metric">
                    <span className="m-label">Load</span>
                    <span className="m-value">{item.load}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card sa-alerts-card">
          <div className="sa-card-header">
            <h3><Zap size={18} /> System Alerts</h3>
          </div>
          <div className="sa-alerts-list">
            <div className="sa-alert-item warning">
              <div className="alert-dot"></div>
              <div className="alert-content">
                <strong>High API Latency</strong>
                <p>US-East cluster experiencing 15% increase in response times.</p>
              </div>
            </div>
            <div className="sa-alert-item info">
              <div className="alert-dot"></div>
              <div className="alert-content">
                <strong>Scheduled Maintenance</strong>
                <p>Database optimization scheduled for EU-West at 02:00 UTC.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sa-overview-page h1 { font-size: 1.5rem; margin-bottom: 8px; font-weight: 800; }
        @media (min-width: 768px) { .sa-overview-page h1 { font-size: 2rem; } }

        .sa-overview-page p { color: var(--on-surface-variant); font-size: 0.9rem; margin-bottom: 0; }
        @media (min-width: 768px) { .sa-overview-page p { font-size: 0.95rem; } }

        .sa-view-header { 
          display: flex; 
          flex-direction: column;
          gap: 20px; 
          margin-bottom: 32px; 
        }

        @media (min-width: 768px) {
          .sa-view-header { flex-direction: row; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        }

        .sa-dl-btn { width: 100%; }
        @media (min-width: 768px) { .sa-dl-btn { width: auto; } }
        
        .sa-stats-grid { 
          display: grid; 
          grid-template-columns: repeat(1, 1fr); 
          gap: 16px; 
          margin-bottom: 32px; 
        }

        @media (min-width: 480px) { .sa-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
        @media (min-width: 1024px) { .sa-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 40px; } }

        .sa-stat-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid var(--outline-variant); }
        .sa-stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .sa-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .sa-stat-trend { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
        .sa-stat-trend.up { background: #d1fae5; color: #065f46; }
        .sa-stat-trend.down { background: #fee2e2; color: #991b1b; }
        .sa-stat-label { font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 600; display: block; margin-bottom: 4px; }
        .sa-stat-value { font-size: 1.5rem; font-weight: 800; margin: 0; }
        @media (min-width: 768px) { .sa-stat-value { font-size: 1.75rem; } }

        .sa-secondary-grid { 
          display: flex;
          flex-direction: column;
          gap: 24px; 
        }

        @media (min-width: 1024px) {
          .sa-secondary-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        }

        .sa-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .sa-card-header h3 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 1rem; }
        .status-badge { font-size: 0.6rem; font-weight: 900; color: #10b981; background: #d1fae5; padding: 4px 8px; border-radius: 6px; }
        
        .sa-network-list { display: flex; flex-direction: column; gap: 12px; }
        .sa-network-item { display: flex; justify-content: space-between; padding: 16px; background: var(--surface-container-low); border-radius: 12px; border: 1px solid var(--outline-variant); flex-wrap: wrap; gap: 12px; }
        .region-info { display: flex; flex-direction: column; gap: 4px; min-width: 120px; }
        .region-name { font-weight: 700; font-size: 0.9rem; }
        .region-status { font-size: 0.7rem; font-weight: 700; color: #10b981; }
        .region-metrics { display: flex; gap: 16px; align-items: center; justify-content: flex-end; flex: 1; }
        .metric { text-align: right; }
        .m-label { display: block; font-size: 0.65rem; color: var(--on-surface-variant); font-weight: 600; margin-bottom: 2px; }
        .m-value { font-weight: 700; font-size: 0.85rem; }

        .sa-alerts-list { display: flex; flex-direction: column; gap: 12px; }
        .sa-alert-item { display: flex; gap: 12px; padding: 16px; border-radius: 12px; border: 1px solid var(--outline-variant); }
        .sa-alert-item.warning { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .sa-alert-item.info { border-left: 4px solid var(--primary); background: var(--primary-fixed); }
        .alert-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
        .warning .alert-dot { background: #f59e0b; }
        .info .alert-dot { background: var(--primary); }
        .alert-content strong { display: block; font-size: 0.85rem; margin-bottom: 4px; }
        .alert-content p { font-size: 0.8rem; margin: 0; line-height: 1.4; }
      `}</style>
    </div>
  );
};

export default SAOverview;
