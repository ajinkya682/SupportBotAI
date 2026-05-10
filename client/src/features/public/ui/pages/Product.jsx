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
import Footer from "../../../../shared/ui/components/Footer";

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
            style={{ margin: '0 auto 16px' }}
          >
            <Bot size={16} /> AI-FIRST PLATFORM
          </motion.div>
          <h1 className="hero-title" style={{textAlign:"center"}}>Support That <span className="gradient-text">Thinks</span> Before It Speaks</h1>
          <p className="hero-subtitle" style={{textAlign:"center"}}>Scale your customer service with an AI that doesn't just respond—it understands and resolves.</p>
          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg full-w-mobile">Get Started Free</Link>
            <button className="btn btn-outline btn-lg full-w-mobile">Watch Video Tour</button>
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
                <f.icon size={28} />
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
            <div className="title-tag"><Sparkles size={14} /> DATA HARVESTING</div>
            <h2>Instant Learning from <span className="gradient-text">Any Source</span></h2>
            <p className="showcase-desc">Paste text, upload docs, or provide a URL. SupportBotAI crawls your resources to build a localized knowledge base that stays up to date with your business.</p>
            
            <div className="showcase-features">
              <div className="s-feat">
                <div className="s-icon"><Globe size={18} /></div>
                <div className="s-feat-text">
                  <h4>Multi-language Intelligence</h4>
                  <p>Detect and reply in over 50 languages automatically.</p>
                </div>
              </div>
              <div className="s-feat">
                <div className="s-icon"><BarChart3 size={18} /></div>
                <div className="s-feat-text">
                  <h4>Deep Analytics Insights</h4>
                  <p>Understand sentiment trends and intent gaps.</p>
                </div>
              </div>
              <div className="s-feat">
                <div className="s-icon"><Headphones size={18} /></div>
                <div className="s-feat-text">
                  <h4>Hybrid Handover</h4>
                  <p>Smooth transition from AI to human agents.</p>
                </div>
              </div>
            </div>
            
            <div className="showcase-cta">
              <Link to="/signup" className="btn btn-primary full-w-mobile">
                Explore Platform <ArrowRight size={18} />
              </Link>
            </div>
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
        .product-page { 
          padding-top: 64px;
          padding-bottom: 0; 
        }
        @media (min-width: 1024px) { 
          .product-page { padding-top: 80px; padding-bottom: 0; } 
        }

        .product-hero { padding: 60px 0 40px; }
        @media (min-width: 768px) { .product-hero { padding: 120px 0 80px; } }

        .title-tag { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 10px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; background: var(--primary-fixed); width: fit-content; padding: 4px 12px; border-radius: 20px; }
        @media (min-width: 768px) { .title-tag { font-size: 11px; margin: 0 auto 24px; } }

        .hero-title { font-size: 2.25rem; line-height: 1.2; margin-bottom: 16px; font-weight: 800; letter-spacing: -0.02em; }
        @media (min-width: 768px) { .hero-title { font-size: 4rem; line-height: 1.1; margin-bottom: 24px; } }

        .hero-subtitle { font-size: 1.05rem; color: var(--on-surface-variant); max-width: 600px; margin: 0 auto; line-height: 1.5; }
        @media (min-width: 768px) { .hero-subtitle { font-size: 1.25rem; line-height: 1.6; } }

        .hero-cta { display: flex; flex-direction: column; gap: 12px; justify-content: center; margin-top: 32px; }
        @media (min-width: 640px) { .hero-cta { flex-direction: row; gap: 20px; margin-top: 40px; } }

        .full-w-mobile { width: 100%; }
        @media (min-width: 640px) { .full-w-mobile { width: auto; } }
        
        .features-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 40px; }
        @media (min-width: 640px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 60px; } }

        .feature-card-premium { padding: 32px 24px; border-radius: 24px; transition: 0.3s; }
        @media (min-width: 768px) { .feature-card-premium { padding: 48px; border-radius: 32px; } }
        .feature-card-premium:hover { transform: translateY(-8px); border-color: var(--primary-fixed); }

        .icon-wrapper { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        @media (min-width: 768px) { .icon-wrapper { width: 64px; height: 64px; border-radius: 18px; margin-bottom: 32px; } }

        .feature-card-premium h3 { font-size: 1.25rem; margin-bottom: 12px; }
        @media (min-width: 768px) { .feature-card-premium h3 { font-size: 1.5rem; margin-bottom: 16px; } }

        .feature-card-premium p { color: var(--on-surface-variant); line-height: 1.6; font-size: 0.9rem; margin: 0; }
        @media (min-width: 768px) { .feature-card-premium p { font-size: 0.95rem; line-height: 1.7; } }
        
        .product-showcase { margin-top: 80px; }
        @media (min-width: 768px) { .product-showcase { margin-top: 160px; } }

        .showcase-content { display: flex; flex-direction: column; gap: 48px; }
        @media (min-width: 1024px) { .showcase-content { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center; } }

        .showcase-text h2 { font-size: 2rem; margin: 16px 0; line-height: 1.2; font-weight: 800; }
        @media (min-width: 768px) { .showcase-text h2 { font-size: 3rem; margin: 24px 0; } }

        .showcase-desc { color: var(--on-surface-variant); font-size: 1rem; line-height: 1.6; margin-bottom: 32px; }
        @media (min-width: 768px) { .showcase-desc { font-size: 1.1rem; line-height: 1.7; margin-bottom: 40px; } }
        
        .showcase-features { display: flex; flex-direction: column; gap: 24px; }
        @media (min-width: 768px) { .showcase-features { gap: 32px; } }

        .s-feat { display: flex; align-items: flex-start; gap: 16px; }
        @media (min-width: 768px) { .s-feat { gap: 20px; } }

        .s-icon { width: 40px; height: 40px; background: var(--surface-container-low); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; }
        @media (min-width: 768px) { .s-icon { width: 44px; height: 44px; } }

        .s-feat-text h4 { font-size: 1.05rem; margin-bottom: 4px; font-weight: 700; }
        @media (min-width: 768px) { .s-feat-text h4 { font-size: 1.1rem; } }

        .s-feat-text p { font-size: 0.9rem; margin-bottom: 0; color: var(--on-surface-variant); line-height: 1.5; }
        
        .showcase-cta { margin-top: 32px; }

        .glass-mockup-wrapper { position: relative; padding: 12px; }
        @media (min-width: 768px) { .glass-mockup-wrapper { padding: 20px; } }

        .glass-mockup-wrapper::before { content: ''; position: absolute; inset: 0; background: var(--primary-fixed); filter: blur(60px); opacity: 0.3; z-index: 0; border-radius: 50%; }
        @media (min-width: 768px) { .glass-mockup-wrapper::before { filter: blur(80px); } }

        .glass-mockup { background: white; border: 1px solid var(--outline-variant); border-radius: 20px; padding: 24px; box-shadow: var(--shadow-2); position: relative; z-index: 1; }
        @media (min-width: 768px) { .glass-mockup { border-radius: 24px; padding: 32px; box-shadow: var(--shadow-4); } }

        .mockup-header { display: flex; gap: 8px; margin-bottom: 24px; }
        @media (min-width: 768px) { .mockup-header { margin-bottom: 32px; } }

        .mockup-header .dot { width: 8px; height: 8px; background: var(--outline-variant); border-radius: 50%; }
        @media (min-width: 768px) { .mockup-header .dot { width: 10px; height: 10px; } }

        .mockup-chat { display: flex; flex-direction: column; gap: 12px; }
        @media (min-width: 768px) { .mockup-chat { gap: 16px; } }

        .msg-bot { align-self: flex-start; background: var(--surface-container-low); padding: 10px 14px; border-radius: 12px; font-size: 0.8rem; max-width: 85%; }
        .msg-user { align-self: flex-end; background: var(--primary); color: white; padding: 10px 14px; border-radius: 12px; font-size: 0.8rem; max-width: 85%; }
        
        @media (min-width: 768px) {
          .msg-bot, .msg-user { padding: 12px 16px; border-radius: 16px; font-size: 0.85rem; max-width: 80%; }
        }

        @media (max-width: 1023px) {
          .showcase-text { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .s-feat { text-align: left; }
        }
      `}</style>
      <Footer />
    </div>
  );
}
