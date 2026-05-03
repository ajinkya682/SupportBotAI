import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
  Sparkles
} from "lucide-react";
import PricingSection from "../components/PricingSection";

export default function Home() {
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
              <Sparkles size={16} />
              <span>Revolutionizing Support with Gen-AI</span>
            </div>
            <h1>
              AI that resolves support <br /> 
              <span className="gradient-text">tickets instantly.</span>
            </h1>
            <p className="hero-desc">
              SupportBotAI is an intelligent customer support platform that handles 80% of your common queries automatically, while seamlessly routing complex issues to your human team.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Free Trial <ArrowRight size={20} />
              </Link>
              <Link to="/product" className="btn btn-secondary btn-lg">
                View Features
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="dots"><span></span><span></span><span></span></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar"></div>
                <div className="mockup-content">
                  <div className="mockup-card"></div>
                  <div className="mockup-grid">
                    <div></div><div></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-title text-center">
            <div className="title-tag">CORE CAPABILITIES</div>
            <h2>Built for modern support teams</h2>
            <p>Everything you need to automate your support workflow and keep your customers happy 24/7.</p>
          </div>

          <div className="feature-grid">
            <div className="card feature-card">
              <div className="feature-icon" style={{ background: 'var(--surface-container-low)', color: 'var(--primary)' }}>
                <Bot size={32} />
              </div>
              <h3>AI-First Resolution</h3>
              <p>Our advanced LLMs understand intent and emotion, resolving most queries before a human ever sees them.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
                <Layers size={32} />
              </div>
              <h3>Seamless Routing</h3>
              <p>When the AI detects complexity or high emotion, it instantly routes the chat to an agent with full context.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
                <Globe size={32} />
              </div>
              <h3>Instant Integration</h3>
              <p>Deploy your custom chatbot to any website with a single script tag. Zero code required for basic setup.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon" style={{ background: '#ffdad6', color: '#93000a' }}>
                <Shield size={32} />
              </div>
              <h3>Custom Knowledge</h3>
              <p>Train your AI on your own documentation, FAQs, and website content to ensure perfect brand alignment.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon" style={{ background: '#e0e7ff', color: '#3525cd' }}>
                <BarChart3 size={32} />
              </div>
              <h3>Actionable Analytics</h3>
              <p>Track resolution rates, response times, and customer sentiment with our professional dashboard.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                <Clock size={32} />
              </div>
              <h3>24/7 Availability</h3>
              <p>Your support never sleeps. Provide instant answers to global customers regardless of time zones.</p>
            </div>
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

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <Bot size={32} color="var(--primary)" />
                <span>SUPPORTBOT <span style={{ color: 'var(--primary)' }}>AI</span></span>
              </Link>
              <p>Revolutionizing customer support with AI that understands, learns, and resolves issues instantly.</p>
            </div>
            
            <div className="footer-nav">
              <div className="footer-col">
                <h4>Product</h4>
                <Link to="/product">Features</Link>
                <Link to="/pricing">Pricing</Link>
                <Link to="/docs">Documentation</Link>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <Link to="/about">About Us</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/careers">Careers</Link>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/security">Security</Link>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2026 SupportBotAI Inc. All rights reserved.</p>
            <div className="social-links">
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-page { background: var(--surface); color: var(--on-surface); }
        .hero-section { padding: 120px 0 160px; overflow: hidden; position: relative; }
        .hero-section::before { content: ''; position: absolute; top: -100px; right: -100px; width: 600px; height: 600px; background: radial-gradient(circle, var(--primary-low) 0%, transparent 70%); opacity: 0.5; z-index: 0; filter: blur(60px); }
        
        .hero-container { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
        .hero-badge { display: flex; align-items: center; gap: 10px; background: var(--surface-container); color: var(--primary); padding: 8px 20px; border-radius: 30px; font-weight: 700; font-size: var(--text-label-sm); width: fit-content; margin-bottom: 32px; border: 1px solid var(--outline-variant); }
        .hero-text h1 { font-size: 4rem; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.02em; font-weight: 700; }
        .gradient-text { background: linear-gradient(135deg, var(--primary), #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-desc { font-size: 1.15rem; color: var(--on-surface-variant); line-height: 1.6; margin-bottom: 48px; max-width: 600px; }
        .hero-cta { display: flex; gap: 20px; }
        .btn-lg { padding: 16px 32px; font-size: 1.1rem; border-radius: 14px; }
        
        .hero-visual { position: relative; }
        .dashboard-mockup { background: white; border-radius: 20px; border: 1px solid var(--outline-variant); box-shadow: var(--shadow-overlay); overflow: hidden; height: 400px; display: flex; flex-direction: column; }
        .mockup-header { height: 32px; background: var(--surface-container-low); display: flex; align-items: center; padding: 0 16px; gap: 6px; }
        .dots span { width: 8px; height: 8px; border-radius: 50%; background: var(--outline-variant); display: inline-block; margin-right: 4px; }
        .mockup-body { flex: 1; display: flex; }
        .mockup-sidebar { width: 60px; background: var(--surface-container); border-right: 1px solid var(--outline-variant); }
        .mockup-content { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .mockup-card { height: 100px; background: var(--surface-container-low); border-radius: 12px; }
        .mockup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex: 1; }
        .mockup-grid div { background: var(--surface-container-lowest); border-radius: 12px; border: 1px solid var(--outline-variant); }
        
        .trust-section { padding: 60px 0; border-top: 1px solid var(--outline-variant); border-bottom: 1px solid var(--outline-variant); background: var(--surface-container-low); }
        .trust-label { text-align: center; font-size: var(--text-label-sm); font-weight: 700; color: var(--on-surface-variant); letter-spacing: 0.15em; margin-bottom: 40px; }
        .logo-cloud { display: flex; justify-content: center; gap: 80px; flex-wrap: wrap; opacity: 0.5; font-weight: 800; font-size: 1.5rem; }
        
        .features-section { padding: 120px 0; }
        .section-title { margin-bottom: 80px; }
        .title-tag { font-size: var(--text-label-sm); font-weight: 700; color: var(--primary); letter-spacing: 0.15em; margin-bottom: 16px; }
        .section-title h2 { font-size: var(--text-h1); margin-bottom: 20px; font-weight: 600; }
        .section-title p { color: var(--on-surface-variant); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
        .feature-card { padding: 40px; border-radius: 20px; transition: var(--transition-normal); }
        .feature-card:hover { transform: translateY(-8px); border-color: var(--primary); }
        .feature-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .feature-card h3 { font-size: var(--text-h3); margin-bottom: 16px; }
        .feature-card p { color: var(--on-surface-variant); line-height: 1.6; font-size: var(--text-body-sm); }
        
        .how-it-works { padding: 120px 0; background: var(--surface-container-low); }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; margin-top: 80px; }
        .step-item { position: relative; }
        .step-num { font-size: 4rem; font-weight: 800; color: var(--outline-variant); position: absolute; top: -50px; left: -10px; opacity: 0.3; }
        .step-item h3 { font-size: var(--text-h3); margin-bottom: 16px; position: relative; z-index: 1; }
        .step-item p { color: var(--on-surface-variant); line-height: 1.6; position: relative; z-index: 1; font-size: var(--text-body-sm); }
        
        .landing-footer { padding: 100px 0 40px; border-top: 1px solid var(--outline-variant); background: var(--surface-container-lowest); }
        .footer-top { display: grid; grid-template-columns: 1.5fr 1fr; gap: 100px; margin-bottom: 80px; }
        .footer-brand { max-width: 400px; }
        .footer-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; font-weight: 800; font-size: 1.5rem; color: var(--on-surface); margin-bottom: 24px; }
        .footer-brand p { color: var(--on-surface-variant); line-height: 1.7; font-size: var(--text-body-sm); }
        .footer-nav { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .footer-col h4 { font-size: var(--text-label-md); margin-bottom: 24px; color: var(--on-surface); font-weight: 700; }
        .footer-col a { display: block; color: var(--on-surface-variant); text-decoration: none; margin-bottom: 12px; font-weight: 500; font-size: var(--text-body-sm); transition: var(--transition-fast); }
        .footer-col a:hover { color: var(--primary); }
        
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 40px; border-top: 1px solid var(--outline-variant); }
        .footer-bottom p { font-size: var(--text-label-sm); color: var(--on-surface-variant); }
        .social-links { display: flex; gap: 24px; }
        .social-links a { color: var(--on-surface-variant); text-decoration: none; font-weight: 600; font-size: var(--text-label-sm); transition: var(--transition-fast); }
        .social-links a:hover { color: var(--primary); }
      `}</style>
    </div>
  );
}
