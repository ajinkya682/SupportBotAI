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
  ChevronUp,
  ChevronDown,
  Lock
} from "lucide-react";
import { motion } from 'framer-motion';
import ProGate from '../../../../shared/components/ProGate';
import usePlan from '../../../../shared/hooks/usePlan';

export default function Analytics({ conversations = [], business, onUpgrade }) {
  const { isFree, goUpgrade } = usePlan();

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
    { label: 'AI Success', value: '88.5%', trend: '+2%', icon: Zap, color: '#10b981' },
    { label: 'Avg. Time', value: '1m 42s', trend: '-12s', icon: Clock, color: '#8b5cf6' },
    { label: 'Satisfied', value: '94%', trend: '+1%', icon: Users, color: '#06b6d4' },
  ];

  return (
    <div className="animate-fade-in analytics-container">
      <div className="analytics-header">
        <div className="page-title">
          <h1>Performance Insights</h1>
          <p>Monitor your AI's effectiveness and satisfaction metrics.</p>
        </div>
        <div className="header-actions">
          <div className="date-picker">
            <Calendar size={14} />
            <span>7 Days</span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={isFree ? goUpgrade : undefined}
            title={isFree ? 'Export is a Pro feature' : 'Export data'}
            style={{ opacity: isFree ? 0.5 : 1 }}
          >
            <Lock size={14} style={{ display: isFree ? 'inline' : 'none' }} />
            <Download size={14} style={{ display: isFree ? 'none' : 'inline' }} />
            <span className="desktop-only">Export</span>
          </button>
        </div>
      </div>

      <ProGate
        feature="Analytics & Performance"
        description="Unlock full performance insights with Pro. See what's working and improve your support."
      >
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
                <m.icon size={18} />
              </div>
              <div className="metric-info">
                <span className="metric-label">{m.label}</span>
                <div className="metric-value-row">
                  <span className="metric-value">{m.value}</span>
                  <span className={`metric-trend ${m.trend.startsWith('+') ? 'up' : 'down'}`}>
                    {m.trend.startsWith('+') ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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
              <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', boxShadow: 'var(--shadow-2)', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="conversations" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card side-chart-card">
            <h3>Resolution Breakdown</h3>
            <div className="chart-wrapper" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={6} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend">
              {pieData.map((entry, index) => (
                <div key={index} className="pie-legend-item">
                  <div className="legend-label-group">
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
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <h3>AI Intelligence Insights</h3>
          </div>
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
        </div>
      </ProGate>


      <style>{`
        .analytics-container { padding-bottom: 40px; }
        
        .analytics-header { 
          display: flex; 
          flex-direction: column; 
          gap: 16px; 
          margin-bottom: 32px; 
        }

        @media (min-width: 768px) {
          .analytics-header { flex-direction: row; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        }

        .header-actions { display: flex; gap: 8px; }
        .date-picker { display: flex; align-items: center; gap: 6px; background: var(--surface-container-low); padding: 6px 12px; border-radius: 8px; border: 1px solid var(--outline-variant); font-size: 13px; font-weight: 600; cursor: pointer; }
        
        .metrics-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 12px; 
          margin-bottom: 32px; 
        }

        @media (min-width: 1024px) {
          .metrics-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; }
        }

        .metric-card { background: var(--surface-container-lowest); padding: 16px; border-radius: 16px; border: 1px solid var(--outline-variant); display: flex; flex-direction: column; gap: 12px; align-items: flex-start; box-shadow: var(--shadow-1); }
        @media (min-width: 640px) {
          .metric-card { flex-direction: row; align-items: center; padding: 20px; }
        }

        .metric-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .metric-label { font-size: 11px; font-weight: 600; color: var(--on-surface-variant); margin-bottom: 4px; display: block; text-transform: uppercase; }
        .metric-value-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .metric-value { font-size: 1.25rem; font-weight: 800; color: var(--on-surface); }
        .metric-trend { font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 2px; padding: 2px 6px; border-radius: 4px; background: var(--surface-container); }
        .metric-trend.up { color: #10b981; background: rgba(16,185,129,0.1); }
        .metric-trend.down { color: var(--error); background: rgba(239,68,68,0.1); }
        
        .charts-grid { 
          display: flex;
          flex-direction: column;
          gap: 24px; 
          margin-bottom: 40px; 
        }

        @media (min-width: 1024px) {
          .charts-grid { 
            display: grid; 
            grid-template-columns: 1fr 320px; 
            gap: 32px; 
          }
        }

        .card-header { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        @media (min-width: 640px) { .card-header { flex-direction: row; justify-content: space-between; align-items: center; } }
        
        .card-header h3 { font-size: 1.1rem; }
        .chart-wrapper { height: 300px; width: 100%; position: relative; margin-top: 10px; }
        .chart-legend { display: flex; gap: 12px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--on-surface-variant); }
        .legend-item span { width: 8px; height: 8px; border-radius: 50%; }
        
        .pie-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .pie-legend-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--outline-variant); }
        .legend-label-group { display: flex; align-items: center; gap: 8px; }
        .pie-legend-item .dot { width: 8px; height: 8px; border-radius: 50%; }
        .pie-legend-item .label { font-size: 13px; color: var(--on-surface-variant); font-weight: 600; }
        .pie-legend-item .value { font-size: 13px; font-weight: 800; color: var(--on-surface); }
        
        .advanced-insights .section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .advanced-insights .section-title h3 { font-size: 1.1rem; }
        
        .pro-gated-card { position: relative; padding: 40px 20px; text-align: center; overflow: hidden; }
        .lock-overlay { position: absolute; inset: 0; z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; background: rgba(255,255,255,0.6); backdrop-filter: blur(4px); }
        .lock-icon-wrapper { width: 48px; height: 48px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: var(--shadow-2); }
        .lock-overlay h3 { margin-bottom: 8px; font-size: 1.1rem; }
        .lock-overlay p { font-size: 13px; color: var(--on-surface-variant); margin-bottom: 20px; max-width: 300px; }
        .blurred-content { filter: blur(6px); opacity: 0.3; pointer-events: none; }
        .mock-insight { height: 80px; background: #e5e7eb; border-radius: 12px; margin-bottom: 16px; }
        
        .insights-grid { 
          display: flex;
          flex-direction: column;
          gap: 16px; 
        }

        @media (min-width: 768px) {
          .insights-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }

        .insight-card { padding: 20px; transition: 0.2s; }
        .insight-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); }
        .insight-header { display: flex; flex-direction: column-reverse; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
        @media (min-width: 480px) { .insight-header { flex-direction: row; justify-content: space-between; align-items: center; } }

        .sentiment-indicator { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
        .sentiment-indicator.positive { background: #d1fae5; color: #065f46; }
        .sentiment-indicator.warning { background: var(--error-container); color: var(--error); }
        .insight-card h4 { margin: 0; font-size: 14px; }
        .insight-card p { font-size: 13px; color: var(--on-surface-variant); line-height: 1.5; margin-bottom: 16px; }
        .insight-footer { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: var(--on-surface-variant); cursor: pointer; transition: 0.2s; }
        .insight-footer:hover { color: var(--primary); }
        
        .desktop-only { display: none; }
        @media (min-width: 640px) { .desktop-only { display: inline; } }
      `}</style>
    </div>
  );
}
