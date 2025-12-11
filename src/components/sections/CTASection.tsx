import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ctaImage from '@/assets/cta-woman.jpg';

export const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-hero">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-dark-surface rounded-3xl lg:rounded-4xl p-8 lg:p-12 xl:p-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="section-badge mb-6 bg-white/10 text-hero-foreground">
                <span className="w-2 h-2 bg-primary rounded-full" />
                {t('cta.badge')}
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-hero-foreground leading-tight mb-6">
                {t('cta.title')}
              </h2>
              
              <p className="text-hero-foreground/70 text-lg max-w-lg mb-8 leading-relaxed">
                {t('cta.subtitle')}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">{t('cta.openVault')}</Link>
                </Button>
                <Button variant="heroOutline" size="lg" asChild>
                  <Link to="/about">{t('cta.learnMore')}</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative hidden lg:flex justify-end"
            >
              <div className="relative">
                <img
                  src={ctaImage}
                  alt="Happy customer"
                  className="w-full max-w-sm rounded-2xl object-cover"
                />
                {/* Decorative shapes */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-hero rounded-2xl -z-10" />
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/30 rounded-xl rotate-12" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
