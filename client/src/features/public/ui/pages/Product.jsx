import { motion } from "framer-motion";
import { 
  Bot, 
  Cpu, 
  MessageCircle, 
  Zap, 
  ShieldCheck, 
  BarChart3,
  Globe,
  Headphones,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Product() {
  const features = [
    {
      title: "Advanced AI Core",
      desc: "Our proprietary LLM logic ensures your assistant understands context, nuances, and brand tone perfectly.",
      icon: Cpu,
      color: "var(--primary)"
    },
    {
      title: "Emotion Detection",
      desc: "Identify frustrated or urgent customers instantly and escalate to a human agent before they churn.",
      icon: ShieldCheck,
      color: "var(--error)"
    },
    {
      title: "Seamless Integration",
      desc: "Embed our lightweight widget on WordPress, Shopify, React, or any platform with a single script tag.",
      icon: Zap,
      color: "#f59e0b"
    },
    {
      title: "Real-time Inbox",
      desc: "Manage all conversations in one place. Take over chats manually whenever you see a complex issue.",
      icon: MessageCircle,
      color: "#10b981"
    }
  ];

  return (
    <div className="product-page animate-fade-in">
      <section className="product-hero">
        <div className="container text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="title-tag"
            style={{ margin: '0 auto 24px' }}
          >
            <Bot size={20} /> AI-FIRST PLATFORM
          </motion.div>
          <h1 className="hero-title">Support That <span className="gradient-text">Thinks</span> Before It Speaks</h1>
          <p className="hero-subtitle">Scale your customer service with an AI that doesn't just respond—it understands and resolves.</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free</Link>
            <button className="btn btn-outline btn-lg">Watch Video Tour</button>
          </div>
        </div>
      </section>

      <section className="features-grid-section container">
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card feature-card-premium"
            >
              <div className="icon-wrapper" style={{ color: f.color, background: `${f.color}15` }}>
                <f.icon size={32} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="product-showcase container">
        <div className="showcase-content">
          <div className="showcase-text">
            <div className="title-tag"><Sparkles size={16} /> DATA HARVESTING</div>
            <h2>Instant Learning from <span className="gradient-text">Any Source</span></h2>
            <p>Paste text, upload docs, or provide a URL. SupportBotAI crawls your resources to build a localized knowledge base that stays up to date with your business.</p>
            <div className="showcase-features">
              <div className="s-feat">
                <div className="s-icon"><Globe size={20} /></div>
                <div>
                  <h4>Multi-language Intelligence</h4>
                  <p>Detect and reply in over 50 languages automatically.</p>
                </div>
              </div>
              <div className="s-feat">
                <div className="s-icon"><BarChart3 size={20} /></div>
                <div>
                  <h4>Deep Analytics Insights</h4>
                  <p>Understand sentiment trends and intent gaps.</p>
                </div>
              </div>
              <div className="s-feat">
                <div className="s-icon"><Headphones size={20} /></div>
                <div>
                  <h4>Hybrid Handover</h4>
                  <p>Smooth transition from AI to human agents.</p>
                </div>
              </div>
            </div>
            <Link to="/signup" className="btn btn-primary" style={{ marginTop: '32px' }}>
              Explore Platform <ArrowRight size={18} />
            </Link>
          </div>
          <div className="showcase-visual">
            <div className="glass-mockup-wrapper">
              <div className="glass-mockup">
                <div className="mockup-header">
                  <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                </div>
                <div className="mockup-chat">
                  <div className="msg-bot">Hi! How can I help?</div>
                  <div className="msg-user">What's your return policy?</div>
                  <div className="msg-bot">We offer a 30-day no-questions-asked refund policy for all plans!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .product-page { padding-bottom: 120px; }
        .product-hero { padding: 120px 0 80px; }
        .hero-title { font-size: 4rem; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.02em; }
        .hero-subtitle { font-size: 1.25rem; color: var(--on-surface-variant); max-width: 600px; margin: 0 auto; line-height: 1.6; }
        
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin-top: 60px; }
        .feature-card-premium { padding: 48px; border-radius: 32px; transition: 0.3s; }
        .feature-card-premium:hover { transform: translateY(-8px); border-color: var(--primary-fixed); }
        .icon-wrapper { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
        .feature-card-premium h3 { font-size: 1.5rem; margin-bottom: 16px; }
        .feature-card-premium p { color: var(--on-surface-variant); line-height: 1.7; font-size: 0.95rem; }
        
        .product-showcase { margin-top: 160px; }
        .showcase-content { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center; }
        .showcase-text h2 { font-size: 3rem; margin: 24px 0; line-height: 1.2; }
        .showcase-text p { color: var(--on-surface-variant); font-size: 1.1rem; line-height: 1.7; margin-bottom: 40px; }
        
        .showcase-features { display: flex; flex-direction: column; gap: 32px; }
        .s-feat { display: flex; gap: 20px; }
        .s-icon { width: 44px; height: 44px; background: var(--surface-container-low); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; }
        .s-feat h4 { font-size: 1.1rem; margin-bottom: 4px; }
        .s-feat p { font-size: 0.9rem; margin-bottom: 0; color: var(--on-surface-variant); }
        
        .glass-mockup-wrapper { position: relative; padding: 20px; }
        .glass-mockup-wrapper::before { content: ''; position: absolute; inset: 0; background: var(--primary-fixed); filter: blur(80px); opacity: 0.3; z-index: 0; border-radius: 50%; }
        .glass-mockup { background: white; border: 1px solid var(--outline-variant); border-radius: 24px; padding: 32px; box-shadow: var(--shadow-4); position: relative; z-index: 1; }
        .mockup-header { display: flex; gap: 8px; margin-bottom: 32px; }
        .mockup-header .dot { width: 10px; height: 10px; background: var(--outline-variant); border-radius: 50%; }
        .mockup-chat { display: flex; flex-direction: column; gap: 16px; }
        .msg-bot { align-self: flex-start; background: var(--surface-container-low); padding: 12px 16px; border-radius: 16px; font-size: 0.85rem; max-width: 80%; }
        .msg-user { align-self: flex-end; background: var(--primary); color: white; padding: 12px 16px; border-radius: 16px; font-size: 0.85rem; max-width: 80%; }
        
        @media (max-width: 992px) {
          .showcase-content { grid-template-columns: 1fr; gap: 60px; text-align: center; }
          .s-feat { text-align: left; }
          .hero-title { font-size: 3rem; }
        }
      `}</style>
    </div>
  );
}
