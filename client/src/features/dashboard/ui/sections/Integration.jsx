import { useState } from 'react';
import { Copy, Check, Globe, ShieldCheck, Terminal, AlertCircle, Sparkles } from "lucide-react";
import { API_URL } from '../../../../shared/services/config';

export default function Integration({ business, onUpgrade }) {
  const [copied, setCopied] = useState(false);

  const isFree = business?.plan === 'free';
  const domainLimit = isFree ? 1 : 10;
  const currentDomains = business?.allowedDomains || [];

  const scriptTag = `<script 
  src="${API_URL}/widget.js" 
  data-api-key="${business?.apiKey || 'YOUR_API_KEY'}" 
  defer
></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>
          Installation & Integration
        </h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Deploy your AI assistant to your website in seconds.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-10)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          
          {/* Script Card */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <Terminal size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Embed Script</h3>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
              Add this script tag to your website's <code style={{ background: 'var(--color-surface-container-low)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-primary)' }}>&lt;head&gt;</code> or just before the closing <code style={{ background: 'var(--color-surface-container-low)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-primary)' }}>&lt;/body&gt;</code> tag.
            </p>
            
            <div style={{ position: 'relative', background: '#1e293b', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <pre style={{ margin: 0, color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', overflowX: 'auto', lineHeight: 1.8 }}>
                {scriptTag}
              </pre>
              <button 
                onClick={copyToClipboard}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: copied ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  padding: '8px', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Domains Card */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Globe size={20} style={{ color: 'var(--color-secondary)' }} />
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Whitelisted Domains</h3>
              </div>
              <span style={{ background: 'var(--color-surface-container-low)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 'bold' }}>
                {currentDomains.length} / {domainLimit} WEBSITES
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {currentDomains.length > 0 ? currentDomains.map(domain => (
                <div key={domain} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-6)', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-container)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-secondary)' }} />
                    <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>{domain}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 'var(--weight-bold)' }}>
                    <ShieldCheck size={14} /> ACTIVE
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-surface-container)' }}>
                  <AlertCircle size={32} style={{ color: 'var(--color-on-surface-muted)', margin: '0 auto var(--space-4)' }} />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)' }}>No websites connected yet. Deployment detected automatically.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card" style={{ background: 'var(--color-primary-light)', border: 'none', padding: 'var(--space-8)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)', textTransform: 'uppercase' }}>Smart Deployment</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {[
                { title: 'Zero Config', desc: 'No complex setup. Paste the code and we handle the rest.' },
                { title: 'Auto-Detect', desc: 'Your assistant whitelists your domain the moment it loads.' },
                { title: 'Global CDN', desc: 'Fast loading times across all regions and devices.' }
              ].map(item => (
                <div key={item.title}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            {isFree && (
              <button className="btn btn-primary btn-block" onClick={onUpgrade} style={{ marginTop: 'var(--space-8)' }}>
                <Sparkles size={14} /> Upgrade for 10 Domains
              </button>
            )}
          </div>

          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-6)' }}>SUPPORTED PLATFORMS</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {['WordPress', 'Webflow', 'React', 'Shopify', 'Next.js', 'SquareSpace'].map(p => (
                <div key={p} style={{ padding: '8px', textAlign: 'center', background: 'var(--color-surface-container-low)', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: 'var(--color-on-surface-variant)' }}>{p}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
