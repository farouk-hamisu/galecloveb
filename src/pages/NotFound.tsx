import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-32 pb-20 flex items-center justify-center min-h-[80vh] bg-hero">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-bold text-hero-foreground mb-4">{t('not_found_page.title')}</h2>
            <p className="text-hero-foreground/70 text-lg mb-8 max-w-md mx-auto">
              {t('not_found_page.subtitle')}
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/">{t('not_found_page.return_to_home')}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
