import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3 } from "lucide-react";

export default function Analytics({ conversations, business, onUpgrade }) {
  const isFree = business?.plan === 'free';
  const PRIMARY_COLOR = 'var(--color-primary)';
  const SECONDARY_COLOR = 'var(--color-secondary)';
  const ERROR_COLOR = 'var(--color-error)';
  const COLORS = [PRIMARY_COLOR, SECONDARY_COLOR, ERROR_COLOR];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const volMap = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
  conversations.forEach(conv => { volMap[days[new Date(conv.createdAt).getDay()]]++; });
  const conversationData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({ name: day, count: volMap[day] }));

  const resCounts = { ai: 0, human: 0, unresolved: 0 };
  conversations.forEach(c => {
    if (c.status === 'ai_resolved') resCounts.ai++;
    else if (c.status === 'human_resolved') resCounts.human++;
    else resCounts.unresolved++;
  });
  const totalRes = conversations.length || 1;
  const resolutionData = [
    { name: 'AI Resolved', value: Math.round((resCounts.ai / totalRes) * 100) },
    { name: 'Human Resolved', value: Math.round((resCounts.human / totalRes) * 100) },
    { name: 'Unresolved', value: Math.round((resCounts.unresolved / totalRes) * 100) },
  ];

  const sentCounts = { positive: 0, neutral: 0, negative: 0 };
  conversations.forEach(c => {
    if (c.emotion === 'happy') sentCounts.positive++;
    else if (['angry', 'frustrated', 'urgent'].includes(c.emotion)) sentCounts.negative++;
    else sentCounts.neutral++;
  });
  const totalSent = conversations.length || 1;
  const sentimentStats = [
    { label: 'Positive', value: Math.round((sentCounts.positive / totalSent) * 100), color: SECONDARY_COLOR },
    { label: 'Neutral', value: Math.round((sentCounts.neutral / totalSent) * 100), color: '#f59e0b' },
    { label: 'Negative', value: Math.round((sentCounts.negative / totalSent) * 100), color: ERROR_COLOR },
  ];

  const intentMap = {};
  conversations.forEach(c => {
    const fmt = (c.intent || 'General Query').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    intentMap[fmt] = (intentMap[fmt] || 0) + 1;
  });
  const topIntents = Object.entries(intentMap).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 4);

  const ttStyle = { background: 'white', border: '1px solid var(--color-surface-container)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', padding: '12px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>
            Analytics & Insights
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Deep dive into your AI performance and user sentiment.</p>
        </div>
        {isFree && <button className="btn btn-primary" onClick={onUpgrade}><Sparkles size={16} /> Unlock All Features</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-6)', position: 'relative' }}>
        {isFree && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onUpgrade}>
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)', maxWidth: '400px', boxShadow: 'var(--shadow-2xl)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)', color: 'var(--color-primary)' }}>
                <BarChart3 size={32} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Pro Analytics</h2>
              <p style={{ color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-sm)' }}>Get detailed breakdowns of customer intent, sentiment trends, and automated resolution rates.</p>
              <button className="btn btn-primary">Upgrade to Pro</button>
            </div>
          </div>
        )}

        {/* Volume */}
        <div className="card" style={{ filter: isFree ? 'blur(4px)' : 'none', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-8)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Daily Conversation Volume</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversationData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-container-low)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="count" stroke={PRIMARY_COLOR} strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution */}
        <div className="card" style={{ filter: isFree ? 'blur(4px)' : 'none', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-8)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Resolution Breakdown</h3>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={resolutionData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                  {resolutionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={ttStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {resolutionData.map((item, i) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: COLORS[i] }} />
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>{item.value}%</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-on-surface-muted)' }}>{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="card" style={{ filter: isFree ? 'blur(4px)' : 'none', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-8)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Customer Sentiment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {sentimentStats.map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)' }}>
                  <span style={{ color: 'var(--color-on-surface)' }}>{item.label}</span>
                  <span style={{ color: item.color }}>{item.value}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: item.color, borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Query Categories */}
        <div className="card" style={{ filter: isFree ? 'blur(4px)' : 'none', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-8)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Top Intent Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {topIntents.length > 0 ? topIntents.map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-xl)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-on-surface)' }}>{item.label}</span>
                <span style={{ fontSize: '10px', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{item.count} SESSIONS</span>
              </div>
            )) : (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)' }}>Insufficient data to generate categories.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
