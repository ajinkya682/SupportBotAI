import React from "react";
import PricingSection from "../components/PricingSection";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

export default function Pricing() {
  const faqs = [
    {
      q: "Can I switch plans later?",
      a: "Yes, you can upgrade or downgrade your plan at any time from your dashboard billing settings. Changes take effect immediately."
    },
    {
      q: "What happens if I exceed my limit?",
      a: "On the Starter plan, the widget will pause until the next billing cycle. We'll notify you when you reach 80% and 100% of your limit."
    },
    {
      q: "Is there a long-term contract?",
      a: "No, SupportBotAI is a flexible month-to-month service. You can cancel at any time with a single click from your dashboard."
    },
    {
      q: "Do you offer a free trial?",
      a: "Our Starter plan is free forever! For Pro features, we offer a 14-day money-back guarantee if you're not satisfied."
    }
  ];

  return (
    <div className="pricing-page-wrapper animate-fade-in">
      <div className="pricing-hero">
        <div className="container text-center">
          <div className="title-tag"><Sparkles size={16} /> SIMPLE BILLING</div>
          <h1>Ready to scale your support?</h1>
          <p>Join 2,000+ companies automating their customer success with SupportBotAI.</p>
        </div>
      </div>

      <PricingSection />
      
      <section className="faq-section container">
        <div className="section-title text-center">
          <div className="title-tag">COMMON QUESTIONS</div>
          <h2>Frequently Asked Questions</h2>
        </div>
        
        <div className="faq-accordion">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="card faq-item-card"
            >
              <div className="faq-q">
                <HelpCircle size={20} color="var(--primary)" />
                <h4>{faq.q}</h4>
              </div>
              <p className="faq-a">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="cta-banner container">
        <div className="card banner-card">
          <div className="banner-text">
            <h3>Still have questions?</h3>
            <p>Our team is here to help you choose the right plan for your business needs.</p>
          </div>
          <button className="btn btn-primary btn-lg">Chat with Sales</button>
        </div>
      </div>

      <style>{`
        .pricing-page-wrapper { padding-bottom: 120px; background: var(--surface); }
        .pricing-hero { padding: 80px 0 0; }
        .pricing-hero h1 { font-size: 3.5rem; margin: 24px 0; }
        .pricing-hero p { color: var(--on-surface-variant); font-size: 1.15rem; max-width: 600px; margin: 0 auto; }
        
        .faq-section { margin-top: 80px; }
        .faq-accordion { max-width: 900px; margin: 60px auto 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .faq-item-card { padding: 32px; height: 100%; border-radius: 24px; }
        .faq-q { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .faq-q h4 { margin: 0; font-size: 1.1rem; color: var(--on-surface); }
        .faq-a { color: var(--on-surface-variant); line-height: 1.6; font-size: 0.95rem; margin: 0; }
        
        .cta-banner { margin-top: 120px; }
        .banner-card { background: linear-gradient(135deg, var(--inverse-surface), #1e293b); color: white; padding: 60px; display: flex; justify-content: space-between; align-items: center; border: none; border-radius: 32px; }
        .banner-text h3 { font-size: 2rem; margin-bottom: 12px; color: white; }
        .banner-text p { color: var(--outline-variant); font-size: 1.1rem; margin: 0; }
        
        @media (max-width: 992px) {
          .faq-accordion { grid-template-columns: 1fr; }
          .banner-card { flex-direction: column; text-align: center; gap: 40px; padding: 48px; }
        }
      `}</style>
    </div>
  );
}
