import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  Zap, 
  Sparkles, 
  Download,
  Calendar,
  Filter,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Info,
  Lock
} from "lucide-react";
import { motion } from 'framer-motion';

export default function Analytics({ conversations = [], business, onUpgrade }) {
  const isFree = business?.plan === 'free';

  const data = [
    { name: 'Mon', conversations: 45, resolved: 38 },
    { name: 'Tue', conversations: 52, resolved: 48 },
    { name: 'Wed', conversations: 38, resolved: 32 },
    { name: 'Thu', conversations: 65, resolved: 58 },
    { name: 'Fri', conversations: 48, resolved: 42 },
    { name: 'Sat', conversations: 24, resolved: 20 },
    { name: 'Sun', conversations: 18, resolved: 15 },
  ];

  const pieData = [
    { name: 'AI Resolved', value: 75, color: 'var(--primary)' },
    { name: 'Human Handover', value: 15, color: '#f59e0b' },
    { name: 'Unresolved', value: 10, color: 'var(--error)' },
  ];

  const metrics = [
    { label: 'Total Volume', value: '1,284', trend: '+14%', icon: MessageSquare, color: 'var(--primary)' },
    { label: 'AI Success Rate', value: '88.5%', trend: '+2%', icon: Zap, color: '#10b981' },
    { label: 'Avg. Handle Time', value: '1m 42s', trend: '-12s', icon: Clock, color: '#8b5cf6' },
    { label: 'Satisfied Users', value: '94%', trend: '+1%', icon: Users, color: '#06b6d4' },
  ];

  return (
    <div className="animate-fade-in analytics-container">
      <div className="analytics-header">
        <div className="page-title">
          <h1>Performance Insights</h1>
          <p>Monitor your AI's effectiveness and customer satisfaction metrics.</p>
        </div>
        <div className="header-actions">
          <div className="date-picker">
            <Calendar size={16} />
            <span>Last 7 Days</span>
          </div>
          <button className="btn btn-secondary"><Download size={16} /> Export Report</button>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((m, i) => (
          <motion.div 
            key={i} 
            className="metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="metric-icon" style={{ background: `${m.color}15`, color: m.color }}>
              <m.icon size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-label">{m.label}</span>
              <div className="metric-value-row">
                <span className="metric-value">{m.value}</span>
                <span className={`metric-trend ${m.trend.startsWith('+') ? 'up' : 'down'}`}>
                  {m.trend.startsWith('+') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {m.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card main-chart-card">
          <div className="card-header">
            <h3>Conversation Volume</h3>
            <div className="chart-legend">
              <div className="legend-item"><span style={{ background: 'var(--primary)' }}></span> Total</div>
              <div className="legend-item"><span style={{ background: '#10b981' }}></span> Resolved</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '12px', boxShadow: 'var(--shadow-3)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="conversations" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card side-chart-card">
          <h3>Resolution Breakdown</h3>
          <div className="chart-wrapper" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend">
            {pieData.map((entry, index) => (
              <div key={index} className="pie-legend-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="dot" style={{ background: entry.color }}></span>
                  <span className="label">{entry.name}</span>
                </div>
                <span className="value">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="advanced-insights">
        <div className="section-title">
          <Sparkles size={20} style={{ color: 'var(--primary)' }} />
          <h3>AI Intelligence Insights</h3>
        </div>

        {isFree ? (
          <div className="card pro-gated-card">
            <div className="lock-overlay">
              <div className="lock-icon-wrapper">
                <Lock size={32} />
              </div>
              <h3>Advanced Sentiment Analytics</h3>
              <p>Unlock deep-learning powered emotion tracking, intent analysis, and automated ROI reporting.</p>
              <button className="btn btn-primary" onClick={onUpgrade}>Upgrade to Pro</button>
            </div>
            <div className="blurred-content">
              <div className="mock-insight"></div>
              <div className="mock-insight"></div>
            </div>
          </div>
        ) : (
          <div className="insights-grid">
            <div className="card insight-card">
              <div className="insight-header">
                <div className="sentiment-indicator positive">92% Positive</div>
                <h4>Customer Sentiment</h4>
              </div>
              <p>Customers are responding exceptionally well to the AI's personality. Most common positive keyword: "Helpful".</p>
              <div className="insight-footer">
                <span>View Sentiment Map</span>
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="card insight-card">
              <div className="insight-header">
                <div className="sentiment-indicator warning">4 Common Gaps</div>
                <h4>Knowledge Gaps</h4>
              </div>
              <p>The AI struggled with "International Shipping" queries 12 times this week. Suggest adding this to Training.</p>
              <div className="insight-footer" style={{ color: 'var(--primary)' }}>
                <span>Update Training</span>
                <Sparkles size={14} />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .analytics-container { padding-bottom: 60px; }
        .analytics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-actions { display: flex; gap: 12px; }
        .date-picker { display: flex; align-items: center; gap: 8px; background: var(--surface-container-low); padding: 8px 16px; border-radius: 10px; border: 1px solid var(--outline-variant); font-size: 0.875rem; font-weight: 600; cursor: pointer; }
        
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .metric-card { background: var(--surface-container-lowest); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--outline-variant); display: flex; gap: 20px; align-items: center; box-shadow: var(--shadow-1); }
        .metric-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .metric-label { font-size: 0.85rem; font-weight: 600; color: var(--on-surface-variant); margin-bottom: 4px; display: block; }
        .metric-value-row { display: flex; align-items: baseline; gap: 12px; }
        .metric-value { font-size: 1.5rem; font-weight: 800; color: var(--on-surface); }
        .metric-trend { font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 2px; }
        .metric-trend.up { color: #10b981; }
        .metric-trend.down { color: var(--error); }
        
        .charts-grid { display: grid; grid-template-columns: 1fr 340px; gap: 32px; margin-bottom: 48px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .chart-legend { display: flex; gap: 16px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; color: var(--on-surface-variant); }
        .legend-item span { width: 8px; height: 8px; border-radius: 50%; }
        
        .pie-legend { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        .pie-legend-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--outline-variant); }
        .pie-legend-item .dot { width: 8px; height: 8px; border-radius: 50%; }
        .pie-legend-item .label { font-size: 0.85rem; color: var(--on-surface-variant); font-weight: 600; }
        .pie-legend-item .value { font-size: 0.85rem; font-weight: 800; color: var(--on-surface); }
        
        .advanced-insights .section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .pro-gated-card { position: relative; padding: 60px; text-align: center; overflow: hidden; }
        .lock-overlay { position: absolute; inset: 0; z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); }
        .lock-icon-wrapper { width: 64px; height: 64px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: var(--shadow-3); }
        .lock-overlay h3 { margin-bottom: 12px; }
        .lock-overlay p { font-size: 0.95rem; color: var(--on-surface-variant); margin-bottom: 24px; max-width: 400px; }
        .blurred-content { filter: blur(10px); opacity: 0.3; pointer-events: none; }
        .mock-insight { height: 100px; background: #e5e7eb; border-radius: 12px; margin-bottom: 20px; }
        
        .insights-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .insight-card { padding: 24px; transition: 0.2s; }
        .insight-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-2); }
        .insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .sentiment-indicator { font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
        .sentiment-indicator.positive { background: #d1fae5; color: #065f46; }
        .sentiment-indicator.warning { background: var(--error-container); color: var(--error); }
        .insight-card h4 { margin: 0; }
        .insight-card p { font-size: 0.9rem; color: var(--on-surface-variant); line-height: 1.6; margin-bottom: 20px; }
        .insight-footer { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; color: var(--on-surface-variant); cursor: pointer; transition: 0.2s; }
        .insight-footer:hover { color: var(--primary); }
      `}</style>
    </div>
  );
}
