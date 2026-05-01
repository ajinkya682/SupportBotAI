import { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { motion } from 'framer-motion';
import { BASE_URL, APP_URL } from '../../../../shared/services/config';

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
          <p>Connect your AI to your website with a single line of code.</p>
        </div>
      </div>

      <div className="integration-grid">
        <div className="main-panel">
          <div className="card">
            <div className="section-header">
              <div className="section-icon"><Terminal size={20} /></div>
              <div>
                <h3>Installation Script</h3>
                <p>Paste this script tag into the <code className="inline-code">&lt;head&gt;</code> or <code className="inline-code">&lt;body&gt;</code> of your site.</p>
              </div>
            </div>

            <div className="code-block-container">
              <div className="code-header">
                <span className="code-lang">HTML</span>
                <button 
                  onClick={copyToClipboard}
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                >
                  {copied ? <><Check size={14} /> <span className="desktop-only">Copied</span></> : <><Copy size={14} /> <span className="desktop-only">Copy</span></>}
                </button>
              </div>
              <div className="code-content">
                <pre>{scriptTag}</pre>
              </div>
            </div>

            <div className="integration-tip">
              <AlertCircle size={18} className="tip-icon" />
              <p>The chatbot will automatically authorize the first domain it is successfully loaded on.</p>
            </div>
          </div>

          <div className="card">
            <div className="section-header-flex">
              <div className="header-title-group">
                <div className="section-icon"><Globe size={20} /></div>
                <div>
                  <h3>Authorized Domains</h3>
                  <p className="desktop-only">Websites where your chatbot is allowed to load.</p>
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
                    <ShieldCheck size={14} /> <span className="desktop-only">Authorized</span>
                  </div>
                </motion.div>
              ))}

              {currentDomains.length === 0 && (
                <div className="empty-domains">
                  <div className="empty-icon"><Globe size={32} /></div>
                  <p>No domains connected yet.</p>
                </div>
              )}
            </div>

            {isFree && currentDomains.length >= domainLimit && (
              <div className="upgrade-notice">
                <ShieldAlert size={24} className="upgrade-icon" />
                <p>You've reached the free limit. Upgrade to Pro for up to 10 domains.</p>
                <button className="btn btn-primary btn-sm" onClick={onUpgrade}>Upgrade</button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="card highlight-card">
            <h4 className="flex items-center gap-2"><Sparkles size={16} /> Smart Management</h4>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-check"><Check size={12} /></div>
                <p><strong>Auto-Whitelisting:</strong> New domains are added automatically.</p>
              </div>
              <div className="feature-item">
                <div className="feature-check"><Check size={12} /></div>
                <p><strong>CORS Protection:</strong> Only authorized domains can access the bot.</p>
              </div>
              <div className="feature-item">
                <div className="feature-check"><Check size={12} /></div>
                <p><strong>Global Delivery:</strong> Served via Edge CDN.</p>
              </div>
            </div>
            {isFree && (
              <button className="btn btn-primary btn-block" style={{ marginTop: '20px' }} onClick={onUpgrade}>
                Upgrade Domains <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div className="card platforms-card">
            <h4>Supported Platforms</h4>
            <p className="platform-subtext">Works with any platform that supports custom HTML/JS.</p>
            <div className="platform-grid">
              {['WordPress', 'Shopify', 'Webflow', 'React', 'Next.js', 'Wix', 'Squarespace', 'Ghost'].map(platform => (
                <div key={platform} className="platform-tag">
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .integration-container { padding-bottom: 40px; }
        .integration-header { margin-bottom: 32px; }
        
        .integration-grid { 
          display: flex;
          flex-direction: column;
          gap: 24px; 
        }

        @media (min-width: 1024px) {
          .integration-grid { 
            display: grid; 
            grid-template-columns: 1fr 340px; 
            gap: 32px; 
          }
        }

        .main-panel { display: flex; flex-direction: column; gap: 24px; }
        
        .section-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px; }
        .section-header h3 { font-size: 1.1rem; margin-bottom: 4px; }
        .section-header p { font-size: 13px; color: var(--on-surface-variant); }
        
        .section-header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .header-title-group { display: flex; gap: 12px; align-items: center; }
        
        .section-icon { width: 40px; height: 40px; background: var(--primary-fixed); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        
        .inline-code { background: var(--surface-container-high); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.85em; color: var(--primary); word-break: break-all; }
        
        .code-block-container { background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid var(--outline-variant); }
        .code-header { background: #1e293b; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
        .code-lang { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; }
        .copy-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
        .copy-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .copy-btn.copied { background: #059669; color: white; border-color: #059669; }
        
        .code-content { padding: 16px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .code-content pre { color: #10b981; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.5; margin: 0; white-space: pre-wrap; word-break: break-word; }
        @media (min-width: 768px) { .code-content pre { white-space: pre; } }
        
        .integration-tip { margin-top: 20px; display: flex; gap: 10px; padding: 16px; background: var(--surface-container-low); border-radius: 12px; border: 1px solid var(--outline-variant); color: var(--on-surface-variant); font-size: 13px; line-height: 1.4; align-items: flex-start; }
        .tip-icon { flex-shrink: 0; margin-top: 2px; }
        
        .usage-indicator { display: flex; flex-direction: column; align-items: flex-end; }
        .usage-indicator .count { font-size: 1.2rem; font-weight: 800; color: var(--primary); }
        .usage-indicator .label { font-size: 10px; font-weight: 700; color: var(--on-surface-variant); text-transform: uppercase; }
        
        .domain-list { display: flex; flex-direction: column; gap: 10px; }
        .domain-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 12px; gap: 12px; flex-wrap: wrap; }
        .domain-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .domain-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .domain-status-dot.active { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); }
        .domain-name { font-weight: 700; color: var(--on-surface); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .domain-badge { font-size: 11px; font-weight: 700; color: #10b981; display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        
        .empty-domains { padding: 32px; text-align: center; color: var(--on-surface-variant); border: 1px dashed var(--outline-variant); border-radius: 12px; }
        .empty-icon { margin-bottom: 12px; opacity: 0.3; }
        
        .upgrade-notice { margin-top: 20px; padding: 16px; background: var(--error-container); border-radius: 12px; display: flex; flex-direction: column; gap: 12px; color: var(--error); align-items: flex-start; }
        @media (min-width: 480px) { .upgrade-notice { flex-direction: row; align-items: center; } }
        .upgrade-notice p { font-size: 13px; font-weight: 600; flex: 1; line-height: 1.4; margin: 0; }
        .upgrade-icon { flex-shrink: 0; }
        
        .highlight-card { background: linear-gradient(135deg, var(--surface-container-lowest), var(--surface-container-low)); border-color: var(--primary-fixed); }
        .highlight-card h4 { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .feature-list { display: flex; flex-direction: column; gap: 12px; }
        .feature-item { display: flex; gap: 10px; align-items: flex-start; }
        .feature-check { width: 18px; height: 18px; background: #d1fae5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .feature-item p { font-size: 13px; color: var(--on-surface-variant); line-height: 1.4; margin: 0; }
        
        .platform-subtext { font-size: 12px; color: var(--on-surface-variant); margin-bottom: 16px; }
        .platform-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .platform-tag { padding: 8px; text-align: center; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 8px; font-size: 11px; font-weight: 700; color: var(--on-surface); }
        
        .desktop-only { display: none; }
        @media (min-width: 640px) { .desktop-only { display: inline; } }
      `}</style>
    </div>
  );
}
