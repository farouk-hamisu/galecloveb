import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const StatsSection = () => {
  const { t } = useTranslation();

  const stats = [
    {
      value: t('stats.interest.value'),
      label: t('stats.interest.label'),
    },
    {
      value: t('stats.transactions.value'),
      label: t('stats.transactions.label'),
    },
    {
      value: t('stats.countries.value'),
      label: t('stats.countries.label'),
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-badge mx-auto mb-4">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t('stats.badge')}
          </div>
          <h2 className="section-title text-foreground mb-4">
            {t('stats.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('stats.subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl lg:text-6xl font-bold text-primary mb-3">
                {stat.value}
              </div>
              <p className="text-muted-foreground text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
