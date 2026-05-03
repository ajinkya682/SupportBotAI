import { motion } from 'framer-motion';
import { TrendingUp, Users, Building2, MessageSquare, ArrowUpRight, ArrowDownRight, Globe, Zap } from 'lucide-react';

const SAOverview = () => {
  const stats = [
    { label: 'Total Revenue', value: '$124,592', trend: '+14.2%', icon: TrendingUp, color: '#10b981' },
    { label: 'Active Clients', value: '1,284', trend: '+8.1%', icon: Building2, color: 'var(--primary)' },
    { label: 'Total Agents', value: '4,592', trend: '+12.4%', icon: Users, color: '#8b5cf6' },
    { label: 'Global Volume', value: '1.2M', trend: '+24.5%', icon: MessageSquare, color: '#f59e0b' }
  ];

  const networkStatus = [
    { region: 'North America', status: 'Operational', latency: '24ms', load: '42%' },
    { region: 'Europe (West)', status: 'Operational', latency: '31ms', load: '38%' },
    { region: 'Asia Pacific', status: 'Operational', latency: '85ms', load: '12%' }
  ];

  return (
    <div className="sa-overview-page animate-fade-in">
      <header className="sa-view-header">
        <div>
          <h1>Global Intelligence</h1>
          <p>Real-time network performance and business metrics across all clusters.</p>
        </div>
        <div className="sa-header-actions">
          <button className="btn btn-primary">Download Report</button>
        </div>
      </header>

      <div className="sa-stats-grid">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            className="sa-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="sa-stat-header">
              <div className="sa-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div className={`sa-stat-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <div className="sa-stat-body">
              <span className="sa-stat-label">{stat.label}</span>
              <h2 className="sa-stat-value">{stat.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="sa-secondary-grid">
        <div className="card sa-network-card">
          <div className="sa-card-header">
            <h3><Globe size={20} /> Network Infrastructure</h3>
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
                    <span className="m-label">Cluster Load</span>
                    <span className="m-value">{item.load}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card sa-alerts-card">
          <div className="sa-card-header">
            <h3><Zap size={20} /> System Alerts</h3>
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
        .sa-overview-page h1 { font-size: 2rem; margin-bottom: 8px; font-weight: 800; }
        .sa-overview-page p { color: var(--on-surface-variant); font-size: 0.95rem; }
        .sa-view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        
        .sa-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px; }
        .sa-stat-card { background: white; padding: 24px; border-radius: 20px; border: 1px solid var(--outline-variant); }
        .sa-stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .sa-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .sa-stat-trend { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
        .sa-stat-trend.up { background: #d1fae5; color: #065f46; }
        .sa-stat-trend.down { background: #fee2e2; color: #991b1b; }
        .sa-stat-label { font-size: 0.875rem; color: var(--on-surface-variant); font-weight: 600; display: block; margin-bottom: 4px; }
        .sa-stat-value { font-size: 1.75rem; font-weight: 800; margin: 0; }

        .sa-secondary-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        .sa-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .sa-card-header h3 { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 1.1rem; }
        .status-badge { font-size: 0.65rem; font-weight: 900; color: #10b981; background: #d1fae5; padding: 4px 10px; border-radius: 6px; }
        
        .sa-network-list { display: flex; flex-direction: column; gap: 16px; }
        .sa-network-item { display: flex; justify-content: space-between; padding: 16px; background: var(--surface-container-low); border-radius: 14px; border: 1px solid var(--outline-variant); }
        .region-info { display: flex; flex-direction: column; gap: 4px; }
        .region-name { font-weight: 700; font-size: 0.95rem; }
        .region-status { font-size: 0.75rem; font-weight: 700; color: #10b981; }
        .region-metrics { display: flex; gap: 24px; }
        .metric { text-align: right; }
        .m-label { display: block; font-size: 0.7rem; color: var(--on-surface-variant); font-weight: 600; margin-bottom: 2px; }
        .m-value { font-weight: 700; font-size: 0.9rem; }

        .sa-alerts-list { display: flex; flex-direction: column; gap: 12px; }
        .sa-alert-item { display: flex; gap: 16px; padding: 16px; border-radius: 14px; border: 1px solid var(--outline-variant); }
        .sa-alert-item.warning { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .sa-alert-item.info { border-left: 4px solid var(--primary); background: var(--primary-fixed); }
        .alert-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; }
        .warning .alert-dot { background: #f59e0b; }
        .info .alert-dot { background: var(--primary); }
        .alert-content strong { display: block; font-size: 0.9rem; margin-bottom: 4px; }
        .alert-content p { font-size: 0.85rem; margin: 0; line-height: 1.4; }
      `}</style>
    </div>
  );
};

export default SAOverview;
