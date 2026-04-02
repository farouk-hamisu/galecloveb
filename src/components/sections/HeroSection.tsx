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
    <section className="bg-background pt-24 lg:pt-32 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground text-sm font-medium mb-3 tracking-wide uppercase">
              {t('hero.badge')}
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-5">
              {t('hero.title')}
            </h1>

            <p className="text-muted-foreground text-base max-w-lg mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">{t('hero.openAccount')}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">{t('hero.learnMore')}</Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <img
              src={heroImage}
              alt="Professional banking services"
              className="w-full h-auto rounded-2xl object-cover"
              width={960}
              height={640}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
