import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: t('contact_page.toast_success_title'),
      description: t('contact_page.toast_success_description'),
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact_page.email_us'),
      description: t('contact_page.general_inquiries'),
      value: 'support@nrbank.com',
      action: 'mailto:support@nrbank.com',
    },
    {
      icon: Phone,
      title: t('contact_page.call_us'),
      description: t('contact_page.support_24_7'),
      value: '+1 (800) NRB-BANK',
      action: 'tel:+18006282265',
    },
    {
      icon: MapPin,
      title: t('contact_page.visit_us'),
      description: t('contact_page.headquarters'),
      value: '123 Financial District, New York, NY 10005',
      action: '#',
    },
    {
      icon: Clock,
      title: t('contact_page.business_hours'),
      description: t('contact_page.support_available'),
      value: t('contact_page.online_support_24_7'),
      action: '#',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-32">
        {/* Hero */}
        <section className="bg-hero py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="section-badge mb-6 bg-white/10 text-hero-foreground mx-auto w-fit">
                <span className="w-2 h-2 bg-primary rounded-full" />
                {t('contact_page.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hero-foreground mb-6">
                {t('contact_page.title')}
              </h1>
              <p className="text-hero-foreground/70 text-lg md:text-xl leading-relaxed">
                {t('contact_page.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-24">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={item.title}
                  href={item.action}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <p className="text-sm font-medium text-primary">{item.value}</p>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 lg:py-28 bg-light-gray">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">{t('contact_page.send_message_title')}</h2>
                <p className="text-muted-foreground mb-8">
                  {t('contact_page.send_message_subtitle')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact_page.full_name')}</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact_page.email_address')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact_page.subject')}</Label>
                    <Input
                      id="subject"
                      placeholder={t('contact_page.how_can_we_help')}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact_page.message')}</Label>
                    <Textarea
                      id="message"
                      placeholder={t('contact_page.tell_us_more')}
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      t('contact_page.sending')
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('contact_page.send_message')}
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:pt-12"
              >
                <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground">{t('contact_page.live_chat_title')}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {t('contact_page.live_chat_subtitle')}
                  </p>
                  <Button variant="outline">{t('contact_page.start_live_chat')}</Button>
                </div>

                <div className="bg-hero text-hero-foreground rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4">{t('contact_page.business_inquiries_title')}</h3>
                  <p className="text-hero-foreground/70 mb-6">
                    {t('contact_page.business_inquiries_subtitle')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-hero-foreground/80">
                      <Mail className="w-5 h-5" />
                      <span>{t('contact_page.business_email')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-hero-foreground/80">
                      <Phone className="w-5 h-5" />
                      <span>{t('contact_page.business_phone')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
