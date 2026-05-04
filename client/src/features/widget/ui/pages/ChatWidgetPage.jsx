import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Loader2, Sparkles, Bell, User } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { API_URL } from "../../../../shared/services/config";

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

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const conversationIdRef = useRef(null);
  const ownerIdRef = useRef(null);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);
  useEffect(() => {
    ownerIdRef.current = ownerId;
  }, [ownerId]);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/chat/config/${apiKey}`);
        setBusiness(data);
        setOwnerId(data.ownerId);
        setMessages([
          {
            role: "assistant",
            content:
              data.appearance?.welcomeMessage ||
              "Hey there! 👋 How can I help you today?",
            timestamp: new Date(),
            senderType: "ai",
            senderName: data.appearance?.botName || data.name || "SupportBotAI",
            senderAvatar: data.appearance?.companyLogo || null,
          },
        ]);
      } catch (err) {
        console.error("Config fetch failed", err);
      }
    };
    fetchBusiness();
  }, [apiKey]);

  useEffect(() => {
    if (!ownerId) return;

    const sock = io(API_URL.replace('/api', ''), {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = sock;

    const joinRooms = () => {
      sock.emit("join_room", { ownerId, role: "user" });
      if (conversationIdRef.current) {
        sock.emit("join_session", conversationIdRef.current);
        console.log('[Widget] Joined session room:', conversationIdRef.current);
      }
    };

    // Join on first connect
    sock.on("connect", () => {
      console.log('[Widget] Socket connected, joining rooms...');
      joinRooms();
    });

    // If already connected when this effect runs, join immediately
    if (sock.connected) {
      joinRooms();
    }

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
        // Deduplicate: skip if last message has same content from same sender
        const last = prev[prev.length - 1];
        if (
          last &&
          last.content === data.content &&
          last.senderType === data.senderType
        ) return prev;
        return [...prev, newMsg];
      });

      if (data.senderType === "agent" || data.senderType === "owner") {
        setShowResolveButtons(true);
        setLastHumanSender({
          type: data.senderType,
          name: data.senderName,
          id: data.senderId,
        });
        setIsAiActive(false);
      }

      if (!isWidgetOpen) {
        setUnreadCount((prev) => prev + 1);
        window.parent.postMessage(
          {
            type: "new-message",
            content: data.content,
            count: unreadCount + 1,
          },
          "*",
        );
        window.parent.postMessage(
          { type: "unread-count", count: unreadCount + 1 },
          "*",
        );
      }
    });

    sock.on("agent_joined", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      // Only update agent info — do NOT replace messages array.
      // The join message arrives cleanly via the separate 'new_message' event.
      setAgent(data.agent);
      setIsAiActive(false);
      // Remove any escalation card shown while waiting
      setMessages((prev) => prev.filter((m) => m.role !== "system_escalation"));
    });

    sock.on("ticket_resolved", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      setIsResolved(true);
      setShowResolveButtons(false);
    });

    sock.on("ai_toggled", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      setIsAiActive(data.isAiActive);
      if (data.isAiActive) {
        setAgent(null);
      }
    });


    return () => {
      sock.off('connect');
      sock.off('new_message');
      sock.off('agent_joined');
      sock.off('ticket_resolved');
      sock.off('ai_toggled');
      sock.disconnect();
    };
  }, [ownerId]); // ← removed isWidgetOpen: socket must NOT reconnect on widget open/close

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

  const handleSend = async (content) => {
    const messageContent = (content || input).trim();
    if (!messageContent || loading) return;

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
        setMessages((prev) => [...prev, aiMsg]);
        if (!capturedName && aiAskedForName(data.content))
          setWaitingForName(true);
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
    setMessages([
      {
        role: "assistant",
        content:
          business?.appearance?.welcomeMessage ||
          "Hey there! 👋 How can I help you today?",
        timestamp: new Date(),
        senderType: "ai",
        senderName:
          business?.appearance?.botName || business?.name || "SupportBotAI",
        senderAvatar: business?.appearance?.companyLogo || null,
      },
    ]);
    setConversationId(null);
    conversationIdRef.current = null;
    setIsResolved(false);
    setAgent(null);
    setIsAiActive(true);
    setShowResolveButtons(false);
    setInput("");
    setUnreadCount(0);
    setUserName("");
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

  const headerName = !isAiActive && agent ? (agent.displayName || agent.name) : botName;
  const headerStatus = isAiActive
    ? `${botName} Online`
    : agent
      ? `${agent.roleTitle || 'Support Agent'} — Real Human 🟢`
      : "Connecting to Agent...";
  const headerAvatar =
    !isAiActive && agent?.profilePhoto ? agent.profilePhoto : logoUrl;

  return (
    <div className="cw-root">
      <div
        className="cw-header"
        style={{
          background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
        }}
      >
        <div className="cw-header-left">
          <div className="cw-logo-wrap">
            {headerAvatar ? (
              <img src={headerAvatar} alt="avatar" className="cw-logo-img" />
            ) : (
              <div
                className="cw-logo-fallback"
                style={{ background: `${themeColor}33` }}
              >
                <Sparkles size={18} color="white" />
              </div>
            )}
            <div className="cw-online-dot" />
          </div>
          <div className="cw-header-text">
            <span className="cw-bot-name">{headerName}</span>
            <span className="cw-status">
              <span className="cw-status-dot" />
              {headerStatus}
            </span>
          </div>
        </div>
        <button
          className="cw-close-btn"
          onClick={() => window.parent.postMessage("close-chat", "*")}
        >
          <X size={18} />
        </button>
      </div>

      <div className="cw-messages" ref={scrollRef}>
        {messages.map((m, i) => {
          if (m.role === 'system_escalation') {
            return (
              <div key={i} className="cw-escalation-card">
                <div className="cw-esc-icon">🔴</div>
                <div className="cw-esc-body">
                  <div className="cw-esc-title">HIGH INTENT DETECTED</div>
                  <div className="cw-esc-sub">Connecting you with our support team. An agent will join shortly...</div>
                </div>
              </div>
            );
          }

          const isAgentMsg = m.senderType === 'agent' || m.senderType === 'owner';
          const isUserMsg  = m.role === 'user' || m.senderType === 'user';
          const ts = m.timestamp ? new Date(m.timestamp) : null;

          return (
            <div key={i} className={`cw-msg cw-msg--${isUserMsg ? 'user' : 'assistant'}`}>
              {!isUserMsg && (
                <div
                  className="cw-avatar"
                  style={{
                    background: `${themeColor}22`,
                    border: `1.5px solid ${themeColor}44`,
                  }}
                >
                  {renderAvatar(m)}
                </div>
              )}
              {isUserMsg && (
                <div className="cw-avatar cw-avatar--user">
                  <User size={12} style={{ color: '#94a3b8' }} />
                </div>
              )}
              <div className="cw-bubble-wrap">
                {isAgentMsg && (
                  <div className="cw-sender-label">
                    {m.senderName || 'Agent'}
                    {m.senderRole ? `, ${m.senderRole}` : ''}
                    <span className="cw-human-badge">🟢 Real Human</span>
                  </div>
                )}
                <div
                  className="cw-bubble"
                  style={isUserMsg ? { background: themeColor, color: '#fff' } : {}}
                >
                  {m.content}
                </div>
                {ts && (
                  <div className="cw-timestamp">
                    {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && isAiActive && (
          <div className="cw-msg cw-msg--assistant">
            <div
              className="cw-avatar"
              style={{
                background: `${themeColor}22`,
                border: `1.5px solid ${themeColor}44`,
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="" className="cw-avatar-img" />
              ) : (
                <Sparkles size={12} style={{ color: themeColor }} />
              )}
            </div>
            <div className="cw-bubble-wrap">
              <div className="cw-bubble cw-bubble--typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        {unreadCount > 0 && (
          <div style={{ textAlign: "center", margin: "10px 0" }}>
            <span
              style={{
                background: "#ef4444",
                color: "white",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            >
              <Bell
                size={10}
                style={{ display: "inline", marginRight: "4px" }}
              />{" "}
              {unreadCount} NEW MESSAGES
            </span>
          </div>
        )}

        {isResolved && (
          <div
            style={{
              textAlign: "center",
              margin: "20px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              animation: "cwFadeUp 0.3s ease-out",
            }}
          >
            <span
              style={{
                background: "rgba(34,197,94,0.12)",
                color: "#22c55e",
                padding: "8px 20px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid rgba(34,197,94,0.3)",
                boxShadow: "0 2px 8px rgba(34,197,94,0.1)",
              }}
            >
              ✅ Conversation Resolved
            </span>
            <button
              onClick={startNewChat}
              className="cw-start-new-btn"
              style={{
                background: themeColor,
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "14px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: `0 4px 15px ${themeColor}44`,
              }}
            >
              Start New Conversation
            </button>
          </div>
        )}

        {error && <div className="cw-error">{error}</div>}
      </div>

      {showResolveButtons && !isResolved && !loading && (
        <div className="cw-feedback">
          <div className="cw-feedback-text">Did that solve your problem?</div>
          <div className="cw-feedback-btns">
            <button
              className="cw-fb-btn cw-fb-btn--primary"
              onClick={handleSolved}
              style={{ background: themeColor }}
            >
              ✅ Solved
            </button>
            <button
              className="cw-fb-btn cw-fb-btn--secondary"
              onClick={handleAskSomethingElse}
              style={{ color: themeColor, borderColor: `${themeColor}44` }}
            >
              Ask Something Else
            </button>
          </div>
        </div>
      )}

      {business?.faqs?.length > 0 && messages.length === 1 && !loading && (
        <div className="cw-faqs">
          <div className="cw-faqs-label">Suggested Questions</div>
          <div className="cw-faqs-list">
            {business.faqs.map((faq, i) => (
              <button
                key={i}
                className="cw-faq-btn"
                onClick={() => handleSend(faq.question)}
                style={{ borderColor: `${themeColor}44`, color: themeColor }}
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="cw-inputbar">
        {!isAiActive && agent && (
          <div
            style={{
              fontSize: "0.7rem",
              color: themeColor,
              marginBottom: "8px",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            You are now connected with {agent.displayName}
            {agent.roleTitle ? `, ${agent.roleTitle}` : ""}.
          </div>
        )}
        <form
          className="cw-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            className="cw-input"
            placeholder={
              isResolved
                ? "Start a new conversation..."
                : isAiActive
                  ? business?.appearance?.placeholderText || "Type a message…"
                  : "Reply to agent..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <button
            type="submit"
            className="cw-send-btn"
            disabled={!input.trim() || loading}
            style={{ background: themeColor }}
          >
            {loading ? (
              <Loader2 size={13} className="spin" />
            ) : (
              <MessageSquare size={13} />
            )}
          </button>
        </form>
        <div className="cw-powered">
          Powered by&nbsp;
          <strong style={{ color: themeColor }}>SupportBotAI</strong>
        </div>
      </div>

      <style>{`
        html, body { height: 100vh !important; margin: 0 !important; padding: 0 !important; background: #f0f4f8 !important; overflow: hidden !important; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .cw-root { display: flex; flex-direction: column; height: 100vh; min-height: 100vh; width: 100%; font-family: 'Inter', sans-serif; background: #f0f4f8; color: #0f172a; overflow: hidden; }
        .cw-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; color: #fff; flex-shrink: 0; }
        .cw-header-left { display: flex; align-items: center; gap: 12px; }
        .cw-logo-wrap { position: relative; width: 40px; height: 40px; }
        .cw-logo-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.4); }
        .cw-logo-fallback { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.3); }
        .cw-online-dot { position: absolute; bottom: 1px; right: 1px; width: 10px; height: 10px; background: #4ade80; border-radius: 50%; border: 2px solid white; }
        .cw-header-text { display: flex; flex-direction: column; gap: 2px; }
        .cw-bot-name { font-size: 0.95rem; font-weight: 700; }
        .cw-status { font-size: 0.7rem; opacity: 0.85; display: flex; align-items: center; gap: 4px; }
        .cw-status-dot { width: 5px; height: 5px; background: #4ade80; border-radius: 50%; }
        .cw-close-btn { background: rgba(255,255,255,0.15); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .cw-messages { flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 12px; }
        .cw-msg { display: flex; align-items: flex-end; gap: 8px; animation: cwFadeUp 0.25s ease-out; }
        .cw-msg--user { flex-direction: row-reverse; }
        @keyframes cwFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .cw-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .cw-avatar--user { background: #e2e8f0; }
        .cw-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .cw-bubble-wrap { display: flex; flex-direction: column; gap: 3px; max-width: 60%; }
        .cw-msg--user .cw-bubble-wrap { align-items: flex-end; }
        .cw-sender-label { font-size: 0.65rem; font-weight: 700; color: #64748b; padding: 0 4px; }
        .cw-bubble { padding: 10px 14px; border-radius: 18px; font-size: 0.875rem; line-height: 1.55; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .cw-msg--assistant .cw-bubble { background: #ffffff; color: #1e293b; border-top-left-radius: 4px; border: 1px solid #e2e8f0; }
        .cw-msg--user .cw-bubble { border-top-right-radius: 4px; }
        .cw-timestamp { font-size: 0.62rem; color: #94a3b8; padding: 0 4px; }
        .cw-bubble--typing { display: flex; align-items: center; gap: 4px; padding: 12px 16px; }
        .cw-bubble--typing span { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: cwTyping 1.3s infinite ease-in-out; }
        .cw-bubble--typing span:nth-child(2) { animation-delay: 0.2s; }
        .cw-bubble--typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cwTyping { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }
        .cw-error { text-align: center; font-size: 0.78rem; color: #ef4444; background: rgba(239,68,68,0.06); padding: 8px 12px; border-radius: 10px; }
        .cw-inputbar { flex-shrink: 0; padding: 8px 10px 6px; background: #ffffff; border-top: 1px solid #e2e8f0; }
        .cw-input-form { display: flex; align-items: center; gap: 6px; background: #f1f5f9; border-radius: 20px; padding: 4px 4px 4px 12px; border: 1.5px solid #e2e8f0; }
        .cw-input { flex: 1; border: none; background: transparent; font-size: 0.72rem; outline: none; padding: 4px 0; color: #1e293b; }
        .cw-send-btn { width: 28px; height: 28px; border-radius: 50%; border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .cw-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cw-powered { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.55rem; color: #94a3b8; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .cw-faqs { padding: 10px 14px; background: #ffffff; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #f1f5f9; }
        .cw-faqs-label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .cw-faqs-list { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .cw-faqs-list::-webkit-scrollbar { display: none; }
        .cw-faq-btn { white-space: nowrap; padding: 7px 14px; border-radius: 18px; border: 1.5px solid; background: #fff; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .cw-faq-btn:hover { background: #f8fafc; transform: translateY(-1px); }
        .cw-feedback { padding: 12px 14px; background: #ffffff; border-top: 1px solid #f1f5f9; animation: cwFadeUp 0.3s ease-out; }
        .cw-feedback-text { font-size: 0.72rem; font-weight: 700; color: #64748b; margin-bottom: 8px; text-align: center; }
        .cw-feedback-btns { display: flex; gap: 8px; justify-content: center; }
        .cw-fb-btn { padding: 6px 16px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1.5px solid transparent; }
        .cw-fb-btn--primary { color: #fff; }
        .cw-fb-btn--secondary { background: #fff; }
        .cw-fb-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .cw-start-new-btn:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .spin { animation: cwSpin 0.8s linear infinite; }
        @keyframes cwSpin { to { transform: rotate(360deg); } }
        .cw-escalation-card { display: flex; align-items: flex-start; gap: 10px; background: #fff5f5; border: 1px solid #fecaca; border-radius: 14px; padding: 12px 14px; margin: 4px 0; animation: cwFadeUp 0.3s ease-out; }
        .cw-esc-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        .cw-esc-title { font-size: 0.72rem; font-weight: 800; color: #dc2626; letter-spacing: 0.03em; }
        .cw-esc-sub { font-size: 0.7rem; color: #7f1d1d; margin-top: 3px; line-height: 1.4; }
        .cw-human-badge { margin-left: 6px; font-size: 0.6rem; background: #dcfce7; color: #16a34a; padding: 1px 6px; border-radius: 8px; font-weight: 700; }
      `}</style>
    </div>
  );
}
