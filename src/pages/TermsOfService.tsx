import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
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
            <h1 className="text-4xl font-bold text-foreground mb-8">{t('terms_of_service_page.title')}</h1>
            <div className="space-y-6 text-muted-foreground">
              <p>
                {t('terms_of_service_page.welcome')}
              </p>
              <p>
                {t('terms_of_service_page.acceptance')}
              </p>
              <h2 className="text-2xl font-bold text-foreground mt-8">{t('terms_of_service_page.cookies_title')}</h2>
              <p>
                {t('terms_of_service_page.cookies_p1')}
              </p>
              <p>
                {t('terms_of_service_page.cookies_p2')}
              </p>
              <h2 className="text-2xl font-bold text-foreground mt-8">{t('terms_of_service_page.license_title')}</h2>
              <p>
                {t('terms_of_service_page.license_p1')}
              </p>
              <p>{t('terms_of_service_page.license_p2')}</p>
              <ul className="list-disc list-inside">
                <li>{t('terms_of_service_page.license_l1')}</li>
                <li>{t('terms_of_service_page.license_l2')}</li>
                <li>{t('terms_of_service_page.license_l3')}</li>
                <li>{t('terms_of_service_page.license_l4')}</li>
              </ul>
              <h2 className="text-2xl font-bold text-foreground mt-8">{t('terms_of_service_page.iframes_title')}</h2>
              <p>
                {t('terms_of_service_page.iframes_p1')}
              </p>
              <h2 className="text-2xl font-bold text-foreground mt-8">{t('terms_of_service_page.content_liability_title')}</h2>
              <p>
                {t('terms_of_service_page.content_liability_p1')}
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
