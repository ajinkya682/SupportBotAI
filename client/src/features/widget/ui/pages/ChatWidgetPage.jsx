import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Sparkles, Bell, User, Send, Volume2, VolumeX, RotateCcw, Star, ChevronDown, Minus } from "lucide-react";
import Loader from "../../../../shared/ui/components/Loader";
import ReactMarkdown from 'react-markdown';

function playPop(muted) {
  if (muted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 520; o.type = 'sine';
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.start(); o.stop(ctx.currentTime + 0.18);
  } catch {}
}
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { API_URL } from "../../../../shared/services/config";
import { usePushNotifications } from "../../../../shared/hooks/usePushNotifications";

function extractName(text) {
  const patterns = [
    /(?:my name is|i(?:'m| am)|call me)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+)(?:\s[A-Z][a-z]+)?[.,!]?\s*(?:here|speaking)?$/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

function aiAskedForName(text) {
  const lower = text.toLowerCase();
  return (
    lower.includes("your name") ||
    lower.includes("what's your name") ||
    lower.includes("may i know your name") ||
    lower.includes("can i get your name")
  );
}

export default function ChatWidgetPage() {
  const { apiKey } = useParams();

  // 1. All Refs at the top
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const conversationIdRef = useRef(null);
  const ownerIdRef = useRef(null);
  const typingTimerRef = useRef(null);
  const pendingAiRef = useRef(null);

  // 2. All State
  const [business, setBusiness] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [userName, setUserName] = useState("");
  const [waitingForName, setWaitingForName] = useState(false);
  const [isAiActive, setIsAiActive] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);
  const [isResolved, setIsResolved] = useState(false);
  const [agent, setAgent] = useState(null);
  const [showResolveButtons, setShowResolveButtons] = useState(false);
  const [lastHumanSender, setLastHumanSender] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [typingAgentName, setTypingAgentName] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [showScrollPill, setShowScrollPill] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [starRating, setStarRating] = useState(0);
  const [starHover, setStarHover] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const { subscribeToPush, isSubscribed } = usePushNotifications(null);

  // 3. Sync Refs with State
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);
  useEffect(() => { ownerIdRef.current = ownerId; }, [ownerId]);

  // 4. Initial Config Fetch
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/chat/config/${apiKey}`);
        setBusiness(data);
        setOwnerId(data.ownerId);
        setMessages([{
          role: "assistant",
          content: data.appearance?.welcomeMessage || "Hey there! 👋 How can I help you today?",
          timestamp: new Date(),
          senderType: "ai",
          senderName: data.appearance?.botName || data.name || "SupportBotAI",
          senderAvatar: data.appearance?.companyLogo || null,
        }]);
      } catch (err) { console.error("Config fetch failed", err); }
    };
    fetchBusiness();
  }, [apiKey]);

  // 5. Socket Setup
  useEffect(() => {
    if (!ownerId) return;

    const sock = io(API_URL.replace('/api', ''), {
      autoConnect: true, reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 1000,
    });
    socketRef.current = sock;

    const joinRooms = () => {
      sock.emit("join_room", { ownerId, role: "user" });
      if (conversationIdRef.current) sock.emit("join_session", conversationIdRef.current);
    };

    sock.on("connect", () => { setIsConnected(true); joinRooms(); });
    sock.on("disconnect", () => setIsConnected(false));
    if (sock.connected) joinRooms();

    sock.on("new_message", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      if (data.senderType === "user") return;

      const newMsg = {
        role: "assistant",
        content: data.content,
        timestamp: data.timestamp || new Date(),
        senderType: data.senderType,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        senderRole: data.senderRole,
      };

      setMessages((prev) => {
        // Dedup: check last 10 messages
        const recent = prev.slice(-10);
        const isDup = recent.some(m => m.content === data.content && (m.senderType === data.senderType || (m.senderType === 'ai' && data.senderType === 'ai')));
        if (isDup) return prev;
        
        // Skip if this content was just added by REST
        if (pendingAiRef.current === data.content) {
          pendingAiRef.current = null;
          return prev;
        }
        return [...prev, newMsg];
      });

      playPop(isMuted);
      if (data.senderType === "agent" || data.senderType === "owner") {
        setShowResolveButtons(true);
        setLastHumanSender({ type: data.senderType, name: data.senderName, id: data.senderId });
        setIsAiActive(false);
      }
      
      if (!isWidgetOpen) {
        setUnreadCount((prev) => prev + 1);
        window.parent.postMessage({ type: "new-message", content: data.content, count: unreadCount + 1 }, "*");
        window.parent.postMessage({ type: "unread-count", count: unreadCount + 1 }, "*");
      }

      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop - clientHeight > 100) { setShowScrollPill(true); setNewMsgCount(p => p + 1); }
      }
    });

    sock.on("agent_typing", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      setIsAgentTyping(true);
      setTypingAgentName(data.agentName || "Agent");
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsAgentTyping(false), 3000);
    });

    sock.on("agent_joined", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      setAgent(data.agent);
      setIsAiActive(false);
      setMessages((prev) => {
        // Prevent duplicate join cards for the same agent
        const hasJoinCard = prev.some(m => m.role === 'system_agent_joined' && m.agent?._id === data.agent?._id);
        if (hasJoinCard) return prev;

        return [
          ...prev.filter((m) => m.role !== "system_escalation"),
          { role: "system_agent_joined", agent: data.agent, timestamp: new Date() }
        ];
      });
    });

    sock.on("ticket_resolved", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      setIsResolved(true);
      setShowResolveButtons(false);
      if (data.messages) {
        setMessages(data.messages);
      }
    });

    sock.on("ai_toggled", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      setIsAiActive(data.isAiActive);
      if (data.isAiActive) setAgent(null);
    });

    return () => {
      sock.off('connect'); sock.off('disconnect'); sock.off('new_message');
      sock.off('agent_typing'); sock.off('agent_joined'); sock.off('ticket_resolved'); sock.off('ai_toggled');
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      sock.disconnect();
    };
  }, [ownerId]);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data === "chat-opened") {
        setIsWidgetOpen(true);
        setUnreadCount(0);
      } else if (e.data === "chat-closed") setIsWidgetOpen(false);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [messages]);

  const themeColor = business?.appearance?.themeColor || "#6366f1";
  const botName =
    business?.appearance?.botName || business?.name || "SupportBotAI";
  const logoUrl = business?.appearance?.companyLogo || null;

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    setShowScrollPill(false); setNewMsgCount(0);
  };

  const handleSend = async (content) => {
    const messageContent = (content || input).trim();
    if (!messageContent || loading) return;
    setShowWelcome(false);
    setError(null);
    setShowResolveButtons(false);

    let currentMessages = messages;
    let currentConvId = conversationId;

    if (isResolved) {
      startNewChat();
      return;
    }

    const userMsg = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      senderType: "user",
      senderName: userName || "You",
    };

    let capturedName = userName;

    if (waitingForName || !userName || userName === "Anonymous") {
      const detected = extractName(messageContent);
      if (detected) {
        capturedName = detected;
        setUserName(detected);
        setWaitingForName(false);
      } else if (waitingForName) {
        const parts = messageContent.trim().split(" ");
        if (parts.length <= 2) {
          capturedName = parts[0];
          setUserName(capturedName);
          setWaitingForName(false);
        }
      }
    }

    const updatedMessages = [...currentMessages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/chat`, {
        apiKey,
        messages: updatedMessages.map(({ role, content }) => ({
          role,
          content,
        })),
        conversationId: currentConvId,
        userName: capturedName || undefined,
        origin: window.location.href
      });

      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
        conversationIdRef.current = data.conversationId;
        socketRef.current?.emit("join_session", data.conversationId);
      }

      if (data.userName && data.userName !== "Anonymous") {
        setUserName(data.userName);
      }

      setIsAiActive(data.isAiActive ?? true);

      if (data.content) {
        const aiMsg = {
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
          senderType: "ai",
          senderName: botName,
          senderAvatar: logoUrl,
        };
        // Mark this content so the socket listener skips it if it arrives after us
        pendingAiRef.current = data.content;
        setMessages((prev) => {
          // Also dedup here in case socket already added it
          const recent = prev.slice(-5);
          if (recent.some(m => m.content === data.content && m.senderType === 'ai')) {
            pendingAiRef.current = null;
            return prev;
          }
          return [...prev, aiMsg];
        });
        // Clear the pending marker after a safe window
        setTimeout(() => { pendingAiRef.current = null; }, 3000);
        if (!capturedName && aiAskedForName(data.content)) setWaitingForName(true);
      }

      // Show escalation cinematic message if ticket was created
      if (data.status === 'human_needed') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system_escalation',
            content: 'escalation',
            timestamp: new Date(),
            senderType: 'system',
          },
        ]);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSolved = () => {
    if (!conversationId || !ownerId) return;
    const sock = socketRef.current;
    if (sock) {
      sock.emit("resolve_ticket", {
        ownerId,
        conversationId,
        resolvedBy: lastHumanSender?.id || "unknown",
        resolvedByName: lastHumanSender?.name || "Support",
        resolvedByType: lastHumanSender?.type || "agent",
      });
    }
    setIsResolved(true);
    setShowResolveButtons(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "✅ Great! I'm glad we could help. Your ticket has been marked as solved. Have a wonderful day! 😊",
        timestamp: new Date(),
        senderType: "ai",
        senderName: botName,
        senderAvatar: logoUrl,
      },
    ]);
  };

  const handleAskSomethingElse = () => {
    setShowResolveButtons(false);
    setIsAiActive(true);
    setInput("");
    if (inputRef.current) inputRef.current.focus();
  };

  const startNewChat = () => {
    setMessages([{ role: "assistant", content: business?.appearance?.welcomeMessage || "Hey there! 👋 How can I help you today?", timestamp: new Date(), senderType: "ai", senderName: botName, senderAvatar: logoUrl }]);
    setConversationId(null); conversationIdRef.current = null; setIsResolved(false); setAgent(null);
    setIsAiActive(true); setShowResolveButtons(false); setInput(""); setUnreadCount(0); setUserName(""); setStarRating(0); setShowWelcome(false);
  };

  const renderAvatar = (msg) => {
    if (msg.senderType === "agent" && msg.senderAvatar) {
      return (
        <img
          src={msg.senderAvatar}
          alt={msg.senderName || ""}
          className="cw-avatar-img"
        />
      );
    }
    if (msg.senderType === "owner" && msg.senderAvatar) {
      return (
        <img
          src={msg.senderAvatar}
          alt={msg.senderName || ""}
          className="cw-avatar-img"
        />
      );
    }
    if (msg.senderAvatar) {
      return <img src={msg.senderAvatar} alt="" className="cw-avatar-img" />;
    }
    if (logoUrl) return <img src={logoUrl} alt="" className="cw-avatar-img" />;
    return <Sparkles size={12} style={{ color: themeColor }} />;
  };

  const headerName = !isAiActive && agent ? (agent.displayName || agent.name) : (business?.appearance?.botName || business?.name || "SupportBotAI");
  const headerAvatar = !isAiActive && agent?.profilePhoto ? agent.profilePhoto : (business?.appearance?.companyLogo || null);

  const showBranding = business?.plan !== 'pro' || !business?.appearance?.hideBranding;

  return (
    <div className="cw-root">
      {!isConnected && (
        <div className="cw-reconnect-banner">
          <RotateCcw size={12} className="spin" /> Reconnecting to service...
        </div>
      )}

      {/* Header */}
      <div className="cw-header" style={{ borderTop: `4px solid ${themeColor}` }}>
        <div className="cw-header-left">
          <div className="cw-header-av">
            {headerAvatar ? (
              <img src={headerAvatar} alt={headerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Sparkles size={20} color={themeColor} />
            )}
          </div>
          <div className="cw-header-text">
            <span className="cw-bot-name">{headerName}</span>
            <div className="cw-status">
              <div className="cw-online-dot" />
              <span>Online</span>
            </div>
          </div>
        </div>
        <div className="cw-header-actions">
          <button className="cw-icon-btn" onClick={() => setIsMuted(m => !m)} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX size={18} color="#94a3b8" /> : <Volume2 size={18} color="#94a3b8" />}
          </button>
          <button className="cw-icon-btn" onClick={() => window.parent.postMessage("close-supportbot", "*")}>
            <Minus size={20} color="#94a3b8" />
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div className="cw-messages" ref={scrollRef}>
        {messages.length === 1 && !loading && showWelcome && (
          <div className="cw-empty-state">
            <div className="cw-empty-av">
              {logoUrl ? (
                <img src={logoUrl} alt={botName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <Sparkles size={40} color={themeColor} />
              )}
            </div>
            <h2>How can we help?</h2>
            <p>Ask me anything about our products or services. I'm here to help you instantly.</p>
          </div>
        )}

        {messages.map((m, i) => {
          const isUserMsg = m.role === 'user' || m.senderType === 'user';
          const ts = m.timestamp ? new Date(m.timestamp) : null;
          const prevTs = i > 0 ? new Date(messages[i-1].timestamp) : null;
          const showSeparator = ts && prevTs && (ts - prevTs > 30 * 60 * 1000); // 30 mins gap
          const avatar = m.senderAvatar || (m.senderType === 'ai' ? logoUrl : null);

          const separator = showSeparator ? (
            <div key={`sep-${i}`} className="cw-date-separator">
              <span>{ts.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : null;

          if (m.role === 'system_escalation') return (
            <div key={i} className="cw-esc-card" style={{ borderLeftColor: themeColor }}>
              <div className="cw-esc-badge" style={{ background: `linear-gradient(135deg, ${themeColor}, #dc2626)` }}>⚡ HIGH INTENT</div>
              <div className="cw-esc-line">Connecting to a human agent...</div>
            </div>
          );

          if (m.role === 'system_agent_joined') return (
            <div key={i} className="cw-agent-joined-pill">
              <span className="cw-aj-dot" />
              <strong>{m.agent?.displayName || m.agent?.name || 'Agent'}</strong> joined the chat
            </div>
          );

          return (
            <>
              {separator}
              <div key={i} className={`cw-msg cw-msg--${isUserMsg ? 'user' : 'bot'}`}>
                {!isUserMsg && (
                  <div className="cw-av-mini">
                    {avatar ? (
                      <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ background: `${themeColor}15`, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={14} color={themeColor} />
                      </div>
                    )}
                  </div>
                )}
                <div className="cw-bubble-container">
                  <div className={`cw-bubble cw-bubble--${isUserMsg ? 'user' : 'bot'}`}>
                    {isUserMsg ? (
                      <span>{m.content}</span>
                    ) : (
                      <div className="cw-markdown">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {ts && <span className="cw-ts">{ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              </div>
            </>
          );
        })}

        {/* AI typing */}
        {loading && (
          <div className="cw-msg cw-msg--bot">
            <div className="cw-av-mini">
              {logoUrl ? (
                <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div style={{ background: `${themeColor}15`, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color={themeColor} />
                </div>
              )}
            </div>
            <div className="cw-bubble cw-bubble--bot">
              <div className="cw-typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {/* Agent typing */}
        {isAgentTyping && (
          <div className="cw-msg cw-msg--bot">
            <div className="cw-av-mini" style={{ background: '#dcfce7' }}>
              <User size={14} color="#16a34a" />
            </div>
            <div className="cw-bubble-container">
              <div className="cw-bubble cw-bubble--bot">
                <div className="cw-typing-dots">
                  <span style={{ background: '#16a34a' }} /><span style={{ background: '#16a34a' }} /><span style={{ background: '#16a34a' }} />
                </div>
              </div>
              <span className="cw-ts" style={{ fontStyle: 'italic' }}>{typingAgentName} is typing...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="cw-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={12} /></button>
          </div>
        )}
      </div>

      {/* Quick Replies */}
      {business?.faqs?.length > 0 && messages.length === 1 && !loading && showWelcome && (
        <div className="cw-chips-wrapper">
          {business.faqs.slice(0, 5).map((faq, i) => (
            <button key={i} className="cw-chip" onClick={() => handleSend(faq.question)}>
              {faq.question}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="cw-inputbar">
        <form className="cw-input-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <input
            ref={inputRef}
            className="cw-input"
            placeholder={isResolved ? "Conversation ended..." : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isResolved}
            aria-label="Type your message"
          />
          <button 
            type="submit" 
            className="cw-send-btn" 
            disabled={!input.trim() || loading || isResolved}
            style={{ background: input.trim() && !loading && !isResolved ? themeColor : '#e5e7eb' }}
            aria-label="Send message"
          >
            <Send size={18} color="#fff" fill={input.trim() ? "#fff" : "none"} />
          </button>
        </form>
        {showBranding && (
          <div className="cw-powered">Powered by SupportBotAI</div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        :root {
          --brand-primary: ${themeColor};
          --bubble-bot-bg: #ffffff;
          --bubble-user-bg: ${themeColor};
          --chat-bg: #f9fafb;
          --header-bg: #ffffff;
          --text-main: #1f2937;
          --text-muted: #6b7280;
          --border-color: #e5e7eb;
        }

        html, body { 
          height: 100vh !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          overflow: hidden !important; 
          font-family: 'Inter', sans-serif;
        }

        .cw-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          background: var(--chat-bg);
          color: var(--text-main);
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
        }

        /* Header */
        .cw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #ffffff;
          border-bottom: 1px solid var(--border-color);
          z-index: 10;
        }

        .cw-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cw-header-av {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px var(--border-color);
        }

        .cw-header-text {
          display: flex;
          flex-direction: column;
        }

        .cw-bot-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .cw-status {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cw-online-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }

        .cw-header-actions {
          display: flex;
          gap: 8px;
        }

        /* Message Thread */
        .cw-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scroll-behavior: smooth;
        }

        .cw-messages::-webkit-scrollbar {
          width: 5px;
        }
        .cw-messages::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }

        .cw-msg {
          display: flex;
          max-width: 85%;
          position: relative;
          animation: cwSlideUp 0.3s ease-out forwards;
        }

        @keyframes cwSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cw-msg--bot {
          align-self: flex-start;
          flex-direction: row;
          gap: 10px;
          align-items: flex-end;
        }

        .cw-msg--user {
          align-self: flex-end;
          flex-direction: row-reverse;
          align-items: flex-end;
        }

        .cw-date-separator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 24px 0;
          font-size: 0.7rem;
          color: #9ca3af;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cw-date-separator span {
          background: var(--chat-bg);
          padding: 0 12px;
          z-index: 1;
        }
        .cw-date-separator::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
          z-index: 0;
        }

        .cw-av-mini {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          align-self: flex-end;
          margin-bottom: 4px;
        }

        .cw-bubble {
          padding: 12px 16px;
          font-size: 0.9rem;
          line-height: 1.6;
          word-break: break-word;
          position: relative;
        }

        .cw-bubble--bot {
          background: var(--bubble-bot-bg);
          color: #374151;
          border-radius: 18px 18px 18px 4px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .cw-bubble--user {
          background: var(--bubble-user-bg);
          color: #ffffff;
          border-radius: 18px 18px 4px 18px;
        }

        .cw-ts {
          font-size: 0.7rem;
          color: #9ca3af;
          margin-top: 4px;
          display: block;
        }

        .cw-msg--user .cw-ts { text-align: right; }

        /* Markdown Styles */
        .cw-markdown p { margin-bottom: 8px; }
        .cw-markdown p:last-child { margin-bottom: 0; }
        .cw-markdown strong { font-weight: 700; color: inherit; }
        .cw-markdown ul, .cw-markdown ol { padding-left: 20px; margin: 8px 0; }
        .cw-markdown li { margin-bottom: 4px; }
        .cw-markdown li::marker { color: var(--brand-primary); }
        .cw-markdown code { 
          background: rgba(0,0,0,0.05); 
          padding: 2px 4px; 
          border-radius: 4px; 
          font-family: monospace; 
          font-size: 0.85em; 
        }
        .cw-markdown a { 
          color: var(--brand-primary); 
          text-decoration: none; 
          font-weight: 600;
        }
        .cw-markdown a:hover { text-decoration: underline; }

        /* Typing Indicator */
        .cw-typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }
        .cw-typing-dots span {
          width: 8px;
          height: 8px;
          background: var(--brand-primary);
          border-radius: 50%;
          opacity: 0.6;
          animation: cwTypingWave 1.2s infinite ease-in-out;
        }
        .cw-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .cw-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes cwTypingWave {
          0%, 60%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          30% { transform: translateY(-4px) scale(1.1); opacity: 1; }
        }

        /* Empty State */
        .cw-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          animation: cwFadeIn 0.5s ease-out;
        }
        .cw-empty-av {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          border: 4px solid #fff;
        }
        .cw-empty-state h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; color: var(--text-main); }
        .cw-empty-state p { font-size: 0.95rem; color: var(--text-muted); max-width: 240px; line-height: 1.5; }

        @keyframes cwFadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Quick Replies */
        .cw-chips-wrapper {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 16px 16px;
          scrollbar-width: none;
        }
        .cw-chips-wrapper::-webkit-scrollbar { display: none; }
        .cw-chip {
          white-space: nowrap;
          padding: 8px 16px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s;
        }
        .cw-chip:hover {
          background: var(--brand-primary);
          color: #ffffff;
          border-color: var(--brand-primary);
          transform: translateY(-2px);
        }

        /* Input Bar */
        .cw-inputbar {
          background: #ffffff;
          padding: 12px 16px 16px;
          border-top: 1px solid var(--border-color);
          box-shadow: 0 -4px 10px rgba(0,0,0,0.02);
        }
        .cw-input-form {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cw-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          padding: 10px 0;
          outline: none;
          color: var(--text-main);
        }
        .cw-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cw-send-btn:hover:not(:disabled) { transform: scale(1.1); }
        .cw-send-btn:active:not(:disabled) { transform: scale(0.9); }
        .cw-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .cw-powered {
          font-size: 0.6rem;
          text-align: center;
          color: #9ca3af;
          margin-top: 8px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .cw-reconnect-banner {
          background: #fef3c7;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 8px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cw-error {
          background: #fee2e2;
          color: #b91c1c;
          font-size: 0.8rem;
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          animation: cwSlideUp 0.3s ease-out;
        }
        .cw-error button {
          background: none;
          border: none;
          color: #b91c1c;
          cursor: pointer;
          opacity: 0.7;
        }
        .cw-error button:hover { opacity: 1; }

        .spin { animation: cwSpin 1s linear infinite; }
        @keyframes cwSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Mobile Styles */
        @media (max-width: 640px) {
          .cw-root { border-radius: 0; }
          .cw-header { border-radius: 0; position: sticky; top: 0; }
          .cw-inputbar { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }
        }
      `}</style>

    </div>
  );
}
