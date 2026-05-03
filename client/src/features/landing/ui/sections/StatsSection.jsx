import { motion } from "framer-motion";

const stats = [
  { value: '80%', label: 'Queries auto-resolved' },
  { value: '<2s', label: 'Average response time' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '4.9★', label: 'Customer satisfaction' },
];

export default function StatsSection() {
  return (
    <section style={{ background: 'var(--color-surface-container-lowest)', padding: 'var(--space-20) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-display)', color: 'var(--color-on-surface)' }}>Trusted by the numbers</h2>
        </div>
        <div className="grid-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-6xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-primary)', letterSpacing: 'var(--tracking-tight)' }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-on-surface-variant)', marginTop: 'var(--space-2)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
