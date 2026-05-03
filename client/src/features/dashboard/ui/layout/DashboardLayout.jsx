import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';

export default function DashboardLayout({ children, activeTab, setActiveTab, business, onUpgrade, showUpgradeModal, setShowUpgradeModal, isUpgrading, handleUpgrade }) {
  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onUpgrade={onUpgrade} business={business} />

      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-surface)' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          padding: 'var(--space-4) var(--space-8)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--shadow-xs)',
          zIndex: 10, flexShrink: 0,
        }}>
          <NotificationBell />
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-8)', flex: 1, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13,13,13,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-5)' }} onClick={() => setShowUpgradeModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', position: 'relative', maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowUpgradeModal(false)} style={{ position: 'absolute', top: 'var(--space-5)', right: 'var(--space-5)' }}><X size={18} /></button>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)' }}>
                  <Sparkles size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-3)' }}>
                  Upgrade to <span style={{ color: 'var(--color-primary)' }}>SupportBot Pro</span>
                </h2>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Unlock the full power of AI for your customer support.</p>
              </div>
              <div style={{ background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'var(--space-1)', marginBottom: 'var(--space-6)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-primary)', letterSpacing: 'var(--tracking-tight)' }}>$49</span>
                  <span style={{ color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {['Unlimited AI Conversations', 'Advanced URL Web Training', 'White-label Widget (No Branding)', 'Advanced Emotion & Intent Analytics', 'AI Suggestion for Human Agents'].map(feat => (
                    <li key={feat} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', alignItems: 'center' }}>
                      <Check size={16} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} /> {feat}
                    </li>
                  ))}
                </ul>
                <button className={`btn btn-primary btn-lg btn-block${isUpgrading ? ' btn-loading' : ''}`} onClick={handleUpgrade} disabled={isUpgrading}>
                  {!isUpgrading && 'Upgrade Now'}
                </button>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>Cancel anytime. No questions asked.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
