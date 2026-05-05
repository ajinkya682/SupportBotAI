import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  UserCircle2, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  MessageCircle,
  Activity,
  UserCheck,
  Search,
  MoreVertical
} from "lucide-react";

const INITIAL_STEPS = [
  {
    id: 1,
    type: 'user-typing',
    text: "Hi, what is your office address?",
    flowStep: 0,
    delay: 1500
  },
  {
    id: 2,
    type: 'user',
    text: "Hi, what is your office address?",
    flowStep: 0,
    delay: 500
  },
  {
    id: 3,
    type: 'ai-typing',
    flowStep: 1,
    delay: 2000
  },
  {
    id: 4,
    type: 'ai',
    text: "Our office address is 456 Tech Plaza, Pune, Maharashtra, India. How can I help you today?",
    flowStep: 1,
    delay: 2000
  },
  {
    id: 5,
    type: 'user-typing',
    text: "I need help with bulk order pricing and delivery logistics.",
    flowStep: 2,
    delay: 2000
  },
  {
    id: 6,
    type: 'user',
    text: "I need help with bulk order pricing and delivery logistics.",
    flowStep: 2,
    delay: 500
  },
  {
    id: 7,
    type: 'ai-typing',
    flowStep: 2,
    delay: 1500
  },
  {
    id: 8,
    type: 'ai-analyzing',
    text: "Analyzing logistics requirements and enterprise pricing models...",
    flowStep: 2,
    delay: 2000
  },
  {
    id: 9,
    type: 'ai-typing',
    flowStep: 3,
    delay: 1500
  },
  {
    id: 10,
    type: 'ai-escalate',
    text: "This is a complex request. Escalating to our Senior Enterprise Team. Agent Alex is joining...",
    flowStep: 3,
    delay: 2000
  },
  {
    id: 11,
    type: 'system',
    text: "Agent 'Alex' joined the conversation",
    flowStep: 4,
    delay: 1200
  },
  {
    id: 12,
    type: 'agent-typing',
    flowStep: 4,
    delay: 2000
  },
  {
    id: 13,
    type: 'agent',
    text: "Hi! I'm Alex. I've reviewed your request. We can offer a 25% bulk discount. I'm sending the full proposal now.",
    flowStep: 4,
    delay: 3500
  },
  {
    id: 'final',
    type: 'resolved',
    text: "Conversation marked as solved. If you have any other doubts, ask here...",
    flowStep: 4,
    delay: 3000
  }
];

const FLOW_STEPS = [
  { id: 0, label: "User Asks", icon: <MessageCircle size={16} />, desc: "Initial inquiry" },
  { id: 1, label: "AI Understands", icon: <Bot size={16} />, desc: "Contextual processing" },
  { id: 2, label: "Detects Complexity", icon: <Activity size={16} />, desc: "High intent identified" },
  { id: 3, label: "Escalates", icon: <Zap size={16} />, desc: "Seamless handover" },
  { id: 4, label: "Human Resolves", icon: <UserCheck size={16} />, desc: "Expert finalization" }
];

const KNOWLEDGE_BASE = [
  {
    keywords: ['pricing', 'cost', 'price', 'plan', 'free', 'pro'],
    response: "We offer a Free plan (100 convos/mo) and a Pro plan at $49/mo with unlimited conversations and advanced AI training."
  },
  {
    keywords: ['register', 'signup', 'sign up', 'account', 'create'],
    response: "You can register in less than 2 minutes! Just click the 'Get Started Free' button to create your account and start training your AI."
  },
  {
    keywords: ['integrate', 'setup', 'install', 'script', 'website'],
    response: "Integration is simple: just copy the single-line script tag from your dashboard and paste it before the </body> tag on your website."
  },
  {
    keywords: ['train', 'learning', 'crawl', 'url', 'faq'],
    response: "Our AI trains by crawling your website URLs or by importing your existing FAQs. It takes just seconds to process and start responding."
  },
  {
    keywords: ['language', 'support', 'native'],
    response: "SupportBotAI natively supports over 100 languages, allowing you to serve customers globally with a single assistant."
  },
  {
    keywords: ['security', 'safe', 'data', 'encryption'],
    response: "We use enterprise-grade AES-256 encryption and JWT authentication to ensure your business data and customer conversations remain private."
  },
  {
    keywords: ['human', 'agent', 'escalate', 'live'],
    response: "When the AI detects complex queries or high-intent requests, it can seamlessly escalate the conversation to a human support agent."
  }
];

const DEFAULT_RESPONSE = "That's a great question about SupportBotAI! Our platform is designed to automate customer success with high-fidelity AI. Anything else you'd like to know?";

