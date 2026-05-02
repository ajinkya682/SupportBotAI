import React from 'react';
import { Check, ArrowRight, Zap, Sparkles, Shield, Bot, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      description: 'Perfect for small blogs and side projects exploring AI support.',
      features: [
        '50 AI Conversations /mo',
        'Basic Knowledge Base (Manual)',
        'Standard SupportBotAI Branding',
        '1 Website Integration',
        'Basic Analytics',
        'Community Support'
      ],
      cta: 'Start for Free',
      link: '/signup',
      highlight: false,
      icon: MessageSquare,
      color: 'var(--on-surface-variant)'
    },
    {
      name: 'Professional',
      price: '49',
      description: 'Ideal for growing businesses that need 24/7 automated resolution.',
      features: [
        'Unlimited AI Conversations',
        'Intelligent URL Deep-Scanning',
        'White-label Widget (No Branding)',
        'Up to 10 Website Integrations',
        'Sentiment & Intent Analytics',
        'Priority Human Handover',
        'Advanced Custom Styling',
        'Priority Email Support'
      ],
      cta: 'Get Started Pro',
      link: '/signup',
      highlight: true,
      icon: Sparkles,
      color: 'var(--primary)'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'High-volume support with custom LLM training and API access.',
      features: [
        'Everything in Pro',
        'Custom Dedicated Model Training',
        'Full API & Webhook Access',
        'Unlimited Website Integrations',
        'Dedicated Account Manager',
        'SLA & Priority 24/7 Support',
        'SSO & Advanced Security',
        'Custom Legal Compliance'
      ],
      cta: 'Contact Sales',
      link: '/signup',
      highlight: false,
      icon: Shield,
      color: 'var(--inverse-surface)'
    }
  ];

  return (
    <section className="pricing-section">
      <div className="container">
        <div className="section-title text-center">
          <div className="title-tag">TRANSPARENT PRICING</div>
          <h2>Scale your support without <br />scaling your overhead</h2>
          <p>Choose the plan that fits your business stage. No hidden fees, cancel anytime.</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`pricing-card ${plan.highlight ? 'highlighted' : ''}`}
            >
              {plan.highlight && (
                <div className="popular-badge">MOST POPULAR</div>
              )}
              
              <div className="plan-header">
                <div className="plan-icon" style={{ color: plan.color, background: `${plan.color}15` }}>
                  <plan.icon size={28} />
                </div>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className="plan-price">
                {plan.price !== 'Custom' && <span className="currency">$</span>}
                <span className="amount">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="period">/month</span>}
              </div>

              <div className="plan-features">
                <ul>
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx}>
                      <Check size={18} className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link 
                to={plan.link} 
                className={`btn btn-block ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                style={{ height: '56px', fontSize: '1rem' }}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="pricing-footer text-center">
          <p>Need something custom? <Link to="/contact">Contact our support team</Link></p>
        </div>
      </div>

      <style>{`
        .pricing-section { padding: 120px 0; background: var(--surface); position: relative; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 80px; }
        
        .pricing-card { background: var(--surface-container-lowest); border: 1px solid var(--outline-variant); border-radius: 32px; padding: 48px; position: relative; transition: var(--transition-normal); display: flex; flex-direction: column; }
        .pricing-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-4); border-color: var(--primary-fixed); }
        .pricing-card.highlighted { border: 2px solid var(--primary); box-shadow: 0 20px 40px rgba(53, 37, 205, 0.1); transform: scale(1.05); z-index: 2; }
        .pricing-card.highlighted:hover { transform: scale(1.05) translateY(-8px); }
        
        .popular-badge { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; }
        
        .plan-header { margin-bottom: 32px; }
        .plan-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .plan-header h3 { font-size: 1.75rem; margin-bottom: 12px; }
        .plan-header p { font-size: 0.95rem; color: var(--on-surface-variant); line-height: 1.5; }
        
        .plan-price { margin-bottom: 40px; display: flex; align-items: baseline; gap: 4px; }
        .plan-price .currency { font-size: 1.5rem; font-weight: 700; color: var(--on-surface-variant); }
        .plan-price .amount { font-size: 3.5rem; font-weight: 900; color: var(--on-surface); font-family: 'Outfit'; }
        .plan-price .period { font-size: 1rem; color: var(--on-surface-variant); font-weight: 600; }
        
        .plan-features { margin-bottom: 48px; flex: 1; }
        .plan-features ul { list-style: none; padding: 0; }
        .plan-features li { display: flex; gap: 12px; margin-bottom: 16px; font-size: 0.95rem; color: var(--on-surface-variant); font-weight: 500; }
        .check-icon { color: var(--primary); flex-shrink: 0; }
        
        .pricing-footer { margin-top: 60px; color: var(--on-surface-variant); font-weight: 500; }
        .pricing-footer a { color: var(--primary); text-decoration: none; font-weight: 700; }
        
        @media (max-width: 1024px) {
          .pricing-grid { grid-template-columns: 1fr; max-width: 500px; margin: 80px auto 0; }
          .pricing-card.highlighted { transform: none; }
          .pricing-card.highlighted:hover { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}
