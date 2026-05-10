import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Bot, 
  Zap, 
  Shield, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  BarChart3, 
  Globe, 
  Clock,
  Sparkles,
  PlayCircle,
  Activity,
  Cpu,
  Inbox,
  Languages,
  Users,
  Code,
  X
} from "lucide-react";
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa6';
import PricingSection from "../components/PricingSection";
import HeroAnimation from "../components/HeroAnimation";
import Footer from "../../../../shared/ui/components/Footer";
import { API_URL } from "../../../../shared/services/config";
import axios from "axios";

export default function Home() {
  const [showVideo, setShowVideo] = useState(false);
  const [platformConfig, setPlatformConfig] = useState({
    heroVideoUrl: "https://drive.google.com/file/d/1pLfBH1QpokINZq0_7NW7an-lSC_kzYQy/preview",
    twitterUrl: "https://twitter.com",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com"
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/super-admin/config`);
        if (res.data.success) {
          setPlatformConfig(prev => ({
            ...prev,
            ...res.data.config
          }));
        }
      } catch (err) {
        console.error("Failed to fetch public config:", err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="landing-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>AI-FIRST PLATFORM</span>
            </div>
            <h1>
              Support That Thinks <br /> 
              <span className="gradient-text">Before It Speaks.</span>
            </h1>
            <p className="hero-desc">
              Scale your customer service with an AI that doesn't just respond—it understands and resolves complex queries instantly.
            </p>
            
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg full-width-mobile">
                Get Started Free <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => setShowVideo(true)}
                className="btn btn-secondary btn-lg full-width-mobile"
              >
                <PlayCircle size={20} /> Watch Video Tour
              </button>
            </div>

            <div className="hero-highlights">
              <div className="highlight-item">
                <Cpu size={18} />
                <span>Advanced AI Core</span>
              </div>
              <div className="highlight-item">
                <Activity size={18} />
                <span>Emotion Detection</span>
              </div>
              <div className="highlight-item">
                <Layers size={18} />
                <span>Seamless Integration</span>
              </div>
              <div className="highlight-item">
                <Inbox size={18} />
                <span>Real-time Inbox</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <HeroAnimation />
          </motion.div>
        </div>
      </section>

      {/* Integration Strip */}
      <section className="integration-strip">
        <div className="container">
          <p className="strip-label">CONNECTS SEAMLESSLY WITH YOUR STACK</p>
          <div className="integration-logos">
            <div className="logo-item"><Globe size={24} /> <span>WordPress</span></div>
            <div className="logo-item"><Zap size={24} /> <span>Shopify</span></div>
            <div className="logo-item"><Cpu size={24} /> <span>React</span></div>
            <div className="logo-item"><Layers size={24} /> <span>Webflow</span></div>
            <div className="logo-item"><Shield size={24} /> <span>Next.js</span></div>
          </div>
        </div>
      </section>

      {/* Code Snippet & Features */}
      <section className="mid-features-section">
        <div className="container">
          <div className="mid-grid">
            <div className="code-block-container">
              <div className="code-header">
                <div className="dots"><span></span><span></span><span></span></div>
                <span>widget.js</span>
              </div>
              <div className="code-content">
                <code>
                  <span className="keyword">&lt;script</span> <span className="attr">src</span>=<span className="string">"https://supportbotai.com/widget.js"</span><span className="keyword">&gt;&lt;/script&gt;</span>
                </code>
              </div>
              <div className="code-caption">
                <Code size={14} /> One line of code to deploy everywhere.
              </div>
            </div>

            <div className="feature-cards-grid">
              <div className="mini-card">
                <div className="icon-box"><Sparkles size={20} /></div>
                <h4>Instant Learning</h4>
                <p>Train from any URL or PDF in seconds.</p>
              </div>
              <div className="mini-card">
                <div className="icon-box"><Languages size={20} /></div>
                <h4>Multi-language</h4>
                <p>Support in 100+ languages natively.</p>
              </div>
              <div className="mini-card">
                <div className="icon-box"><BarChart3 size={20} /></div>
                <h4>Deep Analytics</h4>
                <p>Insights into customer sentiment.</p>
              </div>
              <div className="mini-card">
                <div className="icon-box"><Zap size={20} /></div>
                <h4>Hybrid Handover</h4>
                <p>Perfect AI-to-Human transition.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <p className="trust-label">TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</p>
          <div className="logo-cloud">
            {['Stripe', 'Airbnb', 'HubSpot', 'Linear', 'Discord', 'Slack'].map(name => (
              <span key={name} className="logo-placeholder">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-title text-center">
            <div className="title-tag">GETTING STARTED</div>
            <h2>Three steps to support excellence</h2>
          </div>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Connect Your Data', desc: 'Upload your docs or link your URL. SupportBotAI learns your business in seconds.' },
              { step: '02', title: 'Customize Your Bot', desc: 'Define your brand voice, theme colors, and welcome messages to match your style.' },
              { step: '03', title: 'Embed & Automate', desc: 'Paste the script tag and watch your resolution rates soar instantly.' }
            ].map((item, idx) => (
              <div key={idx} className="step-item">
                <span className="step-num">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* Simple Billing CTA Section */}
      <section className="cta-final-section">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cta-card"
          >
            <div className="cta-content">
              <div className="cta-badge">SIMPLE BILLING</div>
              <h2>Ready to scale your support?</h2>
              <p>Join 2,000+ companies automating their customer success with SupportBotAI. Setup takes less than 5 minutes.</p>
              <div className="cta-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started Free <ArrowRight size={20} />
                </Link>
                <Link to="/pricing" className="btn btn-secondary btn-lg">
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="cta-visual desktop-only">
              <div className="floating-stat">
                <div className="stat-icon"><Users size={20} /></div>
                <div className="stat-text">
                  <strong>2,000+</strong>
                  <span>Businesses</span>
                </div>
              </div>
              <div className="floating-stat second">
                <div className="stat-icon"><Zap size={20} /></div>
                <div className="stat-text">
                  <strong>99.9%</strong>
                  <span>Resolution</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />

      <AnimatePresence>
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="video-modal-overlay"
            onClick={() => setShowVideo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="video-modal-content"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-video" onClick={() => setShowVideo(false)}>
                <X size={24} />
              </button>
              <div className="video-wrapper">
                <iframe 
                  src={platformConfig.heroVideoUrl} 
                  width="100%" 
                  height="100%" 
                  allow="autoplay"
                  title="SupportBotAI Video Tour"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .video-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }

        .video-modal-content {
          width: 100%;
          max-width: 1000px;
          position: relative;
          background: #000;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }

        @media (min-width: 768px) {
          .video-modal-overlay { padding: 40px; }
          .video-modal-content { border-radius: 24px; }
        }

        .close-video {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          transition: all 0.2s ease;
        }

        @media (min-width: 768px) {
          .close-video { width: 44px; height: 44px; top: 20px; right: 20px; }
        }

        .close-video:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.1);
        }

        .video-wrapper {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
          height: 0;
        }

        .video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .landing-page { 
          background: #ffffff; 
          color: #1e293b; 
          padding-top: 64px;
        }
        @media (min-width: 1024px) {
          .landing-page { padding-top: 80px; }
        }
        
        .hero-section { padding: 32px 0 60px; overflow: hidden; position: relative; }
        @media (min-width: 768px) { .hero-section { padding: 60px 0 100px; } }
        
        .hero-container { 
          display: flex; flex-direction: column; gap: 64px; align-items: center; 
          position: relative; z-index: 1; 
        }

        @media (min-width: 1024px) {
          .hero-container { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; text-align: left; }
        }
        
        .hero-badge { 
          display: flex; align-items: center; gap: 10px; 
          background: #f5f3ff; color: #7c3aed; padding: 10px 18px; 
          border-radius: 99px; font-weight: 800; font-size: 11px; 
          width: fit-content; margin-bottom: 32px; border: 1px solid rgba(124, 58, 237, 0.1);
          letter-spacing: 0.1em;
        }

        .hero-text h1 { 
          font-size: clamp(2.5rem, 10vw, 4.5rem); line-height: 1.05; 
          margin-bottom: 24px; letter-spacing: -0.03em; font-weight: 900; 
        }
        
        .gradient-text { background: linear-gradient(135deg, #7c3aed, #3525cd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .hero-desc { font-size: 1.25rem; color: #64748b; line-height: 1.6; margin-bottom: 48px; max-width: 540px; }
        
        .hero-cta { display: flex; flex-direction: column; gap: 12px; margin-bottom: 60px; width: 100%; }
        @media (min-width: 640px) { .hero-cta { flex-direction: row; width: auto; } }
        
        .full-width-mobile { width: 100%; }
        @media (min-width: 640px) { .full-width-mobile { width: auto; } }
        
        .btn-lg { padding: 16px 28px; font-size: 1.05rem; border-radius: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; }
        @media (min-width: 768px) { .btn-lg { padding: 18px 36px; font-size: 1.1rem; border-radius: 16px; } }
        
        .btn-primary { background: #7c3aed; color: white; box-shadow: 0 20px 40px -10px rgba(124, 58, 237, 0.4); border: none; }
        .btn-secondary { background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0; }

        .hero-highlights { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 768px) { .hero-highlights { gap: 24px; } }
        .highlight-item { display: flex; align-items: center; gap: 8px; color: #64748b; font-weight: 600; font-size: 13px; }
        @media (min-width: 768px) { .highlight-item { gap: 12px; font-size: 14px; } }
        .highlight-item svg { color: #7c3aed; }

        .hero-visual { width: 100%; max-width: 900px; }

        /* Integration Strip */
        .integration-strip { padding: 32px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
        @media (min-width: 768px) { .integration-strip { padding: 40px 0; } }
        .strip-label { text-align: center; font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 0.15em; margin-bottom: 32px; }
        .integration-logos { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; opacity: 0.6; padding: 0 10px; }
        @media (min-width: 768px) { .integration-logos { gap: 48px; padding: 0; } }
        
        .logo-item { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: #64748b; }
        @media (min-width: 768px) { .logo-item { gap: 10px; font-size: 15px; } }

        /* Mid Section */
        .mid-features-section { padding: 120px 0; background: #ffffff; }
        .mid-grid { display: grid; grid-template-columns: 1fr; gap: 64px; align-items: center; }
        @media (min-width: 1024px) { .mid-grid { grid-template-columns: 1fr 1fr; } }

        .code-block-container { 
          background: #1e293b; 
          border-radius: 20px; 
          padding: 20px; 
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.3); 
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        @media (min-width: 768px) { .code-block-container { border-radius: 24px; padding: 32px; } }
        .code-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; color: #94a3b8; font-size: 12px; font-weight: 700; }
        .code-header .dots { display: flex; gap: 6px; }
        .code-header .dots span { width: 8px; height: 8px; border-radius: 50%; background: #334155; }
        .code-content { 
          color: #e2e8f0; 
          font-family: monospace; 
          font-size: 11px; 
          line-height: 1.6; 
          overflow-x: auto; 
          padding: 10px 0;
          white-space: pre-wrap;
          word-break: break-all;
        }
        @media (min-width: 768px) { .code-content { font-size: 14px; line-height: 1.8; white-space: nowrap; } }
        .keyword { color: #818cf8; }
        .attr { color: #38bdf8; }
        .string { color: #34d399; }
        .code-caption { margin-top: 24px; color: #64748b; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        .feature-cards-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px) { .feature-cards-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; } }
        .mini-card { padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; background: #ffffff; transition: all 0.3s ease; }
        @media (min-width: 768px) { .mini-card { padding: 24px; border-radius: 20px; } }
        .mini-card:hover { border-color: #7c3aed; transform: translateY(-5px); }
        .icon-box { width: 40px; height: 40px; border-radius: 10px; background: #f5f3ff; color: #7c3aed; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        @media (min-width: 768px) { .icon-box { width: 44px; height: 44px; border-radius: 12px; margin-bottom: 16px; } }
        .mini-card h4 { font-size: 15px; font-weight: 800; margin-bottom: 6px; }
        @media (min-width: 768px) { .mini-card h4 { font-size: 16px; margin-bottom: 8px; } }
        .mini-card p { font-size: 13px; color: #64748b; line-height: 1.5; }

        /* Existing Styles Optimized */
        .trust-section { padding: 80px 0; }
        .trust-label { text-align: center; font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 40px; }
        .logo-cloud { display: flex; flex-wrap: wrap; justify-content: center; gap: 60px; opacity: 0.4; font-weight: 900; font-size: 1.5rem; }
        
        .how-it-works { padding: 80px 0; background: #f8fafc; }
        @media (min-width: 768px) { .how-it-works { padding: 120px 0; } }
        
        .section-title h2 { font-size: clamp(2rem, 6vw, 3rem); font-weight: 900; letter-spacing: -0.02em; margin-bottom: 20px; }
        .steps-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 60px; margin-top: 80px; }
        @media (min-width: 768px) { .steps-grid { grid-template-columns: repeat(3, 1fr); } }
        .step-item { position: relative; }
        .step-num { font-size: 4rem; font-weight: 900; color: #7c3aed; opacity: 0.05; position: absolute; top: -40px; left: -10px; }
        .step-item h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 16px; }
        .step-item p { color: #64748b; line-height: 1.7; }

        .landing-footer { padding: 100px 0 40px; border-top: 1px solid #f1f5f9; }
        .footer-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; font-weight: 900; font-size: 1.5rem; color: #1e293b; margin-bottom: 24px; }
        .footer-brand p { color: #64748b; max-width: 320px; line-height: 1.7; }
        .footer-nav { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .footer-col h4 { font-size: 14px; font-weight: 800; margin-bottom: 24px; }
        .footer-col a { display: block; color: #64748b; text-decoration: none; margin-bottom: 12px; font-weight: 600; font-size: 14px; }
        .footer-bottom { border-top: 1px solid #f1f5f9; padding-top: 40px; margin-top: 60px; display: flex; justify-content: space-between; align-items: center; }

        /* Final CTA Section */
        .cta-final-section { padding: 100px 0; background: #ffffff; }
        .cta-card { 
          background: #7c3aed; 
          border-radius: 24px; 
          padding: 32px 24px; 
          color: white; 
          display: grid; 
          grid-template-columns: 1fr; 
          gap: 32px; 
          position: relative;
          overflow: hidden;
          box-shadow: 0 40px 80px -20px rgba(124, 58, 237, 0.4);
        }
        @media (min-width: 768px) { .cta-card { border-radius: 32px; padding: 60px; gap: 48px; } }
        @media (min-width: 1024px) { .cta-card { grid-template-columns: 1fr 300px; align-items: center; } }
        
        .cta-badge { background: rgba(255,255,255,0.15); color: white; padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; width: fit-content; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.2); }
        .cta-card h2 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; margin-bottom: 16px; letter-spacing: -0.02em; }
        .cta-card p { font-size: clamp(1rem, 2vw, 1.2rem); opacity: 0.9; margin-bottom: 32px; max-width: 500px; line-height: 1.6; }
        @media (min-width: 768px) { .cta-card p { margin-bottom: 40px; } }
        .cta-actions { display: flex; flex-wrap: wrap; gap: 16px; }
        .cta-actions .btn-secondary { background: white; color: #7c3aed; border: none; }
        
        .cta-visual { position: relative; height: 100%; min-height: 200px; }
        .floating-stat { 
          position: absolute; 
          top: 0; 
          right: 0; 
          background: white; 
          padding: 20px; 
          border-radius: 20px; 
          color: #1e293b; 
          display: flex; 
          align-items: center; 
          gap: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          animation: float 6s ease-in-out infinite;
        }
        .floating-stat.second { top: 120px; right: -40px; animation-delay: 3s; }
        .stat-icon { width: 44px; height: 44px; border-radius: 12px; background: #f5f3ff; color: #7c3aed; display: flex; align-items: center; justify-content: center; }
        .stat-text { display: flex; flex-direction: column; }
        .stat-text strong { font-size: 1.25rem; font-weight: 800; }
        .stat-text span { font-size: 0.8rem; color: #64748b; font-weight: 600; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
