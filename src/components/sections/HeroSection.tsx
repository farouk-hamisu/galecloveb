import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import heroImage from '@/assets/hero-business.jpg';

export const HeroSection = () => {
  const { t } = useTranslation();

  const highlights = [
    'Serious Savings',
    'Commitment-Free',
    'No Fees. No Catch.',
    'Easy Experience',
    'Free Plan Available',
    'Global Transfers',
  ];

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professional banking services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <p className="text-white/70 text-xs font-medium mb-3 tracking-widest uppercase">
            {t('hero.badge')}
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            {t('hero.title')}
          </h1>

          <p className="text-white/80 text-sm max-w-lg mb-8 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-white/90">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/signup">{t('hero.openAccount')}</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/about">{t('hero.learnMore')}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
