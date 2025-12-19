import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const CustomerTestimonialsSection = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      key: 'sarah',
      avatar: '/placeholder.svg',
    },
    {
      key: 'michael',
      avatar: '/placeholder.svg',
    },
    {
      key: 'jessica',
      avatar: '/placeholder.svg',
    },
    {
      key: 'david',
      avatar: '/placeholder.svg',
    },
    {
      key: 'emily',
      avatar: '/placeholder.svg',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-light-gray">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="section-badge mx-auto mb-4">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t('customer_testimonials.badge')}
          </div>
          <h2 className="section-title text-foreground mb-6">
            {t('customer_testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('customer_testimonials.subtitle')}
          </p>
        </div>

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
            {testimonials.map((item, index) => (
              <CarouselItem key={item.key} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-3xl p-8 h-full"
                >
                  <div className="flex items-center mb-6">
                    <img src={item.avatar} alt={t(`customer_testimonials.items.${item.key}.name`)} className="w-14 h-14 rounded-full mr-4" />
                    <div>
                      <h3 className="font-bold text-lg text-foreground">
                        {t(`customer_testimonials.items.${item.key}.name`)}
                      </h3>
                      <p className="text-muted-foreground">
                        {t(`customer_testimonials.items.${item.key}.role`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-muted-foreground">
                    {t(`customer_testimonials.items.${item.key}.text`)}
                  </p>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

