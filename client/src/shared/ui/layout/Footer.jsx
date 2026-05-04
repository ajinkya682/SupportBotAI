import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-surface-container-low)', padding: 'var(--space-16) 0 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
          <div>
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-xl)', color: 'var(--color-primary)', letterSpacing: 'var(--tracking-tight)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              <Bot size={20} /> SupportBotAI
            </Link>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)', lineHeight: 'var(--leading-body)', maxWidth: '240px' }}>Revolutionizing customer support with AI that understands, learns, and resolves issues instantly.</p>
          </div>
          {[
            { title: 'Product', links: [{ label: 'Features', to: '/product' }, { label: 'Pricing', to: '/pricing' }, { label: 'Documentation', to: '/docs' }, { label: 'Get Started', to: '/signup' }] },
            { title: 'Resources', links: [{ label: 'Help Center', to: '#' }, { label: 'API Status', to: '#' }, { label: 'Security', to: '#' }, { label: 'Integrations', to: '#' }] },
            { title: 'Company', links: [{ label: 'About Us', to: '#' }, { label: 'Careers', to: '#' }, { label: 'Privacy', to: '#' }, { label: 'Terms', to: '#' }] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-5)' }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)', transition: 'color var(--duration-base) var(--ease-standard)' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-on-surface)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-on-surface-muted)'; }}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--color-surface-container)', padding: 'var(--space-5) 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)' }}>© 2026 SupportBotAI Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 'var(--space-5)' }}>
            {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
              <a key={s} href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-on-surface)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-on-surface-muted)'; }}>{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
