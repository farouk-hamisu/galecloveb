import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import teamImage from '@/assets/team-celebrate.jpg';

export const WhyUsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-24 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src={teamImage}
              alt="Our team"
              className="rounded-2xl w-full h-auto object-cover"
              loading="lazy"
              width={640}
              height={512}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-badge mb-4">
              <span className="w-2 h-2 bg-primary rounded-full" />
              {t('whyUs.badge')}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {t('whyUs.title')}
            </h2>

            <div className="space-y-5">
              {['accounts', 'fees', 'support'].map((key) => (
                <div key={key} className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {t(`whyUs.${key}.value`)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(`whyUs.${key}.label`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`whyUs.${key}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
