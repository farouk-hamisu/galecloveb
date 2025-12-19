import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-foreground mb-8">{t('privacy_policy_page.title')}</h1>
            <div className="space-y-6 text-muted-foreground">
              <p>
                {t('privacy_policy_page.intro_p1')}
              </p>
              <p>
                {t('privacy_policy_page.intro_p2')}
              </p>
              <h2 className="text-2xl font-bold text-foreground mt-8">{t('privacy_policy_page.log_files_title')}</h2>
              <p>
                {t('privacy_policy_page.log_files_p1')}
              </p>
              <h2 className="text-2xl font-bold text-foreground mt-8">{t('privacy_policy_page.cookies_title')}</h2>
              <p>
                {t('privacy_policy_page.cookies_p1')}
              </p>
              <h2 className="text-2xl font-bold text-foreground mt-8">{t('privacy_policy_page.third_party_title')}</h2>
              <p>
                {t('privacy_policy_page.third_party_p1')}
              </p>
              <p>
                {t('privacy_policy_page.third_party_p2')}
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
