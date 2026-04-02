import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const StatsSection = () => {
  const { t } = useTranslation();

  const stats = [
    { value: t('stats.interest.value'), label: t('stats.interest.label') },
    { value: t('stats.transactions.value'), label: t('stats.transactions.label') },
    { value: t('stats.countries.value'), label: t('stats.countries.label') },
  ];

  return (
    <section className="py-16 lg:py-20 bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-2">{stat.value}</div>
              <p className="text-primary-foreground/70 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
