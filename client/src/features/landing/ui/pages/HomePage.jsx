import HeroSection from '../sections/HeroSection';
import TrustedBy from '../sections/TrustedBy';
import FeaturesSection from '../sections/FeaturesSection';
import StatsSection from '../sections/StatsSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import PricingSection from '../../../../shared/ui/components/PricingSection';
import CTABanner from '../sections/CTABanner';
import Footer from '../../../../shared/ui/layout/Footer';

export default function HomePage() {
  return (
    <div style={{ background: 'var(--color-surface)' }}>
      <HeroSection />
      <TrustedBy />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <CTABanner />
      <Footer />
    </div>
  );
}
