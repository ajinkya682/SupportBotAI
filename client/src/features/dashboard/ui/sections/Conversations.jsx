import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MessageSquare, User, Bot, Send, AlertCircle,
  Search, Sparkles, Loader2, Zap, ZapOff, Crown, CheckCircle, Clock,
  UserCheck, Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../../../shared/services/config';

const statusConfig = {
  ai_resolved: { label: 'AI Resolved', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  human_resolved: { label: 'Resolved', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  human_needed: { label: 'Urgent', color: 'var(--color-error)', bg: '#fdecea' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fef3e2' },
};

export default function Conversations({
  conversations = [],
  initialSelectedId,
  setSelectedConversationId,
  isAgentView = false,
  socket,
  ownerInfo = null,
}) {
  const { user } = useSelector((state) => state.auth);
  
  const [selectedConv, setSelectedConv] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Sync selected conversation when conversations list updates
  useEffect(() => {
    if (selectedConv) {
      const updated = conversations.find(c => c._id === selectedConv._id);
      if (updated) {
        const changed = updated.messages.length !== selectedConv.messages.length ||
          updated.status !== selectedConv.status ||
          updated.isAiActive !== selectedConv.isAiActive ||
          updated.agent?._id !== selectedConv.agent?._id;
        if (changed) setSelectedConv(updated);
      }
    }
  }, [conversations]);

  // Handle initial selection from Overview
  useEffect(() => {
    if (initialSelectedId) {
      const conv = conversations.find(c => c._id === initialSelectedId);
      if (conv) setSelectedConv(conv);
    }
  }, [initialSelectedId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  const handleJoin = async () => {
    if (!selectedConv || !user) return;
    const ownerId = user.role === 'owner' ? user._id : user.ownerId;
    
    socket.emit('join_conversation', {
      conversationId: selectedConv._id,
      agentId: user._id,
      ownerId
    });
    
    setSelectedConv(prev => ({ 
      ...prev, 
      status: 'in_progress', 
      isAiActive: false,
      agent: { _id: user._id, displayName: user.displayName || user.name, profilePhoto: user.profilePhoto } 
    }));
  };

  const handleResolve = async (id) => {
    if (!user) return;
    const ownerId = user.role === 'owner' ? user._id : user.ownerId;

    socket.emit('resolve_ticket', {
      conversationId: id,
      ownerId,
      resolvedBy: user._id,
      resolvedByName: user.displayName || user.name,
      resolvedByType: user.role === 'owner' ? 'owner' : 'agent'
    });
    
    setSelectedConv(prev => ({ ...prev, status: 'human_resolved' }));
  };

  const handleToggleAi = async () => {
    if (!selectedConv || !user) return;
    const ownerId = user.role === 'owner' ? user._id : user.ownerId;

    if (selectedConv.isAiActive) {
      handleJoin();
    } else {
      socket.emit('toggle_ai', {
        conversationId: selectedConv._id,
        isAiActive: true,
        ownerId
      });
      setSelectedConv(prev => ({ ...prev, isAiActive: true }));
      toast.success("AI Assistant resumed");
    }
  };

  const handleAISuggest = async () => {
    if (!selectedConv || !user?.token) return;
    setIsSuggesting(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/chat/suggest`,
        { conversationId: selectedConv._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
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
      const ownerId = user.role === 'owner' ? user._id : user.ownerId;
      const payload = {
        conversationId: selectedConv._id,
        ownerId,
        content: replyText,
        senderType: user.role === 'owner' ? 'owner' : 'agent',
        senderName: user.role === 'owner' ? `Admin (${user.name})` : (user.displayName || user.name),
        senderAvatar: user.role === 'owner' ? (ownerInfo?.businessLogo || user.profilePhoto) : user.profilePhoto,
        senderRole: user.role === 'owner' ? 'Business Owner' : user.roleTitle
      };

      socket.emit('send_message', payload);
      
      await axios.post(`${API_URL}/api/conversations/${selectedConv._id}/reply`, {
        content: replyText,
        senderType: payload.senderType,
        senderName: payload.senderName
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setReplyText('');
    } catch (err) {
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = statusConfig[status] || statusConfig.in_progress;
    return (
      <span style={{ 
        fontSize: '10px', 
        fontWeight: 'var(--weight-bold)', 
        padding: '2px 8px', 
        borderRadius: 'var(--radius-full)', 
        background: s.bg, 
        color: s.color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {s.label}
      </span>
    );
  };

  const renderMsgAvatar = (msg) => {
    if (msg.role === 'user') {
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-muted)' }}>
          <User size={14} />
        </div>
      );
    }
    const avatarUrl = msg.senderAvatar || msg.sender?.profilePhoto;
    if (avatarUrl) {
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    }
    if (msg.senderType === 'owner') {
      return (
        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: 'var(--color-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>
          <Crown size={14} />
        </div>
      );
    }
    return (
      <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Bot size={14} />
      </div>
    );
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (conv.userName || '').toLowerCase().includes(q) ||
      (conv.messages[conv.messages.length - 1]?.content || '').toLowerCase().includes(q);
  });

  const canSend = !isAgentView || (isAgentView && selectedConv?.agent?._id === user?._id);

  return (
    <div style={{ 
      height: 'calc(100vh - 120px)', 
      display: 'flex', 
      overflow: 'hidden', 
      background: 'var(--color-surface-container-lowest)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-surface-container)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Sidebar List */}
      <div style={{ 
        width: '360px', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid var(--color-surface-container)', 
        flexShrink: 0, 
        background: 'var(--color-surface-container-lowest)' 
      }}>
        <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--color-surface-container-low)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-muted)', pointerEvents: 'none' }} />
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 'var(--space-10)', background: 'var(--color-surface-container-low)', border: 'none' }}
            />
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: 'var(--space-12) var(--space-8)', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                  <Inbox size={24} style={{ color: 'var(--color-on-surface-muted)' }} />
                </div>
                <h4 style={{ color: 'var(--color-on-surface)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-1)' }}>No results</h4>
                <p style={{ color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-xs)' }}>Try a different search term.</p>
              </div>
            ) : (
              [...filteredConversations]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((conv) => (
                  <motion.div
                    key={conv._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`conv-item ${selectedConv?._id === conv._id ? 'active' : ''}`}
                    onClick={() => { setSelectedConv(conv); if (setSelectedConversationId) setSelectedConversationId(conv._id); }}
                    style={{
                      padding: 'var(--space-4) var(--space-5)', 
                      cursor: 'pointer', 
                      transition: 'all var(--duration-base)',
                      background: selectedConv?._id === conv._id ? 'var(--color-primary-light)' : 'transparent',
                      borderLeft: `4px solid ${selectedConv?._id === conv._id ? 'var(--color-primary)' : 'transparent'}`,
                      borderBottom: '1px solid var(--color-surface-container-low)'
                    }}
                    onMouseEnter={e => { if (selectedConv?._id !== conv._id) e.currentTarget.style.background = 'var(--color-surface-container-low)'; }}
                    onMouseLeave={e => { if (selectedConv?._id !== conv._id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-1)' }}>
                      <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface)' }}>
                        {conv.userName || `User ${conv._id.substring(conv._id.length - 4).toUpperCase()}`}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-on-surface-muted)', fontWeight: 'var(--weight-medium)' }}>
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      {renderStatusBadge(conv.status)}
                      {conv.priority === 'high' && <AlertCircle size={12} style={{ color: 'var(--color-error)' }} />}
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.messages[conv.messages.length - 1]?.content || 'No messages'}
                    </p>
                  </motion.div>
                ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Chat View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', position: 'relative' }}>
        {selectedConv ? (
          <>
            {/* Header */}
            <div style={{ background: 'white', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)' }}>
                  {(selectedConv.userName || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)', margin: 0 }}>{selectedConv.userName || 'Anonymous Visitor'}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-secondary)' }}>
                      <div className="live-pulse" /> LIVE SESSION
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', fontWeight: 'var(--weight-medium)' }}>
                      AI Assistant: <strong style={{ color: selectedConv.isAiActive ? 'var(--color-primary)' : 'var(--color-error)' }}>{selectedConv.isAiActive ? 'ON' : 'OFF'}</strong>
                    </span>
                    {selectedConv.agent && (
                      <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserCheck size={12} /> {selectedConv.agent.displayName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {isAgentView && !selectedConv.agent && (
                  <button className="btn btn-primary btn-sm" onClick={handleJoin}>Join Chat</button>
                )}
                {(!isAgentView || (isAgentView && selectedConv.agent?._id === user?._id)) && selectedConv.status !== 'human_resolved' && (
                  <>
                    <button 
                      className={`btn btn-sm ${selectedConv.isAiActive ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={handleToggleAi}>
                      {selectedConv.isAiActive ? <ZapOff size={14} /> : <Zap size={14} />}
                      {selectedConv.isAiActive ? "Pause AI" : "Resume AI"}
                    </button>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-secondary)', borderColor: 'var(--color-secondary-light)' }} onClick={() => handleResolve(selectedConv._id)}>
                      <CheckCircle size={14} /> Resolve
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="custom-scrollbar"
              style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', background: 'var(--color-surface-container-lowest)' }}>
              {selectedConv.messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const senderName = msg.senderName || msg.sender?.name || (isUser ? 'Visitor' : 'AI');
                const senderType = msg.senderType || msg.sender?.userType || (isUser ? 'user' : 'ai');
                const isHuman = senderType === 'agent' || senderType === 'owner';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', padding: '0 var(--space-2)' }}>
                      {!isUser && renderMsgAvatar(msg)}
                      <span style={{ fontSize: '11px', fontWeight: 'var(--weight-semibold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {senderName} {isHuman && ' (Staff)'}
                      </span>
                      {isUser && renderMsgAvatar(msg)}
                    </div>
                    <div style={{
                      maxWidth: '80%', 
                      padding: 'var(--space-3) var(--space-4)', 
                      borderRadius: 'var(--radius-xl)',
                      ...(isUser 
                        ? { background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', borderTopRightRadius: '4px' }
                        : isHuman 
                          ? { background: 'var(--color-secondary-light)', color: 'var(--color-secondary)', borderTopLeftRadius: '4px', border: '1px solid rgba(0,107,60,0.1)' }
                          : { background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderTopLeftRadius: '4px', border: '1px solid rgba(0,74,198,0.1)' }
                      )
                    }}>
                      <div style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-body)' }}>{msg.content}</div>
                    </div>
                    <div style={{ marginTop: 'var(--space-1)', padding: '0 var(--space-2)', fontSize: '10px', color: 'var(--color-on-surface-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} /> {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}

              {!selectedConv.isAiActive && selectedConv.status !== 'human_resolved' && (
                <div style={{ textAlign: 'center', margin: 'var(--space-4) 0' }}>
                  <span style={{ background: '#fffbeb', color: '#b45309', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', border: '1px solid #fde68a' }}>
                    AI paused — Staff in control
                  </span>
                </div>
              )}

              {selectedConv.status === 'human_resolved' && (
                <div style={{ textAlign: 'center', margin: 'var(--space-4) 0' }}>
                  <span style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', border: `1px solid rgba(0,107,60,0.2)` }}>
                    Conversation marked as resolved
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Footer */}
            {selectedConv.status !== 'human_resolved' && (
              <div style={{ padding: 'var(--space-5) var(--space-6)', background: 'white', borderTop: '1px solid var(--color-surface-container)', opacity: !canSend ? 0.6 : 1 }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAISuggest}
                    disabled={isSuggesting || !canSend} 
                    style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)', flexShrink: 0 }}>
                    {isSuggesting ? <Loader2 className="spin" size={20} /> : <Sparkles size={20} />}
                  </motion.button>
                  
                  <form onSubmit={handleSendReply} style={{ flex: 1, display: 'flex', gap: 'var(--space-3)', background: 'var(--color-surface-container-low)', padding: 'var(--space-2) var(--space-2) var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-surface-container)' }}>
                    <input
                      placeholder={!canSend ? "Join conversation to reply..." : "Type your message..."}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={!canSend}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--color-on-surface)', outline: 'none', fontSize: 'var(--text-sm)' }}
                    />
                    <motion.button 
                      whileTap={{ scale: 0.9 }} 
                      type="submit" 
                      disabled={!replyText.trim() || isSending || !canSend}
                      style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      {isSending ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
                    </motion.button>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-container-lowest)' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
              <MessageSquare size={32} style={{ color: 'var(--color-on-surface-muted)' }} />
            </div>
            <h3 style={{ color: 'var(--color-on-surface)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-1)' }}>Select a conversation</h3>
            <p style={{ color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)' }}>Choose a chat from the sidebar to start responding.</p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-surface-container); border-radius: 10px; }
        .live-pulse { width: 8px; height: 8px; background: var(--color-secondary); border-radius: 50%; animation: pulse-anim 2s infinite; }
        @keyframes pulse-anim { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .spin { animation: spin-anim 0.8s linear infinite; }
        @keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
