import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bot, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  User, 
  CheckCircle2, 
  Zap, 
  ZapOff, 
  Send, 
  Loader2,
  Sparkles,
  ChevronRight,
  Shield,
  Activity,
  History,
  Info
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "../../../auth/state/authSlice";
import { getBusiness } from "../../state/businessSlice";
import { getConversations } from "../../../conversations/state/conversationSlice";
import Conversations from "./Conversations";
import socket from "../../../../shared/services/socket";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AgentDashboard({ user }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [business, setBusiness] = useState(null);
  const { conversations: reduxConversations, isLoading: convLoading } = useSelector((state) => state.conversations);

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

  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("join_room", { ownerId: user.ownerId, role: "agent", agentId: user._id });

    socket.on("new_ticket", (newConv) => {
      toast.success(`🎫 New ticket assigned from ${newConv.userName || "Anonymous"}`);
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
          senderName: data.senderName
        };
        const last = conv.messages[conv.messages.length - 1];
        if (last && last.content === data.content) return conv;
        return { ...conv, messages: [...conv.messages, newMsg], updatedAt: new Date() };
      }));
    });

    socket.on("ticket_resolved", (data) => {
      setConversations(prev => prev.map(conv => {
        if (conv._id !== data.conversationId) return conv;
        return { ...conv, status: 'human_resolved', updatedAt: new Date() };
      }));
      toast.success(`✅ Ticket resolved by ${data.resolvedByName}`);
    });

    return () => {
      socket.off("new_ticket");
      socket.off("new_message");
      socket.off("ticket_resolved");
      socket.disconnect();
    };
  }, [user?._id]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

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
        return (
          <div className="agent-overview">
             <div className="stats-row">
               <div className="card stat-card">
                 <div className="stat-label">Assigned Chats</div>
                 <div className="stat-value">{conversations.filter(c => c.agent?._id === user._id).length}</div>
               </div>
               <div className="card stat-card">
                 <div className="stat-label">Waiting for You</div>
                 <div className="stat-value" style={{ color: 'var(--error)' }}>
                   {conversations.filter(c => c.status === 'human_needed' && !c.agent).length}
                 </div>
               </div>
               <div className="card stat-card">
                 <div className="stat-label">Resolved Today</div>
                 <div className="stat-value" style={{ color: '#10b981' }}>12</div>
               </div>
             </div>
             
             <div className="card active-now">
               <h3><Activity size={20} /> My Active Workload</h3>
               <div className="workload-list">
                 {conversations.filter(c => c.agent?._id === user._id && c.status === 'in_progress').map(conv => (
                   <div key={conv._id} className="workload-item" onClick={() => setActiveTab('conversations')}>
                     <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                       <div className="user-icon"><User size={18} /></div>
                       <div>
                         <div className="name">{conv.userName || 'Anonymous'}</div>
                         <div className="preview">{conv.messages[conv.messages.length - 1]?.content}</div>
                       </div>
                     </div>
                     <ChevronRight size={18} color="var(--outline)" />
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
      default: return null;
    }
  };

  return (
    <div className="agent-layout">
      {/* Mini Sidebar */}
      <aside className="agent-sidebar">
        <div className="sidebar-top">
          <div className="brand-icon">
            <Bot size={28} color="white" />
          </div>
          <nav className="nav-icons">
            <button className={`icon-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} title="Overview">
              <LayoutDashboard size={24} />
            </button>
            <button className={`icon-btn ${activeTab === 'conversations' ? 'active' : ''}`} onClick={() => setActiveTab('conversations')} title="Chats">
              <MessageSquare size={24} />
              {conversations.filter(c => c.status === 'human_needed' && !c.agent).length > 0 && (
                <span className="nav-badge"></span>
              )}
            </button>
            <button className={`icon-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} title="History">
              <History size={24} />
            </button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="icon-btn logout" onClick={onLogout} title="Logout">
            <LogOut size={24} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="agent-main">
        <header className="agent-header">
          <div className="header-left">
            <h2>{activeTab === 'conversations' ? 'Inbox' : (activeTab === 'overview' ? 'Agent Console' : 'Archive')}</h2>
            <div className="agent-status">
              <span className="dot"></span> Online
            </div>
          </div>
          <div className="header-right">
            <div className="agent-profile">
              <div className="profile-info">
                <span className="name">{user.name}</span>
                <span className="role">{user.roleTitle || 'Support Agent'}</span>
              </div>
              <div className="avatar">
                {user.profilePhoto ? <img src={user.profilePhoto} alt="" /> : user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="content-inner">
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
        </div>
      </main>

      <style>{`
        .agent-layout { display: flex; height: 100vh; background: var(--surface); overflow: hidden; }
        
        .agent-sidebar { width: 80px; background: var(--inverse-surface); display: flex; flex-direction: column; justify-content: space-between; padding: 24px 0; align-items: center; }
        .brand-icon { width: 48px; height: 48px; background: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; }
        .nav-icons { display: flex; flex-direction: column; gap: 20px; }
        .icon-btn { width: 52px; height: 52px; border-radius: 16px; border: none; background: transparent; color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; position: relative; }
        .icon-btn:hover { background: rgba(255,255,255,0.05); color: white; }
        .icon-btn.active { background: var(--primary-container); color: white; box-shadow: var(--shadow-2); }
        .nav-badge { position: absolute; top: 12px; right: 12px; width: 10px; height: 10px; background: var(--error); border: 2px solid var(--inverse-surface); border-radius: 50%; }
        .icon-btn.logout { color: #f87171; }
        .icon-btn.logout:hover { background: rgba(248,113,113,0.1); }
        
        .agent-main { flex: 1; display: flex; flex-direction: column; }
        .agent-header { height: 80px; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; background: var(--surface-container-lowest); border-bottom: 1px solid var(--outline-variant); }
        .header-left { display: flex; align-items: center; gap: 24px; }
        .header-left h2 { font-size: 1.5rem; margin: 0; }
        .agent-status { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; color: #10b981; background: #d1fae5; padding: 4px 12px; border-radius: 20px; }
        .agent-status .dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; }
        
        .agent-profile { display: flex; align-items: center; gap: 16px; }
        .profile-info { text-align: right; }
        .profile-info .name { display: block; font-weight: 700; color: var(--on-surface); font-size: 0.95rem; }
        .profile-info .role { display: block; font-size: 0.75rem; color: var(--on-surface-variant); font-weight: 600; }
        .avatar { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-fixed); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; overflow: hidden; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        
        .content-inner { flex: 1; padding: 32px 40px; overflow-y: auto; background: var(--surface-container-low); }
        .agent-chat-wrapper { height: 100%; }
        
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
        .stat-card { padding: 24px; }
        .stat-label { font-size: 0.85rem; font-weight: 600; color: var(--on-surface-variant); margin-bottom: 8px; }
        .stat-value { font-size: 2rem; font-weight: 800; }
        
        .active-now { padding: 32px; }
        .active-now h3 { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .workload-list { display: flex; flex-direction: column; gap: 12px; }
        .workload-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 16px; cursor: pointer; transition: 0.2s; }
        .workload-item:hover { transform: translateY(-2px); border-color: var(--primary); background: var(--surface-container-lowest); }
        .workload-item .user-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--primary-fixed); color: var(--primary); display: flex; align-items: center; justify-content: center; }
        .workload-item .name { font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; }
        .workload-item .preview { font-size: 0.85rem; color: var(--on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px; }
        
        .empty-workload { padding: 48px; text-align: center; color: var(--on-surface-variant); }
        .empty-workload p { margin-top: 16px; font-weight: 600; }
      `}</style>
    </div>
  );
}
