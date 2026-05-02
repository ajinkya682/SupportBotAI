import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Settings, 
  Bot, 
  Palette, 
  Code2, 
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Search,
  MessageSquare,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Terminal,
  ExternalLink,
  Info
} from "lucide-react";
import { API_URL } from '../../../../shared/services/config';

const SectionHeader = ({ title, icon: Icon, color = "var(--primary)" }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
    <div style={{ 
      width: '48px', height: '48px', borderRadius: '14px', 
      background: `${color}15`, display: 'flex', alignItems: 'center', 
      justifyContent: 'center', color: color 
    }}>
      <Icon size={24} />
    </div>
    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{title}</h2>
  </div>
);

const CodeBlock = ({ code }) => (
  <div style={{ 
    background: '#0f172a', 
    borderRadius: '20px', 
    padding: '32px', 
    border: '1px solid var(--outline-variant)',
    margin: '32px 0',
    position: 'relative',
    fontFamily: 'JetBrains Mono, monospace'
  }}>
    <div style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.5, color: '#94a3b8' }}>
      <Terminal size={18} />
    </div>
    <pre style={{ margin: 0, overflowX: 'auto', fontSize: '0.95rem', color: '#10b981', lineHeight: '1.6' }}>
      <code>{code}</code>
    </pre>
  </div>
);

