import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: '1',
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
    },
    {
      number: '2',
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
    },
    {
      number: '3',
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-hero">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="section-badge mb-4 bg-white/10 text-hero-foreground">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t('howItWorks.badge')}
          </div>
          <h2 className="section-title text-hero-foreground max-w-xl">
            {t('howItWorks.title')}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-dark-surface rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="text-6xl font-bold text-primary/30 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-hero-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-hero-foreground/60 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
