import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const WhyUsSection = () => {
  const { t } = useTranslation();

  const stats = [
    {
      value: t('whyUs.accounts.value'),
      label: t('whyUs.accounts.label'),
      description: t('whyUs.accounts.description'),
      highlight: true,
    },
    {
      value: t('whyUs.fees.value'),
      label: t('whyUs.fees.label'),
      description: t('whyUs.fees.description'),
      highlight: false,
    },
    {
      value: t('whyUs.support.value'),
      label: t('whyUs.support.label'),
      description: t('whyUs.support.description'),
      highlight: false,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-light-gray">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-badge mx-auto mb-4">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t('whyUs.badge')}
          </div>
          <h2 className="section-title text-foreground">
            {t('whyUs.title')}
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* First Stat - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="stat-card lg:row-span-2"
          >
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-5xl lg:text-6xl font-bold text-primary mb-2">
                  {stats[0].value}
                </h3>
                <p className="text-foreground font-semibold text-lg">{stats[0].label}</p>
              </div>
              <p className="text-muted-foreground mt-auto">{stats[0].description}</p>
              
              {/* Decorative testimonials */}
              <div className="mt-8 flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-bold text-muted-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-primary border-2 border-card flex items-center justify-center text-xs font-bold text-primary-foreground">
                  +99
                </div>
              </div>
            </div>
          </motion.div>

          {/* Second Stat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="stat-card lg:col-span-2 flex items-center gap-8"
          >
            <div className="flex-1">
              <h3 className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                {stats[1].value}
              </h3>
              <p className="text-foreground font-semibold text-lg mb-4">{stats[1].label}</p>
              <p className="text-muted-foreground">{stats[1].description}</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 rounded-2xl bg-light-gray flex items-center justify-center">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Third Stat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="stat-card lg:col-span-2"
          >
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <h3 className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stats[2].value}
                </h3>
                <p className="text-foreground font-semibold text-lg mb-4">{stats[2].label}</p>
                <p className="text-muted-foreground">{stats[2].description}</p>
              </div>
              
              {/* Testimonial bubbles */}
              <div className="hidden md:flex flex-col gap-3">
                {['Doug Mae', 'Walker Chris', 'Chad Ford'].map((name, i) => (
                  <div key={name} className="flex items-center gap-2 bg-light-gray px-3 py-2 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {name[0]}
                    </div>
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
