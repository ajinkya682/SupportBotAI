import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getBusiness, updateBusiness } from "../../state/businessSlice";
import { getConversations } from "../../../conversations/state/conversationSlice";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Loader2, Bell, ChevronRight, Menu, Volume2, VolumeX } from "lucide-react";
import axios from "axios";
import socket from "../../../../shared/services/socket";
import toast from "react-hot-toast";
import { API_URL } from "../../../../shared/services/config";

import Sidebar from "../components/Sidebar";
import Overview from "../components/Overview";
import Conversations from "../components/Conversations";
import Training from "../components/Training";
import Appearance from "../components/Appearance";
import Integration from "../components/Integration";
import Analytics from "../components/Analytics";
import TeamMembers from "../components/TeamMembers";
import AgentDashboard from "../components/AgentDashboard";
import NotificationBell from "../components/NotificationBell";
import SystemSettings from "../components/SystemSettings";
import Notifications from "../components/Notifications";
import Profile from "../components/Profile";
import { usePushNotifications } from "../../../../shared/hooks/usePushNotifications";
import useSound from "../../../../shared/services/useSound";
import PushPrompt from "../../../../shared/ui/components/PushPrompt";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { business, isLoading: businessLoading } = useSelector(
    (state) => state.business,
  );
  const { conversations: reduxConversations, isLoading: convLoading } =
    useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { isPromptVisible, subscribeToPush, handleLater } = usePushNotifications(user);
  const { isMuted, toggleMute, playSound } = useSound();

  const loadAgents = async () => {
    if (!user?.token) return;
    try {
      const { data } = await axios.get(`${API_URL}/agents/list`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAgents(data);
    } catch (err) {
      console.error('Failed to load agents', err);
    }
  };

  useEffect(() => {
    if (user?.role === "agent") return;
    dispatch(getBusiness()).then((action) => {
      if (action.payload && typeof action.payload === 'object' && !action.error) {
        dispatch(getConversations());
      }
    });
    loadAgents();

    // Background refresh for agents status to complement socket events
    const agentRefresh = setInterval(loadAgents, 60000);
    return () => clearInterval(agentRefresh);
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (reduxConversations.length > 0) {
      setConversations(reduxConversations);
    }
  }, [reduxConversations]);

  useEffect(() => {
    if (!user?._id || user?.role === "agent") return;

    const joinRooms = () => {
      socket.emit("join_room", { userId: user._id, ownerId: user._id, role: "owner" });
      console.log("Dashboard joined room:", user._id);
    };

    socket.connect();
    joinRooms();

    // Rejoin rooms on reconnection (Critical for production stability)
    socket.on("connect", joinRooms);

    socket.on("new_ticket", (newConv) => {
      playSound('new_ticket');
      toast.success(
        `🎫 New support ticket from ${newConv.userName || "Anonymous"}`,
      );
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === newConv._id);
        if (exists)
          return prev.map((c) => (c._id === newConv._id ? newConv : c));
        return [newConv, ...prev];
      });
    });

    socket.on("new_message", (data) => {
      // Only play sound if it's from a user (customer)
      if (data.senderType === 'user') {
        playSound('pop');
      }
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id !== data.conversationId) return conv;
          
          const newMsg = {
            role: data.senderType === "user" ? "user" : "assistant",
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
            // If the last message has the same content and was sent within the last 2 seconds, ignore it
            const lastTime = new Date(last.timestamp).getTime();
            const newTime = new Date(newMsg.timestamp).getTime();
            if (newTime - lastTime < 2000) return conv;
          }

          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            updatedAt: new Date(),
          };
        }),
      );
    });

    socket.on("ticket_resolved", (data) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id !== data.conversationId) return conv;
          return { 
            ...conv, 
            status: "human_resolved", 
            updatedAt: new Date(),
            messages: data.messages || conv.messages 
          };
        }),
      );
      toast.success(`✅ Ticket resolved by ${data.resolvedByName}`);
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

    socket.on("agent_status_changed", (data) => {
      setAgents((prev) =>
        prev.map((a) =>
          a._id === data.agentId || a._id?.toString() === data.agentId?.toString()
            ? { ...a, status: data.status }
            : a
        )
      );
    });

    socket.on("ticket_assigned", (data) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === data.conversationId
            ? { ...conv, routingStatus: 'assigned', assignedAgentId: data.agentId }
            : conv
        )
      );
    });

    socket.on("conversation_claimed", (data) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === data.conversationId
            ? { ...conv, routingStatus: 'assigned', assignedAgentId: data.agentId }
            : conv
        )
      );
    });

    socket.on("agent_joined", (data) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === data.conversationId
            ? { ...conv, status: 'in_progress', isAiActive: false, agent: data.agent,
                messages: data.messages || conv.messages }
            : conv
        )
      );
    });

    return () => {
      socket.off("connect", joinRooms);
      socket.off("new_ticket");
      socket.off("new_message");
      socket.off("ticket_resolved");
      socket.off("update_conversation");
      socket.off("agent_status_changed");
      socket.off("ticket_assigned");
      socket.off("conversation_claimed");
      socket.off("agent_joined");
      socket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        supportEmail: business.supportEmail || "",
        knowledge: business.knowledge || "",
        faqs: business.faqs || [],
        allowedDomains: business.allowedDomains || [],
        appearance: business.appearance || {
          themeColor: "#3525cd",
          botName: business.name || "AI Assistant",
          welcomeMessage: "Hi there! How can I help you today?",
          placeholderText: "Type your message...",
        },
      });
    }
  }, [business]);

  const [formData, setFormData] = useState({
    name: "",
    supportEmail: "",
    knowledge: "",
    faqs: [],
    allowedDomains: [],
    appearance: {
      themeColor: "#3525cd",
      botName: "",
      welcomeMessage: "Hi there! How can I help you today?",
      placeholderText: "Type your message...",
    },
  });

  const onSave = async () => {
    try {
      await dispatch(updateBusiness(formData)).unwrap();
      toast.success("Changes saved successfully!");
    } catch (err) {
      toast.error("Failed to save: " + (err.message || "Unknown error"));
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await axios.post(
        `${API_URL}/conversations/upgrade`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      toast.success("Plan upgraded successfully to PRO! 🚀");
      dispatch(getBusiness());
      setShowUpgradeModal(false);
    } catch (err) {
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  if (user?.role === "agent") {
    return <AgentDashboard user={user} />;
  }

  const renderContent = () => {
    if (
      (convLoading && conversations.length === 0) ||
      (businessLoading && !business)
    ) {
      return (
        <div className="loading-state">
          <Loader2 size={48} className="animate-spin" />
          <p>Synchronizing neural nodes...</p>
          {businessLoading && <p style={{fontSize: '12px', opacity: 0.6}}>Fetching your workspace profile...</p>}
        </div>
      );
    }
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            business={business}
            conversations={conversations}
            agents={agents}
            setActiveTab={setActiveTab}
            setSelectedConversationId={setSelectedConversationId}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case "conversations":
        return (
          <Conversations
            conversations={conversations}
            initialSelectedId={selectedConversationId}
            setSelectedConversationId={setSelectedConversationId}
            onConversationsUpdate={setConversations}
            socket={socket}
            ownerInfo={{
              name: user?.name,
              businessLogo: business?.appearance?.companyLogo,
            }}
          />
        );
      case "training":
        return (
          <Training
            formData={formData}
            setFormData={setFormData}
            onSave={onSave}
            isLoading={businessLoading}
            business={business}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case "analytics":
        return (
          <Analytics
            conversations={conversations}
            business={business}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case "appearance":
        return (
          <Appearance
            formData={formData}
            setFormData={setFormData}
            onSave={onSave}
            isLoading={businessLoading}
            business={business}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case "integration":
        return (
          <Integration
            business={business}
            onSave={onSave}
            isLoading={businessLoading}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case "team":
        return <TeamMembers />;
      case "settings":
        return (
          <SystemSettings
            formData={formData}
            setFormData={setFormData}
            onSave={onSave}
            isLoading={businessLoading}
          />
        );
      case "notifications":
        return <Notifications />;
      case "profile":
        return <Profile />;
      default:
        return <Overview business={business} conversations={conversations} />;
    }
  };

  return (
    <div className="dashboard-root sa-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpgrade={() => setShowUpgradeModal(true)}
        business={business}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="sa-main-content">
        <header className="sa-top-bar">
          <div className="sa-top-bar-left">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="sa-breadcrumb">
              <span className="sa-root desktop-only">Business Console</span>
              <ChevronRight size={14} className="sa-sep desktop-only" />
              <span className="sa-current">
                {activeTab
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
          </div>

          <div className="sa-top-actions">
            <div className="notification-wrap">
              {business && (
                <NotificationBell 
                  onViewAll={() => setActiveTab("notifications")} 
                />
              )}
            </div>
            <button className="mute-btn-header" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="var(--primary)" />}
            </button>
            <div className="sa-admin-badge">
              {business?.plan?.toUpperCase() || 'STARTER'}
            </div>
            <div className="header-user">
              <div className="user-text desktop-only">
                <span className="user-name">{user?.name}</span>
              </div>
              <div className="sa-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="sa-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: "100%" }}
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

      <AnimatePresence>
        {showUpgradeModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              className="modal-surface"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setShowUpgradeModal(false)}
              >
                <X size={20} />
              </button>

              <div className="upgrade-content">
                <div className="upgrade-icon">
                  <Sparkles size={32} />
                </div>
                <h2>Neural Expansion Pack</h2>
                <p>
                  Unlock high-frequency intelligence and global cluster
                  deployment.
                </p>

                <div className="price-display">
                  <span className="currency">$</span>
                  <span className="value">49</span>
                  <span className="cycle">/ month</span>
                </div>

                <div className="feature-list">
                  <div className="feature-item">
                    <Check size={16} /> <span>Unlimited AI Interactions</span>
                  </div>
                  <div className="feature-item">
                    <Check size={16} /> <span>Deep Knowledge Synthesis</span>
                  </div>
                  <div className="feature-item">
                    <Check size={16} /> <span>Full Cluster Analytics</span>
                  </div>
                  <div className="feature-item">
                    <Check size={16} /> <span>Advanced Neural Routing</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Initiate Expansion"
                  )}
                </button>
                <span className="guarantee">
                  Cancel synchronization anytime.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .dashboard-root { display: flex; height: 100vh; height: 100dvh; background: var(--surface); position: relative; overflow: hidden; width: 100%; }
        .sa-layout { background: var(--surface); display: flex; flex-direction: column; width: 100%; min-height: 0; }
        @media (min-width: 1024px) { .sa-layout { flex-direction: row; } }

        .sa-main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; position: relative; overflow: hidden; }
        
        .sa-top-bar { 
          height: 64px; 
          padding: 0 16px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          background: white; 
          border-bottom: 1px solid var(--outline-variant); 
          flex-shrink: 0; 
          z-index: 50;
        }
        @media (min-width: 768px) { .sa-top-bar { height: 72px; padding: 0 32px; } }
        @media (min-width: 1024px) { .sa-top-bar { height: 80px; padding: 0 40px; } }

        .sa-top-bar-left { display: flex; align-items: center; gap: 16px; }
        .mobile-menu-btn { background: transparent; border: none; padding: 4px; color: var(--on-surface); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        @media (min-width: 1024px) { .mobile-menu-btn { display: none; } }

        .sa-breadcrumb { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem; }
        .sa-root { color: var(--on-surface-variant); }
        .sa-sep { color: var(--outline); }
        .sa-current { color: var(--on-surface); text-transform: capitalize; }
        
        .sa-top-actions { display: flex; align-items: center; gap: 16px; }
        @media (min-width: 768px) { .sa-top-actions { gap: 24px; } }

        .notification-wrap { display: flex; align-items: center; }
        .mute-btn-header { background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 8px; transition: 0.2s; }
        .mute-btn-header:hover { background: var(--primary-low); }
        .sa-admin-badge { font-size: 0.6rem; font-weight: 900; background: var(--inverse-surface); color: white; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; }
        
        .header-user { display: flex; align-items: center; gap: 12px; }
        .user-name { font-size: 0.85rem; font-weight: 700; color: var(--on-surface); }
        .sa-avatar { width: 32px; height: 32px; background: var(--primary-low); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
        @media (min-width: 768px) { .sa-avatar { width: 36px; height: 36px; border-radius: 10px; } }
        
        .sa-viewport { flex: 1; padding: 16px; overflow-y: auto; background: var(--surface-container-low); -webkit-overflow-scrolling: touch; }
        @media (min-width: 768px) { .sa-viewport { padding: 32px; } }
        @media (min-width: 1024px) { .sa-viewport { padding: 40px; } }

        .loading-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--outline); gap: 24px; font-weight: 500; }
        
        .modal-backdrop { position: fixed; inset: 0; background: rgba(27, 27, 36, 0.4); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal-surface { background: white; width: 100%; max-width: 480px; border-radius: 20px; padding: 32px 24px; position: relative; border: 1px solid var(--outline-variant); box-shadow: var(--shadow-modal); }
        .modal-close { position: absolute; top: 16px; right: 16px; background: transparent; border: none; color: var(--outline); cursor: pointer; transition: 0.2s; padding: 8px; border-radius: 8px; }
        
        .upgrade-content { text-align: center; }
        .upgrade-icon { width: 56px; height: 56px; background: var(--primary-low); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .upgrade-content h2 { margin-bottom: 8px; font-size: 1.5rem; font-weight: 800; }
        
        .price-display { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: 24px; }
        .price-display .value { font-size: 2.5rem; font-weight: 700; color: var(--on-surface); }
        
        .feature-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; text-align: left; background: var(--surface-container-low); padding: 16px; border-radius: 12px; }
        .feature-item { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--on-surface-variant); }
        .feature-item svg { color: var(--primary); }
        
        .desktop-only { display: none; }
        @media (min-width: 1024px) { .desktop-only { display: inline-flex; } }
      `}</style>
    </div>
  );
}
