import { motion } from "framer-motion";
import { Bot, Cpu, MessageCircle, Zap, ShieldCheck, BarChart3, Globe, Headphones, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../../../../shared/ui/layout/Footer";

const features = [
  { title: "Advanced AI Core", desc: "Our proprietary LLM logic ensures your assistant understands context, nuances, and brand tone perfectly.", icon: Cpu },
  { title: "Emotion Detection", desc: "Identify frustrated or urgent customers instantly and escalate to a human agent before they churn.", icon: ShieldCheck },
  { title: "Seamless Integration", desc: "Embed our lightweight widget on WordPress, Shopify, React, or any platform with a single script tag.", icon: Zap },
  { title: "Real-time Inbox", desc: "Manage all conversations in one place. Take over chats manually whenever you see a complex issue.", icon: MessageCircle },
];

const capabilities = [
  { icon: Globe, text: 'Multi-language Support' },
  { icon: BarChart3, text: 'Deep Analytics Insights' },
  { icon: Headphones, text: 'Hybrid Human-AI Handover' },
];

export default function Product() {
  return (
    <div style={{ background: 'var(--color-surface)', paddingBottom: 'var(--space-24)' }} className="animate-fade-in">

      {/* HERO */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--color-surface-container-lowest)', paddingTop: 'var(--space-12)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: 'var(--space-6)' }}>
            <span className="badge badge-primary badge-dot"><Bot size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> AI Powered</span>
          </motion.div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-7xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-display)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-6)', maxWidth: '800px', margin: '0 auto var(--space-6)' }}>
            Support That <span style={{ color: 'var(--color-primary)' }}>Thinks</span> Before It Speaks
          </h1>
          <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '0 auto var(--space-10)', lineHeight: 'var(--leading-body)' }}>
            Scale your customer service with an AI that doesn't just respond — it understands.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Start for Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--color-surface-container-low)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card card-hover">
                <div style={{ width: '52px', height: '52px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
                  <f.icon size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-3)', letterSpacing: 'var(--tracking-display)' }}>{f.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--color-surface-container-lowest)' }}>
        <div className="container">
          <div className="grid-asymmetric">
            {/* Text */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-display)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-5)', lineHeight: 'var(--leading-display)' }}>
                Instant Learning from <span style={{ color: 'var(--color-primary)' }}>Any Source</span>
              </h2>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-8)', lineHeight: 'var(--leading-body)' }}>
                Paste text, upload docs, or provide a URL. SupportBotAI crawls your resources to build a localized knowledge base that stays up to date.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {capabilities.map((cap, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-on-surface-variant)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <cap.icon size={16} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    {cap.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock Chat Card */}
            <div className="card-float" style={{ overflow: 'hidden' }}>
              {/* Title bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: 'var(--radius-full)', background: '#ff5f56' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: 'var(--radius-full)', background: '#ffbd2e' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: 'var(--radius-full)', background: '#27c93f' }} />
                <span style={{ marginLeft: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)' }}>AI Support Chat</span>
              </div>
              {/* Messages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="glass-ai" style={{ borderRadius: 'var(--radius-lg)', borderBottomLeftRadius: 'var(--radius-sm)', padding: 'var(--space-4) var(--space-5)', maxWidth: '80%', alignSelf: 'flex-start', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface)' }}>
                  How do I track my order?
                  <div style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--color-secondary)', display: 'inline-block', marginLeft: 'var(--space-2)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                </div>
                <div style={{ background: 'var(--color-primary-gradient)', borderRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-sm)', padding: 'var(--space-4) var(--space-5)', maxWidth: '80%', alignSelf: 'flex-end', fontSize: 'var(--text-sm)', color: 'white' }}>
                  You can track your order at /orders with your ID!
                </div>
                <div className="glass-ai" style={{ borderRadius: 'var(--radius-lg)', borderBottomLeftRadius: 'var(--radius-sm)', padding: 'var(--space-4) var(--space-5)', maxWidth: '80%', alignSelf: 'flex-start', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface)' }}>
                  Thanks! What about refunds?
                </div>
              </div>
              {/* Input bar */}
              <div style={{ marginTop: 'var(--space-6)', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-full)', padding: 'var(--space-3) var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)' }}>Type your message...</span>
                <div style={{ width: '28px', height: '28px', background: 'var(--color-primary-gradient)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={14} style={{ color: 'white' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
