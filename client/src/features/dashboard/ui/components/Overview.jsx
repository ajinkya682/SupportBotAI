import { 
  MessageSquare, 
  Bot, 
  ArrowUpRight,
  Zap,
  Activity,
  Users,
  Sparkles,
  Code2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TicketCard from './TicketCard';
import { Ticket, Stamp, CheckCircle2, Trash2 } from 'lucide-react';
import socket from "../../../../shared/services/socket";

export default function Overview({ business, conversations = [], agents = [], setActiveTab, setSelectedConversationId, onUpgrade }) {
  if (!conversations) return <div className="loading-state">Synchronizing operational data...</div>;

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

  const pendingTickets = (conversations || []).filter(
    c => c.routingStatus === 'pending' || c.routingStatus === 'holding' || (c.status === 'human_needed' && !c.assignedAgentId)
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleTakeOver = (ticket) => {
    socket.emit('join_conversation', {
      conversationId: ticket._id,
      agentId: business.owner,
      ownerId: business.owner
    });
    setActiveTab('conversations');
    setSelectedConversationId(ticket._id);
  };

  return (
    <div className="animate-fade-in">
      {/* The unassigned-alert is replaced by the Pending Queue below */}
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
                  <div className="sf-left">
                    <span className="chip chip-success" style={{ fontSize: '10px' }}>Active</span>
                    {chat.agent && (
                      <div className="session-agent-tag">
                        <div className="sat-avatar">
                          {chat.agent.profilePhoto ? <img src={chat.agent.profilePhoto} alt="" /> : chat.agent.displayName?.charAt(0)}
                        </div>
                        <span>{chat.agent.displayName || chat.agent.name}</span>
                      </div>
                    )}
                  </div>
                  <span className="session-time">{new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {pendingTickets.length > 0 && (
        <div className="pending-queue-section animate-fade-in section-spacing">
          <div className="pq-header">
            <h3><Ticket size={22} color="var(--primary)" /> Smart Routing Queue</h3>
            <div className="pq-header-right">
              <span className="pq-badge">{pendingTickets.length} Customer{pendingTickets.length > 1 ? 's' : ''} Waiting</span>
              {agents.filter(a => a.status === 'online' || a.status === 'in_conversation').length === 0 && (
                <span className="pq-offline-warning">⚠️ No Agents Online</span>
              )}
            </div>
          </div>
          <p className="pq-desc">These requests are currently queued because agents are either offline or busy. As an owner, you can intercept these tickets to provide instant support.</p>
          
          <div className="pq-grid">
            {pendingTickets.map(ticket => (
              <TicketCard 
                key={ticket._id} 
                ticket={ticket} 
                onTakeOver={handleTakeOver} 
              />
            ))}
          </div>
        </div>
      )}

      {/* No Agents Online Banner - Only show if queue is empty to avoid clutter */}
      {pendingTickets.length === 0 && agents.length > 0 && agents.filter(a => a.status === 'online' || a.status === 'in_conversation').length === 0 && (
        <div className="no-agents-banner animate-fade-in">
          <div className="nab-icon">🔴</div>
          <div className="nab-content">
             <h4>All Support Agents are Offline</h4>
             <p>Your team is currently offline. New customer escalations will appear in your queue here.</p>
          </div>
          <div className="nab-actions">
            <button className="nab-refresh" onClick={() => dispatch(getConversations())} title="Check status">
              <Activity size={16} />
            </button>
            <button className="nab-btn" onClick={() => setActiveTab('team')}>Manage Team</button>
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
              {stat.trend} <span className="trend-vs">vs prev period</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="overview-main-grid">
        {/* Activity Intelligence Panel */}
        <div className="card activity-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>Neural Activity Stream</h3>
              <p>Real-time telemetry from AI interactions.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('conversations')}>Full Logs</button>
          </div>
          
          <div className="activity-stream">
            <AnimatePresence mode="popLayout">
              {conversations.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare size={40} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p>Awaiting system telemetry...</p>
                </div>
              ) : [...conversations]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, 6)
                .map((conv) => {
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
                          <span className="user-identity">{conv.userName || 'Visitor'}</span>
                          <span className="row-time">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="row-preview">{conv.messages[conv.messages.length - 1]?.content || 'Initializing...'}</p>
                      </div>

                      <div className="row-status">
                         <span className={`chip chip-${conv.status === 'human_needed' ? 'error' : 'pending'}`}>
                          {conv.status?.replace('_', ' ')}
                         </span>
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
              <p className="block-spacing">Using <strong>{business.conversationCount}</strong> of <strong>{business.conversationLimit}</strong> slots.</p>
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

      {/* Agent Status Grid */}
      {agents.length > 0 && (
        <div className="section-spacing">
          <div className="section-header-row">
            <h3 className="section-title">Support Team</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('team')}>Manage Team</button>
          </div>
          <div className="agent-grid">
            {agents.map(agent => {
              const statusLabel = agent.status === 'in_conversation' ? 'Busy' :
                agent.status === 'online' ? 'Online' :
                agent.status === 'away' ? 'Away' : 'Offline';
              const statusColor = agent.status === 'online' ? '#10b981' :
                agent.status === 'in_conversation' ? '#f59e0b' :
                agent.status === 'away' ? '#f59e0b' : '#94a3b8';
              return (
                <div key={agent._id} className="agent-status-card">
                  <div className="agent-avatar-wrap">
                    {agent.profilePhoto
                      ? <img src={agent.profilePhoto} alt={agent.displayName} className="agent-photo" />
                      : <div className="agent-initials" style={{background: `${statusColor}22`, color: statusColor}}>
                          {(agent.displayName || agent.name || 'A').charAt(0).toUpperCase()}
                        </div>
                    }
                    <span className="agent-status-dot" style={{background: statusColor}} />
                  </div>
                  <div className="agent-info">
                    <div className="agent-name">{agent.displayName || agent.name}</div>
                    <div className="agent-role">{agent.roleTitle || 'Support Agent'}</div>
                  </div>
                  <span className="agent-badge" style={{color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}33`}}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .live-status-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .live-pulse { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .live-status-header h3 { font-size: 11px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .live-sessions-grid { 
          display: grid; 
          grid-template-columns: 1fr;
          gap: 12px; 
        }

        @media (min-width: 640px) {
          .live-sessions-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        }

        .live-session-card { cursor: pointer; border-color: #22c55e33; padding: 16px; }
        .session-user { font-weight: 700; font-size: 14px; color: var(--on-surface); margin-bottom: 4px; }
        .session-preview { font-size: 13px; color: var(--on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .session-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
        .session-time { font-size: 11px; color: var(--outline); font-weight: 500; }
        
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 12px; 
        }

        @media (min-width: 900px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; }
        }

        .metric-card { padding: 16px; }
        @media (min-width: 768px) { .metric-card { padding: 24px; } }

        .metric-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .metric-icon { padding: 8px; border-radius: 10px; }
        .label { font-size: 12px; font-weight: 600; color: var(--outline); text-transform: uppercase; }
        
        .metric-trend { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 12px; flex-wrap: wrap; }
        .metric-trend.up { color: #10b981; }
        .metric-trend.down { color: var(--error); }
        .trend-vs { opacity: 0.6; font-weight: 400; display: none; }
        @media (min-width: 640px) { .trend-vs { display: inline; } }
        
        .overview-main-grid { 
          display: flex;
          flex-direction: column;
          gap: 24px; 
        }

        @media (min-width: 800px) {
          .overview-main-grid { 
            display: grid; 
            grid-template-columns: 1fr 320px; 
            gap: 32px; 
          }
        }

        .activity-panel { padding: 16px; min-width: 0; }
        @media (min-width: 768px) { .activity-panel { padding: 32px; } }

        .panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; }
        .panel-title-group h3 { font-size: 1.25rem; }
        .panel-header p { font-size: 13px; color: var(--on-surface-variant); margin-top: 4px; line-height: 1.4; }
        
        .activity-stream { 
          display: flex; 
          flex-direction: column; 
          gap: 10px; 
          max-height: 480px; 
          overflow-y: auto; 
          padding-right: 6px;
        }

        .activity-stream::-webkit-scrollbar { width: 5px; }
        .activity-stream::-webkit-scrollbar-track { background: transparent; }
        .activity-stream::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; transition: 0.2s; }
        .activity-stream::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .activity-row { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 12px; 
          border-radius: 12px; 
          border: 1px solid var(--surface-container-highest); 
          transition: var(--transition-fast); 
          cursor: pointer; 
          width: 100%;
        }

        @media (min-width: 768px) {
          .activity-row { gap: 16px; padding: 16px; }
        }

        .activity-row:hover { border-color: var(--primary); background: var(--surface-container-low); }
        .row-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .row-content { flex: 1; min-width: 0; max-width: 70%; }
        .row-header { display: flex; justify-content: space-between; margin-bottom: 2px; align-items: baseline; }
        .user-identity { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .row-time { font-size: 11px; color: var(--outline); flex-shrink: 0; }
        .row-preview { 
          font-size: 13px; 
          color: var(--on-surface-variant); 
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          margin: 0; 
          line-height: 1.5; 
          width: 100%;
        }
        
        .row-status { display: none; }
        @media (min-width: 480px) { .row-status { display: flex; align-items: flex-end; flex-shrink: 0; } }
        
        .intelligence-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .progress-track { height: 6px; background: var(--surface-container-high); border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); border-radius: 3px; }
        
        .health-top { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
        .status-ok { color: #10b981; }
        .health-bar-bg { height: 4px; background: var(--surface-container-high); border-radius: 2px; margin-bottom: 12px; }
        .health-bar-fill { width: 100%; height: 100%; background: #10b981; border-radius: 2px; }
        .health-metrics { display: flex; justify-content: space-between; font-size: 11px; color: var(--outline); font-weight: 500; }
        
        .action-stack { display: grid; grid-template-columns: 1fr; gap: 8px; }
        @media (min-width: 480px) and (max-width: 1023px) {
          .action-stack { grid-template-columns: repeat(3, 1fr); }
        }

        .action-button { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px; border: 1px solid var(--outline-variant); background: white; color: var(--on-surface); font-weight: 600; font-size: 13px; cursor: pointer; transition: var(--transition-fast); text-align: left; width: 100%; min-height: 44px; }
        .action-button:hover { border-color: var(--primary); background: var(--surface-container-low); color: var(--primary); }

        .unassigned-alert { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 16px 20px; }
        .ua-left { display: flex; align-items: center; gap: 14px; }
        .ua-icon { font-size: 1.5rem; }
        .ua-title { font-weight: 700; color: #c2410c; font-size: 0.95rem; }
        .ua-sub { font-size: 0.78rem; color: #9a3412; margin-top: 2px; }

        .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-title { font-size: 1rem; font-weight: 700; color: var(--on-surface); }

        .agent-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 640px) { .agent-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .agent-grid { grid-template-columns: repeat(3, 1fr); } }

        .agent-status-card { display: flex; align-items: center; gap: 14px; background: white; border: 1px solid var(--outline-variant); border-radius: 14px; padding: 14px 16px; transition: 0.2s; }
        .agent-status-card:hover { box-shadow: var(--shadow-raised); transform: translateY(-2px); }
        .agent-avatar-wrap { position: relative; flex-shrink: 0; }
        .agent-photo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--outline-variant); }
        .agent-initials { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
        .agent-status-dot { position: absolute; bottom: 1px; right: 1px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; }
        .agent-info { flex: 1; min-width: 0; }
        .agent-name { font-weight: 700; font-size: 0.9rem; color: var(--on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .agent-role { font-size: 0.75rem; color: var(--on-surface-variant); margin-top: 2px; }
        .agent-badge { font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 20px; white-space: nowrap; text-transform: uppercase; }

        .no-agents-banner { display: flex; align-items: center; gap: 20px; background: #fff5f5; border: 1.5px solid #feb2b2; border-radius: 16px; padding: 20px 24px; margin-bottom: 32px; }
        .nab-icon { font-size: 1.5rem; }
        .nab-content { flex: 1; }
        .nab-content h4 { margin: 0 0 4px; font-weight: 800; color: #9b2c2c; font-size: 1rem; }
        .nab-content p { margin: 0; font-size: 0.88rem; color: #c53030; font-weight: 500; }
        .nab-btn { background: #c53030; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .nab-btn:hover { background: #9b2c2c; }
        
        .nab-actions { display: flex; align-items: center; gap: 8px; }
        .nab-refresh { background: white; border: none; color: #c53030; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .nab-refresh:hover { background: #fee2e2; transform: rotate(30deg); }

        .pending-queue-section {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid var(--outline-variant);
        }

        .pq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .pq-header-right { display: flex; align-items: center; gap: 12px; }
        .pq-offline-warning { font-size: 0.7rem; font-weight: 800; color: #ef4444; background: #fee2e2; padding: 4px 10px; border-radius: 8px; animation: pq-blink 2s infinite; text-transform: uppercase; letter-spacing: 0.05em; }
        @keyframes pq-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

        .pq-header h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--on-surface);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pq-badge {
          background: var(--primary-fixed);
          color: var(--primary);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .pq-desc {
          font-size: 0.9rem;
          color: var(--on-surface-variant);
          margin-bottom: 24px;
          max-width: 700px;
        }

        .pq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 1024px) {
          .pq-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1440px) {
          .pq-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .sf-left { display: flex; align-items: center; gap: 8px; }
        .session-agent-tag { display: flex; align-items: center; gap: 6px; background: #f0fdf4; border: 1px solid #d1fae5; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; color: #065f46; }
        .sat-avatar { width: 14px; height: 14px; border-radius: 50%; overflow: hidden; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; }
        .sat-avatar img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </div>
  );
}
