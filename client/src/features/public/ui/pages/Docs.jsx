import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Palette, 
  Code2, 
  ChevronRight,
  CheckCircle2,
  Search,
  Zap,
  Globe,
  Lock,
  Terminal,
  ExternalLink,
  Info
} from "lucide-react";
import { API_URL } from '../../../../shared/services/config';

const SectionHeader = ({ title, icon: Icon, color = "var(--primary)" }) => (
  <div className="section-header-title">
    <div className="section-header-icon" style={{ background: `${color}15`, color: color }}>
      <Icon size={20} />
    </div>
    <h2>{title}</h2>
  </div>
);

const CodeBlock = ({ code }) => (
  <div className="code-block">
    <div className="code-block-icon">
      <Terminal size={14} />
    </div>
    <pre>
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
            <div className="title-tag">DOCUMENTATION HUB</div>
            <h1 className="hero-title">
              Build better <span className="gradient-text">support experiences</span>
            </h1>
            <p className="hero-subtitle">
              Everything you need to integrate, customize, and optimize your SupportBotAI assistant.
            </p>

            <div className="docs-search-container">
              <Search className="search-icon" size={18} />
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
            <h4 className="sidebar-label desktop-only">Guides & References</h4>
            <div className="sidebar-links">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`sidebar-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  <cat.icon size={18} className="sidebar-icon" />
                  <span>{cat.label}</span>
                  {activeCategory === cat.id && <ChevronRight size={14} className="ml-auto desktop-only" />}
                </button>
              ))}
            </div>

            <div className="api-status-card desktop-only">
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
                    { step: 1, title: 'Connect Your Domain', desc: 'Add your business name and website URL in the settings.', icon: Globe },
                    { step: 2, title: 'Train the Engine', desc: 'Use our Intelligent Scanner to crawl your existing website or manually add FAQs.', icon: Bot },
                    { step: 3, title: 'Style Your Widget', desc: 'Match colors, logos, and greeting messages to your brand personality.', icon: Palette },
                    { step: 4, title: 'One-Click Deployment', desc: 'Copy the lightweight script tag and paste it before your site\'s body end tag.', icon: Code2 },
                  ].map((item, i) => (
                    <div key={i} className="roadmap-step">
                      <div className="step-circle">{item.step}</div>
                      <div className="card step-card">
                        <div className="step-card-header">
                          <item.icon size={18} color="var(--primary)" />
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
                  <Info size={20} color="var(--primary)" className="callout-icon" />
                  <p>
                    <strong>Security Note:</strong> Replace <code>'YOUR_API_KEY'</code> below with the unique key found in your <strong>Dashboard &gt; Integration</strong> tab.
                  </p>
                </div>

                <CodeBlock code={`<!-- SupportBotAI Widget -->\n<script src="${API_URL}/widget.js"></script>\n<script>\n  window.SupportBotAI.init({\n    apiKey: 'YOUR_API_KEY', // Replace with your real key from Dashboard\n    theme: 'dark'\n  });\n</script>`} />

                <h3 className="section-subtitle">Official SDK Support</h3>
                <div className="platform-grid">
                  {['React / Next.js', 'WordPress', 'Webflow', 'Shopify', 'HTML/JS', 'Bubble.io'].map(p => (
                    <div key={p} className="platform-tag">
                      <CheckCircle2 size={16} color="var(--primary)" className="flex-shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Fallback for other categories just to prevent blank screen */}
            {activeCategory !== 'getting-started' && activeCategory !== 'integration' && (
               <motion.div key="other" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <SectionHeader title={categories.find(c => c.id === activeCategory)?.label || 'Documentation'} icon={categories.find(c => c.id === activeCategory)?.icon || Zap} />
                  <p className="content-intro">This section is currently under construction. Please check back later.</p>
               </motion.div>
            )}
          </AnimatePresence>

          <div className="docs-footer-cta">
            <h3>Still stuck?</h3>
            <p>Our engineering team is ready to help you with custom implementations.</p>
            <div className="cta-buttons">
              <button className="btn btn-secondary w-full">Contact Engineering</button>
              <button className="btn btn-primary w-full">Join Discord</button>
            </div>
          </div>
        </main>
      </section>

      <style>{`
        .docs-page { background: var(--surface); min-height: 100vh; }
        
        .docs-hero { 
          padding: 60px 0 40px; 
          background: var(--surface-container-low); 
          border-bottom: 1px solid var(--outline-variant); 
        }

        @media (min-width: 768px) { .docs-hero { padding: 100px 0 60px; } }

        .title-tag { font-size: 10px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 auto 16px; background: var(--primary-fixed); width: fit-content; padding: 4px 12px; border-radius: 20px; }
        @media (min-width: 768px) { .title-tag { font-size: 11px; margin: 0 auto 24px; } }

        .hero-title { font-size: 2rem; margin-bottom: 16px; line-height: 1.2; font-weight: 800; }
        @media (min-width: 768px) { .hero-title { font-size: 3.5rem; margin-bottom: 20px; } }

        .hero-subtitle { color: var(--on-surface-variant); font-size: 1rem; max-width: 700px; margin: 0 auto 32px; line-height: 1.5; }
        @media (min-width: 768px) { .hero-subtitle { font-size: 1.25rem; margin: 0 auto 40px; } }
        
        .docs-search-container { position: relative; max-width: 600px; margin: 0 auto; width: 100%; }
        .docs-search-container .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--outline); }
        .docs-search-container input { width: 100%; padding: 14px 16px 14px 48px; border-radius: 12px; background: white; border: 1.5px solid var(--outline-variant); font-size: 0.95rem; box-shadow: var(--shadow-1); }
        @media (min-width: 768px) { .docs-search-container input { padding: 18px 20px 18px 54px; border-radius: 16px; font-size: 1rem; } }
        .docs-search-container input:focus { border-color: var(--primary); outline: none; }
        
        .docs-main-grid { 
          display: flex;
          flex-direction: column;
          gap: 40px; 
          padding: 40px 0; 
        }

        @media (min-width: 1024px) {
          .docs-main-grid { display: grid; grid-template-columns: 260px 1fr; gap: 60px; padding: 80px 0; }
        }

        .sidebar-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: 24px; }
        
        .sidebar-links { 
          display: flex; 
          gap: 8px; 
          overflow-x: auto; 
          padding-bottom: 8px; 
          -webkit-overflow-scrolling: touch; 
          scrollbar-width: none; 
        }
        .sidebar-links::-webkit-scrollbar { display: none; }

        @media (min-width: 1024px) {
          .sidebar-links { flex-direction: column; overflow-x: visible; padding-bottom: 0; }
        }

        .sidebar-btn { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 12px; color: var(--on-surface-variant); font-weight: 600; cursor: pointer; transition: 0.2s; text-align: left; white-space: nowrap; font-size: 13px; }
        @media (min-width: 1024px) {
          .sidebar-btn { background: transparent; border: none; padding: 14px 16px; font-size: 14px; white-space: normal; }
        }

        .sidebar-btn:hover { background: var(--surface-container-low); color: var(--on-surface); }
        .sidebar-btn.active { background: var(--primary-fixed); color: var(--primary); border-color: var(--primary-fixed); }
        
        .api-status-card { margin-top: 40px; padding: 20px; background: var(--surface-container-low); border-radius: 16px; border: 1px solid var(--outline-variant); }
        .status-header { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #10b981; font-size: 0.85rem; margin-bottom: 8px; }
        .status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px rgba(16,185,129,0.4); }
        .api-status-card p { font-size: 0.8rem; color: var(--on-surface-variant); margin-bottom: 16px; }

        .section-header-title { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        @media (min-width: 768px) { .section-header-title { gap: 16px; margin-bottom: 32px; } }
        .section-header-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        @media (min-width: 768px) { .section-header-icon { width: 48px; height: 48px; border-radius: 14px; } }
        .section-header-title h2 { font-size: 1.5rem; font-weight: 800; margin: 0; }
        @media (min-width: 768px) { .section-header-title h2 { font-size: 2rem; } }
        
        .content-intro { font-size: 1rem; color: var(--on-surface-variant); line-height: 1.6; margin-bottom: 32px; }
        @media (min-width: 768px) { .content-intro { font-size: 1.15rem; margin-bottom: 48px; } }

        .docs-roadmap { position: relative; padding-left: 24px; margin-top: 32px; }
        @media (min-width: 768px) { .docs-roadmap { padding-left: 32px; margin-top: 40px; } }

        .docs-roadmap::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--primary), transparent); }
        
        .roadmap-step { position: relative; margin-bottom: 32px; }
        @media (min-width: 768px) { .roadmap-step { margin-bottom: 40px; } }

        .step-circle { position: absolute; left: -35px; top: 0; width: 20px; height: 20px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900; }
        @media (min-width: 768px) { .step-circle { left: -44px; width: 24px; height: 24px; font-size: 0.75rem; } }

        .step-card { padding: 20px; border-radius: 16px; }
        @media (min-width: 768px) { .step-card { padding: 24px; border-radius: 20px; } }

        .step-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .step-card-header h4 { margin: 0; font-size: 1rem; font-weight: 700; }
        @media (min-width: 768px) { .step-card-header h4 { font-size: 1.1rem; } }

        .step-card p { color: var(--on-surface-variant); margin: 0; font-size: 0.9rem; line-height: 1.5; }
        
        .info-callout { display: flex; gap: 16px; padding: 16px; background: var(--primary-fixed); border-radius: 12px; color: var(--on-primary-container); margin-bottom: 24px; align-items: flex-start; }
        @media (min-width: 768px) { .info-callout { padding: 20px; border-radius: 16px; margin-bottom: 32px; } }
        .callout-icon { flex-shrink: 0; margin-top: 2px; }
        .info-callout p { margin: 0; font-size: 0.9rem; line-height: 1.5; }
        
        .code-block { background: #0f172a; border-radius: 16px; padding: 24px 16px; border: 1px solid var(--outline-variant); margin: 24px 0; position: relative; font-family: 'JetBrains Mono', monospace; }
        @media (min-width: 768px) { .code-block { border-radius: 20px; padding: 32px; margin: 32px 0; } }

        .code-block-icon { position: absolute; top: 12px; right: 12px; opacity: 0.5; color: #94a3b8; }
        .code-block pre { margin: 0; overflow-x: auto; font-size: 0.85rem; color: #10b981; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
        @media (min-width: 768px) { .code-block pre { font-size: 0.9rem; white-space: pre; } }
        
        .section-subtitle { font-size: 1.25rem; font-weight: 700; margin: 40px 0 20px; }

        .platform-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 12px; }
        @media (min-width: 480px) { .platform-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        @media (min-width: 768px) { .platform-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }

        .platform-tag { display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--surface-container-low); border-radius: 10px; border: 1px solid var(--outline-variant); font-weight: 600; font-size: 0.85rem; }
        @media (min-width: 768px) { .platform-tag { padding: 16px; border-radius: 12px; font-size: 0.9rem; } }
        
        .docs-footer-cta { margin-top: 60px; padding: 40px 20px; text-align: center; border-top: 1px solid var(--outline-variant); }
        @media (min-width: 768px) { .docs-footer-cta { margin-top: 100px; padding: 60px 40px; } }

        .docs-footer-cta h3 { font-size: 1.5rem; margin-bottom: 8px; }
        .docs-footer-cta p { font-size: 0.95rem; color: var(--on-surface-variant); margin-bottom: 24px; }

        .cta-buttons { display: flex; flex-direction: column; gap: 12px; justify-content: center; }
        @media (min-width: 640px) { .cta-buttons { flex-direction: row; gap: 16px; } }

        .w-full { width: 100%; }
        @media (min-width: 640px) { .w-full { width: auto; } }

        .desktop-only { display: none; }
        @media (min-width: 1024px) { .desktop-only { display: block; } }
      `}</style>
    </div>
  );
}
