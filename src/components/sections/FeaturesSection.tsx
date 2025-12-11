import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Wallet, Shield } from 'lucide-react';

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Send,
      title: t('features.zeroFee.title'),
      description: t('features.zeroFee.description'),
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Wallet,
      title: t('features.smartWallet.title'),
      description: t('features.smartWallet.description'),
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description'),
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <div className="section-badge mb-4">
              <span className="w-2 h-2 bg-primary rounded-full" />
              {t('features.badge')}
            </div>
            <h2 className="section-title text-foreground">
              {t('features.title')}<br />
              <span className="text-primary">{t('features.titleHighlight')}</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-lg">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="feature-card group hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
