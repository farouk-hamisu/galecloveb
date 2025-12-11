import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-woman.jpg';

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-hero pt-24 lg:pt-32 pb-12 min-h-[90vh] flex items-center">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-dark-surface rounded-3xl lg:rounded-4xl p-8 lg:p-12 xl:p-16 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="section-badge mb-6 bg-white/10 text-hero-foreground">
                <span className="w-2 h-2 bg-primary rounded-full" />
                {t('hero.badge')}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hero-foreground leading-tight mb-6">
                {t('hero.title')}
              </h1>
              
              <p className="text-hero-foreground/70 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
                {t('hero.subtitle')}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">{t('hero.openAccount')}</Link>
                </Button>
                <Button variant="heroOutline" size="lg" asChild>
                  <Link to="/about">{t('hero.learnMore')}</Link>
                </Button>
              </div>

              {/* Trusted By */}
              <div className="pt-8 border-t border-white/10">
                <p className="text-hero-foreground/50 text-sm mb-4">{t('hero.trustedBy')}</p>
                <div className="flex flex-wrap items-center gap-6 opacity-60">
                  {['Pingdom', 'ClickUp', 'Monday'].map((company) => (
                    <span key={company} className="text-hero-foreground font-semibold text-lg">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:flex justify-end items-center"
            >
              {/* Floating card decoration */}
              <div className="absolute top-1/4 left-0 z-20 bg-card rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">Transfer Complete</p>
                    <p className="text-muted-foreground text-xs">$2,500 sent</p>
                  </div>
                </div>
              </div>

              <div className="relative w-full max-w-md">
                <img
                  src={heroImage}
                  alt="Happy customer with NCUBank card"
                  className="w-full h-auto rounded-2xl object-cover shadow-2xl"
                />
                {/* Decorative shapes */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-2xl -rotate-12" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-coral-light/80 rounded-xl rotate-12" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
