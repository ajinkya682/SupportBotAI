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
  Info,
  Sparkles,
  Database,
  Cpu,
  Layers,
  ShieldCheck,
  Smartphone,
  Cloud,
  MessageSquare,
  Atom,
  Layout,
  ShoppingBag,
  FileCode,
  MousePointer2
} from "lucide-react";
import Footer from '../../../../shared/ui/components/Footer';
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
            <h1 className="hero-title" style={{textAlign:"center"}}>
              Build better <span className="gradient-text">support experiences</span>
            </h1>
            <p className="hero-subtitle" style={{textAlign:"center"}}>
              Everything you need to integrate, customize, and optimize your SupportBotAI assistant.
            </p>

            <div className="docs-search-container">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search documentation, guides, or API..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="search-shortcut">
                <kbd>/</kbd>
              </div>
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
              <p>All systems running normally across all 12 global edge regions.</p>
              <button className="status-link">
                View Full Status Page <ExternalLink size={12} />
              </button>
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
                      <div className="card step-card shadow-sm">
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

            {activeCategory === 'ai-training' && (
              <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="AI Training & Intelligence" icon={Bot} />
                <p className="content-intro">
                  SupportBotAI learns from your existing business data to provide accurate, human-like responses to customer inquiries.
                </p>

                <div className="docs-grid-2">
                  <div className="card feature-card">
                    <div className="icon-box purple"><Globe size={20} /></div>
                    <h3>URL Context Scanning</h3>
                    <p>Enter your website URL, and our engine will crawl your pages, blogs, and documentation to build a local knowledge base automatically.</p>
                  </div>
                  <div className="card feature-card">
                    <div className="icon-box blue"><Database size={20} /></div>
                    <h3>FAQ Knowledge Base</h3>
                    <p>Manually input common Question & Answer pairs for high-frequency inquiries that require specific, verbatim responses.</p>
                  </div>
                </div>

                <div className="pro-tip-box">
                  <Sparkles size={20} className="pro-tip-icon" />
                  <div>
                    <strong>Pro Tip:</strong> Use clear, descriptive language in your FAQs. The more context you provide, the better the AI can generalize to similar user questions.
                  </div>
                </div>

                <h3 className="section-subtitle">Natural Language Processing</h3>
                <p>Our NLP engine uses semantic analysis to understand user intent, meaning it can answer correctly even if the user uses different terminology or makes typos.</p>
              </motion.div>
            )}

            {activeCategory === 'customization' && (
              <motion.div key="cust" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Widget Customization" icon={Palette} />
                <p className="content-intro">
                  Your chatbot should feel like a native part of your website. Customize every visual aspect from our intuitive branding dashboard.
                </p>

                <div className="custom-steps">
                  <div className="custom-step-item">
                    <div className="step-icon-wrap"><Smartphone size={20} /></div>
                    <div className="step-text">
                      <h4>Visual Identity</h4>
                      <p>Upload your company logo and set a primary brand color. The widget UI will automatically adapt its gradients and accents to match.</p>
                    </div>
                  </div>
                  <div className="custom-step-item">
                    <div className="step-icon-wrap"><MessageSquare size={20} /></div>
                    <div className="step-text">
                      <h4>Engagement Settings</h4>
                      <p>Configure auto-greeting messages, placeholder texts, and set "Away" messages for when your support agents are offline.</p>
                    </div>
                  </div>
                  <div className="custom-step-item">
                    <div className="step-icon-wrap"><Layers size={20} /></div>
                    <div className="step-text">
                      <h4>Positioning & Behavior</h4>
                      <p>Choose between left or right placement, and set "Show Delay" to trigger the widget only after a user spends a specific amount of time on page.</p>
                    </div>
                  </div>
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
                  {[
                    { name: 'React / Next.js', icon: Atom, color: '#61dafb' },
                    { name: 'WordPress', icon: Globe, color: '#21759b' },
                    { name: 'Webflow', icon: Layout, color: '#4353ff' },
                    { name: 'Shopify', icon: ShoppingBag, color: '#95bf47' },
                    { name: 'HTML / JavaScript', icon: FileCode, color: '#f7df1e' },
                    { name: 'Bubble.io', icon: MousePointer2, color: '#00d3ff' }
                  ].map(p => (
                    <div key={p.name} className="platform-card">
                      <div className="platform-icon-wrap" style={{ color: p.color, background: `${p.color}10` }}>
                        <p.icon size={20} />
                      </div>
                      <div className="platform-info">
                        <span>{p.name}</span>
                        <div className="sdk-status">Available</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeCategory === 'security' && (
              <motion.div key="sec" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Security & Authentication" icon={Lock} />
                <p className="content-intro">
                  Security is the foundation of SupportBotAI. We ensure your data and your customers' privacy are protected at every layer.
                </p>

                <div className="security-features">
                  <div className="sec-feature">
                    <ShieldCheck size={24} className="sec-icon" />
                    <div>
                      <h4>JWT Authentication</h4>
                      <p>All dashboard and API requests are secured with JSON Web Tokens, ensuring only authorized administrators can access business configurations.</p>
                    </div>
                  </div>
                  <div className="sec-feature">
                    <Cloud size={24} className="sec-icon" />
                    <div>
                      <h4>Encrypted Data at Rest</h4>
                      <p>Your knowledge base and conversation logs are encrypted using industry-standard AES-256 encryption within our secure cloud clusters.</p>
                    </div>
                  </div>
                  <div className="sec-feature">
                    <Cpu size={24} className="sec-icon" />
                    <div>
                      <h4>Secure Widget Sandboxing</h4>
                      <p>The SupportBotAI widget runs in a secure sandbox, preventing it from accessing sensitive user data on your parent website.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="docs-footer-cta">
            <div className="footer-cta-inner">
              <div className="cta-text">
                <h3>Still stuck?</h3>
                <p>Our engineering team is ready to help you with custom implementations or enterprise setups.</p>
              </div>
              <div className="cta-actions">
                <button className="btn btn-secondary">
                  <MessageSquare size={18} /> Contact Engineering
                </button>
                <button className="btn btn-primary">
                  <Globe size={18} /> Join Our Community
                </button>
              </div>
            </div>
          </div>
        </main>
      </section>

      <style>{`
        .docs-page { background: #ffffff; min-height: 100vh; color: #1e293b; }
        
        .docs-hero { 
          padding: 60px 0 40px; 
          background: #f8fafc; 
          border-bottom: 1px solid #f1f5f9; 
        }

        @media (min-width: 768px) { .docs-hero { padding: 80px 0 60px; } }

        .title-tag { font-size: 10px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 auto 16px; background: #f5f3ff; width: fit-content; padding: 4px 12px; border-radius: 20px; }

        .hero-title { font-size: 2.2rem; margin-bottom: 16px; line-height: 1.2; font-weight: 800; color: #0f172a; }
        @media (min-width: 768px) { .hero-title { font-size: 3.5rem; } }

        .hero-subtitle { color: #64748b; font-size: 1rem; max-width: 700px; margin: 0 auto 32px; line-height: 1.6; }
        @media (min-width: 768px) { .hero-subtitle { font-size: 1.2rem; } }
        
        .docs-search-container { position: relative; max-width: 600px; margin: 0 auto; width: 100%; }
        .docs-search-container .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .docs-search-container input { width: 100%; padding: 14px 16px 14px 48px; border-radius: 12px; background: white; border: 1.5px solid #e2e8f0; font-size: 0.95rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .docs-search-container input:focus { border-color: #7c3aed; outline: none; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
        
        .search-shortcut { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); display: none; }
        @media (min-width: 768px) { .search-shortcut { display: block; } }
        .search-shortcut kbd { background: #f8fafc; border: 1px solid #e2e8f0; color: #94a3b8; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; font-family: sans-serif; box-shadow: 0 2px 0 #e2e8f0; }

        .docs-main-grid { display: flex; flex-direction: column; gap: 40px; padding: 40px 0; }
        @media (min-width: 1024px) {
          .docs-main-grid { display: grid; grid-template-columns: 280px 1fr; gap: 60px; padding: 80px 0; }
        }

        .platform-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 24px; }
        .platform-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: white; border: 1px solid #f1f5f9; border-radius: 16px; transition: 0.3s; cursor: pointer; }
        .platform-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border-color: #e2e8f0; }
        .platform-icon-wrap { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .platform-info span { display: block; font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
        .sdk-status { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981; }

        .sidebar-links { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 24px; }
        @media (min-width: 1024px) {
          .sidebar-links { flex-direction: column; overflow-x: visible; }
        }

        .sidebar-btn { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; color: #64748b; font-weight: 600; cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 14px; }
        .sidebar-btn:hover { background: #f1f5f9; color: #0f172a; }
        .sidebar-btn.active { background: #7c3aed; color: white; }

        .api-status-card { margin-top: 40px; padding: 24px; background: #f8fafc; border-radius: 20px; border: 1px solid #f1f5f9; }
        .status-header { display: flex; align-items: center; gap: 10px; font-weight: 800; color: #10b981; font-size: 0.85rem; margin-bottom: 8px; }
        .status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .api-status-card p { font-size: 0.8rem; color: #64748b; margin-bottom: 16px; line-height: 1.4; }
        .status-link { background: none; border: none; color: #7c3aed; font-weight: 700; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; }

        .docs-content-area { min-width: 0; }

        .section-header-title { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .section-header-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .section-header-title h2 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }

        .content-intro { font-size: 1.1rem; color: #475569; line-height: 1.7; margin-bottom: 48px; }

        /* AI Training Grid */
        .docs-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .feature-card { padding: 32px; border-radius: 24px; border: 1px solid #f1f5f9; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .purple { background: #f5f3ff; color: #7c3aed; }
        .blue { background: #eff6ff; color: #3b82f6; }
        .feature-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; }
        .feature-card p { font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0; }

        .pro-tip-box { display: flex; gap: 16px; padding: 20px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; color: #92400e; font-size: 0.95rem; line-height: 1.6; margin-bottom: 48px; }
        .pro-tip-icon { color: #f59e0b; flex-shrink: 0; }

        /* Customization Steps */
        .custom-steps { display: flex; flex-direction: column; gap: 32px; margin-bottom: 48px; }
        .custom-step-item { display: flex; gap: 20px; }
        .step-icon-wrap { width: 44px; height: 44px; border-radius: 50%; background: #f8fafc; border: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #7c3aed; }
        .step-text h4 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
        .step-text p { font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0; }

        /* Security */
        .security-features { display: flex; flex-direction: column; gap: 24px; }
        .sec-feature { display: flex; gap: 20px; padding: 24px; background: #fcfcfd; border: 1px solid #f1f5f9; border-radius: 20px; }
        .sec-icon { color: #10b981; flex-shrink: 0; }
        .sec-feature h4 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
        .sec-feature p { font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0; }

        .docs-footer-cta { margin-top: 80px; padding: 60px 40px; background: #7c3aed; border-radius: 32px; color: white; text-align: center; }
        @media (min-width: 1024px) { .docs-footer-cta { text-align: left; } }
        .footer-cta-inner { display: flex; flex-direction: column; gap: 32px; align-items: center; }
        @media (min-width: 1024px) { .footer-cta-inner { flex-direction: row; justify-content: space-between; } }
        .cta-text h3 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
        .cta-text p { font-size: 1.1rem; opacity: 0.9; margin: 0; max-width: 500px; }
        .cta-actions { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        @media (min-width: 640px) { .cta-actions { flex-direction: row; width: auto; } }
        .cta-actions .btn { padding: 16px 28px; font-weight: 700; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .docs-footer-cta .btn-secondary { background: white; color: #7c3aed; }
        .docs-footer-cta .btn-primary { background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.3); }

        .docs-roadmap { position: relative; padding-left: 32px; margin-top: 40px; }
        .docs-roadmap::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #e2e8f0; }
        .roadmap-step { position: relative; margin-bottom: 40px; }
        .step-circle { position: absolute; left: -44px; top: 0; width: 24px; height: 24px; background: #7c3aed; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; box-shadow: 0 0 0 6px white; }
        .step-card { padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9; }
        .step-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .step-card-header h4 { margin: 0; font-size: 1.1rem; }
        
        .code-block { background: #0f172a; border-radius: 20px; padding: 32px; margin: 32px 0; position: relative; }
        .code-block-icon { position: absolute; top: 16px; right: 16px; color: #475569; }
        .code-block pre { margin: 0; font-size: 0.95rem; color: #38bdf8; line-height: 1.6; }

        .info-callout { display: flex; gap: 16px; padding: 24px; background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 20px; color: #0369a1; margin-bottom: 32px; }
        .callout-icon { flex-shrink: 0; }
        .info-callout p { margin: 0; font-size: 0.95rem; line-height: 1.6; }
      `}</style>
      <Footer />
    </div>
  );
}
