import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTASection } from '@/components/sections/CTASection';
import { motion } from 'framer-motion';
import { Shield, Users, Globe, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Your security is our top priority. We use bank-grade encryption and multi-factor authentication.',
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'We put our customers at the heart of everything we do, providing 24/7 support.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Operating in 10+ countries, we make international banking seamless and affordable.',
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized globally for our innovative approach to modern banking solutions.',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 lg:pt-32">
        {/* Hero */}
        <section className="bg-hero py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="section-badge mb-6 bg-white/10 text-hero-foreground">
                <span className="w-2 h-2 bg-primary rounded-full" />
                About Us
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hero-foreground mb-6">
                Banking Reimagined for the Modern World
              </h1>
              <p className="text-hero-foreground/70 text-lg md:text-xl leading-relaxed">
                NationalCreditUnionBank was founded with a simple mission: to make banking accessible,
                transparent, and empowering for everyone. We believe financial services should work
                for you, not against you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="section-title text-foreground mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground text-lg">
                  <p>
                    Founded in 2020, NCUBank emerged from a vision to transform how people interact
                    with their money. Our founders, veterans of traditional banking, saw firsthand
                    the frustrations customers faced with hidden fees, poor service, and outdated systems.
                  </p>
                  <p>
                    Today, we serve over 100,000 customers across 10+ countries, processing more than
                    $500 million in transactions every month. Our commitment to transparency, security,
                    and innovation drives everything we do.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="stat-card text-center">
                  <div className="text-4xl font-bold text-primary mb-2">100K+</div>
                  <div className="text-muted-foreground">Happy Customers</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-4xl font-bold text-primary mb-2">10+</div>
                  <div className="text-muted-foreground">Countries</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-4xl font-bold text-primary mb-2">$500M+</div>
                  <div className="text-muted-foreground">Monthly Volume</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">Support</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 lg:py-28 bg-light-gray">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="section-title text-foreground mb-4">Our Values</h2>
              <p className="text-muted-foreground text-lg">
                The principles that guide everything we do at NationalCreditUnionBank.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="feature-card text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                    <value.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
