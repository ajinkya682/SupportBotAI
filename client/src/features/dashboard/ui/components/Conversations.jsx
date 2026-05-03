import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  User,
  Bot,
  Send,
  CheckCircle2,
  Search,
  Sparkles,
  Loader2,
  Zap,
  ZapOff,
  CheckCircle,
  ChevronLeft
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
  const [showThreadList, setShowThreadList] = useState(true);

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
      if (conv) {
        setSelectedConv(conv);
        setShowThreadList(false);
      }
    }
  }, [initialSelectedId]);

  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  const handleJoin = async () => {
    if (!selectedConv || !user) return;
    const ownerId = user.role === "owner" ? user._id : user.ownerId;
    try {
      const { data } = await axios.put(
        `${API_URL}/agents/join/${selectedConv._id}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Update agent status to busy
      socket.emit("agent_status_change", { 
        agentId: user._id, 
        status: 'in_conversation', 
        ownerId 
      });

      // Play whoosh sound if playSound prop provided
      if (typeof playSound === 'function') playSound('whoosh');

      // Optimistically update local state
      setSelectedConv(prev => ({
        ...prev,
        status: "in_progress",
        isAiActive: false,
        agent: {
          _id: user._id,
          displayName: user.displayName || user.name,
          profilePhoto: user.profilePhoto,
        },
        messages: data.conversation?.messages || prev.messages,
      }));
      toast.success('Joined conversation successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join conversation');
    }
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

    // Reset agent status to online (free)
    socket.emit("agent_status_change", { 
      agentId: user._id, 
      status: 'online', 
      ownerId 
    });
    
    if (typeof playSound === 'function') playSound('success');

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

  const handleReplyTyping = () => {
    if (!socket || !selectedConv) return;
    const ownerId = user.role === "owner" ? user._id : user.ownerId;
    const agentName = user.role === "owner" ? `Admin (${user.name})` : user.displayName || user.name;
    socket.emit("typing", { conversationId: selectedConv._id, agentName, ownerId });
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

      // socket.js persists to DB AND emits to session room (widget) + owner room (dashboard)
      socket.emit("send_message", payload);

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
      case 'human_needed': return <span className="chip chip-error">ACTION</span>;
      case 'in_progress': return <span className="chip chip-pending">ACTIVE</span>;
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

  const handleSelectThread = (conv) => {
    setSelectedConv(conv);
    if (setSelectedConversationId) setSelectedConversationId(conv._id);
    if (window.innerWidth < 1024) {
      setShowThreadList(false);
    }
  };

  return (
    <div className={`conversations-layout animate-fade-in ${!showThreadList ? 'viewing-chat' : ''}`}>
      {/* Thread List Sidebar */}
      <div className={`thread-sidebar ${!showThreadList ? 'hide-on-mobile' : ''}`}>
        <div className="sidebar-header">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search logs..."
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
                <p>No active logs.</p>
              </div>
            ) : (
              [...filteredConversations]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((conv) => {
                  const isAssignedToMe = conv.assignedAgentId === user?._id ||
                    conv.agent?._id === user?._id;
                  const isPending = conv.routingStatus === 'holding' || conv.routingStatus === 'pending';
                  return (
                  <motion.div
                    key={conv._id}
                    layout
                    className={`thread-item ${selectedConv?._id === conv._id ? "selected" : ""}`}
                    onClick={() => handleSelectThread(conv)}
                  >
                    <div className="thread-meta">
                      <span className="thread-user">{conv.userName || 'Visitor'}</span>
                      <span className="thread-time">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="thread-preview">
                      {conv.messages[conv.messages.length - 1]?.content || "Initializing..."}
                    </p>
                    <div className="thread-footer">
                      {getStatusChip(conv.status)}
                      {isAssignedToMe && <span className="chip chip-mine">YOU</span>}
                      {isPending && isAgentView && <span className="chip chip-pending">UNASSIGNED</span>}
                      {conv.isAiActive && <div className="ai-active-indicator"><Sparkles size={10} /> AI</div>}
                    </div>
                    {selectedConv?._id === conv._id && <div className="selection-indicator" />}
                  </motion.div>
                );})
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Neural Chat Interface */}
      <div className={`neural-interface ${showThreadList ? 'hide-on-mobile' : ''}`}>
        {selectedConv ? (
          <>
            <header className="interface-header">
              <div className="header-left">
                <button className="back-btn" onClick={() => setShowThreadList(true)}>
                  <ChevronLeft size={24} />
                </button>
                <div className="header-identity">
                  <div className="identity-avatar">
                    {(selectedConv.userName || "V").charAt(0).toUpperCase()}
                  </div>
                  <div className="identity-text">
                    <h3>{selectedConv.userName || "Visitor"}</h3>
                    <div className="identity-status">
                      <span className="live-pulse-container"><div className="pulse-dot"></div> LIVE</span>
                      <span className="id-node desktop-only">ID: {selectedConv._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="header-actions">
                {isAgentView && !selectedConv.agent && (
                  <button className="btn btn-primary btn-sm" onClick={handleJoin}>
                    Join
                  </button>
                )}
                {(!isAgentView || (isAgentView && selectedConv.agent?._id === user?._id)) &&
                  selectedConv.status !== "human_resolved" && (
                    <button 
                      className={`btn btn-sm ${selectedConv.isAiActive ? "btn-secondary" : "btn-primary"}`}
                      onClick={handleToggleAi}
                      title={selectedConv.isAiActive ? "Disable AI" : "Enable AI"}
                    >
                      {selectedConv.isAiActive ? <ZapOff size={16} /> : <Zap size={16} />}
                      <span className="desktop-only">{selectedConv.isAiActive ? "Disable AI" : "Enable AI"}</span>
                    </button>
                  )}
                {(!isAgentView || (isAgentView && selectedConv.agent?._id === user?._id)) &&
                  selectedConv.status !== "human_resolved" && (
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => handleResolve(selectedConv._id)}
                      title="Resolve"
                    >
                      <CheckCircle size={16} />
                      <span className="desktop-only">Resolve</span>
                    </button>
                  )}
              </div>
            </header>

            <div className="neural-content" ref={messagesContainerRef}>
              <div className="neural-messages">
                {selectedConv.messages.map((msg, idx) => {
                  const isUs = msg.senderType === "ai" || msg.senderType === "agent" || msg.senderType === "owner";
                  const displaySide = isUs ? "us" : "customer";
                  const senderName = msg.senderName || msg.sender?.name || (msg.role === "user" ? "User" : "AI Assistant");
                  const avatarSrc = msg.senderAvatar || msg.sender?.profilePhoto || null;

                  return (
                    <div key={idx} className={`neural-message ${displaySide}`}>
                      {displaySide === "customer" && (
                        <div className="message-source">
                          <div className="source-avatar customer">
                            <User size={12} />
                          </div>
                        </div>
                      )}
                      {displaySide === "us" && msg.senderType !== "ai" && avatarSrc && (
                        <div className="message-source">
                          <div className="source-avatar agent-photo">
                            <img src={avatarSrc} alt={senderName} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                          </div>
                        </div>
                      )}
                      <div className="message-envelope">
                        {displaySide === "us" && msg.senderType !== "ai" && (
                          <div className="message-attribution">
                            {senderName} <span className="attribution-role">{msg.senderRole || 'Node'}</span>
                            {msg.senderType === 'agent' && <span className="real-human-badge">🟢 Real Human</span>}
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
                    aria-label="AI Suggestion"
                  >
                    {isSuggesting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  </button>
                  <form onSubmit={handleSendReply} className="input-form">
                    <input
                      placeholder={!canSend ? "Access restricted..." : "Type reply..."}
                      value={replyText}
                      onChange={(e) => { setReplyText(e.target.value); handleReplyTyping(); }}
                      disabled={!canSend}
                    />
                    <button type="submit" className="btn btn-primary send-btn" disabled={!replyText.trim() || isSending || !canSend}>
                      {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                  </form>
                </div>
              </footer>
            ) : (
              <div className="resolved-status">
                <CheckCircle2 size={16} />
                <span>Session terminated</span>
              </div>
            )}
          </>
        ) : (
          <div className="neural-empty hide-on-mobile">
            <div className="empty-orb">
              <MessageSquare size={40} />
            </div>
            <h3>Select a Conversation</h3>
            <p>Choose a thread from the log to begin transmission.</p>
          </div>
        )}
      </div>

      <style>{`
        .conversations-layout {
          display: flex; 
          height: calc(100vh - 100px); 
          background: white;
          border-radius: 0; 
          border: none; 
          overflow: hidden;
          position: relative;
        }

        @media (min-width: 1024px) {
          .conversations-layout {
            height: calc(100vh - 160px); 
            border-radius: var(--radius-card-modal); 
            border: 1px solid var(--outline-variant);
            box-shadow: var(--shadow-raised);
          }
        }
        
        .thread-sidebar {
          width: 100%; 
          border-right: 1px solid var(--outline-variant); 
          display: flex; 
          flex-direction: column;
          background: var(--surface-container-low);
          z-index: 10;
        }

        @media (min-width: 1024px) {
          .thread-sidebar { width: 320px; }
        }

        .hide-on-mobile { display: none !important; }
        @media (min-width: 1024px) { .hide-on-mobile { display: flex !important; } }
        
        .sidebar-header { padding: 16px; border-bottom: 1px solid var(--outline-variant); }
        @media (min-width: 1024px) { .sidebar-header { padding: 24px; } }

        .search-box {
          display: flex; align-items: center; gap: 12px; background: white;
          padding: 10px 16px; border-radius: 12px; border: 1px solid var(--outline-variant);
        }
        .search-box input { border: none; background: transparent; padding: 0; font-size: 14px; color: var(--on-surface); width: 100%; }
        .search-box input:focus { outline: none; }
        .search-box svg { color: var(--outline); }
        
        .thread-list { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .thread-item {
          padding: 16px; border-bottom: 1px solid var(--surface-container-high); cursor: pointer;
          transition: var(--transition-fast); position: relative;
        }
        @media (min-width: 1024px) { .thread-item { padding: 20px; } }

        .thread-item:hover { background: var(--surface-container-high); }
        .thread-item.selected { background: white; }
        .selection-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--primary); }
        
        .thread-meta { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .thread-user { font-weight: 700; color: var(--on-surface); font-size: 14px; }
        .thread-time { font-size: 11px; color: var(--outline); }
        .thread-preview { font-size: 13px; color: var(--on-surface-variant); margin: 0 0 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .thread-footer { display: flex; gap: 8px; align-items: center; }
        .ai-active-indicator { font-size: 10px; font-weight: 800; color: var(--primary); background: var(--surface-container-low); padding: 2px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; }
        
        .neural-interface { flex: 1; display: flex; flex-direction: column; background: white; position: relative; width: 100%; }
        .interface-header { 
          padding: 12px 16px; 
          border-bottom: 1px solid var(--outline-variant); 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          background: white;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        @media (min-width: 1024px) {
          .interface-header { padding: 20px 32px; background: var(--surface-container-lowest); }
        }

        .header-left { display: flex; align-items: center; gap: 12px; }
        .back-btn { 
          background: transparent; border: none; color: var(--on-surface); cursor: pointer; padding: 4px; border-radius: 8px;
        }
        @media (min-width: 1024px) { .back-btn { display: none; } }

        .header-identity { display: flex; align-items: center; gap: 12px; }
        .identity-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
        @media (min-width: 1024px) { .identity-avatar { width: 44px; height: 44px; font-size: 18px; } }

        .identity-text h3 { margin: 0; font-size: 15px; font-weight: 700; }
        .identity-status { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
        .live-pulse-container { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #10b981; font-weight: 800; }
        .pulse-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
        .id-node { font-size: 10px; color: var(--outline); font-weight: 600; }
        .desktop-only { display: none; }
        @media (min-width: 1024px) { .desktop-only { display: inline; } }
        
        .header-actions { display: flex; gap: 8px; }
        .neural-content { flex: 1; padding: 24px 16px; overflow-y: auto; background: var(--surface); -webkit-overflow-scrolling: touch; }
        @media (min-width: 1024px) { .neural-content { padding: 40px 32px; } }

        .neural-messages { display: flex; flex-direction: column; gap: 24px; max-width: 800px; margin: 0 auto; }
        .neural-message { display: flex; gap: 12px; width: 100%; }
        .message-source { flex-shrink: 0; }
        .source-avatar { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .source-avatar.ai { background: var(--primary-container); color: white; }
        .source-avatar.agent, .source-avatar.owner { background: var(--surface-container-highest); color: var(--on-surface); }
        
        .message-envelope { max-width: 60%; display: flex; flex-direction: column; }
        .neural-message.us { flex-direction: row-reverse; }
        .neural-message.us .message-envelope { align-items: flex-end; }
        .message-attribution { font-size: 11px; font-weight: 700; margin-bottom: 4px; color: var(--on-surface-variant); }
        .attribution-role { font-weight: 500; opacity: 0.6; }
        .message-body { padding: 12px 16px; border-radius: 14px; font-size: 14px; line-height: 1.5; word-break: break-word; }
        .us .message-body { background: var(--primary); color: white; border-top-right-radius: 2px; }
        .customer .message-body { background: white; color: var(--on-surface); border: 1px solid var(--outline-variant); border-top-left-radius: 2px; }
        .message-meta { font-size: 10px; color: var(--outline); margin-top: 6px; }
        
        .interface-footer { 
          padding: 16px; 
          background: white; 
          border-top: 1px solid var(--outline-variant);
          padding-bottom: calc(16px + env(safe-area-inset-bottom));
        }

        @media (min-width: 1024px) {
          .interface-footer { padding: 24px 32px; }
        }

        .input-cluster { display: flex; gap: 12px; align-items: center; max-width: 800px; margin: 0 auto; }
        .input-form { flex: 1; display: flex; gap: 8px; background: var(--surface-container-low); padding: 6px; border-radius: 14px; border: 1px solid var(--outline-variant); }
        .input-form input { flex: 1; border: none; background: transparent; padding: 0 8px; font-size: 14px; color: var(--on-surface); min-width: 0; }
        .input-form input:focus { outline: none; }
        .ai-intel-btn { width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--primary-container); background: white; color: var(--primary); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .send-btn { min-width: 44px; padding: 0; border-radius: 10px; }
        
        .resolved-status { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; background: var(--surface-container-low); border-top: 1px solid var(--outline-variant); color: #065f46; font-size: 13px; font-weight: 600; }
        .neural-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--on-surface-variant); text-align: center; padding: 40px; }
        .empty-orb { width: 80px; height: 80px; border-radius: 50%; background: var(--surface-container-low); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--outline); }
        
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .chip-mine { background: #ede9fe; color: #7c3aed; }
        .real-human-badge { margin-left: 6px; font-size: 10px; background: #dcfce7; color: #16a34a; padding: 1px 6px; border-radius: 8px; font-weight: 700; }
        .source-avatar.agent-photo { width: 28px; height: 28px; overflow: hidden; border-radius: 50%; }
      `}</style>
    </div>
  );
}
