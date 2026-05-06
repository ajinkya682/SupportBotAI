import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bot, 
  LogOut, 
  User, 
  CheckCircle2, 
  ChevronRight,
  Activity,
  History,
  Menu,
  X,
  Clock,
  Bell
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "../../../auth/state/authSlice";
import { getBusiness } from "../../state/businessSlice";
import { getConversations } from "../../../conversations/state/conversationSlice";
import Conversations from "./Conversations";
import socket from "../../../../shared/services/socket";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import NotificationBell from "./NotificationBell";
import Notifications from "./Notifications";
import AgentProfileSetup from "./AgentProfileSetup";

export default function AgentDashboard({ user }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [business, setBusiness] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const profileDoneKey = `profile_setup_done_${user?._id}`;
  const [showProfileSetup, setShowProfileSetup] = useState(
    !user?.displayName && !localStorage.getItem(profileDoneKey)
  );

  const dismissProfileSetup = () => {
    localStorage.setItem(profileDoneKey, '1');
    setShowProfileSetup(false);
  };
  const { conversations: reduxConversations } = useSelector((state) => state.conversations);

  useEffect(() => {
    dispatch(getConversations());
    fetchBusinessData();
  }, [dispatch]);

  useEffect(() => {
    if (reduxConversations.length > 0) {
      setConversations(reduxConversations);
    }
  }, [reduxConversations]);

  const fetchBusinessData = async () => {
    try {
      const response = await dispatch(getBusiness()).unwrap();
      setBusiness(response);
    } catch (err) {
      console.error("Failed to load business data", err);
    }
  };

  const [agentStatus, setAgentStatus] = useState('online');

  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    // Use userId key so server joins agent_${userId} room correctly
    socket.emit("join_room", { ownerId: user.ownerId, role: "agent", userId: user._id });
    // Announce online status
    socket.emit("agent_status_change", { agentId: user._id, status: 'online', ownerId: user.ownerId });

    // Heartbeat every 30s to keep status alive
    const heartbeat = setInterval(() => {
      socket.emit("agent_heartbeat", { agentId: user._id });
    }, 30000);

    socket.on("agent_assigned", (conv) => {
      toast.success(`🎯 Ticket assigned to you from ${conv.userName || 'Anonymous'}`);
      setConversations(prev => {
        const exists = prev.find(c => c._id === conv._id);
        if (exists) return prev.map(c => c._id === conv._id ? conv : c);
        return [conv, ...prev];
      });
    });

    socket.on("new_ticket", (newConv) => {
      setConversations(prev => {
        const exists = prev.find(c => c._id === newConv._id);
        if (exists) return prev.map(c => c._id === newConv._id ? newConv : c);
        return [newConv, ...prev];
      });
    });

    socket.on("new_message", (data) => {
      setConversations(prev => prev.map(conv => {
        if (conv._id !== data.conversationId) return conv;
        const newMsg = {
          role: data.senderType === 'user' ? 'user' : 'assistant',
          content: data.content,
          timestamp: data.timestamp || new Date(),
          senderType: data.senderType,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
        };
        const last = conv.messages[conv.messages.length - 1];
        if (last && last.content === data.content) return conv;
        return { ...conv, messages: [...conv.messages, newMsg], updatedAt: new Date() };
      }));
    });

    socket.on("agent_joined", (data) => {
      setConversations(prev => prev.map(conv => {
        if (conv._id !== data.conversationId) return conv;
        return { ...conv, status: 'in_progress', isAiActive: false, agent: data.agent,
          messages: data.messages || conv.messages };
      }));
    });

    socket.on("ticket_resolved", (data) => {
      setConversations(prev => prev.map(conv => {
        if (conv._id !== data.conversationId) return conv;
        return { ...conv, status: 'human_resolved', updatedAt: new Date(),
          messages: data.messages || conv.messages };
      }));
      toast.success(`✅ Ticket resolved`);
    });

    socket.on("conversation_claimed", (data) => {
      setConversations(prev => prev.map(conv =>
        conv._id === data.conversationId ? { ...conv, routingStatus: 'assigned', assignedAgentId: data.agentId } : conv
      ));
    });

    return () => {
      clearInterval(heartbeat);
      socket.emit("agent_status_change", { agentId: user._id, status: 'offline', ownerId: user.ownerId });
      socket.off("agent_assigned");
      socket.off("new_ticket");
      socket.off("new_message");
      socket.off("agent_joined");
      socket.off("ticket_resolved");
      socket.off("conversation_claimed");
      socket.disconnect();
    };
  }, [user?._id]);

  const handleStatusChange = (newStatus) => {
    setAgentStatus(newStatus);
    socket.emit("agent_status_change", { agentId: user._id, status: newStatus, ownerId: user.ownerId });
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Agent Console' },
    { id: 'conversations', icon: MessageSquare, label: 'Live Inbox', badge: conversations.filter(c => c.status === 'human_needed' && !c.agent).length },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'history', icon: History, label: 'Session Archive' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'conversations':
        return (
          <div className="agent-chat-wrapper">
            <Conversations 
              conversations={conversations} 
              isAgentView={true} 
              socket={socket}
              onConversationsUpdate={setConversations}
              ownerInfo={business ? {
                businessLogo: business.appearance?.companyLogo,
              } : null}
            />
          </div>
        );
      case 'overview':
        const agentStats = [
          { 
            label: 'Assigned Chats', 
            value: conversations.filter(c => c.agent?._id === user._id).length, 
            icon: MessageSquare, 
            color: 'var(--primary)' 
          },
          { 
            label: 'Waiting for You', 
            value: conversations.filter(c => c.status === 'human_needed' && !c.agent).length, 
            icon: Clock, 
            color: '#ef4444',
            alert: conversations.filter(c => c.status === 'human_needed' && !c.agent).length > 0
          },
          { 
            label: 'Resolved Today', 
            value: 12, 
            icon: CheckCircle2, 
            color: '#10b981' 
          }
        ];

        return (
          <div className="agent-overview animate-fade-in">
             <div className="ag-stats-grid">
               {agentStats.map((stat, i) => (
                 <motion.div 
                   key={i} 
                   className={`ag-stat-card ${stat.alert ? 'stat-alert' : ''}`}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                 >
                   <div className="ag-stat-header">
                     <div className="ag-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                       <stat.icon size={20} />
                     </div>
                     {stat.alert && <span className="ag-stat-badge">PRIORITY</span>}
                   </div>
                   <div className="ag-stat-body">
                     <span className="ag-stat-label">{stat.label}</span>
                     <h2 className="ag-stat-value">{stat.value}</h2>
                   </div>
                 </motion.div>
               ))}
             </div>
             
             <div className="card active-now">
               <div className="card-header">
                 <h3><Activity size={18} /> My Active Workload</h3>
               </div>
               <div className="workload-list">
                 {conversations.filter(c => c.agent?._id === user._id && c.status === 'in_progress').map(conv => (
                   <div key={conv._id} className="workload-item" onClick={() => switchTab('conversations')}>
                     <div className="workload-info">
                       <div className="user-icon"><User size={16} /></div>
                       <div className="workload-text">
                         <div className="name">{conv.userName || 'Anonymous'}</div>
                         <div className="preview">{conv.messages[conv.messages.length - 1]?.content}</div>
                       </div>
                     </div>
                     <ChevronRight size={18} color="var(--outline)" className="chevron" />
                   </div>
                 ))}
                 {conversations.filter(c => c.agent?._id === user._id && c.status === 'in_progress').length === 0 && (
                   <div className="empty-workload">
                     <CheckCircle2 size={32} color="#10b981" />
                     <p>All caught up! No active chats assigned to you.</p>
                   </div>
                 )}
               </div>
             </div>
          </div>
        );
      case 'notifications':
        return <Notifications />;
      default: return (
        <div className="empty-workload">
          <div className="empty-icon-wrap">
            <History size={48} />
          </div>
          <h3>Session Archive</h3>
          <p>This feature is coming soon. You'll be able to review all past customer interactions here.</p>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-root ag-layout">
      {showProfileSetup && (
        <AgentProfileSetup
          user={user}
          onComplete={() => dismissProfileSetup()}
          onDismiss={() => dismissProfileSetup()}
        />
      )}
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            className="ag-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Enterprise Sidebar */}
      <aside className={`ag-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="ag-sidebar-header">
          <div className="ag-header-main">
            <div className="ag-logo-wrapper">
              <Bot size={20} color="white" />
            </div>
            <div>
              <h3>Agent Pro</h3>
              <span>Support Console</span>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} color="var(--outline)" />
          </button>
        </div>
        
        <nav className="ag-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                className={`ag-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="ag-icon" />
                <span>{item.label}</span>
                {item.badge > 0 && <span className="nav-badge-pill">{item.badge}</span>}
                {isActive && <motion.div layoutId="ag-active-pill" className="active-pill desktop-only" />}
              </button>
            );
          })}
        </nav>

        <div className="ag-sidebar-footer">
          <button onClick={onLogout} className="ag-logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ag-main-content">
        <header className="ag-top-bar">
          <div className="ag-top-bar-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="ag-breadcrumb">
              <span className="ag-root desktop-only">Support</span>
              <ChevronRight size={14} className="ag-sep desktop-only" />
              <span className="ag-current">
                {activeTab === 'conversations' ? 'Live Inbox' : (activeTab === 'overview' ? 'Console' : 'Archive')}
              </span>
            </div>
          </div>
          
          <div className="ag-top-actions">
            <div className="ag-status-select">
              <span className={`ag-status-dot-sm ${agentStatus}`} />
              <select value={agentStatus} onChange={e => handleStatusChange(e.target.value)}
                className="ag-status-dd">
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="ag-notification-wrap">
              <NotificationBell onViewAll={() => switchTab('notifications')} />
            </div>
            <div className="ag-profile">
               <div className="profile-text desktop-only">
                 <span className="name">{user.name}</span>
                 <span className="role">{user.roleTitle || 'Support Agent'}</span>
               </div>
               <div className="avatar">
                 {user.profilePhoto ? <img src={user.profilePhoto} alt="" /> : user.name.charAt(0)}
               </div>
            </div>
          </div>
        </header>
        
        <main className={`ag-viewport ${activeTab === 'conversations' ? 'no-pad' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .ag-layout { 
          background: var(--surface); 
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        @media (min-width: 1024px) {
          .ag-layout { flex-direction: row; }
        }

        .ag-sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 90;
        }

        @media (min-width: 1024px) {
          .ag-sidebar-overlay { display: none; }
        }

        .ag-sidebar { 
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          width: 280px; 
          background: white; 
          border-right: 1px solid var(--outline-variant);
          display: flex; 
          flex-direction: column; 
          padding: 24px 16px; 
          z-index: 100; 
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ag-sidebar.open { transform: translateX(0); }

        @media (min-width: 1024px) {
          .ag-sidebar {
            position: static;
            width: 300px;
            transform: none;
            padding: 32px 16px;
          }
        }

        .ag-sidebar-header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          padding: 0 16px; 
          margin-bottom: 32px; 
        }

        @media (min-width: 1024px) { .ag-sidebar-header { margin-bottom: 48px; } }

        .ag-header-main { display: flex; align-items: center; gap: 16px; }
        .ag-logo-wrapper { width: 40px; height: 40px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(53, 37, 205, 0.3); }
        .ag-sidebar-header h3 { color: var(--on-surface); margin: 0; font-size: 1.1rem; font-weight: 800; }
        .ag-sidebar-header span { color: var(--on-surface-variant); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .mobile-close-btn { background: transparent; border: none; padding: 4px; display: flex; }
        @media (min-width: 1024px) { .mobile-close-btn { display: none; } }

        .ag-sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
        .ag-nav-link { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; color: var(--on-surface-variant); text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: 0.2s; position: relative; border: none; background: transparent; width: 100%; text-align: left; cursor: pointer; }
        @media (min-width: 1024px) { .ag-nav-link { padding: 14px 16px; font-size: 0.95rem; } }

        .ag-nav-link:hover { background: var(--surface-container); }
        .ag-nav-link.active { color: white; background: var(--primary); box-shadow: 0 8px 16px -4px rgba(53, 37, 205, 0.3); }
        .active-pill { position: absolute; left: -16px; width: 4px; height: 24px; background: var(--primary); border-radius: 0 4px 4px 0; }
        
        .nav-badge-pill { margin-left: auto; background: var(--error); color: white; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 20px; box-shadow: 0 2px 8px rgba(186, 26, 26, 0.3); }
        .ag-nav-link.active .nav-badge-pill { background: white; color: var(--primary); }

        .ag-sidebar-footer { padding-top: 16px; border-top: 1px solid var(--outline-variant); margin-top: auto; }
        .ag-logout-btn { display: flex; align-items: center; gap: 14px; width: 100%; padding: 12px 16px; border-radius: 12px; background: transparent; border: none; color: #ef4444; cursor: pointer; font-weight: 700; transition: 0.2s; font-size: 0.9rem; }
        .ag-logout-btn:hover { background: #fef2f2; }
        
        .ag-main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        
        .ag-top-bar { height: 60px; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; background: white; border-bottom: 1px solid var(--outline-variant); flex-shrink: 0; }
        @media (min-width: 768px) { .ag-top-bar { height: 72px; padding: 0 32px; } }
        @media (min-width: 1024px) { .ag-top-bar { height: 80px; padding: 0 40px; } }

        .ag-top-bar-left { display: flex; align-items: center; gap: 16px; }
        .mobile-menu-btn { background: transparent; border: none; padding: 4px; color: var(--on-surface); display: flex; align-items: center; justify-content: center; }
        @media (min-width: 1024px) { .mobile-menu-btn { display: none; } }

        .ag-breadcrumb { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem; }
        .ag-root { color: var(--on-surface-variant); }
        .ag-sep { color: var(--outline); }
        .ag-current { color: var(--on-surface); }
        
        .ag-top-actions { display: flex; align-items: center; gap: 16px; }
        .ag-status-select { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 20px; padding: 4px 12px; }
        .ag-status-dot-sm { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .ag-status-dot-sm.online { background: #10b981; }
        .ag-status-dot-sm.away { background: #f59e0b; }
        .ag-status-dot-sm.offline { background: #94a3b8; }
        .ag-status-dd { border: none; background: transparent; font-size: 0.75rem; font-weight: 700; color: #065f46; cursor: pointer; outline: none; }

        .ag-profile { display: flex; align-items: center; gap: 12px; }
        .profile-text { text-align: right; }
        .profile-text .name { display: block; font-weight: 700; color: var(--on-surface); font-size: 0.85rem; }
        .profile-text .role { display: block; font-size: 0.7rem; color: var(--on-surface-variant); font-weight: 600; }
        .avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--primary-fixed); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; overflow: hidden; border: 1px solid var(--outline-variant); }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        
        .ag-viewport { flex: 1; padding: 16px; overflow-y: auto; background: var(--surface-container-low); }
        @media (min-width: 768px) { .ag-viewport { padding: 32px; } }
        .ag-viewport.no-pad { padding: 0; }

        .ag-stats-grid { 
          display: grid; 
          grid-template-columns: repeat(1, 1fr); 
          gap: 16px; 
          margin-bottom: 24px; 
        }
        @media (min-width: 640px) { .ag-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .ag-stats-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; } }

        .ag-stat-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--outline-variant); transition: 0.3s; }
        .ag-stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-overlay); }
        .ag-stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .ag-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .ag-stat-badge { font-size: 0.6rem; font-weight: 900; color: #ef4444; background: #fee2e2; padding: 4px 8px; border-radius: 6px; }
        .ag-stat-label { font-size: 0.85rem; color: var(--on-surface-variant); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px; }
        .ag-stat-value { font-size: 2.25rem; font-weight: 800; margin: 0; color: var(--on-surface); }
        .stat-alert { border-color: #fecaca; background: #fffafb; }

        .active-now { padding: 0; overflow: hidden; }
        .active-now .card-header { padding: 20px 24px; border-bottom: 1px solid var(--outline-variant); }
        .workload-list { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .workload-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-radius: 12px; cursor: pointer; transition: 0.2s; background: white; border: 1px solid var(--outline-variant); }
        .workload-item:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .workload-info { display: flex; align-items: center; gap: 16px; min-width: 0; flex: 1; }
        .user-icon { width: 40px; height: 40px; background: var(--surface-container); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; }
        .workload-text { min-width: 0; flex: 1; }
        .workload-text .name { font-weight: 700; color: var(--on-surface); font-size: 0.95rem; margin-bottom: 2px; }
        .workload-text .preview { font-size: 0.8rem; color: var(--on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .empty-workload { padding: 80px 20px; text-align: center; }
        .empty-icon-wrap { width: 80px; height: 80px; background: var(--surface-container); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--outline); }
        .empty-workload h3 { font-size: 1.25rem; font-weight: 800; color: var(--on-surface); margin-bottom: 8px; }
        .empty-workload p { color: var(--on-surface-variant); max-width: 400px; margin: 0 auto; font-weight: 500; }

        .desktop-only { display: none; }
        @media (min-width: 1024px) { .desktop-only { display: inline-flex; } }

        .ag-notification-wrap {
          display: flex;
          align-items: center;
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
}
