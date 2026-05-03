import React, { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function PricingSection({ showHeader = true }) {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 0, yearlyPrice: 0,
      description: "Perfect for exploring SupportBotAI.",
      features: [
        { text: "100 AI Conversations /mo", included: true },
        { text: "Basic Knowledge Base", included: true },
        { text: "Standard Widget Customization", included: true },
        { text: "Community Support", included: true },
        { text: "Single Website Embed", included: true },
        { text: "Advanced Web Scraper", included: false },
        { text: "Priority Support", included: false },
      ],
      buttonText: "Get Started for Free",
      link: "/signup", popular: false,
    },
    {
      name: "Pro",
      monthlyPrice: 49, yearlyPrice: 32,
      description: "Everything you need to scale support.",
      features: [
        { text: "Unlimited AI Conversations", included: true },
        { text: "Advanced Web Scraper (URL Crawling)", included: true },
        { text: "Premium Brandable Widget", included: true },
        { text: "Team Collaboration (3 Seats)", included: true },
        { text: "Priority Human Escalation", included: true },
        { text: "Remove 'Powered by' Branding", included: true },
        { text: "Advanced Analytics", included: true },
      ],
      buttonText: "Upgrade to Pro",
      link: "/signup", popular: true,
    },
  ];

  return (
    <section style={{ padding: 'var(--space-20) 0', background: 'var(--color-surface-container-lowest)' }}>
      <div className="container">
        {showHeader && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <motion.span
              initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 'var(--weight-semibold)', display: 'inline-block', marginBottom: 'var(--space-4)' }}
            >
              Pricing
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-display)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-8)' }}
            >
              Choose the plan that's right for you
            </motion.h2>

            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: !isYearly ? 'var(--color-on-surface)' : 'var(--color-on-surface-muted)', fontWeight: !isYearly ? 'var(--weight-semibold)' : 'var(--weight-regular)', transition: 'color var(--duration-base) var(--ease-standard)' }}>Pay Monthly</span>
              <div
                onClick={() => setIsYearly(!isYearly)}
                style={{ width: '48px', height: '26px', background: isYearly ? 'var(--color-primary)' : 'var(--color-surface-container-high)', borderRadius: 'var(--radius-full)', padding: '3px', cursor: 'pointer', transition: 'background var(--duration-slow) var(--ease-standard)', position: 'relative' }}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ width: '20px', height: '20px', background: 'white', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)', marginLeft: isYearly ? '22px' : '0' }}
                />
              </div>
              <span style={{ color: isYearly ? 'var(--color-on-surface)' : 'var(--color-on-surface-muted)', fontWeight: isYearly ? 'var(--weight-semibold)' : 'var(--weight-regular)', transition: 'color var(--duration-base) var(--ease-standard)' }}>
                Pay Yearly <span className="badge badge-success" style={{ marginLeft: 'var(--space-2)' }}>4 months free ✨</span>
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', maxWidth: '820px', margin: '0 auto' }}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 + 0.2 }}
              style={{
                background: plan.popular ? 'var(--color-primary-gradient)' : 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-10)',
                display: 'flex', flexDirection: 'column',
                boxShadow: plan.popular ? 'var(--shadow-xl)' : 'var(--shadow-sm)',
                transition: 'transform var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard)',
                position: 'relative',
                minHeight: '580px',
              }}
              whileHover={{ translateY: -6, boxShadow: plan.popular ? '0 32px 64px rgba(0,74,198,0.2)' : '0 16px 48px rgba(0,74,198,0.1)' }}
            >
              {plan.popular && (
                <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'white', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', padding: 'var(--space-1) var(--space-4)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Most Popular
                </span>
              )}

              <div style={{ marginBottom: 'var(--space-8)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', display: 'block', marginBottom: 'var(--space-4)', color: plan.popular ? 'rgba(255,255,255,0.9)' : 'var(--color-on-surface)', letterSpacing: 'var(--tracking-display)' }}>
                  {plan.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-1)', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--color-on-surface-variant)', marginBottom: 'var(--space-3)' }}>$</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-7xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', lineHeight: 1, color: plan.popular ? 'white' : 'var(--color-on-surface)' }}>
                    <AnimatePresence mode="wait">
                      <motion.span key={isYearly ? plan.yearlyPrice : plan.monthlyPrice} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span style={{ color: plan.popular ? 'rgba(255,255,255,0.6)' : 'var(--color-on-surface-muted)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>/ mo</span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: plan.popular ? 'rgba(255,255,255,0.75)' : 'var(--color-on-surface-muted)', lineHeight: 'var(--leading-body)' }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', flex: 1 }}>
                {plan.features.map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: !feature.included ? (plan.popular ? 'rgba(255,255,255,0.3)' : 'var(--color-on-surface-muted)') : (plan.popular ? 'rgba(255,255,255,0.9)' : 'var(--color-on-surface-variant)'), opacity: !feature.included ? 0.5 : 1 }}>
                    {feature.included
                      ? <Check size={16} style={{ color: plan.popular ? 'rgba(255,255,255,0.9)' : 'var(--color-secondary)', flexShrink: 0, marginTop: '2px' }} />
                      : <X size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    }
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              <Link
                to={plan.link}
                className={plan.popular ? 'btn btn-white btn-lg btn-block' : 'btn btn-primary btn-lg btn-block'}
              >
                {plan.buttonText}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
