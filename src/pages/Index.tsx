import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { WhyUsSection } from '@/components/sections/WhyUsSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { CustomerTestimonialsSection } from '@/components/sections/CustomerTestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';
import BrevoConversations from "@/components/BrevoConversations";
const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhyUsSection />
        <HowItWorksSection />
        <StatsSection />
        <CustomerTestimonialsSection />
        <CTASection />
        <BrevoConversations />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
