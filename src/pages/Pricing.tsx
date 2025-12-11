import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/sections/PricingSection';
import { CTASection } from '@/components/sections/CTASection';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-32">
        <div className="bg-hero py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hero-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-hero-foreground/70 text-lg md:text-xl max-w-2xl mx-auto">
              Choose the plan that's right for you. No hidden fees, no surprises.
            </p>
          </div>
        </div>
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
