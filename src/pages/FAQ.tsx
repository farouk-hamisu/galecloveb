import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTASection } from '@/components/sections/CTASection';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t } = useTranslation();

  const faqCategories = [
    {
      category: 'Account & Getting Started',
      questions: [
        {
          q: 'How do I open an account with NCUBank?',
          a: 'Opening an account is simple! Click on "Open Account" or "Sign Up" and follow the guided process. You\'ll need to provide basic personal information, verify your identity (KYC), and you\'ll be ready to bank within minutes.',
        },
        {
          q: 'What documents do I need for verification?',
          a: 'We require a valid government-issued ID (passport, driver\'s license, or national ID card) and proof of address (utility bill, bank statement, or official letter dated within the last 3 months).',
        },
        {
          q: 'Is there a minimum deposit to open an account?',
          a: 'No minimum deposit is required for our Basic plan. Premium and Business plans may have specific requirements based on the features you need.',
        },
      ],
    },
    {
      category: 'Transfers & Payments',
      questions: [
        {
          q: 'How long do international transfers take?',
          a: 'International transfers typically take 1-3 business days depending on the destination country and banking hours. SWIFT transfers may take up to 5 business days for some regions.',
        },
        {
          q: 'Are there any fees for transfers?',
          a: 'Internal transfers between NCUBank accounts are always free. International transfers have transparent fees displayed before you confirm. Premium members enjoy 0% FX fees.',
        },
        {
          q: 'What currencies do you support?',
          a: 'We support over 50 currencies for transfers and our smart wallet, including USD, EUR, GBP, JPY, CAD, AUD, and many more.',
        },
      ],
    },
    {
      category: 'Cards & Security',
      questions: [
        {
          q: 'How do virtual cards work?',
          a: 'Virtual cards are digital cards that work like physical cards but exist only in your app. They\'re perfect for online shopping, subscriptions, and enhanced security. You can create, freeze, or delete them instantly.',
        },
        {
          q: 'What happens if I lose my card?',
          a: 'You can instantly freeze your card from the app to prevent unauthorized use. Report it through the app or contact our 24/7 support, and we\'ll issue a replacement immediately.',
        },
        {
          q: 'How is my money protected?',
          a: 'We use bank-grade 256-bit encryption, two-factor authentication, biometric login, and real-time fraud monitoring. Your funds are held in segregated accounts with licensed banking partners.',
        },
      ],
    },
    {
      category: 'Savings & Investments',
      questions: [
        {
          q: 'How do savings vaults work?',
          a: 'Savings vaults let you set aside money for specific goals. Create a vault, set your target amount and deadline, and earn competitive interest rates while you save. You can create multiple vaults for different goals.',
        },
        {
          q: 'What interest rates do you offer?',
          a: 'We offer up to 2% APY on savings accounts, which is significantly higher than traditional banks. Rates may vary based on your account type and market conditions.',
        },
        {
          q: 'Can I withdraw from my savings anytime?',
          a: 'Yes! Unlike fixed deposits, our savings vaults offer full liquidity. You can withdraw your funds at any time without penalties.',
        },
      ],
    },
    {
      category: 'Support & Contact',
      questions: [
        {
          q: 'How can I reach customer support?',
          a: 'Our support team is available 24/7 through multiple channels: in-app chat, email support, phone support (Premium members), and our help center with detailed guides.',
        },
        {
          q: 'What is your response time?',
          a: 'We aim to respond to all queries within 2 hours. Premium and Business members receive priority support with typical response times under 30 minutes.',
        },
        {
          q: 'Do you have a mobile app?',
          a: 'Yes! Our mobile app is available for both iOS and Android devices. Download it from the App Store or Google Play Store to manage your finances on the go.',
        },
      ],
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
                Help Center
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hero-foreground mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-hero-foreground/70 text-lg md:text-xl leading-relaxed">
                Find answers to common questions about NCUBank. Can't find what you're looking for?
                Contact our 24/7 support team.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="mb-12 last:mb-0"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${categoryIndex}-${index}`}
                      className="bg-card border border-border rounded-xl px-6"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
