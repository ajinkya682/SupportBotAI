import { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck, 
  Terminal, 
  Plus, 
  Trash2, 
  AlertCircle,
  Sparkles,
  Loader2,
  Save,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, BASE_URL, APP_URL } from '../../../../shared/services/config';

export default function Integration({ business, onSave, isLoading, onUpgrade }) {
  const [copied, setCopied] = useState(false);
  
  const isFree = business?.plan === 'free';
  const domainLimit = isFree ? 1 : 10;
  const currentDomains = business?.allowedDomains || [];

  const scriptTag = `<!-- SupportBotAI Widget -->\n<script \n  src="${BASE_URL}/widget.js" \n  data-api-key="${business?.apiKey || 'YOUR_API_KEY'}" \n  data-client-url="${APP_URL}" \n  defer\n></script>\n<!-- End SupportBotAI Widget -->`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in integration-container">
      <div className="integration-header">
        <div className="page-title">
          <h1>Website Integration</h1>
          <p>Connect SupportBotAI to your website with a single line of code.</p>
        </div>
      </div>

      <div className="integration-grid">
        <div className="main-panel">
          <div className="card">
            <div className="section-header">
              <div className="section-icon"><Terminal size={24} /></div>
              <div>
                <h3>Installation Script</h3>
                <p>Copy and paste this script tag into the <code className="inline-code">&lt;head&gt;</code> or <code className="inline-code">&lt;body&gt;</code> of your website.</p>
              </div>
            </div>

            <div className="code-block-container">
              <div className="code-header">
                <span className="code-lang">HTML SCRIPT</span>
                <button 
                  onClick={copyToClipboard}
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                >
                  {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Code</>}
                </button>
              </div>
              <div className="code-content">
                <pre>{scriptTag}</pre>
              </div>
            </div>

            <div className="integration-tip">
              <AlertCircle size={20} />
              <p>The chatbot will automatically authorize and whitelist the first domain it is successfully loaded on.</p>
            </div>
          </div>

          <div className="card">
            <div className="section-header-flex">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="section-icon"><Globe size={24} /></div>
                <div>
                  <h3>Authorized Domains</h3>
                  <p>Websites where your chatbot is allowed to load and interact.</p>
                </div>
              </div>
              <div className="usage-indicator">
                <span className="count">{currentDomains.length} / {domainLimit}</span>
                <span className="label">Used</span>
              </div>
            </div>

            <div className="domain-list">
              {currentDomains.map((domain) => (
                <motion.div 
                  key={domain} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="domain-item"
                >
                  <div className="domain-info">
                    <div className="domain-status-dot active"></div>
                    <span className="domain-name">{domain}</span>
                  </div>
                  <div className="domain-badge">
                    <ShieldCheck size={14} /> Authorized
                  </div>
                </motion.div>
              ))}

              {currentDomains.length === 0 && (
                <div className="empty-domains">
                  <div className="empty-icon"><Globe size={32} /></div>
                  <p>No domains connected yet. Install the script to get started.</p>
                </div>
              )}
            </div>

            {isFree && currentDomains.length >= domainLimit && (
              <div className="upgrade-notice">
                <ShieldAlert size={20} />
                <p>You've reached the free limit of 1 domain. Upgrade to Pro for up to 10 domains.</p>
                <button className="btn btn-primary btn-sm" onClick={onUpgrade}>Upgrade Now</button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="card highlight-card">
            <h4 className="flex items-center gap-4"><Sparkles size={18} /> Smart Management</h4>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-check"><Check size={14} /></div>
                <p><strong>Auto-Whitelisting:</strong> New domains are added automatically upon first load.</p>
              </div>
              <div className="feature-item">
                <div className="feature-check"><Check size={14} /></div>
                <p><strong>CORS Protection:</strong> Only authorized domains can access your bot's intelligence.</p>
              </div>
              <div className="feature-item">
                <div className="feature-check"><Check size={14} /></div>
                <p><strong>Global Delivery:</strong> Our widget is served via high-speed global Edge CDN.</p>
              </div>
            </div>
            {isFree && (
              <button className="btn btn-primary btn-block" style={{ marginTop: '24px' }} onClick={onUpgrade}>
                Upgrade for More Domains <ArrowRight size={16} />
              </button>
            )}
          </div>

          <div className="card platforms-card">
            <h4>Supported Platforms</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '20px' }}>Works with any platform that supports custom HTML/JS.</p>
            <div className="platform-grid">
              {['WordPress', 'Shopify', 'Webflow', 'React', 'Next.js', 'Wix', 'Squarespace', 'Ghost'].map(platform => (
                <div key={platform} className="platform-tag">
                  {platform}
                </div>
              ))}
            </div>
            <button className="btn btn-text" style={{ width: '100%', marginTop: '16px', fontSize: '0.85rem' }}>
              View Setup Guides <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .integration-container { padding-bottom: 60px; }
        .integration-header { margin-bottom: 40px; }
        .integration-grid { display: grid; grid-template-columns: 1fr 340px; gap: 32px; }
        .main-panel { display: flex; flex-direction: column; gap: 32px; }
        
        .section-header { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
        .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-icon { width: 48px; height: 48px; background: var(--primary-fixed); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        
        .inline-code { background: var(--surface-container-high); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: var(--primary); }
        
        .code-block-container { background: #0f172a; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--outline-variant); }
        .code-header { background: #1e293b; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
        .code-lang { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; }
        .copy-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .copy-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .copy-btn.copied { background: #059669; color: white; border-color: #059669; }
        .code-content { padding: 24px; overflow-x: auto; }
        .code-content pre { color: #10b981; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; line-height: 1.6; margin: 0; }
        
        .integration-tip { margin-top: 24px; display: flex; gap: 12px; padding: 16px; background: var(--surface-container-low); border-radius: 12px; border: 1px solid var(--outline-variant); color: var(--on-surface-variant); font-size: 0.85rem; line-height: 1.5; }
        
        .usage-indicator { display: flex; flex-direction: column; align-items: flex-end; }
        .usage-indicator .count { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
        .usage-indicator .label { font-size: 0.7rem; font-weight: 700; color: var(--on-surface-variant); text-transform: uppercase; }
        
        .domain-list { display: flex; flex-direction: column; gap: 10px; }
        .domain-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 12px; }
        .domain-info { display: flex; align-items: center; gap: 12px; }
        .domain-status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .domain-status-dot.active { background: #10b981; box-shadow: 0 0 8px #10b981; }
        .domain-name { font-weight: 700; color: var(--on-surface); }
        .domain-badge { font-size: 0.75rem; font-weight: 700; color: #10b981; display: flex; align-items: center; gap: 4px; }
        
        .empty-domains { padding: 40px; text-align: center; color: var(--on-surface-variant); border: 1px dashed var(--outline-variant); border-radius: 12px; }
        .empty-icon { margin-bottom: 12px; opacity: 0.3; }
        
        .upgrade-notice { margin-top: 24px; padding: 20px; background: var(--error-container); border-radius: 12px; display: flex; align-items: center; gap: 16px; color: var(--error); }
        .upgrade-notice p { font-size: 0.85rem; font-weight: 600; flex: 1; }
        
        .highlight-card { background: linear-gradient(135deg, var(--surface-container-lowest), var(--surface-container-low)); border-color: var(--primary-fixed); }
        .feature-list { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
        .feature-item { display: flex; gap: 12px; }
        .feature-check { width: 20px; height: 20px; background: #d1fae5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .feature-item p { font-size: 0.85rem; color: var(--on-surface-variant); line-height: 1.4; }
        
        .platform-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; }
        .platform-tag { padding: 8px; text-align: center; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 8px; font-size: 0.75rem; font-weight: 700; color: var(--on-surface); }
      `}</style>
    </div>
  );
}
