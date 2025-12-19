import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTASection } from '@/components/sections/CTASection';
import { motion } from 'framer-motion';
import { Shield, Users, Globe, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  const values = [
    {
      icon: Shield,
      title: t('about_page.security_first_title'),
      description: t('about_page.security_first_desc'),
    },
    {
      icon: Users,
      title: t('about_page.customer_focused_title'),
      description: t('about_page.customer_focused_desc'),
    },
    {
      icon: Globe,
      title: t('about_page.global_reach_title'),
      description: t('about_page.global_reach_desc'),
    },
    {
      icon: Award,
      title: t('about_page.award_winning_title'),
      description: t('about_page.award_winning_desc'),
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-32">
        {/* Hero */}
        <section className="bg-hero py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="section-badge mb-6 bg-white/10 text-hero-foreground">
                <span className="w-2 h-2 bg-primary rounded-full" />
                {t('about_page.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hero-foreground mb-6">
                {t('about_page.title')}
              </h1>
              <p className="text-hero-foreground/70 text-lg md:text-xl leading-relaxed">
                {t('about_page.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="section-title text-foreground mb-6">{t('about_page.story_title')}</h2>
                <div className="space-y-4 text-muted-foreground text-lg">
                  <p>
                    {t('about_page.story_p1')}
                  </p>
                  <p>
                    {t('about_page.story_p2')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="stat-card text-center">
                  <div className="text-4xl font-bold text-primary mb-2">100K+</div>
                  <div className="text-muted-foreground">{t('about_page.happy_customers')}</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-4xl font-bold text-primary mb-2">10+</div>
                  <div className="text-muted-foreground">{t('about_page.countries')}</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-4xl font-bold text-primary mb-2">$500M+</div>
                  <div className="text-muted-foreground">{t('about_page.monthly_volume')}</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">{t('about_page.support')}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 lg:py-28 bg-light-gray">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="section-title text-foreground mb-4">{t('about_page.values_title')}</h2>
              <p className="text-muted-foreground text-lg">
                {t('about_page.values_subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="feature-card text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                    <value.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
