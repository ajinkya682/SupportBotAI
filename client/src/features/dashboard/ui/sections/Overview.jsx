import { MessageSquare, Bot, Activity, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  human_needed: { label: 'Urgent', color: 'var(--color-error)', bg: 'var(--color-error-light)' },
  in_progress: { label: 'In Progress', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  human_resolved: { label: 'Resolved', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  ai_resolved: { label: 'AI Resolved', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
};

export default function Overview({ business, conversations = [], setActiveTab, setSelectedConversationId, onUpgrade }) {
  if (!conversations) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
      <div style={{ width: '24px', height: '24px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const stats = [
    { label: 'Total Conversations', value: business?.conversationCount || conversations?.length || 0, trend: '+12.5%', icon: MessageSquare, positive: true, color: 'var(--color-primary)' },
    { label: 'AI Resolution Rate', value: '84.2%', trend: '+5.2%', icon: Bot, positive: true, color: 'var(--color-secondary)' },
    { label: 'Avg. Response Time', value: '1.2s', trend: '-0.4s', icon: Clock, positive: true, color: '#f59e0b' },
    { label: 'Active Tickets', value: (conversations || []).filter(c => c.status === 'human_needed').length, trend: 'Live', icon: Activity, positive: false, color: 'var(--color-error)' },
  ];

  const handleConversationClick = (id) => {
    setSelectedConversationId(id);
    setActiveTab('conversations');
  };

  const urgentTickets = conversations.filter(c => c.status === 'human_needed');
  const recentConversations = [...conversations]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-1)' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>
          Welcome back! Here's what's happening with your AI assistant today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card" style={{ padding: 'var(--space-6)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-3)' }}>{stat.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: stat.positive ? 'var(--color-secondary)' : 'var(--color-on-surface-muted)' }}>
              <TrendingUp size={14} /> {stat.trend} <span style={{ color: 'var(--color-on-surface-muted)', fontWeight: 'var(--weight-medium)' }}>vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Urgent Tickets */}
          {urgentTickets.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid var(--color-error)', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <AlertCircle size={20} style={{ color: 'var(--color-error)' }} />
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>Urgent Support Needed</h3>
                </div>
                <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '10px', fontWeight: 'var(--weight-bold)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{urgentTickets.length} PENDING</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {urgentTickets.slice(0, 3).map((conv) => (
                  <div key={conv._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', background: '#fee2e244', borderRadius: 'var(--radius-xl)', border: '1px solid #fee2e2' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--weight-bold)' }}>
                      {conv.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>{conv.userName || 'Anonymous'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{new Date(conv.updatedAt).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{conv.messages[conv.messages.length - 1]?.content}</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleConversationClick(conv._id)}>Join</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Recent Activity</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('conversations')}>View All</button>
            </div>
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {recentConversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-on-surface-muted)' }}>
                   <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: 'var(--space-4)' }} />
                   <p style={{ fontSize: 'var(--text-sm)' }}>No activity yet. Your bot is ready!</p>
                </div>
              ) : recentConversations.map(conv => (
                <div 
                  key={conv._id} onClick={() => handleConversationClick(conv._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.2s' }}
                  className="row-hover"
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--weight-bold)' }}>
                    {conv.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>{conv.userName || 'Visitor'}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{new Date(conv.updatedAt).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.messages[conv.messages.length - 1]?.content}</p>
                  </div>
                  <span style={{ 
                    fontSize: '10px', fontWeight: 'var(--weight-bold)', padding: '2px 8px', borderRadius: 'var(--radius-full)', 
                    background: statusConfig[conv.status]?.bg || 'var(--color-surface-container-high)',
                    color: statusConfig[conv.status]?.color || 'var(--color-on-surface-muted)'
                  }}>
                    {(statusConfig[conv.status]?.label || conv.status).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Usage */}
          {business?.plan === 'free' && (
            <div className="card" style={{ background: 'var(--color-primary-light)', border: 'none' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>USAGE LIMITS</h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-2)' }}>{business.conversationCount} of {business.conversationLimit} responses used.</p>
              <div style={{ height: '6px', background: 'white', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
                <div style={{ width: `${(business.conversationCount / business.conversationLimit) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
              </div>
              <button className="btn btn-primary btn-sm btn-block" onClick={onUpgrade}>Upgrade to Pro</button>
            </div>
          )}

          {/* Health */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-6)' }}>SYSTEM STATUS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { label: 'AI Engine', status: 'Operational', ok: true },
                { label: 'Socket Stream', status: 'Live', ok: true },
                { label: 'Intelligence', status: business?.knowledge ? 'Active' : 'Pending', ok: !!business?.knowledge }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-variant)' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: item.ok ? 'var(--color-secondary)' : '#f59e0b' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-6)' }}>QUICK ACTIONS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('training')}>Train AI Assistant</button>
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('appearance')}>Customize Widget</button>
              <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('integration')}>Get Embed Code</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .row-hover:hover { background: var(--color-surface-container-low) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
