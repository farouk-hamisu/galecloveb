import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-foreground rounded-2xl p-10 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-xl mx-auto"
          >
            <p className="text-primary text-xs uppercase tracking-wider font-medium mb-3">{t('cta.badge')}</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-background leading-tight mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-background/60 text-sm mb-8 leading-relaxed">{t('cta.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">{t('cta.openVault')}</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-background/20 text-background hover:bg-background/10" asChild>
                <Link to="/about">{t('cta.learnMore')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
