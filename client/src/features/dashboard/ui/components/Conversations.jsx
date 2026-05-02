import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  User,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Loader2,
  Zap,
  ZapOff,
  CheckCircle,
  MoreVertical,
  Info,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../../../../shared/services/config";

export default function Conversations({
  conversations = [],
  initialSelectedId,
  setSelectedConversationId,
  isAgentView = false,
  onRefresh,
  socket,
  onConversationsUpdate,
  ownerInfo = null,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [selectedConv, setSelectedConv] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (selectedConv) {
      const updated = conversations.find((c) => c._id === selectedConv._id);
      if (updated) {
        const changed =
          updated.messages.length !== selectedConv.messages.length ||
          updated.status !== selectedConv.status ||
          updated.isAiActive !== selectedConv.isAiActive ||
          updated.agent?._id !== selectedConv.agent?._id;
        if (changed) setSelectedConv(updated);
      }
    }
  }, [conversations]);

  useEffect(() => {
    if (initialSelectedId) {
      const conv = conversations.find((c) => c._id === initialSelectedId);
      if (conv) setSelectedConv(conv);
    }
  }, [initialSelectedId]);

  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  const handleJoin = async () => {
    if (!selectedConv || !user) return;
    const ownerId = user.role === "owner" ? user._id : user.ownerId;

    socket.emit("join_conversation", {
      conversationId: selectedConv._id,
      agentId: user._id,
      ownerId,
    });

    setSelectedConv((prev) => ({
      ...prev,
      status: "in_progress",
      isAiActive: false,
      agent: {
        _id: user._id,
        displayName: user.displayName || user.name,
        profilePhoto: user.profilePhoto,
      },
    }));
  };

  const handleResolve = async (id) => {
    if (!user) return;
    const ownerId = user.role === "owner" ? user._id : user.ownerId;

    socket.emit("resolve_ticket", {
      conversationId: id,
      ownerId,
      resolvedBy: user._id,
      resolvedByName: user.displayName || user.name,
      resolvedByType: user.role === "owner" ? "owner" : "agent",
    });

    setSelectedConv((prev) => ({ ...prev, status: "human_resolved" }));
  };

  const handleToggleAi = async () => {
    if (!selectedConv || !user) return;
    const ownerId = user.role === "owner" ? user._id : user.ownerId;

    if (selectedConv.isAiActive) {
      handleJoin();
    } else {
      socket.emit("toggle_ai", {
        conversationId: selectedConv._id,
        isAiActive: true,
        ownerId,
      });
      setSelectedConv((prev) => ({ ...prev, isAiActive: true }));
      toast.success("AI Assistant resumed");
    }
  };

  const handleAISuggest = async () => {
    if (!selectedConv || !user?.token) return;
    setIsSuggesting(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/chat/suggest`,
        { conversationId: selectedConv._id },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      if (data?.suggestion) setReplyText(data.suggestion);
    } catch (err) {
      toast.error("AI Suggestion failed: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || isSending || !selectedConv || !user) return;
    setIsSending(true);
    try {
      const ownerId = user.role === "owner" ? user._id : user.ownerId;
      const payload = {
        conversationId: selectedConv._id,
        ownerId,
        content: replyText,
        senderType: user.role === "owner" ? "owner" : "agent",
        senderName: user.role === "owner" ? `Admin (${user.name})` : user.displayName || user.name,
        senderAvatar: user.role === "owner" ? ownerInfo?.businessLogo || user.profilePhoto : user.profilePhoto,
        senderRole: user.role === "owner" ? "Business Owner" : user.roleTitle,
      };

      socket.emit("send_message", payload);

      await axios.post(
        `${API_URL}/conversations/${selectedConv._id}/reply`,
        {
          content: replyText,
          senderType: payload.senderType,
          senderName: payload.senderName,
        },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      setReplyText("");
    } catch (err) {
      toast.error("Failed to send reply: " + err);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'ai_resolved': return <span className="chip chip-success">AI RESOLVED</span>;
      case 'human_resolved': return <span className="chip chip-success">RESOLVED</span>;
      case 'human_needed': return <span className="chip chip-error">ACTION REQUIRED</span>;
      case 'in_progress': return <span className="chip chip-pending">IN PROGRESS</span>;
      default: return <span className="chip chip-pending">{status}</span>;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (conv.userName || "").toLowerCase().includes(q) ||
      (conv.messages[conv.messages.length - 1]?.content || "").toLowerCase().includes(q)
    );
  });

  const canSend = !isAgentView || (isAgentView && selectedConv?.agent?._id === user?._id);

  return (
    <div className="conversations-layout animate-fade-in">
      {/* Thread List Sidebar */}
      <div className="thread-sidebar">
        <div className="sidebar-header">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search intelligence logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="thread-list">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredConversations.length === 0 ? (
              <div className="empty-threads">
                <MessageSquare size={32} />
                <p>No active intelligence logs.</p>
              </div>
            ) : (
              [...filteredConversations]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((conv) => (
                  <motion.div
                    key={conv._id}
                    layout
                    className={`thread-item ${selectedConv?._id === conv._id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedConv(conv);
                      if (setSelectedConversationId) setSelectedConversationId(conv._id);
                    }}
                  >
                    <div className="thread-meta">
                      <span className="thread-user">{conv.userName || 'Visitor Node'}</span>
                      <span className="thread-time">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="thread-preview">
                      {conv.messages[conv.messages.length - 1]?.content || "Initializing telemetry..."}
                    </p>
                    <div className="thread-footer">
                      {getStatusChip(conv.status)}
                      {conv.isAiActive && <div className="ai-active-indicator"><Sparkles size={10} /> AI ACTIVE</div>}
                    </div>
                    {selectedConv?._id === conv._id && <div className="selection-indicator" />}
                  </motion.div>
                ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Neural Chat Interface */}
      <div className="neural-interface">
        {selectedConv ? (
          <>
            <header className="interface-header">
              <div className="header-identity">
                <div className="identity-avatar">
                  {(selectedConv.userName || "V").charAt(0).toUpperCase()}
                </div>
                <div className="identity-text">
                  <h3>{selectedConv.userName || "Visitor Node"}</h3>
                  <div className="identity-status">
                    <span className="live-pulse-container"><div className="pulse-dot"></div> LIVE</span>
                    <span className="id-separator">·</span>
                    <span className="id-node">ID: {selectedConv._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="header-actions">
                {isAgentView && !selectedConv.agent && (
                  <button className="btn btn-primary" onClick={handleJoin}>
                    Join Neural Link
                  </button>
                )}
                {(!isAgentView || (isAgentView && selectedConv.agent?._id === user?._id)) &&
                  selectedConv.status !== "human_resolved" && (
                    <button 
                      className={`btn ${selectedConv.isAiActive ? "btn-secondary" : "btn-primary"}`}
                      onClick={handleToggleAi}
                    >
                      {selectedConv.isAiActive ? <ZapOff size={16} /> : <Zap size={16} />}
                      {selectedConv.isAiActive ? "Disable AI" : "Enable AI"}
                    </button>
                  )}
                {(!isAgentView || (isAgentView && selectedConv.agent?._id === user?._id)) &&
                  selectedConv.status !== "human_resolved" && (
                    <button className="btn btn-secondary" onClick={() => handleResolve(selectedConv._id)}>
                      <CheckCircle size={16} /> Terminate Session
                    </button>
                  )}
              </div>
            </header>

            <div className="neural-content" ref={messagesContainerRef}>
              <div className="neural-messages">
                {selectedConv.messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  const senderName = msg.senderName || msg.sender?.name || (isUser ? "User" : "AI Assistant");
                  const senderType = msg.senderType || msg.sender?.userType || (isUser ? "user" : "ai");
                  const isHuman = senderType === "agent" || senderType === "owner";

                  return (
                    <div key={idx} className={`neural-message ${isUser ? "user" : "assistant"}`}>
                      {!isUser && (
                        <div className="message-source">
                          <div className={`source-avatar ${senderType}`}>
                            {senderType === 'ai' ? <Bot size={12} /> : <User size={12} />}
                          </div>
                        </div>
                      )}
                      <div className="message-envelope">
                        {!isUser && isHuman && (
                          <div className="message-attribution">
                            {senderName} <span className="attribution-role">{msg.senderRole || 'Neural Node'}</span>
                          </div>
                        )}
                        <div className="message-body">
                          {msg.content}
                        </div>
                        <div className="message-meta">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            </div>

            {selectedConv.status !== "human_resolved" ? (
              <footer className="interface-footer">
                <div className="input-cluster" style={{ opacity: !canSend ? 0.5 : 1 }}>
                  <button 
                    onClick={handleAISuggest} 
                    disabled={isSuggesting || !canSend}
                    className="ai-intel-btn"
                    title="Get AI Intelligence"
                  >
                    {isSuggesting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  </button>
                  <form onSubmit={handleSendReply} className="input-form">
                    <input
                      placeholder={!canSend ? "Access restricted to linked nodes..." : "Transmit intelligence..."}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={!canSend}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!replyText.trim() || isSending || !canSend}>
                      {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                  </form>
                </div>
              </footer>
            ) : (
              <div className="resolved-status">
                <CheckCircle2 size={16} />
                <span>Neural session terminated by {selectedConv.resolvedByName || "Support Node"}</span>
              </div>
            )}
          </>
        ) : (
          <div className="neural-empty">
            <div className="empty-orb">
              <MessageSquare size={40} />
            </div>
            <h3>Neural Interface Awaiting Input</h3>
            <p>Synchronize with an active thread from the global log to begin transmission.</p>
          </div>
        )}
      </div>

      <style>{`
        .conversations-layout {
          display: flex; height: calc(100vh - 160px); background: white;
          border-radius: var(--radius-card-modal); border: 1px solid var(--outline-variant); overflow: hidden;
          box-shadow: var(--shadow-raised);
        }
        
        .thread-sidebar {
          width: 320px; border-right: 1px solid var(--outline-variant); display: flex; flex-direction: column;
          background: var(--surface-container-low);
        }
        
        .sidebar-header { padding: 24px; border-bottom: 1px solid var(--outline-variant); }
        .search-box {
          display: flex; align-items: center; gap: 12px; background: white;
          padding: 10px 16px; border-radius: var(--radius-btn-input); border: 1px solid var(--outline-variant);
        }
        .search-box input { border: none; background: transparent; padding: 0; font-size: var(--text-body-sm); color: var(--on-surface); width: 100%; }
        .search-box input:focus { outline: none; }
        .search-box svg { color: var(--outline); }
        
        .thread-list { flex: 1; overflow-y: auto; }
        .thread-item {
          padding: 20px; border-bottom: 1px solid var(--surface-container-high); cursor: pointer;
          transition: var(--transition-fast); position: relative;
        }
        .thread-item:hover { background: var(--surface-container-high); }
        .thread-item.selected { background: white; }
        .selection-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--primary); }
        
        .thread-meta { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .thread-user { font-weight: 700; color: var(--on-surface); font-size: var(--text-body-sm); }
        .thread-time { font-size: 0.75rem; color: var(--outline); }
        .thread-preview { font-size: var(--text-body-sm); color: var(--on-surface-variant); margin: 0 0 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .thread-footer { display: flex; gap: 8px; align-items: center; }
        .ai-active-indicator { font-size: 0.6rem; font-weight: 800; color: var(--primary); background: var(--surface-container); padding: 2px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; }
        
        .neural-interface { flex: 1; display: flex; flex-direction: column; background: white; position: relative; }
        .interface-header { padding: 20px 32px; border-bottom: 1px solid var(--outline-variant); display: flex; justify-content: space-between; align-items: center; background: var(--surface-container-lowest); }
        .header-identity { display: flex; align-items: center; gap: 16px; }
        .identity-avatar { width: 44px; height: 44px; border-radius: 12px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
        .identity-text h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
        .identity-status { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .live-pulse-container { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; color: #10b981; font-weight: 800; }
        .pulse-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
        .id-separator { color: var(--outline-variant); font-size: 0.7rem; }
        .id-node { font-size: 0.7rem; color: var(--outline); font-weight: 600; }
        
        .header-actions { display: flex; gap: 12px; }
        .neural-content { flex: 1; padding: 40px 32px; overflow-y: auto; background: var(--surface); }
        .neural-messages { display: flex; flex-direction: column; gap: 32px; max-width: 800px; margin: 0 auto; }
        .neural-message { display: flex; gap: 16px; width: 100%; }
        .neural-message.user { flex-direction: row-reverse; }
        .message-source { flex-shrink: 0; }
        .source-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .source-avatar.ai { background: var(--primary-container); color: white; }
        .source-avatar.agent, .source-avatar.owner { background: var(--surface-container-highest); color: var(--on-surface); }
        
        .message-envelope { max-width: 80%; display: flex; flex-direction: column; }
        .neural-message.user .message-envelope { align-items: flex-end; }
        .message-attribution { font-size: 0.7rem; font-weight: 700; margin-bottom: 6px; color: var(--on-surface-variant); }
        .attribution-role { font-weight: 500; opacity: 0.6; }
        .message-body { padding: 16px 20px; border-radius: 16px; font-size: 0.95rem; line-height: 1.6; }
        .user .message-body { background: var(--primary); color: white; border-top-right-radius: 2px; }
        .assistant .message-body { background: white; color: var(--on-surface); border: 1px solid var(--outline-variant); border-top-left-radius: 2px; box-shadow: var(--shadow-raised); }
        .message-meta { font-size: 0.65rem; color: var(--outline); margin-top: 8px; }
        
        .interface-footer { padding: 24px 32px; background: white; border-top: 1px solid var(--outline-variant); }
        .input-cluster { display: flex; gap: 16px; align-items: center; max-width: 800px; margin: 0 auto; }
        .input-form { flex: 1; display: flex; gap: 12px; background: var(--surface-container-low); padding: 8px; border-radius: 16px; border: 1px solid var(--outline-variant); }
        .input-form input { flex: 1; border: none; background: transparent; padding: 0 12px; font-size: var(--text-body-sm); color: var(--on-surface); }
        .input-form input:focus { outline: none; }
        .ai-intel-btn { width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--primary-container); background: var(--surface-container-lowest); color: var(--primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition-fast); }
        .ai-intel-btn:hover { background: var(--primary); color: white; transform: scale(1.05); }
        
        .resolved-status { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; background: var(--surface-container-low); border-top: 1px solid var(--outline-variant); color: #065f46; font-size: var(--text-body-sm); font-weight: 600; }
        .neural-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--on-surface-variant); text-align: center; padding: 40px; }
        .empty-orb { width: 80px; height: 80px; border-radius: 50%; background: var(--surface-container-low); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--outline); border: 1px solid var(--outline-variant); }
        
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
