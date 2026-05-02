import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Building2, Users, MessageSquare, Ticket, Activity, Zap, CreditCard, Clock, Loader2, TrendingUp, ChevronRight } from 'lucide-react';
import io from 'socket.io-client';
import ConversationViewer from '../components/ConversationViewer';
import { API_URL } from '../../../../shared/services/config';
import { motion } from 'framer-motion';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('superAdminToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [statsRes, activityRes, chartRes] = await Promise.all([
          axios.get(`${API_URL}/api/super-admin/overview/stats`, config),
          axios.get(`${API_URL}/api/super-admin/overview/activity`, config),
          axios.get(`${API_URL}/api/super-admin/overview/chart-data`, config),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (activityRes.data.success) setActivities(activityRes.data.activities);
        if (chartRes.data.success) setChartData(chartRes.data.chartData);
      } catch (error) {
        console.error('Error fetching overview data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const socket = io(API_URL);
    socket.on('new_message', fetchData);
    socket.on('agent_status_changed', fetchData);
    return () => socket.disconnect();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Businesses', value: stats.totalBusinesses, icon: Building2, color: 'var(--color-primary)' },
    { label: 'Free Plan', value: stats.freeBusinesses, icon: Clock, color: 'var(--color-on-surface-muted)' },
    { label: 'Pro Plan', value: stats.proBusinesses, icon: CreditCard, color: '#f59e0b' },
    { label: 'Total Agents', value: stats.totalAgents, icon: Users, color: 'var(--color-secondary)' },
    { label: 'Total Conversations', value: stats.totalConversations, icon: MessageSquare, color: 'var(--color-primary)' },
    { label: 'Total Tickets', value: stats.totalTickets, icon: Ticket, color: 'var(--color-error)' },
    { label: 'Active Sessions', value: stats.activeConversations, icon: Activity, color: 'var(--color-secondary)' },
    { label: 'Messages Today', value: stats.messagesSentToday, icon: Zap, color: '#f59e0b' },
  ];

  const ttStyle = { background: 'white', border: '1px solid var(--color-surface-container)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', padding: '12px' };

  const activityIcon = (type) => {
    if (type === 'new_business') return <Building2 size={16} />;
    if (type === 'ticket_created') return <Ticket size={16} />;
    if (type === 'conversation_resolved') return <Activity size={16} />;
    return <MessageSquare size={16} />;
  };

  const activityColor = (type) => {
    if (type === 'new_business') return 'var(--color-primary)';
    if (type === 'ticket_created') return 'var(--color-error)';
    if (type === 'conversation_resolved') return 'var(--color-secondary)';
    return 'var(--color-primary)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>SuperAdmin Command Center</h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Real-time platform metrics and ecosystem activity.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)' }}>
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-xl)', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>{(stat.value || 0).toLocaleString()}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Growth Trend</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
              <TrendingUp size={14} /> +12% MoM
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-container-low)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                <RechartsTooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="newBusinesses" name="New Businesses" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-8)' }}>Platform Engagement</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-container-low)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                <RechartsTooltip contentStyle={ttStyle} cursor={{ fill: 'var(--color-surface-container-low)' }} />
                <Bar dataKey="newConversations" name="Daily Chats" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-surface-container-low)', background: 'var(--color-surface-container-lowest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Global Activity Stream</h3>
          <button className="btn btn-ghost btn-sm">Refresh Log</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activities.length === 0 ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-on-surface-muted)' }}>No recent activity detected.</div>
          ) : activities.map((activity) => {
            const isConv = activity.id.startsWith('conv_');
            const convId = isConv ? activity.id.replace('conv_', '') : null;
            const color = activityColor(activity.type);
            return (
              <div
                key={activity.id}
                onClick={() => { if (isConv) setSelectedConversation(convId); }}
                style={{ 
                  padding: 'var(--space-5) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  borderBottom: '1px solid var(--color-surface-container-low)', cursor: isConv ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
                className={isConv ? "activity-row-hover" : ""}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activityIcon(activity.type)}
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)', textTransform: 'capitalize' }}>
                      {activity.type.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)' }}>{activity.businessName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-on-surface-muted)' }}>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                  {isConv && <ChevronRight size={16} style={{ color: 'var(--color-on-surface-muted)' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedConversation && (
        <ConversationViewer conversationId={selectedConversation} onClose={() => setSelectedConversation(null)} />
      )}

      <style>{`
        .activity-row-hover:hover { background: var(--color-surface-container-low) !important; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Overview;
