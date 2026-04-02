import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    { number: '01', title: t('howItWorks.step1.title'), description: t('howItWorks.step1.description') },
    { number: '02', title: t('howItWorks.step2.title'), description: t('howItWorks.step2.description') },
    { number: '03', title: t('howItWorks.step3.title'), description: t('howItWorks.step3.description') },
  ];

  return (
    <section className="py-16 lg:py-24 bg-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary text-xs uppercase tracking-wider font-medium mb-2">{t('howItWorks.badge')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-background">{t('howItWorks.title')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background/5 rounded-xl p-6 border border-background/10"
            >
              <div className="text-4xl font-bold text-primary/30 mb-3">{step.number}</div>
              <h3 className="text-lg font-bold text-background mb-2">{step.title}</h3>
              <p className="text-sm text-background/60 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
