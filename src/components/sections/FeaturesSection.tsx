import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Wallet, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import sectionImage from '@/assets/section-woman.jpg';

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Send, title: t('features.zeroFee.title'), description: t('features.zeroFee.description') },
    { icon: Wallet, title: t('features.smartWallet.title'), description: t('features.smartWallet.description') },
    { icon: Shield, title: t('features.security.title'), description: t('features.security.description') },
  ];

  const loanTypes = [
    { label: 'Gold Loans', path: '/contact?type=gold-loan' },
    { label: 'Home Loans', path: '/contact?type=home-loan' },
    { label: 'Payday Loans', path: '/contact?type=payday-loan' },
    { label: 'Small Business Loan', path: '/contact?type=small-business-loan' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Loan Types Nav */}
        <div className="text-center mb-14">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
            Control Policies & Configuration Settings
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Managing & Reducing Wastes
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {loanTypes.map((type, i) => (
              <Link
                key={type.label}
                to={type.path}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {type.label.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* Image + Feature Content */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src={sectionImage}
              alt="Easy online application"
              className="rounded-2xl w-full h-auto object-cover"
              loading="lazy"
              width={640}
              height={640}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Get Instant Loan Against Gold
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              There are variations of passages of Lorem Ipsum available, but the majority have suffered alteration.
            </p>

            <div className="space-y-4">
              {['Easy Online Application', 'Fast Approval Process', 'Competitive Interest Rates'].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item}</p>
                    <p className="text-xs text-muted-foreground">Quick and secure process with minimal documentation required.</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="feature-card group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
