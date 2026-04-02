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
    <footer className="bg-foreground text-background pt-14 pb-6">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-10 border-b border-background/10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-sm">NRBank</span>
            </Link>
            <p className="text-background/60 text-xs max-w-xs mb-5">
              {t('footer.description')}
            </p>
            <div className="flex gap-2">
              <Link to="/login" className="px-3 py-1.5 text-xs font-medium bg-background/10 hover:bg-background/20 rounded-full transition-colors">
                {t('nav.login')}
              </Link>
              <Link to="/signup" className="px-3 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors">
                {t('nav.signUp')}
              </Link>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-xs mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-background/60 hover:text-background transition-colors text-xs">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-3">
          <p className="text-background/40 text-xs">{t('footer.copyright')}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-background/60 text-xs mr-1">{t('footer.followUs')}</span>
            {socialLinks.map(({ icon: Icon, href }, index) => (
              <a key={index} href={href} className="w-7 h-7 flex items-center justify-center rounded-full bg-background/10 hover:bg-background/20 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
