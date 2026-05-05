import React from "react";
import PricingSection from "../components/PricingSection";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import Footer from "../../../../shared/ui/components/Footer";

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
          <h1 style={{textAlign:"center"}}>Ready to scale your support?</h1>
          <p style={{textAlign:"center"}}>Join 2,000+ companies automating their customer success with SupportBotAI.</p>
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
                <HelpCircle size={20} color="var(--primary)" className="flex-shrink-0" />
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
          <button className="btn btn-primary btn-lg w-full-mobile">Chat with Sales</button>
        </div>
      </div>

      <style>{`
        .pricing-page-wrapper { padding-bottom: 64px; background: var(--surface); }
        @media (min-width: 768px) { .pricing-page-wrapper { padding-bottom: 120px; } }

        .pricing-hero { padding: 40px 0 0; }
        @media (min-width: 768px) { .pricing-hero { padding: 80px 0 0; } }

        .pricing-hero h1 { font-size: 2rem; margin: 16px 0; line-height: 1.2; font-weight: 800; }
        @media (min-width: 768px) { .pricing-hero h1 { font-size: 3.5rem; margin: 24px 0; } }

        .pricing-hero p { color: var(--on-surface-variant); font-size: 1rem; max-width: 600px; margin: 0 auto; line-height: 1.5; }
        @media (min-width: 768px) { .pricing-hero p { font-size: 1.15rem; } }
        
        .faq-section { margin-top: 60px; }
        @media (min-width: 768px) { .faq-section { margin-top: 80px; } }

        .faq-accordion { max-width: 900px; margin: 40px auto 0; display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .faq-accordion { grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 60px; } }

        .faq-item-card { padding: 24px; height: 100%; border-radius: 20px; }
        @media (min-width: 768px) { .faq-item-card { padding: 32px; border-radius: 24px; } }

        .faq-q { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        @media (min-width: 768px) { .faq-q { align-items: center; margin-bottom: 16px; } }

        .flex-shrink-0 { flex-shrink: 0; margin-top: 2px; }
        @media (min-width: 768px) { .flex-shrink-0 { margin-top: 0; } }

        .faq-q h4 { margin: 0; font-size: 1.05rem; color: var(--on-surface); line-height: 1.4; }
        @media (min-width: 768px) { .faq-q h4 { font-size: 1.1rem; } }

        .faq-a { color: var(--on-surface-variant); line-height: 1.6; font-size: 0.9rem; margin: 0; }
        @media (min-width: 768px) { .faq-a { font-size: 0.95rem; } }
        
        .cta-banner { margin-top: 64px; }
        @media (min-width: 768px) { .cta-banner { margin-top: 120px; } }

        .banner-card { background: linear-gradient(135deg, var(--inverse-surface), #1e293b); color: white; padding: 40px 24px; display: flex; flex-direction: column; text-align: center; gap: 32px; border: none; border-radius: 24px; align-items: center; }
        @media (min-width: 992px) { .banner-card { flex-direction: row; text-align: left; justify-content: space-between; padding: 60px; gap: 40px; border-radius: 32px; } }

        .banner-text h3 { font-size: 1.5rem; margin-bottom: 8px; color: white; }
        @media (min-width: 768px) { .banner-text h3 { font-size: 2rem; margin-bottom: 12px; } }

        .banner-text p { color: var(--outline-variant); font-size: 1rem; margin: 0; line-height: 1.5; }
        @media (min-width: 768px) { .banner-text p { font-size: 1.1rem; } }

        .w-full-mobile { width: 100%; }
        @media (min-width: 640px) { .w-full-mobile { width: auto; } }

        .title-tag { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 10px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 auto 16px; background: var(--primary-fixed); width: fit-content; padding: 4px 12px; border-radius: 20px; }
        @media (min-width: 768px) { .title-tag { font-size: 11px; margin: 0 auto 24px; } }
      `}</style>
      <Footer />
    </div>
  );
}
