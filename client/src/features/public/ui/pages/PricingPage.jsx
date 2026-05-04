import PricingSection from "../../../../shared/ui/components/PricingSection";
import Footer from "../../../../shared/ui/layout/Footer";

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard settings.' },
  { q: 'What happens if I exceed my limit?', a: 'On the Starter plan, the widget will pause until the next month. We\'ll notify you when you reach 80%.' },
  { q: 'Is there a long-term contract?', a: 'No, SupportBotAI is a month-to-month service. You can cancel at any time without penalties.' },
];

export default function Pricing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', paddingBottom: 'var(--space-24)' }}>
      <PricingSection />

      {/* FAQ Section */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--color-surface-container-lowest)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-display)', color: 'var(--color-on-surface)' }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card">
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-4)', letterSpacing: 'var(--tracking-display)' }}>
                  {faq.q}
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', lineHeight: 'var(--leading-body)' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
