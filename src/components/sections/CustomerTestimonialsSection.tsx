import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import {
  Carousel, CarouselContent, CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import testimonialSarah from '@/assets/testimonial-sarah.jpg';
import testimonialMichael from '@/assets/testimonial-michael.jpg';
import testimonialJessica from '@/assets/testimonial-jessica.jpg';
import testimonialDavid from '@/assets/testimonial-david.jpg';
import testimonialEmily from '@/assets/testimonial-emily.jpg';

const testimonialImages: Record<string, string> = {
  sarah: testimonialSarah,
  michael: testimonialMichael,
  jessica: testimonialJessica,
  david: testimonialDavid,
  emily: testimonialEmily,
};

export const CustomerTestimonialsSection = () => {
  const { t } = useTranslation();

  const testimonials = [
    { key: 'sarah' }, { key: 'michael' }, { key: 'jessica' }, { key: 'david' }, { key: 'emily' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="section-badge mx-auto mb-3">
            <span className="w-2 h-2 bg-primary rounded-full" />
            {t('customer_testimonials.badge')}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t('customer_testimonials.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('customer_testimonials.subtitle')}</p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 3000 })]}
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
                  className="bg-card rounded-xl p-6 h-full border border-border"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonialImages[item.key]}
                      alt={t(`customer_testimonials.items.${item.key}.name`)}
                      className="w-11 h-11 rounded-full object-cover mr-3"
                      loading="lazy"
                      width={44}
                      height={44}
                    />
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{t(`customer_testimonials.items.${item.key}.name`)}</h3>
                      <p className="text-xs text-muted-foreground">{t(`customer_testimonials.items.${item.key}.role`)}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`customer_testimonials.items.${item.key}.text`)}</p>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};
