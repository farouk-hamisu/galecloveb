import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTASection } from '@/components/sections/CTASection';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Pricing = () => {
  const { t } = useTranslation();

  const reviews = [
    {
      name: 'Sarah T.',
      role: 'Freelance Designer',
      review: 'NRBank has revolutionized how I manage my finances. The app is intuitive, and the 24/7 support is a lifesaver. No hidden fees truly means no hidden fees!',
      avatar: '/placeholder.svg',
    },
    {
      name: 'Michael B.',
      role: 'Small Business Owner',
      review: 'Switching to NRBank for my business was the best decision. International transfers are seamless, and the virtual cards provide an extra layer of security for my online purchases.',
      avatar: '/placeholder.svg',
    },
    {
      name: 'Jessica L.',
      role: 'Student',
      review: 'As a student, I need a bank that is simple and affordable. NRBank’s basic plan is perfect for me. I love the savings vaults feature, which helps me budget for my goals.',
      avatar: '/placeholder.svg',
    },
    {
        name: 'David R.',
        role: 'Tech Entrepreneur',
        review: 'The API integrations offered by NRBank have been a game-changer for my business. I can now automate my financial workflows and focus on growing my company.',
        avatar: '/placeholder.svg',
    },
    {
        name: 'Emily S.',
        role: 'World Traveler',
        review: 'The multi-currency wallet is a must-have for anyone who travels frequently. I can hold and exchange currencies with zero FX fees, which saves me a lot of money.',
        avatar: '/placeholder.svg',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-32">
        <div className="bg-hero py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hero-foreground mb-4">
                {t('pricing_page.title')}
              </h1>
              <p className="text-hero-foreground/70 text-lg md:text-xl max-w-2xl mx-auto">
                {t('pricing_page.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>

        <section className="py-20 lg:py-28 bg-light-gray">
          <div className="container mx-auto px-4 lg:px-8">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 2000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {reviews.map((review, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-card rounded-3xl p-8 h-full"
                    >
                      <div className="flex items-center mb-6">
                        <img src={review.avatar} alt={review.name} className="w-14 h-14 rounded-full mr-4" />
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{review.name}</h3>
                          <p className="text-muted-foreground">{review.role}</p>
                        </div>
                      </div>
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{review.review}</p>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
