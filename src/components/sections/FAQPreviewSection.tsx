import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import faqImage from '@/assets/faq-person.jpg';

const faqs = [
  {
    question: 'How Do I Open A New Account?',
    answer:
      'Opening an account is simple. Click "Open Account," fill in your details, verify your email, and you\'re ready to start banking in minutes — no paperwork required.',
  },
  {
    question: 'Are My Funds And Personal Data Secure?',
    answer:
      'Absolutely. We use bank-grade encryption, two-factor authentication, and continuous fraud monitoring to keep your money and information safe at all times.',
  },
  {
    question: 'How Do International Transfers Work?',
    answer:
      'Choose your preferred method — wire transfer, cryptocurrency, PayPal, Wise, and more. Enter the recipient details, confirm the amount, and the transfer is processed seamlessly with a full receipt.',
  },
  {
    question: 'Can I Convert Between Fiat And Bitcoin?',
    answer:
      'Yes. Our built-in swap feature lets you instantly convert your fiat balance to Bitcoin and vice versa at competitive rates, all within your dashboard.',
  },
];

export const FAQPreviewSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left – Accordion */}
          <div className="py-16 lg:py-24 pr-0 lg:pr-12">
            <p className="text-primary text-xs uppercase tracking-wider font-medium mb-3">
              Common Questions
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg text-left text-sm font-medium transition-colors ${
                        isOpen
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/10 text-background/80 hover:bg-background/15'
                      }`}
                    >
                      {faq.question}
                      {isOpen ? (
                        <Minus className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pt-3 pb-1 text-background/60 text-[13px] leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right – Image */}
          <div className="hidden lg:block relative min-h-[480px]">
            <img
              src={faqImage}
              alt="Person managing finances on phone and laptop"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