export default function Docs() {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'ai-training', label: 'AI Training', icon: Bot },
    { id: 'customization', label: 'Customization', icon: Palette },
    { id: 'integration', label: 'Integration', icon: Code2 },
    { id: 'security', label: 'Security & Auth', icon: Lock }
  ];

  return (
    <div className="docs-page animate-fade-in">
      <section className="docs-hero">
        <div className="container hero-inner">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="title-tag" style={{ margin: '0 auto 24px' }}>DOCUMENTATION HUB</div>
            <h1 className="hero-title">
              Build better <span className="gradient-text">support experiences</span>
            </h1>
            <p className="hero-subtitle">
              Everything you need to integrate, customize, and optimize your SupportBotAI assistant.
            </p>

            <div className="docs-search-container">
              <Search className="search-icon" size={22} />
              <input 
                type="text" 
                placeholder="Search documentation..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container docs-main-grid">
        <aside className="docs-sidebar">
          <div className="sticky-sidebar">
            <h4 className="sidebar-label">Guides & References</h4>
            <div className="sidebar-links">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`sidebar-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  <cat.icon size={20} />
                  <span>{cat.label}</span>
                  {activeCategory === cat.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
              ))}
            </div>

            <div className="api-status-card">
              <div className="status-header">
                <div className="status-dot"></div>
                <span>API Operational</span>
              </div>
              <p>All systems running normally.</p>
              <button className="btn btn-text btn-sm">Status Page <ExternalLink size={14} /></button>
            </div>
          </div>
        </aside>

        <main className="docs-content-area">
          <AnimatePresence mode="wait">
            {activeCategory === 'getting-started' && (
              <motion.div key="gs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Getting Started" icon={Zap} />
                <p className="content-intro">
                  SupportBotAI is designed to be set up in under 5 minutes. Follow this roadmap to automate your first customer interaction.
                </p>

                <div className="docs-roadmap">
                  {[
                    { step: 1, title: 'Connect Your Domain', desc: 'Add your business name and primary website URL in the workspace settings.', icon: Globe },
                    { step: 2, title: 'Train the Engine', desc: 'Use our Intelligent Scanner to crawl your existing website or manually add FAQs.', icon: Bot },
                    { step: 3, title: 'Style Your Widget', desc: 'Match colors, logos, and greeting messages to your brand personality.', icon: Palette },
                    { step: 4, title: 'One-Click Deployment', desc: 'Copy the lightweight script tag and paste it before your site\'s body end tag.', icon: Code2 },
                  ].map((item, i) => (
                    <div key={i} className="roadmap-step">
                      <div className="step-circle">{item.step}</div>
                      <div className="card step-card">
                        <div className="step-card-header">
                          <item.icon size={20} color="var(--primary)" />
                          <h4>{item.title}</h4>
                        </div>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeCategory === 'integration' && (
              <motion.div key="int" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Website Integration" icon={Code2} />
                <p className="content-intro">
                  Paste this snippet into your HTML file, ideally just before the closing <code>&lt;/body&gt;</code> tag.
                </p>

                <div className="info-callout">
                  <Info size={24} color="var(--primary)" />
                  <p>
                    <strong>Security Note:</strong> Always keep your API key private. Do not commit it to public repositories.
                  </p>
                </div>

                <CodeBlock code={`<!-- SupportBotAI Widget -->\n<script src="${API_URL}/widget.js"></script>\n<script>\n  window.SupportBotAI.init({\n    apiKey: 'YOUR_API_KEY',\n    theme: 'dark'\n  });\n</script>`} />

                <h3 className="section-subtitle">Official SDK Support</h3>
                <div className="platform-grid">
                  {['React / Next.js', 'WordPress', 'Webflow', 'Shopify', 'HTML/JS', 'Bubble.io'].map(p => (
                    <div key={p} className="platform-tag">
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="docs-footer-cta">
            <h3>Still stuck?</h3>
            <p>Our engineering team is ready to help you with custom implementations.</p>
            <div className="cta-buttons">
              <button className="btn btn-secondary">Contact Engineering</button>
              <button className="btn btn-primary">Join Discord Community</button>
            </div>
          </div>
        </main>
      </section>

      <style>{`
        .docs-page { background: var(--surface); min-height: 100vh; }
        .docs-hero { padding: 100px 0 60px; background: var(--surface-container-low); border-bottom: 1px solid var(--outline-variant); }
        .hero-title { font-size: 3.5rem; margin-bottom: 20px; }
        .hero-subtitle { color: var(--on-surface-variant); font-size: 1.25rem; max-width: 700px; margin: 0 auto 40px; }
        
        .docs-search-container { position: relative; max-width: 600px; margin: 0 auto; }
        .docs-search-container .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: var(--outline); }
        .docs-search-container input { width: 100%; padding: 18px 20px 18px 60px; border-radius: 16px; background: white; border: 1.5px solid var(--outline-variant); font-size: 1rem; box-shadow: var(--shadow-2); }
        .docs-search-container input:focus { border-color: var(--primary); }
        
        .docs-main-grid { display: grid; grid-template-columns: 280px 1fr; gap: 80px; padding: 80px 0; }
        .sidebar-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: 24px; }
        .sidebar-links { display: flex; flex-direction: column; gap: 8px; }
        .sidebar-btn { display: flex; align-items: center; gap: 14px; padding: 14px 20px; background: transparent; border: none; border-radius: 14px; color: var(--on-surface-variant); font-weight: 600; cursor: pointer; transition: 0.2s; text-align: left; }
        .sidebar-btn:hover { background: var(--surface-container-low); color: var(--on-surface); }
        .sidebar-btn.active { background: var(--primary-fixed); color: var(--primary); }
        
        .api-status-card { margin-top: 60px; padding: 24px; background: var(--surface-container-low); border-radius: 20px; border: 1px solid var(--outline-variant); }
        .status-header { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #10b981; font-size: 0.9rem; margin-bottom: 8px; }
        .status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
        .api-status-card p { font-size: 0.8rem; color: var(--on-surface-variant); margin-bottom: 16px; }
        
        .content-intro { font-size: 1.2rem; color: var(--on-surface-variant); line-height: 1.7; margin-bottom: 48px; }
        .docs-roadmap { position: relative; padding-left: 32px; margin-top: 40px; }
        .docs-roadmap::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--primary), transparent); }
        .roadmap-step { position: relative; margin-bottom: 40px; }
        .step-circle { position: absolute; left: -44px; top: 0; width: 24px; height: 24px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; }
        .step-card { padding: 32px; border-radius: 24px; }
        .step-card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .step-card-header h4 { margin: 0; font-size: 1.15rem; }
        .step-card p { color: var(--on-surface-variant); margin: 0; font-size: 0.95rem; line-height: 1.6; }
        
        .info-callout { display: flex; gap: 20px; padding: 20px; background: var(--primary-fixed); border-radius: 16px; color: var(--on-primary-container); margin-bottom: 32px; }
        .info-callout p { margin: 0; font-size: 0.95rem; line-height: 1.5; }
        
        .platform-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px; }
        .platform-tag { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--surface-container-low); border-radius: 12px; border: 1px solid var(--outline-variant); font-weight: 600; font-size: 0.9rem; }
        
        .docs-footer-cta { margin-top: 100px; padding: 60px 40px; text-align: center; border-top: 1px solid var(--outline-variant); }
        .cta-buttons { display: flex; gap: 16px; justify-content: center; margin-top: 32px; }
        
        @media (max-width: 992px) {
          .docs-main-grid { grid-template-columns: 1fr; }
          .docs-sidebar { display: none; }
          .hero-title { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
