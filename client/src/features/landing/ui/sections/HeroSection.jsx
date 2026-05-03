import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="neural-bg" style={{ minHeight: '100vh', background: 'var(--color-surface-container-lowest)', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ width: '100%', paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)' }}>
        <div className="grid-asymmetric">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 'var(--weight-semibold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Sparkles size={14} /> The Future of Customer Support
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-7xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-display)', color: 'var(--color-on-surface)' }}>
              AI that resolves<br /><span style={{ color: 'var(--color-primary)' }}>tickets instantly.</span>
            </h1>
            <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)', maxWidth: '480px' }}>
              SupportBotAI handles 80% of your common queries automatically, while seamlessly routing complex issues to your human team.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started for Free <ArrowRight size={18} /></Link>
              <Link to="/product" className="btn btn-ghost btn-lg">See How It Works</Link>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              {['No credit card required', 'Free 14-day trial', 'Setup in 15 minutes'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-secondary)' }} /> {t}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mock UI Card */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }} style={{ transform: 'translateY(-40px)' }}>
            <div className="card-float">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--color-on-surface)' }}>Live Dashboard</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)' }}>Today's Performance</div>
                </div>
                <span className="badge badge-success badge-dot">Live</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[['284', 'Resolved Today'], ['1.8s', 'Avg Response'], ['12', 'Open Tickets'], ['96%', 'AI Accuracy']].map(([v, l], i) => (
                  <div key={l} style={{ background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color: i === 2 ? 'var(--color-on-surface)' : 'var(--color-primary)', letterSpacing: 'var(--tracking-tight)' }}>{v}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-4)', fontWeight: 'var(--weight-semibold)' }}>Resolution Rate (7d)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', height: '60px' }}>
                  {[40, 65, 55, 78, 62, 88, 96].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: i === 6 ? 'var(--color-primary-gradient)' : 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)', height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
