import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getBusiness, updateBusiness } from "../../state/businessSlice";
import { getConversations } from "../../../conversations/state/conversationSlice";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Loader2, Bell, ChevronRight } from "lucide-react";
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

export default function Dashboard() {
  const dispatch = useDispatch();
  const { business, isLoading: businessLoading } = useSelector(
    (state) => state.business,
  );
  const { conversations: reduxConversations, isLoading: convLoading } =
    useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

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

  useEffect(() => {
    if (user?.role === "agent") return;
    dispatch(getBusiness());
    dispatch(getConversations());
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (reduxConversations.length > 0) {
      setConversations(reduxConversations);
    }
  }, [reduxConversations]);

  useEffect(() => {
    if (!user?._id || user?.role === "agent") return;

    socket.connect();
    socket.emit("join_room", { ownerId: user._id, role: "owner" });

    socket.on("new_ticket", (newConv) => {
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
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id !== data.conversationId) return conv;
          const newMsg = {
            role: data.senderType === "user" ? "user" : "assistant",
            content: data.content,
            timestamp: data.timestamp || new Date(),
            senderType: data.senderType,
            senderName: data.senderName,
          };
          const last = conv.messages[conv.messages.length - 1];
          if (last && last.content === data.content) return conv;
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
          return { ...conv, status: "human_resolved", updatedAt: new Date() };
        }),
      );
      toast.success(`✅ Ticket resolved by ${data.resolvedByName}`);
    });

    return () => {
      socket.off("new_ticket");
      socket.off("new_message");
      socket.off("ticket_resolved");
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
        </div>
      );
    }
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            business={business}
            conversations={conversations}
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
      default:
        return <Overview business={business} conversations={conversations} />;
    }
  };

  return (
    <div className="dashboard-root">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpgrade={() => setShowUpgradeModal(true)}
        business={business}
      />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-breadcrumb">
            <span className="crumb-root">Platform</span>
            <ChevronRight size={14} className="crumb-sep" />
            <span className="crumb-current">
              {activeTab
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>

          <div className="header-controls">
            <NotificationBell />
            <div className="header-divider" />
            <div className="header-user">
              <div className="user-text">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">
                  {business?.plan === "pro"
                    ? "ENTERPRISE NODE"
                    : "STARTER NODE"}
                </span>
              </div>
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-viewport">
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
        .dashboard-root { display: flex; height: 100vh; background: var(--surface); }
        .dashboard-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        
        .dashboard-header {
          height: 72px; padding: 0 40px; display: flex; justify-content: space-between; align-items: center;
          background: white; border-bottom: 1px solid var(--outline-variant); z-index: 50;
        }
        
        .header-breadcrumb { display: flex; align-items: center; gap: 10px; }
        .crumb-root { font-size: var(--text-label-md); font-weight: 500; color: var(--outline); }
        .crumb-sep { color: var(--outline-variant); }
        .crumb-current { font-size: var(--text-label-md); font-weight: 600; color: var(--on-surface); }
        
        .header-controls { display: flex; align-items: center; gap: 24px; }
        .header-divider { width: 1px; height: 24px; background: var(--outline-variant); }
        .header-user { display: flex; align-items: center; gap: 12px; }
        .user-text { text-align: right; }
        .user-name { display: block; font-size: var(--text-label-md); font-weight: 700; color: var(--on-surface); }
        .user-role { font-size: 10px; font-weight: 800; color: var(--primary); letter-spacing: 0.05em; }
        .user-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--surface-container-high); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
        
        .dashboard-viewport { flex: 1; padding: 32px 40px; overflow-y: auto; background: var(--surface); }
        .loading-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--outline); gap: 24px; font-weight: 500; }
        
        .modal-backdrop { position: fixed; inset: 0; background: rgba(27, 27, 36, 0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal-surface { background: white; width: 100%; max-width: 480px; border-radius: var(--radius-card-modal); padding: 40px; position: relative; border: 1px solid var(--outline-variant); box-shadow: var(--shadow-modal); }
        .modal-close { position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: var(--outline); cursor: pointer; transition: 0.2s; }
        .modal-close:hover { color: var(--on-surface); }
        
        .upgrade-content { text-align: center; }
        .upgrade-icon { width: 64px; height: 64px; background: var(--primary-low); color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .upgrade-content h2 { margin-bottom: 8px; font-size: var(--text-h2); }
        .upgrade-content p { color: var(--on-surface-variant); margin-bottom: 32px; font-size: var(--text-body-sm); }
        
        .price-display { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: 32px; }
        .price-display .value { font-size: 3rem; font-weight: 700; color: var(--on-surface); letter-spacing: -0.02em; }
        .price-display .cycle { font-size: var(--text-body-sm); font-weight: 600; color: var(--outline); }
        
        .feature-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; text-align: left; background: var(--surface-container-low); padding: 20px; border-radius: 12px; }
        .feature-item { display: flex; align-items: center; gap: 12px; font-size: var(--text-body-sm); font-weight: 600; color: var(--on-surface-variant); }
        .feature-item svg { color: var(--primary); }
        
        .guarantee { display: block; font-size: 11px; color: var(--outline); font-weight: 500; margin-top: 16px; }
      `}</style>
    </div>
  );
}
