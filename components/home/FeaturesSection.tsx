"use client";

import { motion } from "framer-motion";
import { 
  CreditCard, 
  Smartphone, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  Headphones,
  Brain,
  Fingerprint
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Smart Cards 2025",
    description: "AI-powered spending insights with premium rewards, instant cashback, and global acceptance.",
    badge: "Enhanced",
  },
  {
    icon: Smartphone,
    title: "Mobile Banking",
    description: "Bank on the go with biometric security and voice-activated commands.",
    badge: "New UI",
  },
  {
    icon: Brain,
    title: "AI Financial Advisor",
    description: "Get personalized investment advice powered by cutting-edge AI technology.",
    badge: "2025 Launch",
  },
  {
    icon: TrendingUp,
    title: "Smart Investments",
    description: "Algorithm-driven portfolio management for optimal long-term growth.",
    badge: null,
  },
  {
    icon: Fingerprint,
    title: "Biometric Security",
    description: "Multi-layer protection with fingerprint, face ID, and behavioral analysis.",
    badge: "Upgraded",
  },
  {
    icon: Headphones,
    title: "24/7 AI Support",
    description: "Instant help anytime with our AI assistant and human backup support.",
    badge: null,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function FeaturesSection() {
  return (
    <section className="relative py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-5 py-2 text-sm font-medium text-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Why Choose Us in 2025
          </motion.span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Next-Gen Banking Made{" "}
            <span className="gold-text">Simple</span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Experience the perfect fusion of century-old trust and 2025 innovation. 
            AI-powered insights, instant everything, and security that never sleeps.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              {/* Badge */}
              {feature.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                  {feature.badge}
                </span>
              )}
              
              <div className="relative">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              
              {/* Bottom line decoration */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 group-hover:w-full" />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>RBI Licensed</span>
          </div>
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            <span>DICGC Insured up to 5 Lakh</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>ISO 27001 Certified</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
