import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Palette, Code2, ChevronRight, CheckCircle2, Search, MessageSquare, Zap, Globe, Lock, Terminal, Info } from "lucide-react";
import Footer from "../../../../shared/ui/layout/Footer";
import { API_URL } from '../../../../shared/services/config';

const SectionHeader = ({ title, icon: Icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} style={{ color: 'var(--color-primary)' }} />
    </div>
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-display)', color: 'var(--color-on-surface)', margin: 0 }}>{title}</h2>
  </div>
);

const CodeBlock = ({ code }) => (
  <div style={{ background: '#0d1117', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', margin: 'var(--space-6) 0' }}>
    <pre style={{ margin: 0, overflowX: 'auto', fontSize: 'var(--text-sm)', color: '#94a3b8', lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
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
    { id: 'security', label: 'Security & Auth', icon: Lock },
  ];

  const roadmap = [
    { step: 1, title: 'Connect Your Domain', desc: 'Add your business name and primary website URL in workspace settings.', icon: Globe },
    { step: 2, title: 'Train the Engine', desc: 'Use our Intelligent Scanner to crawl your existing website or manually add FAQs.', icon: Bot },
    { step: 3, title: 'Style Your Widget', desc: 'Match colors, logos, and greeting messages to your brand personality.', icon: Palette },
    { step: 4, title: 'One-Click Deployment', desc: "Copy the lightweight script tag and paste it before your site's body end tag.", icon: Code2 },
  ];

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--color-surface-container-lowest)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-5)', display: 'inline-block' }}>Documentation Hub</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-7xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-display)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-5)' }}>
              Build better <span style={{ color: 'var(--color-primary)' }}>support experiences</span>
            </h1>
            <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '0 auto var(--space-8)', lineHeight: 'var(--leading-body)' }}>
              Everything you need to integrate, customize, and optimize your SupportBotAI assistant.
            </p>
            <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto' }}>
              <Search size={18} style={{ position: 'absolute', left: 'var(--space-5)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-muted)', pointerEvents: 'none' }} />
              <input type="text" placeholder="Search documentation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field" style={{ paddingLeft: 'var(--space-12)', paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)' }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* BODY */}
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-12)', padding: 'var(--space-10) var(--space-8) var(--space-24)' }}>
        {/* Sidebar */}
        <aside>
          <div style={{ position: 'sticky', top: '100px' }}>
            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-5)' }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {categories.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: isActive ? 'var(--color-primary-light)' : 'transparent', border: 'none', cursor: 'pointer', color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)', fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)', transition: 'all var(--duration-base) var(--ease-standard)', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
                    <cat.icon size={16} style={{ flexShrink: 0 }} />
                    {cat.label}
                    {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
            <div className="card-tonal" style={{ marginTop: 'var(--space-8)' }}>
              <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-3)' }}>API Status</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--color-secondary)' }} />
                <span style={{ color: 'var(--color-secondary)', fontWeight: 'var(--weight-semibold)' }}>Operational</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', marginTop: 'var(--space-2)', lineHeight: 'var(--leading-body)' }}>All systems running normally.</p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main>
          <AnimatePresence mode="wait">
            {activeCategory === 'getting-started' && (
              <motion.div key="gs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Getting Started" icon={Zap} />
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)', marginBottom: 'var(--space-10)' }}>SupportBotAI is designed to be set up in under 5 minutes. Follow this roadmap to automate your first customer interaction.</p>
                <div style={{ position: 'relative', paddingLeft: 'var(--space-8)' }}>
                  <div style={{ position: 'absolute', left: '11px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }} />
                  {roadmap.map((item, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
                      <div style={{ position: 'absolute', left: 'calc(-1 * var(--space-8) - 1px)', top: '0', width: '24px', height: '24px', background: 'var(--color-primary)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'white', zIndex: 2, border: '3px solid var(--color-surface)' }}>{item.step}</div>
                      <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                          <item.icon size={16} style={{ color: 'var(--color-primary)' }} />
                          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--color-on-surface)', letterSpacing: 'var(--tracking-display)' }}>{item.title}</h4>
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeCategory === 'integration' && (
              <motion.div key="int" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Direct Integration" icon={Code2} />
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)', marginBottom: 'var(--space-5)' }}>Paste this snippet into your HTML file, just before the closing &lt;/body&gt; tag.</p>
                <div style={{ background: '#fef3e2', padding: 'var(--space-4) var(--space-5)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', alignItems: 'flex-start' }}>
                  <Info size={16} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning)', margin: 0, fontWeight: 'var(--weight-medium)' }}>Replace <code>YOUR_API_KEY</code> with the actual key from your Integration tab.</p>
                </div>
                <CodeBlock code={`<!-- SupportBotAI Widget -->\n<script src="${API_URL}/widget.js"></script>\n<script>\n  window.SupportBotAI.init({\n    apiKey: 'YOUR_API_KEY',\n    theme: 'light'\n  });\n</script>`} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xl)', color: 'var(--color-on-surface)', marginTop: 'var(--space-10)', marginBottom: 'var(--space-5)', letterSpacing: 'var(--tracking-display)' }}>Supported Platforms</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                  {['React / Next.js', 'WordPress', 'Webflow', 'Shopify', 'HTML/JS', 'Bubble.io'].map(p => (
                    <div key={p} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-on-surface)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeCategory === 'ai-training' && (
              <motion.div key="tr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Training Your AI" icon={Bot} />
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)', marginBottom: 'var(--space-8)' }}>The quality of your AI's responses depends on the depth of the knowledge base. You have two ways to feed information:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                  <div className="card" style={{ position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}><Globe size={18} style={{ color: 'var(--color-primary)' }} /></div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-3)', letterSpacing: 'var(--tracking-display)' }}>Automated Web Crawl</h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)', marginBottom: 'var(--space-4)' }}>Enter your website URL, and our deep-learning crawler will index your pages, blogs, and documentation automatically.</p>
                    <span className="badge badge-primary">PRO Feature</span>
                  </div>
                  <div className="card">
                    <div style={{ width: '40px', height: '40px', background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}><MessageSquare size={18} style={{ color: 'var(--color-secondary)' }} /></div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-3)', letterSpacing: 'var(--tracking-display)' }}>Expert Q&A Mode</h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)' }}>Manually define specific answers to common questions. Ensures 100% accuracy for sensitive company policies.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeCategory === 'security' && (
              <motion.div key="sec" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Security & Authentication" icon={Lock} />
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)', marginBottom: 'var(--space-8)' }}>SupportBotAI implements multi-layer protection for both your business data and your customers' conversations.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {[{ title: 'JWT Authentication', desc: 'Secure token-based access for all dashboard operations.' }, { title: 'Domain Whitelisting', desc: 'Ensure your widget only runs on authorized domains.' }, { title: 'Password OTP Recovery', desc: 'Multi-factor authentication for sensitive account changes.' }, { title: 'Encrypted Knowledge Base', desc: 'All trained data encrypted at rest using AES-256.' }].map((s, i) => (
                    <div key={i} className="card" style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: 'var(--radius-full)', background: 'var(--color-error)', marginTop: 'var(--space-2)', flexShrink: 0 }} />
                      <div>
                        <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-1)', letterSpacing: 'var(--tracking-display)' }}>{s.title}</h5>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)', lineHeight: 'var(--leading-body)' }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeCategory === 'customization' && (
              <motion.div key="cust" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionHeader title="Customization" icon={Palette} />
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)', marginBottom: 'var(--space-8)' }}>Personalize every aspect of your chat widget to match your brand's visual identity.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {['Widget theme color', 'Logo and avatar', 'Welcome message', 'Widget placement (left/right)', 'Font and language preferences'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', fontWeight: 'var(--weight-medium)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} /> {t}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer CTA */}
          <div style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-10)', borderTop: '2px solid var(--color-surface-container)', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-2xl)', letterSpacing: 'var(--tracking-display)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-3)' }}>Still have questions?</h3>
            <p style={{ color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-8)' }}>Our technical team is ready to help with your custom implementation.</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-lg">Contact Support</button>
              <button className="btn btn-primary btn-lg">Join Community Discord</button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
