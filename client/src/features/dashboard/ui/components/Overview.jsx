import { 
  MessageSquare, 
  Bot, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight,
  UserCheck,
  Zap,
  Activity,
  Users,
  CheckCircle2,
  Sparkles,
  Code2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function Overview({ business, conversations = [], setActiveTab, setSelectedConversationId, onUpgrade }) {
  if (!conversations) return <div className="p-4">Loading operational data...</div>;

  const stats = [
    { 
      label: 'Network Volume', 
      value: business?.conversationCount || conversations?.length || 0, 
      trend: '+12.5%', 
      icon: MessageSquare,
      color: 'var(--primary)'
    },
    { 
      label: 'Resolution Efficiency', 
      value: '84.2%', 
      trend: '+5.2%', 
      icon: Bot,
      color: '#10b981'
    },
    { 
      label: 'System Latency', 
      value: '1.2s', 
      trend: '-0.4s', 
      icon: Zap,
      color: '#f59e0b'
    },
    { 
      label: 'Active Escalations', 
      value: (conversations || []).filter(c => c.status === 'human_needed').length, 
      trend: '-2', 
      icon: Activity,
      color: 'var(--error)'
    },
  ];

  const handleConversationClick = (id) => {
    setSelectedConversationId(id);
    setActiveTab('conversations');
  };

  const activeChats = conversations.filter(c => {
    const isResolved = c.status === 'human_resolved' || c.status === 'ai_resolved';
    if (isResolved) return false;
    
    const lastUpdate = new Date(c.updatedAt).getTime();
    const now = new Date().getTime();
    return (now - lastUpdate) < 1 * 60 * 1000;
  });

  return (
    <div className="animate-fade-in">
      {/* Live Operational Status */}
      {activeChats.length > 0 && (
        <div className="section-spacing">
          <div className="live-status-header">
            <div className="live-pulse"></div>
            <h3>Operational Live Stream ({activeChats.length})</h3>
          </div>
          <div className="live-sessions-grid">
            {activeChats.map(chat => (
              <motion.div 
                key={chat._id}
                whileHover={{ y: -4, boxShadow: 'var(--shadow-overlay)' }}
                onClick={() => handleConversationClick(chat._id)}
                className="live-session-card card"
              >
                <div className="session-user">{chat.userName || 'Anonymous Node'}</div>
                <div className="session-preview">
                  {chat.messages[chat.messages.length - 1]?.content}
                </div>
                <div className="session-footer">
                  <span className="chip chip-success" style={{ fontSize: '10px' }}>Active</span>
                  <span className="session-time">{new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="stats-grid section-spacing">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            className="card metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="metric-header">
              <span className="label">{stat.label}</span>
              <div className="metric-icon" style={{ color: stat.color, background: `${stat.color}10` }}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className="display-stat">{stat.value}</div>
            <div className={`metric-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
              {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : null}
              {stat.trend} <span style={{ opacity: 0.6, fontWeight: 400 }}>vs prev period</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="overview-main-grid">
        {/* Activity Intelligence Panel */}
        <div className="card activity-panel">
          <div className="panel-header">
            <div>
              <h3>Neural Activity Stream</h3>
              <p>Real-time telemetry from AI-customer interactions.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveTab('conversations')}>Full Logs</button>
          </div>
          
          <div className="activity-stream">
            <AnimatePresence mode="popLayout">
              {conversations.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare size={40} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p>Awaiting initial system telemetry...</p>
                </div>
              ) : [...conversations]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, 6)
                .map((conv, idx) => {
                  const initials = (conv.userName || 'U').charAt(0).toUpperCase();
                  const avatarColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                  const color = avatarColors[initials.charCodeAt(0) % avatarColors.length];

                  return (
                    <motion.div
                      key={conv._id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="activity-row"
                      onClick={() => { setSelectedConversationId(conv._id); setActiveTab('conversations'); }}
                    >
                      <div className="row-avatar" style={{ background: `${color}10`, color: color }}>
                        {initials}
                      </div>
                      
                      <div className="row-content">
                        <div className="row-header">
                          <span className="user-identity">{conv.userName || 'Visitor Node'}</span>
                          <span className="row-time">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="row-preview">{conv.messages[conv.messages.length - 1]?.content || 'Initializing...'}</p>
                      </div>

                      <div className="row-status">
                         <span className={`chip chip-${conv.status === 'human_needed' ? 'error' : 'pending'}`}>
                          {conv.status?.replace('_', ' ')}
                         </span>
                         {conv.isAiActive && (
                           <div className="ai-label">
                             <Sparkles size={10} />
                             <span>AI Guided</span>
                           </div>
                         )}
                      </div>
                    </motion.div>
                  );
                })
              }
            </AnimatePresence>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="intelligence-sidebar">
          {business?.plan === 'free' && (
            <div className="card upgrade-card ai-enhanced">
              <h4 className="element-spacing">Resource Usage</h4>
              <p className="block-spacing">You are using <strong>{business.conversationCount}</strong> of <strong>{business.conversationLimit}</strong> neural slots.</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(business.conversationCount / business.conversationLimit) * 100}%` }}></div>
              </div>
              <button className="btn btn-primary btn-block" style={{ marginTop: '24px' }} onClick={onUpgrade}>
                Expand Intelligence <Sparkles size={14} className="ai-sparkle" />
              </button>
            </div>
          )}
          
          <div className="card system-health">
            <div className="health-top">
              <span>Cluster Status</span>
              <span className="status-ok">Operational</span>
            </div>
            <div className="health-bar-bg">
              <div className="health-bar-fill"></div>
            </div>
            <div className="health-metrics">
              <span>99.9% Uptime</span>
              <span>1.2s Latency</span>
            </div>
          </div>

          <div className="card quick-intelligence">
            <h4 className="block-spacing">Quick Actions</h4>
            <div className="action-stack">
              <button className="action-button" onClick={() => setActiveTab('training')}>
                <Bot size={16} /> Neural Training
              </button>
              <button className="action-button" onClick={() => setActiveTab('integration')}>
                <Code2 size={16} /> Deploy Widget
              </button>
              <button className="action-button" onClick={() => setActiveTab('team')}>
                <Users size={16} /> Cluster Nodes
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .live-status-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .live-pulse { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .live-status-header h3 { font-size: var(--text-label-sm); font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .live-sessions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .live-session-card { cursor: pointer; border-color: #22c55e33; }
        .session-user { font-weight: 700; font-size: var(--text-body-sm); color: var(--on-surface); margin-bottom: 4px; }
        .session-preview { font-size: 0.8rem; color: var(--on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .session-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
        .session-time { font-size: 0.7rem; color: var(--outline); font-weight: 500; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .metric-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .metric-icon { padding: 10px; border-radius: 12px; }
        .metric-trend { font-size: var(--text-label-sm); font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 12px; }
        .metric-trend.up { color: #10b981; }
        .metric-trend.down { color: var(--error); }
        
        .overview-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 32px; }
        .panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .panel-header p { font-size: var(--text-body-sm); color: var(--on-surface-variant); margin-top: 4px; }
        
        .activity-stream { display: flex; flex-direction: column; gap: 12px; }
        .activity-row { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 14px; border: 1px solid var(--surface-container-highest); transition: var(--transition-fast); cursor: pointer; }
        .activity-row:hover { border-color: var(--primary); background: var(--surface-container-low); }
        .row-avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .row-content { flex: 1; min-width: 0; }
        .row-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .user-identity { font-weight: 700; font-size: var(--text-body-sm); }
        .row-time { font-size: 0.75rem; color: var(--outline); }
        .row-preview { font-size: var(--text-body-sm); color: var(--on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
        .row-status { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .ai-label { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700; color: var(--primary); }
        
        .progress-track { height: 6px; background: var(--surface-container-high); border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); border-radius: 3px; }
        .system-health { margin-bottom: 16px; }
        .health-top { display: flex; justify-content: space-between; font-size: var(--text-label-sm); font-weight: 600; margin-bottom: 12px; }
        .status-ok { color: #10b981; }
        .health-bar-bg { height: 4px; background: var(--surface-container-high); border-radius: 2px; margin-bottom: 12px; }
        .health-bar-fill { width: 100%; height: 100%; background: #10b981; border-radius: 2px; }
        .health-metrics { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--outline); font-weight: 500; }
        
        .action-stack { display: flex; flex-direction: column; gap: 8px; }
        .action-button { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--radius-btn-input); border: 1px solid var(--outline-variant); background: white; color: var(--on-surface); font-weight: 600; font-size: var(--text-body-sm); cursor: pointer; transition: var(--transition-fast); text-align: left; width: 100%; }
        .action-button:hover { border-color: var(--primary); background: var(--surface-container-low); color: var(--primary); }
      `}</style>
    </div>
  );
}
