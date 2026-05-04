import React from 'react';
import { Check, Sparkles, Shield, MessageSquare } from 'lucide-react';
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
        'Basic Knowledge Base',
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
        'White-label Widget',
        'Up to 10 Integrations',
        'Sentiment Analytics',
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
        'Custom Dedicated Model',
        'Full API & Webhook Access',
        'Unlimited Integrations',
        'Dedicated Account Manager',
        'SLA & 24/7 Support',
        'SSO & Security',
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
          <h2>Scale your support without <br className="desktop-only" />scaling your overhead</h2>
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
                  <plan.icon size={24} />
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
                      <Check size={16} className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link 
                to={plan.link} 
                className={`btn btn-block w-full ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
                style={{ height: '52px', fontSize: '0.95rem' }}
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
        .pricing-section { 
          padding: 60px 0; 
          background: var(--surface); 
          position: relative; 
        }

        @media (min-width: 768px) {
          .pricing-section { padding: 100px 0; }
        }

        .pricing-grid { 
          display: flex;
          flex-direction: column;
          gap: 24px; 
          margin-top: 40px; 
        }

        @media (min-width: 768px) {
          .pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; margin-top: 60px; }
        }

        @media (min-width: 1024px) {
          .pricing-grid { grid-template-columns: repeat(3, 1fr); margin-top: 80px; }
        }
        
        .pricing-card { 
          background: var(--surface-container-lowest); 
          border: 1px solid var(--outline-variant); 
          border-radius: 20px; 
          padding: 24px; 
          position: relative; 
          transition: var(--transition-normal); 
          display: flex; 
          flex-direction: column; 
          width: 100%;
        }

        @media (min-width: 768px) {
          .pricing-card { padding: 32px; border-radius: 24px; }
        }

        .pricing-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-1); }
        @media (min-width: 1024px) { .pricing-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-raised); } }
        
        .pricing-card.highlighted { 
          border: 2px solid var(--primary); 
          box-shadow: 0 4px 12px rgba(53, 37, 205, 0.08); 
        }

        @media (min-width: 1024px) {
          .pricing-card.highlighted { transform: scale(1.05); z-index: 2; box-shadow: 0 10px 30px rgba(53, 37, 205, 0.08); }
          .pricing-card.highlighted:hover { transform: scale(1.05) translateY(-8px); }
        }
        
        .popular-badge { 
          position: absolute; 
          top: -12px; 
          left: 50%; 
          transform: translateX(-50%); 
          background: var(--primary); 
          color: white; 
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 0.65rem; 
          font-weight: 800; 
          letter-spacing: 0.05em; 
        }
        @media (min-width: 768px) { .popular-badge { top: -14px; padding: 6px 16px; font-size: 0.7rem; } }
        
        .plan-header { margin-bottom: 20px; }
        @media (min-width: 768px) { .plan-header { margin-bottom: 24px; } }

        .plan-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        @media (min-width: 768px) { .plan-icon { width: 56px; height: 56px; border-radius: 14px; margin-bottom: 20px; } }

        .plan-header h3 { font-size: 1.25rem; margin-bottom: 8px; font-weight: 800; }
        @media (min-width: 768px) { .plan-header h3 { font-size: 1.5rem; } }

        .plan-header p { font-size: 0.85rem; color: var(--on-surface-variant); line-height: 1.5; margin: 0; }
        @media (min-width: 768px) { .plan-header p { font-size: 0.9rem; } }
        
        .plan-price { margin-bottom: 24px; display: flex; align-items: baseline; gap: 4px; }
        @media (min-width: 768px) { .plan-price { margin-bottom: 32px; } }

        .plan-price .currency { font-size: 1.1rem; font-weight: 700; color: var(--on-surface-variant); }
        @media (min-width: 768px) { .plan-price .currency { font-size: 1.25rem; } }

        .plan-price .amount { font-size: 2.5rem; font-weight: 900; color: var(--on-surface); line-height: 1; }
        @media (min-width: 768px) { .plan-price .amount { font-size: 3.5rem; } }

        .plan-price .period { font-size: 0.85rem; color: var(--on-surface-variant); font-weight: 600; }
        @media (min-width: 768px) { .plan-price .period { font-size: 0.9rem; } }
        
        .plan-features { margin-bottom: 24px; flex: 1; }
        @media (min-width: 768px) { .plan-features { margin-bottom: 32px; } }

        .plan-features ul { list-style: none; padding: 0; margin: 0; }
        .plan-features li { display: flex; gap: 12px; margin-bottom: 12px; font-size: 0.85rem; color: var(--on-surface-variant); font-weight: 500; align-items: flex-start; line-height: 1.4; }
        @media (min-width: 768px) { .plan-features li { font-size: 0.9rem; margin-bottom: 16px; } }

        .check-icon { color: var(--primary); flex-shrink: 0; margin-top: 2px; }
        
        .w-full { width: 100%; display: flex; align-items: center; justify-content: center; }

        .pricing-footer { margin-top: 40px; color: var(--on-surface-variant); font-weight: 500; font-size: 0.85rem; }
        @media (min-width: 768px) { .pricing-footer { margin-top: 48px; font-size: 0.9rem; } }
        .pricing-footer a { color: var(--primary); text-decoration: none; font-weight: 700; }

        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: inline; } }
      `}</style>
    </section>
  );
}
