import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Loader2, Sparkles, Bell, User, Send, Volume2, VolumeX, RotateCcw, Star, ChevronDown } from "lucide-react";

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
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [typingAgentName, setTypingAgentName] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [showScrollPill, setShowScrollPill] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [starRating, setStarRating] = useState(0);
  const [starHover, setStarHover] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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
      autoConnect: true, reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 1000,
    });
    socketRef.current = sock;

    const joinRooms = () => {
      sock.emit("join_room", { ownerId, role: "user" });
      if (conversationIdRef.current) {
        sock.emit("join_session", conversationIdRef.current);
        console.log('[Widget] Joined session room:', conversationIdRef.current);
      }
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
        // Deduplicate: skip if last message has same content from same sender
        const last = prev[prev.length - 1];
        if (
          last &&
          last.content === data.content &&
          last.senderType === data.senderType
        ) return prev;
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
      setIsAgentTyping(true); setTypingAgentName(data.agentName || "Agent");
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsAgentTyping(false), 3000);
    });

    sock.on("agent_joined", (data) => {
      const cid = conversationIdRef.current;
      if (!cid || data.conversationId !== cid.toString()) return;
      setAgent(data.agent); setIsAiActive(false);
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "system_escalation"),
        { role: "system_agent_joined", agent: data.agent, timestamp: new Date() }
      ]);
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
      sock.off('connect'); sock.off('disconnect'); sock.off('new_message');
      sock.off('agent_typing'); sock.off('agent_joined'); sock.off('ticket_resolved'); sock.off('ai_toggled');
      clearTimeout(typingTimerRef.current); sock.disconnect();
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

  const headerName = !isAiActive && agent ? (agent.displayName || agent.name) : botName;
  const headerAvatar = !isAiActive && agent?.profilePhoto ? agent.profilePhoto : logoUrl;

  return (
    <div className="cw-root">
      {!isConnected && (
        <div className="cw-reconnect-banner">
          <RotateCcw size={11} style={{animation:'cwSpin 1s linear infinite'}} /> Reconnecting...
        </div>
      )}

      {/* Header */}
      <div className="cw-header">
        <div className="cw-header-left">
          <div className="cw-avatar-ring" style={{'--rc': themeColor}}>
            <div className="cw-header-av">
              {headerAvatar
                ? <img src={headerAvatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                : <Sparkles size={15} color={themeColor} />}
            </div>
            <div className="cw-online-dot" />
          </div>
          <div className="cw-header-text">
            <span className="cw-bot-name">{headerName}</span>
            <span className="cw-status">
              <span className="cw-status-pulse" style={{background:'#22c55e'}} />
              {isAiActive ? 'Online · AI Assistant' : agent ? `${agent.roleTitle||'Support Agent'} · Real Human 🟢` : 'Connecting...'}
            </span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
          <button className="cw-icon-btn" onClick={()=>setIsMuted(m=>!m)} title={isMuted?'Unmute':'Mute'}>
            {isMuted ? <VolumeX size={14} color="#94a3b8"/> : <Volume2 size={14} color="#94a3b8"/>}
          </button>
          <button className="cw-icon-btn" onClick={()=>window.parent.postMessage("close-chat","*")}>
            <X size={15} color="#94a3b8"/>
          </button>
        </div>
      </div>
      <div className="cw-header-pulse" style={{'--pc':themeColor}} />

      {/* Messages */}
      <div className="cw-messages" ref={scrollRef}>
        {messages.map((m, i) => {
          if (m.role === 'system_escalation') return (
            <div key={i} className="cw-esc-card">
              <div className="cw-esc-badge">⚡ HIGH INTENT</div>
              {['Detecting query complexity...','High intent identified. Preparing escalation...','Connecting to Senior Enterprise Team...','Agent is joining...'].map((line,li)=>(
                <div key={li} className="cw-esc-line" style={{animationDelay:`${li*0.6}s`}}>
                  {li===3 ? <><Loader2 size={12} style={{animation:'cwSpin 0.8s linear infinite',marginRight:6}}/>{line}</> : line}
                </div>
              ))}
            </div>
          );

          if (m.role === 'system_agent_joined') return (
            <div key={i} className="cw-agent-joined-card">
              <span className="cw-aj-check">✓</span>
              <div className="cw-aj-text">
                <strong>{m.agent?.displayName||m.agent?.name||'Agent'}</strong> has joined
                <div className="cw-aj-sub">Now chatting with a real human</div>
              </div>
              {m.agent?.profilePhoto && <img src={m.agent.profilePhoto} alt="" className="cw-aj-photo"/>}
            </div>
          );

          const isAgentMsg = m.senderType==='agent'||m.senderType==='owner';
          const isUserMsg = m.role==='user'||m.senderType==='user';
          const ts = m.timestamp ? new Date(m.timestamp) : null;
          const src = m.senderAvatar||(m.senderType==='ai'?logoUrl:null);

          return (
            <div key={i} className={`cw-msg cw-msg--${isUserMsg?'user':'bot'}`}>
              {!isUserMsg && (
                <div className="cw-av" style={{background:`${themeColor}18`,border:`1.5px solid ${themeColor}33`}}>
                  {src ? <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : <Sparkles size={12} color={themeColor}/>}
                </div>
              )}
              <div className="cw-bubble-wrap">
                {isAgentMsg && (
                  <div className="cw-sender-label">
                    {m.senderName||'Agent'}{m.senderRole?`, ${m.senderRole}`:''}
                    <span className="cw-human-badge">🟢 Real Human</span>
                  </div>
                )}
                <div className={`cw-bubble ${isUserMsg?'cw-bubble--user':'cw-bubble--bot'}`}
                  style={isUserMsg?{background:`linear-gradient(135deg,${themeColor},${themeColor}dd)`}:{}}>
                  {m.content}
                </div>
                {ts && <div className="cw-ts">{ts.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>}
              </div>
              {isUserMsg && (
                <div className="cw-av cw-av--user"><User size={12} color="#94a3b8"/></div>
              )}
            </div>
          );
        })}

        {/* AI typing */}
        {loading && isAiActive && (
          <div className="cw-msg cw-msg--bot">
            <div className="cw-av" style={{background:`${themeColor}18`,border:`1.5px solid ${themeColor}33`}}>
              {logoUrl ? <img src={logoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : <Sparkles size={12} color={themeColor}/>}
            </div>
            <div className="cw-bubble cw-bubble--bot cw-bubble--typing"><span/><span/><span/></div>
          </div>
        )}

        {/* Agent typing */}
        {isAgentTyping && (
          <div className="cw-msg cw-msg--bot">
            <div className="cw-av" style={{background:'#dcfce7',border:'1.5px solid #bbf7d0'}}>
              <User size={12} color="#16a34a"/>
            </div>
            <div className="cw-bubble-wrap">
              <div className="cw-bubble cw-bubble--bot cw-bubble--typing"><span/><span/><span/></div>
              <div className="cw-ts" style={{fontStyle:'italic'}}>{typingAgentName} is typing...</div>
            </div>
          </div>
        )}

        {/* Resolved card */}
        {isResolved && (
          <div className="cw-resolved-card">
            <div className="cw-resolved-check">✓</div>
            <div className="cw-resolved-title">Conversation Resolved</div>
            <div className="cw-resolved-sub">Hope we helped! Rate your experience:</div>
            <div className="cw-stars">
              {[1,2,3,4,5].map(s=>(
                <Star key={s} size={22}
                  fill={s<=(starHover||starRating)?'#f59e0b':'none'}
                  color={s<=(starHover||starRating)?'#f59e0b':'#d1d5db'}
                  style={{cursor:'pointer',transition:'all 0.15s'}}
                  onMouseEnter={()=>setStarHover(s)}
                  onMouseLeave={()=>setStarHover(0)}
                  onClick={()=>setStarRating(s)}/>
              ))}
            </div>
            <button onClick={startNewChat} className="cw-new-chat-btn" style={{background:themeColor}}>
              Start New Conversation
            </button>
          </div>
        )}

        {error && <div className="cw-error">{error}</div>}

        {/* Scroll-to-bottom pill */}
        {showScrollPill && (
          <button className="cw-scroll-pill" onClick={scrollToBottom} style={{background:themeColor}}>
            <ChevronDown size={14}/> {newMsgCount>0?`${newMsgCount} new`:''}
          </button>
        )}
      </div>


      {showResolveButtons && !isResolved && !loading && (
        <div className="cw-feedback">
          <div className="cw-feedback-text">Did that solve your problem?</div>
          <div className="cw-feedback-btns">
            <button className="cw-fb-btn cw-fb-btn--primary" onClick={handleSolved} style={{background:themeColor}}>✅ Solved</button>
            <button className="cw-fb-btn cw-fb-btn--secondary" onClick={handleAskSomethingElse} style={{color:themeColor,borderColor:`${themeColor}44`}}>Ask Something Else</button>
          </div>
        </div>
      )}

      {business?.faqs?.length > 0 && messages.length === 1 && !loading && (
        <div className="cw-faqs">
          <div className="cw-faqs-label">Suggested Questions</div>
          <div className="cw-faqs-list">
            {business.faqs.map((faq, i) => (
              <button key={i} className="cw-faq-btn" onClick={() => handleSend(faq.question)} style={{borderColor:`${themeColor}44`,color:themeColor}}>
                {faq.question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="cw-inputbar">
        {!isAiActive && agent && (
          <div className="cw-conn-label">Connected with {agent.displayName}{agent.roleTitle ? `, ${agent.roleTitle}` : ''}</div>
        )}
        <form className="cw-input-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <input
            ref={inputRef}
            className="cw-input"
            placeholder={isResolved ? "Start a new conversation..." : isAiActive ? (business?.appearance?.placeholderText || "Ask anything...") : "Reply to agent..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="cw-send-btn" disabled={!input.trim() || loading} style={{background: input.trim() && !loading ? themeColor : '#d1d5db'}}>
            {loading ? <Loader2 size={15} className="spin"/> : <MessageSquare size={15}/>}
          </button>
        </form>
        <div className="cw-powered">Powered by&nbsp;<strong style={{color:themeColor}}>SupportBotAI</strong></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        html,body{height:100vh!important;margin:0!important;padding:0!important;overflow:hidden!important;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .cw-root{display:flex;flex-direction:column;height:100vh;width:100%;font-family:'Inter',sans-serif;background:#fff;color:#111827;overflow:hidden;}
        /* Reconnect */
        .cw-reconnect-banner{background:#fef3c7;color:#92400e;font-size:0.68rem;font-weight:600;padding:6px 14px;display:flex;align-items:center;gap:6px;justify-content:center;flex-shrink:0;}
        /* Header */
        .cw-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#fff;border-bottom:1.5px solid #f0f0f5;flex-shrink:0;}
        .cw-header-left{display:flex;align-items:center;gap:10px;}
        .cw-avatar-ring{position:relative;width:40px;height:40px;flex-shrink:0;}
        .cw-avatar-ring::before{content:'';position:absolute;inset:-2px;border-radius:50%;background:conic-gradient(var(--rc,#7c3aed),#818cf8,var(--rc,#7c3aed));animation:cwRing 3s linear infinite;z-index:0;}
        @keyframes cwRing{to{transform:rotate(360deg);}}
        .cw-header-av{position:relative;z-index:1;width:36px;height:36px;border-radius:50%;background:#f3f0ff;display:flex;align-items:center;justify-content:center;overflow:hidden;margin:2px;}
        .cw-online-dot{position:absolute;bottom:1px;right:1px;width:10px;height:10px;background:#22c55e;border-radius:50%;border:2px solid #fff;z-index:2;animation:cwPulse 2s infinite;}
        @keyframes cwPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4);}50%{box-shadow:0 0 0 4px rgba(34,197,94,0);}}
        .cw-header-text{display:flex;flex-direction:column;gap:2px;}
        .cw-bot-name{font-size:0.95rem;font-weight:700;color:#111827;}
        .cw-status{font-size:0.68rem;color:#6b7280;display:flex;align-items:center;gap:5px;}
        .cw-status-pulse{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .cw-icon-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;transition:background 0.15s;}
        .cw-icon-btn:hover{background:#f1f5f9;}
        .cw-header-pulse{height:2px;background:linear-gradient(90deg,transparent,var(--pc,#7c3aed),transparent);background-size:200% 100%;animation:cwHeaderPulse 2.5s ease-in-out infinite;flex-shrink:0;}
        @keyframes cwHeaderPulse{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
        /* Messages */
        .cw-messages{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;position:relative;}
        .cw-messages::-webkit-scrollbar{width:4px;} .cw-messages::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px;}
        .cw-msg{display:flex;align-items:flex-end;gap:8px;animation:cwFadeUp 0.25s ease-out;}
        .cw-msg--user{flex-direction:row-reverse;}
        .cw-msg--bot{}
        @keyframes cwFadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .cw-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;}
        .cw-av--user{background:#ede9fe;}
        .cw-bubble-wrap{display:flex;flex-direction:column;gap:3px;max-width:70%;}
        .cw-msg--user .cw-bubble-wrap{align-items:flex-end;}
        .cw-sender-label{font-size:0.63rem;font-weight:700;color:#64748b;padding:0 4px;}
        .cw-bubble{padding:10px 14px;border-radius:18px;font-size:0.84rem;line-height:1.6;word-break:break-word;}
        .cw-bubble--bot{background:#f8f7ff;color:#1f2937;border-radius:18px 18px 18px 4px;border:1px solid #ede9fe;}
        .cw-bubble--user{color:#fff;border-radius:18px 18px 4px 18px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.2);}
        .cw-ts{font-size:0.6rem;color:#9ca3af;padding:0 4px;}
        .cw-human-badge{margin-left:6px;font-size:0.58rem;background:#dcfce7;color:#16a34a;padding:1px 6px;border-radius:8px;font-weight:700;}
        /* Typing dots */
        .cw-bubble--typing{display:flex;align-items:center;gap:4px;padding:12px 16px;}
        .cw-bubble--typing span{width:6px;height:6px;background:#94a3b8;border-radius:50%;animation:cwTyping 1.2s infinite ease-in-out;}
        .cw-bubble--typing span:nth-child(2){animation-delay:0.2s;}
        .cw-bubble--typing span:nth-child(3){animation-delay:0.4s;}
        @keyframes cwTyping{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-5px);opacity:1;}}
        /* Escalation card */
        .cw-esc-card{background:linear-gradient(135deg,#fdf4ff,#fef3c7);border-left:3px solid #7c3aed;border-radius:12px;padding:12px 14px;margin:4px 0;animation:cwFadeUp 0.4s ease-out;}
        .cw-esc-badge{display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#7c3aed,#dc2626);color:#fff;font-size:0.62rem;font-weight:800;padding:3px 8px;border-radius:20px;letter-spacing:0.05em;margin-bottom:8px;animation:cwBadgePop 0.4s cubic-bezier(0.34,1.56,0.64,1);}
        @keyframes cwBadgePop{from{transform:scale(0.8);}to{transform:scale(1);}}
        .cw-esc-line{font-size:0.72rem;color:#374151;padding:3px 0;display:flex;align-items:center;animation:cwFadeUp 0.4s ease-out both;}
        /* Agent joined card */
        .cw-agent-joined-card{display:flex;align-items:center;gap:10px;background:#f0fdf4;border:1px solid #d1fae5;border-radius:12px;padding:10px 14px;margin:4px 0;animation:cwScaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        @keyframes cwScaleIn{from{transform:scale(0.92);opacity:0;}to{transform:scale(1);opacity:1;}}
        .cw-aj-check{width:26px;height:26px;border-radius:50%;background:#22c55e;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0;}
        .cw-aj-text{flex:1;font-size:0.75rem;color:#374151;}
        .cw-aj-sub{font-size:0.62rem;color:#6b7280;margin-top:2px;}
        .cw-aj-photo{width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #bbf7d0;}
        /* Resolved card */
        .cw-resolved-card{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1.5px dashed #22c55e;border-radius:16px;padding:18px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;animation:cwFadeUp 0.4s ease-out;}
        .cw-resolved-check{width:40px;height:40px;border-radius:50%;background:#22c55e;color:#fff;font-size:1.2rem;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .cw-resolved-title{font-size:0.9rem;font-weight:800;color:#166534;}
        .cw-resolved-sub{font-size:0.72rem;color:#4b7c5a;}
        .cw-stars{display:flex;gap:4px;}
        .cw-new-chat-btn{border:none;color:#fff;padding:9px 20px;border-radius:20px;font-size:0.78rem;font-weight:700;cursor:pointer;transition:all 0.2s;margin-top:4px;}
        .cw-new-chat-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
        /* Scroll pill */
        .cw-scroll-pill{position:sticky;bottom:0;align-self:center;border:none;color:#fff;padding:5px 12px;border-radius:20px;font-size:0.68rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);animation:cwFadeUp 0.2s ease-out;}
        /* Error */
        .cw-error{font-size:0.75rem;color:#ef4444;background:rgba(239,68,68,0.06);padding:8px 12px;border-radius:10px;text-align:center;}
        /* Feedback */
        .cw-feedback{flex-shrink:0;padding:10px 14px;background:#fff;border-top:1px solid #f1f5f9;animation:cwFadeUp 0.3s ease-out;}
        .cw-feedback-text{font-size:0.72rem;font-weight:700;color:#64748b;margin-bottom:8px;text-align:center;}
        .cw-feedback-btns{display:flex;gap:8px;justify-content:center;}
        .cw-fb-btn{padding:6px 16px;border-radius:12px;font-size:0.75rem;font-weight:600;cursor:pointer;transition:all 0.2s;border:1.5px solid transparent;}
        .cw-fb-btn--primary{color:#fff;} .cw-fb-btn--secondary{background:#fff;}
        .cw-fb-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.08);}
        /* FAQs */
        .cw-faqs{flex-shrink:0;padding:8px 12px;background:#fff;display:flex;flex-direction:column;gap:6px;border-top:1px solid #f1f5f9;}
        .cw-faqs-label{font-size:0.6rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;}
        .cw-faqs-list{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;}
        .cw-faqs-list::-webkit-scrollbar{display:none;}
        .cw-faq-btn{white-space:nowrap;padding:6px 13px;border-radius:18px;border:1.5px solid;background:#fff;font-size:0.73rem;font-weight:600;cursor:pointer;transition:all 0.2s;}
        .cw-faq-btn:hover{background:#faf5ff;transform:translateY(-1px);}
        /* Input bar */
        .cw-inputbar{flex-shrink:0;padding:8px 10px 6px;background:#fff;border-top:1px solid #e5e7eb;}
        .cw-conn-label{font-size:0.68rem;color:#7c3aed;font-weight:700;text-align:center;margin-bottom:6px;}
        .cw-input-form{display:flex;align-items:center;gap:6px;background:#f9fafb;border-radius:28px;padding:4px 4px 4px 14px;border:1.5px solid #e5e7eb;transition:border-color 0.2s,box-shadow 0.2s;}
        .cw-input-form:focus-within{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,0.1);}
        .cw-input{flex:1;border:none;background:transparent;font-size:0.8rem;outline:none;padding:4px 0;color:#111827;font-family:'Inter',sans-serif;}
        .cw-input::placeholder{color:#9ca3af;}
        .cw-send-btn{width:36px;height:36px;border-radius:50%;border:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all 0.2s;}
        .cw-send-btn:hover:not(:disabled){transform:scale(1.05);}
        .cw-send-btn:disabled{opacity:0.45;cursor:not-allowed;}
        .cw-powered{display:flex;align-items:center;justify-content:center;gap:4px;font-size:0.55rem;color:#94a3b8;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;}
        @keyframes cwSpin{to{transform:rotate(360deg);}}
        .spin{animation:cwSpin 0.8s linear infinite;}
      `}</style>

    </div>
  );
}