export default function HeroAnimation() {
  const [messages, setMessages] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(null); // 'user', 'ai', 'agent' or null
  const [activeFlowStep, setActiveFlowStep] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isInteractive, setIsInteractive] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isInteractive) return;

    let timeout;
    const runNextStep = () => {
      const nextIndex = stepIndex + 1;
      
      if (nextIndex >= INITIAL_STEPS.length) {
        // Loop back after delay
        timeout = setTimeout(() => {
          setMessages([]);
          setStepIndex(-1);
          setIsTyping(null);
          setActiveFlowStep(null);
        }, 3000);
        return;
      }

      const step = INITIAL_STEPS[nextIndex];
      setStepIndex(nextIndex);
      setActiveFlowStep(step.flowStep);

      if (step.type.includes('typing')) {
        setIsTyping(step.type.split('-')[0]);
        timeout = setTimeout(runNextStep, step.delay);
      } else {
        setIsTyping(null);
        if (step.type === 'user') {
          // If it was a user message, we show the message
          setMessages(prev => [...prev, step]);
          timeout = setTimeout(runNextStep, step.delay);
        } else if (step.type === 'ai' || step.type === 'agent' || step.type === 'ai-analyzing' || step.type === 'ai-escalate' || step.type === 'system' || step.type === 'resolved') {
          setMessages(prev => [...prev, step]);
          if (step.id === 'final') {
            setIsInteractive(true);
          } else {
            timeout = setTimeout(runNextStep, step.delay);
          }
        }
      }
    };

    timeout = setTimeout(runNextStep, 1000);
    return () => clearTimeout(timeout);
  }, [stepIndex, isInteractive]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const query = inputValue.toLowerCase();
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping('ai');

    setTimeout(() => {
      // Find matching response in knowledge base
      const match = KNOWLEDGE_BASE.find(item => 
        item.keywords.some(keyword => query.includes(keyword))
      );
      
      const responseText = match ? match.response : DEFAULT_RESPONSE;

      const aiMsg = {
        id: Date.now() + 1,
        type: 'ai',
        text: responseText,
      };
      setIsTyping(null);
      setMessages(prev => [...prev, aiMsg]);
    }, 2000);
  };

  return (
    <div className="hero-visual-wrapper">
      <div className="hero-animation-layout">
        {/* Chat Mockup */}
        <div className="chat-mockup-container">
          <div className="mockup-window premium-glass">
            <div className="mockup-header">
              <div className="header-left">
                <div className="header-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="chat-info">
                  <span className="bot-name">Support Assistant</span>
                  <span className="status"><span className="status-dot"></span> Online</span>
                </div>
              </div>
              <div className="header-actions">
                <Search size={16} />
                <MoreVertical size={16} />
              </div>
            </div>

            <div className="chat-body" ref={chatRef}>
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`msg-item ${msg.type}`}
                    layout
                  >
                    {msg.type !== 'resolved' && msg.type !== 'system' && (
                      <div className="msg-avatar">
                        {msg.type === 'user' ? <UserCircle2 size={18} /> : 
                         msg.type === 'agent' ? <div className="agent-avatar">A</div> : 
                         <Bot size={18} />}
                      </div>
                    )}
                    
                    <div className="msg-content-box">
                      {msg.type === 'ai-escalate' && (
                        <div className="intent-tag">
                          <Zap size={10} fill="currentColor" /> HIGH INTENT
                        </div>
                      )}
                      <div className="msg-text">
                        {msg.type === 'resolved' && <CheckCircle2 size={14} className="check-icon" />}
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`typing-row ${isTyping === 'user' ? 'user-typing' : ''}`}
                >
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mockup-footer">
              <form onSubmit={handleSendMessage} className="input-form">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isInteractive ? "Ask anything..." : "Testing lifecycle..."}
                  className="mock-input-field"
                  disabled={!isInteractive || isTyping}
                />
                <button type="submit" className="send-btn" disabled={!isInteractive || !inputValue.trim() || isTyping}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Side Flow Visual */}
        <div className="side-flow-container">
          <div className="flow-track">
            {FLOW_STEPS.map((step, index) => (
              <div key={step.id} className="flow-step-wrapper">
                <motion.div 
                  className={`flow-step ${activeFlowStep >= step.id ? 'active' : ''}`}
                  animate={{ 
                    backgroundColor: activeFlowStep === step.id ? '#7c3aed' : 'rgba(255,255,255,0.8)',
                    color: activeFlowStep === step.id ? 'white' : '#1e293b'
                  }}
                >
                  <div className="flow-icon">{step.icon}</div>
                  <div className="flow-label">
                    <span className="title">{step.label}</span>
                    <span className="desc">{step.desc}</span>
                  </div>
                </motion.div>
                {index < FLOW_STEPS.length - 1 && (
                  <div className={`flow-line ${activeFlowStep > step.id ? 'filled' : ''}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hero-visual-wrapper { width: 100%; position: relative; }
        .hero-animation-layout { display: grid; grid-template-columns: 1fr; gap: 32px; align-items: center; }
        @media (min-width: 1024px) { .hero-animation-layout { grid-template-columns: 1.2fr 0.8fr; gap: 40px; } }

        .premium-glass {
          background: #ffffff; border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.12); border-radius: 32px;
        }

        .mockup-window { height: 560px; display: flex; flex-direction: column; overflow: hidden; }
        .mockup-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .header-dots { display: flex; gap: 6px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .red { background: #ff5f57; }
        .yellow { background: #febc2e; }
        .green { background: #28c840; }
        .chat-info { display: flex; flex-direction: column; }
        .bot-name { font-size: 14px; font-weight: 800; color: #1e293b; }
        .status { font-size: 11px; font-weight: 600; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
        .status-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; }

        .chat-body { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; background: #ffffff; scrollbar-width: none; }
        .chat-body::-webkit-scrollbar { display: none; }

        .msg-item { display: flex; gap: 12px; max-width: 88%; align-items: flex-start; }
        .msg-item.user { align-self: flex-end; flex-direction: row-reverse; }
        .msg-item.resolved, .msg-item.system { align-self: center; max-width: 100%; text-align: center; }

        .msg-avatar { width: 36px; height: 36px; border-radius: 12px; background: #f8fafc; display: flex; align-items: center; justify-content: center; border: 1px solid #f1f5f9; }
        .user .msg-avatar { color: #7c3aed; background: #f5f3ff; }
        .agent-avatar { font-weight: 900; color: #7c3aed; font-size: 14px; }

        .msg-content-box { display: flex; flex-direction: column; gap: 4px; }
        .user .msg-content-box { align-items: flex-end; }
        .intent-tag { font-size: 10px; font-weight: 900; background: #f5f3ff; color: #7c3aed; padding: 4px 8px; border-radius: 6px; width: fit-content; margin-bottom: 4px; }

        .msg-text { padding: 14px 18px; border-radius: 20px; font-size: 14px; line-height: 1.5; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .user .msg-text { background: #7c3aed; color: white; border-top-right-radius: 4px; }
        .ai .msg-text, .ai-escalate .msg-text, .ai-analyzing .msg-text, .agent .msg-text { background: #f8fafc; color: #1e293b; border-top-left-radius: 4px; border: 1px solid #f1f5f9; }
        .resolved .msg-text { background: #ecfdf5; color: #065f46; border: 1px dashed #10b981; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .system .msg-text { background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 700; border-radius: 12px; }

        .typing-row { display: flex; gap: 10px; align-items: center; }
        .typing-row.user-typing { align-self: flex-end; flex-direction: row-reverse; }
        .typing-indicator { display: flex; gap: 4px; padding: 12px 18px; background: #f8fafc; border-radius: 18px; border: 1px solid #f1f5f9; }
        .typing-indicator span { width: 5px; height: 5px; background: #cbd5e1; border-radius: 50%; animation: typing 1.4s infinite; }
        @keyframes typing { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }

        .mockup-footer { padding: 24px; border-top: 1px solid #f1f5f9; }
        .input-form { display: flex; gap: 12px; }
        .mock-input-field { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px 16px; outline: none; font-size: 14px; }
        .send-btn { width: 44px; height: 44px; background: #7c3aed; color: white; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        /* Side Flow */
        .side-flow-container { display: flex; flex-direction: column; justify-content: center; }
        .flow-step { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 16px; border: 1px solid #f1f5f9; transition: all 0.3s ease; }
        .flow-step.active { box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.2); border-color: #7c3aed; }
        .flow-icon { width: 40px; height: 40px; border-radius: 12px; background: white; display: flex; align-items: center; justify-content: center; border: 1px solid #f1f5f9; flex-shrink: 0; }
        .active .flow-icon { background: rgba(255,255,255,0.2); border-color: transparent; }
        .flow-label { display: flex; flex-direction: column; }
        .flow-label .title { font-size: 14px; font-weight: 800; }
        .flow-label .desc { font-size: 11px; font-weight: 600; opacity: 0.7; }
        .flow-line { width: 2px; height: 20px; background: #f1f5f9; margin-left: 35px; }
        .flow-line.filled { background: #7c3aed; }
      `}</style>
    </div>
  );
}
