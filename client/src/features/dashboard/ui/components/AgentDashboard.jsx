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
  Bell,
  Volume2,
  VolumeX,
  Zap,
  ArrowUpRight,
  Ticket,
  ArrowRight
} from "lucide-react";
import useSound from "../../../../shared/services/useSound"; 
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "../../../auth/state/authSlice";
import { getBusiness } from "../../state/businessSlice";
import { getConversations } from "../../../conversations/state/conversationSlice";
import Conversations from "./Conversations";
import TicketCard from "./TicketCard";
import socket from "../../../../shared/services/socket";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import NotificationBell from "./NotificationBell";
import Notifications from "./Notifications";
import AgentProfileSetup from "./AgentProfileSetup";
import { usePushNotifications } from "../../../../shared/hooks/usePushNotifications";
import PushPrompt from "../../../../shared/ui/components/PushPrompt";

export default function AgentDashboard({ user }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [conversations, setConversations] = useState([]);
  const [business, setBusiness] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const profileDoneKey = `profile_setup_done_${user?._id}`;
  const [showProfileSetup, setShowProfileSetup] = useState(
    !user?.displayName && !localStorage.getItem(profileDoneKey)
  );
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const { isPromptVisible, subscribeToPush, handleLater } = usePushNotifications(user);

  const { isMuted, toggleMute, playSound } = useSound();

  const dismissProfileSetup = () => {
    localStorage.setItem(profileDoneKey, '1');
    setShowProfileSetup(false);
  };
  const { conversations: reduxConversations } = useSelector((state) => state.conversations);

  useEffect(() => {
    dispatch(getConversations());
    fetchBusinessData();
  }, [dispatch, activeTab]); // Re-fetch on tab change to ensure fresh data

  useEffect(() => {
    // Sync local state with Redux, allowing for empty arrays from server
    setConversations(reduxConversations || []);
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

    const joinRooms = () => {
      if (socket.connected) {
        socket.emit("join_room", { ownerId: user.ownerId, role: "agent", userId: user._id });
        // Announce online status explicitly
        socket.emit("agent_status_change", { agentId: user._id, status: agentStatus, ownerId: user.ownerId });
        console.log("Agent Dashboard joined room:", user.ownerId, "Status:", agentStatus);
      }
    };

    socket.connect();
    
    if (socket.connected) {
      joinRooms();
    }

    // Rejoin rooms on reconnection (Critical for production stability)
    socket.on("connect", joinRooms);

    // Handle action from notification
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'go_online') {
      toast.success("🚀 You are now online and ready to help!");
      // Remove param from URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Heartbeat every 30s to keep status alive
    const heartbeat = setInterval(() => {
      socket.emit("agent_heartbeat", { agentId: user._id });
    }, 30000);

    socket.on("agent_assigned", (conv) => {
      playSound(conv.priority === 'high' ? 'high_intent' : 'new_ticket');
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
      if (data.senderType === 'user') playSound('pop');
      setConversations(prev => prev.map(conv => {
        if (conv._id !== data.conversationId) return conv;
        
        const newMsg = {
          role: data.senderType === 'user' ? 'user' : 'assistant',
          content: data.content,
          timestamp: data.timestamp || new Date(),
          senderType: data.senderType,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          senderRole: data.senderRole,
        };

        // Improved deduplication logic
        const last = conv.messages[conv.messages.length - 1];
        if (last && last.content === data.content) {
          const lastTime = new Date(last.timestamp).getTime();
          const newTime = new Date(newMsg.timestamp).getTime();
          if (newTime - lastTime < 2000) return conv;
        }

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
        return { 
          ...conv, 
          status: 'human_resolved', 
          updatedAt: new Date(),
          messages: data.messages || conv.messages 
        };
      }));
      toast.success(`✅ Ticket resolved`);
    });
    
    socket.on("update_conversation", (updatedConv) => {
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === updatedConv._id);
        if (exists) {
          return prev.map((c) => (c._id === updatedConv._id ? updatedConv : c));
        }
        return [updatedConv, ...prev];
      });
    });

    socket.on("conversation_claimed", (data) => {
      setConversations(prev => prev.map(conv =>
        conv._id === data.conversationId ? { ...conv, routingStatus: 'assigned', assignedAgentId: data.agentId } : conv
      ));
    });

    return () => {
      clearInterval(heartbeat);
      // Only set offline if they actually close or logout, not on every re-render
      // socket.emit("agent_status_change", { agentId: user._id, status: 'offline', ownerId: user.ownerId });
      socket.off("connect", joinRooms);
      socket.off("agent_assigned");
      socket.off("new_ticket");
      socket.off("new_message");
      socket.off("agent_joined");
      socket.off("ticket_resolved");
      socket.off("conversation_claimed");
    };
  }, [user?._id, agentStatus]);

  const handleStatusChange = (newStatus) => {
    setAgentStatus(newStatus);
    socket.emit("agent_status_change", { agentId: user._id, status: newStatus, ownerId: user.ownerId });
  };

  const onLogout = () => {
    socket.emit("agent_status_change", { 
      agentId: user._id, 
      status: 'offline', 
      ownerId: user.ownerId 
    });
    dispatch(logout());
    dispatch(reset());
  };

  const switchTab = (tab, conversationId = null) => {
    setActiveTab(tab);
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
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
              playSound={playSound}
              initialSelectedId={selectedConversationId}
              setSelectedConversationId={setSelectedConversationId}
              ownerInfo={business ? {
                businessLogo: business.appearance?.companyLogo,
              } : null}
            />
          </div>
        );
    case 'overview':
        const unassignedTickets = conversations.filter(c => 
          (c.status === 'human_needed' || c.routingStatus === 'holding') && 
          !c.agent && 
          !c.assignedAgentId &&
          c.status !== 'human_resolved' &&
          c.status !== 'ai_resolved'
        );
        
        const assignedToMe = conversations.filter(c => 
          c.assignedAgentId === user._id && 
          c.routingStatus === 'assigned' &&
          c.status !== 'human_resolved' &&
          c.status !== 'ai_resolved'
        );

        const myActive = conversations.filter(c => 
          (c.agent?._id === user._id || c.assignedAgentId === user._id) && 
          c.status === 'in_progress'
        );

        const displayTickets = [...assignedToMe, ...myActive, ...unassignedTickets];
        
        const stats = [
          { label: 'Assigned to Me', value: assignedToMe.length, icon: Bell, color: '#3b82f6' },
          { label: 'Active Chats', value: myActive.length, icon: MessageSquare, color: '#10b981' },
          { label: 'System Queue', value: unassignedTickets.length, icon: Clock, color: '#f59e0b' },
          { label: 'Resolved Today', value: conversations.filter(c => c.status === 'human_resolved' && c.agent?._id === user._id && new Date(c.updatedAt).toDateString() === new Date().toDateString()).length, icon: CheckCircle2, color: '#64748b' }
        ];

        return (
          <div className="agent-console animate-fade-in">
            <div className="ag-stats-grid">
              {stats.map((s, i) => (
                <motion.div key={i} className="ag-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="ag-stat-header">
                    <div className="ag-stat-icon" style={{ background: `${s.color}15`, color: s.color }}><s.icon size={20} /></div>
                    <div className="ag-stat-trend up">
                      <ArrowUpRight size={12} />
                      {Math.floor(Math.random() * 15) + 5}%
                    </div>
                  </div>
                  <div className="ag-stat-body">
                    <span className="ag-stat-label">{s.label}</span>
                    <h2 className="ag-stat-value">{s.value}</h2>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="ag-ticket-section">
              <div className="section-header">
                <h3><Zap size={18} color="#f59e0b" /> Active Workload</h3>
                <div className="sh-right">
                  <span className="count-pill">{displayTickets.length} Total Needs Attention</span>
                  <button className="refresh-btn-sm" onClick={() => {
                    dispatch(getConversations());
                    toast.success("Syncing tickets...");
                  }}>
                    <Activity size={14} /> Refresh
                  </button>
                </div>
              </div>
              
              <div className="ticket-grid">
                <AnimatePresence mode="popLayout">
                  {displayTickets.sort((a,b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt)).map((conv) => {
                    const isUnassigned = !conv.agent && !conv.assignedAgentId;
                    const actionLabel = conv.routingStatus === 'assigned' ? 'Accept & Join' : isUnassigned ? 'Claim & View' : 'View Ticket';
                    
                    return (
                      <TicketCard 
                        key={conv._id} 
                        ticket={conv} 
                        actionLabel={actionLabel}
                        onAction={(t) => {
                          if (t.routingStatus === 'assigned' || isUnassigned) {
                            socket.emit('join_conversation', {
                              conversationId: t._id,
                              agentId: user._id,
                              ownerId: user.ownerId
                            });
                          }
                          switchTab('conversations', t._id);
                        }}
                      />
                    );
                  })}
                </AnimatePresence>
                
                {displayTickets.length === 0 && (
                  <div className="empty-state-console">
                    <div className="empty-icon"><Bot size={32} /></div>
                    <h4>No active tickets</h4>
                    <p>You're all caught up! New tickets will appear here automatically.</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => dispatch(getConversations())} style={{marginTop: '16px'}}>
                      Check for new tickets
                    </button>
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
            <div className={`ag-status-select ${agentStatus}`}>
              <span className={`ag-status-dot-sm ${agentStatus}`} />
              <select value={agentStatus} onChange={e => handleStatusChange(e.target.value)}
                className="ag-status-dd">
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <button className="ag-mute-btn" onClick={toggleMute}>
              {isMuted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="var(--primary)" />}
            </button>
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

      <PushPrompt 
        isVisible={isPromptVisible}
        onEnable={subscribeToPush}
        onLater={handleLater}
      />

      <style>{`
        .ag-layout { 
          background: var(--surface); 
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          width: 100%;
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
        
        .ag-main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; position: relative; overflow: hidden; }
        
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
        
        .ag-top-actions { display: flex; align-items: center; gap: 12px; }
        @media (min-width: 768px) { .ag-top-actions { gap: 16px; } }
        
        .ag-status-select { display: flex; align-items: center; gap: 8px; border-radius: 20px; padding: 4px 10px; transition: 0.2s; border: 1px solid var(--outline-variant); }
        .ag-status-select.online { background: #f0fdf4; border-color: #d1fae5; }
        .ag-status-select.away { background: #fffbeb; border-color: #fef3c7; }
        .ag-status-select.offline { background: #f8fafc; border-color: #e2e8f0; }

        .ag-status-dot-sm { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .ag-status-dot-sm.online { background: #10b981; box-shadow: 0 0 6px #10b98166; }
        .ag-status-dot-sm.away { background: #f59e0b; }
        .ag-status-dot-sm.offline { background: #94a3b8; }
        
        .ag-status-dd { border: none; background: transparent; font-size: 0.7rem; font-weight: 700; color: inherit; cursor: pointer; outline: none; padding-right: 4px; }
        .online .ag-status-dd { color: #065f46; }
        .away .ag-status-dd { color: #92400e; }
        .offline .ag-status-dd { color: #475569; }

        .avatar { width: 32px; height: 32px; border-radius: 8px; background: var(--primary-fixed); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; overflow: hidden; border: 1px solid var(--outline-variant); }
        @media (min-width: 768px) { .avatar { width: 36px; height: 36px; border-radius: 10px; font-size: 0.9rem; } }
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
        @media (min-width: 1024px) { .ag-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px; } }

        .ag-stat-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid var(--outline-variant); transition: 0.3s; }
        .ag-stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-overlay); }
        .ag-stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .ag-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .ag-stat-trend { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
        .ag-stat-trend.up { background: #d1fae5; color: #065f46; }
        .ag-stat-trend.down { background: #fee2e2; color: #991b1b; }
        .ag-stat-label { font-size: 0.8rem; color: var(--on-surface-variant); font-weight: 600; display: block; margin-bottom: 4px; }
        .ag-stat-value { font-size: 1.75rem; font-weight: 800; margin: 0; color: var(--on-surface); }
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

        .ag-mute-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--outline-variant);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .ag-mute-btn:hover { background: var(--surface-container-low); }

        .agent-console { max-width: 1200px; margin: 0 auto; }
        
        .ag-ticket-section { margin-top: 32px; }
        .ag-ticket-section .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; }
        .ag-ticket-section h3 { font-size: 1.1rem; font-weight: 800; color: var(--on-surface); display: flex; align-items: center; gap: 10px; margin: 0; }
        .sh-right { display: flex; align-items: center; gap: 12px; }
        .count-pill { font-size: 0.75rem; font-weight: 700; color: var(--on-surface-variant); background: var(--surface-container); padding: 4px 12px; border-radius: 20px; }
        .refresh-btn-sm { background: white; border: 1px solid var(--outline-variant); padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s; color: var(--on-surface-variant); }
        .refresh-btn-sm:hover { background: var(--surface-container-low); border-color: var(--primary); color: var(--primary); }

        .ticket-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 16px; }
        @media (min-width: 768px) { .ticket-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .ticket-grid { grid-template-columns: repeat(3, 1fr); } }

        .ticket-card { background: white; border: 1px solid var(--outline-variant); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: 0.3s; position: relative; overflow: hidden; }
        .ticket-card:hover { transform: translateY(-4px); border-color: var(--primary); box-shadow: 0 12px 24px rgba(0,0,0,0.05); }
        .ticket-card.high-priority { border-left: 4px solid #ef4444; background: #fffafb; }

        .tc-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .tc-user { display: flex; align-items: center; gap: 12px; }
        .tc-avatar { width: 40px; height: 40px; border-radius: 12px; background: var(--surface-container); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
        .tc-name-wrap { display: flex; flex-direction: column; }
        .tc-name { font-weight: 700; color: var(--on-surface); font-size: 0.95rem; }
        .tc-time { font-size: 0.75rem; color: var(--on-surface-variant); font-weight: 600; }

        .tc-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .badge-high { font-size: 0.6rem; font-weight: 900; background: #fee2e2; color: #ef4444; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.05em; }
        .badge-waiting { font-size: 0.6rem; font-weight: 900; background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.05em; }

        .tc-preview { margin: 0; font-size: 0.85rem; color: var(--on-surface-variant); line-height: 1.5; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .tc-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--outline-variant); }
        .tc-status-tag { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 6px; }
        .tc-status-tag.human_needed { background: #e0e7ff; color: #4338ca; }
        .tc-status-tag.in_progress { background: #f3e8ff; color: #7e22ce; }
        
        .unassigned-card { border: 1px dashed var(--error); background: #fff8f8; }
        .badge-unassigned { font-size: 0.6rem; font-weight: 900; background: #fee2e2; color: #ef4444; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.05em; margin-bottom: 4px; }

        .tc-view-btn { background: var(--primary); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 4px; cursor: pointer; transition: 0.2s; }
        .tc-view-btn:hover { background: var(--on-primary-container); transform: translateX(2px); }
        .accept-pulse { animation: tc-pulse 2s infinite; background: #10b981; }
        @keyframes tc-pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

        .empty-state-console { text-align: center; padding: 64px 24px; background: white; border: 1px dashed var(--outline); border-radius: 20px; grid-column: 1 / -1; }
        .empty-icon { width: 64px; height: 64px; background: var(--surface-container); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--outline); }
        .empty-state-console h4 { margin: 0 0 8px; font-weight: 800; color: var(--on-surface); }
        .empty-state-console p { margin: 0; font-size: 0.9rem; color: var(--on-surface-variant); font-weight: 500; }
      `}</style>
    </div>
  );
}
