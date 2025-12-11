import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useState } from 'react';

export const PricingSection = () => {
  const { t } = useTranslation();
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: t('pricing.basic.name'),
      price: t('pricing.basic.price'),
      features: t('pricing.basic.features', { returnObjects: true }) as string[],
      recommended: false,
    },
    {
      name: t('pricing.premium.name'),
      price: t('pricing.premium.price'),
      features: t('pricing.premium.features', { returnObjects: true }) as string[],
      recommended: true,
    },
    {
      name: t('pricing.business.name'),
      price: t('pricing.business.price'),
      features: t('pricing.business.features', { returnObjects: true }) as string[],
      recommended: false,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-light-gray">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="section-badge mx-auto mb-4">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t('pricing.badge')}
          </div>
          <h2 className="section-title text-foreground mb-6">
            {t('pricing.title')}
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-muted'}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'}`}
              />
            </button>
            <span className={`font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('pricing.yearly')}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-3xl p-8 ${
                plan.recommended
                  ? 'bg-hero text-hero-foreground lg:-mt-4 lg:pb-12'
                  : 'bg-card border border-border'
              }`}
            >
              {plan.recommended && (
                <div className="inline-block px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold mb-4">
                  {t('pricing.recommended')}
                </div>
              )}
              
              <div className="mb-6">
                <div className="text-4xl font-bold mb-1">
                  {plan.price}
                  <span className={`text-lg font-normal ${plan.recommended ? 'text-hero-foreground/70' : 'text-muted-foreground'}`}>
                    {t('pricing.perMonth')}
                  </span>
                </div>
                <div className={`text-xl font-semibold ${plan.recommended ? 'text-primary' : 'text-foreground'}`}>
                  {plan.name}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 ${plan.recommended ? 'text-primary' : 'text-primary'}`} />
                    <span className={plan.recommended ? 'text-hero-foreground/80' : 'text-muted-foreground'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.recommended ? 'hero' : 'outline'}
                className="w-full"
                size="lg"
                asChild
              >
                <Link to="/signup">{t('pricing.openAccount')}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
