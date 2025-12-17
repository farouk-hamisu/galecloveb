import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t('footer.solutions'),
      links: [
        { label: t('footer.personalBanking'), href: '/personal' },
        { label: t('footer.businessBanking'), href: '/business' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.aboutUs'), href: '/about' },
        { label: t('footer.careers'), href: '/careers' },
        { label: t('footer.contact'), href: '/contact' },
      ],
    },
    {
      title: t('footer.learn'),
      links: [
        { label: t('footer.blog'), href: '/blog' },
        { label: t('footer.guides'), href: '/guides' },
        { label: t('footer.faq'), href: '/faq' },
      ],
    },
    {
      title: t('footer.segments'),
      links: [
        { label: t('footer.customerSupport'), href: '/support' },
        { label: t('footer.teams'), href: '/teams' },
        { label: t('footer.partners'), href: '/partners' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Instagram, href: '#' },
  ];

  return (
    <footer className="bg-hero text-hero-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-lg">NRBank</span>
            </Link>
            <p className="text-hero-foreground/70 text-sm max-w-xs mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                {t('nav.login')}
              </Link>
              <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-primary hover:bg-coral-dark text-primary-foreground rounded-full transition-colors">
                {t('nav.signUp')}
              </Link>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-hero-foreground/70 hover:text-hero-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-hero-foreground/50 text-sm text-center md:text-left">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-hero-foreground/70 text-sm mr-2">{t('footer.followUs')}</span>
            {socialLinks.map(({ icon: Icon, href }, index) => (
              <a
                key={index}
                href={href}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
