"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Wallet, 
  Building, 
  GraduationCap, 
  Home,
  Car,
  Briefcase,
  Sparkles
} from "lucide-react";

const services = [
  {
    icon: Wallet,
    title: "Personal Banking",
    description: "AI-powered personal banking with smart savings, current accounts, and high-yield fixed deposits.",
    link: "/services/personal",
    rate: "Up to 7.5% p.a.",
  },
  {
    icon: Building,
    title: "Corporate Banking",
    description: "Enterprise solutions with dedicated managers, trade finance, and treasury services.",
    link: "/services/corporate",
    rate: "Custom Plans",
  },
  {
    icon: Home,
    title: "Home Loans",
    description: "Dream home financing with lowest rates in 2025, instant approval, and flexible EMIs.",
    link: "/services/home-loans",
    rate: "From 8.35% p.a.",
  },
  {
    icon: Car,
    title: "Vehicle Loans",
    description: "Zero down payment options for EVs and quick approval for all vehicle types.",
    link: "/services/vehicle-loans",
    rate: "From 8.99% p.a.",
  },
  {
    icon: GraduationCap,
    title: "Education Loans",
    description: "Study anywhere globally with coverage for tuition, living expenses, and more.",
    link: "/services/education-loans",
    rate: "From 9.5% p.a.",
  },
  {
    icon: Briefcase,
    title: "Business Loans",
    description: "Collateral-free business loans up to 50L with instant disbursal and minimal docs.",
    link: "/services/business-loans",
    rate: "From 10.5% p.a.",
  },
];

export function ServicesSection() {
  return (
    <section className="relative bg-card/30 py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,var(--border)_50%,transparent_51%,transparent_100%)] bg-[length:80px_100%] opacity-20" />
      
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row"
        >
          <div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-5 py-2 text-sm font-medium text-primary"
            >
              <Sparkles className="h-4 w-4" />
              2025 Special Rates
            </motion.span>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Financial Solutions for{" "}
              <span className="gold-text">Everyone</span>
            </h2>
          </div>
          <Link href="/services">
            <Button variant="outline" className="group gap-2 border-primary/50 bg-transparent text-foreground hover:border-primary hover:bg-primary/10">
              View All Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Background decoration */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent transition-transform group-hover:scale-150" />
              
              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {service.rate}
                  </span>
                </div>
                
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                
                <Link 
                  href={service.link}
                  className="group/link inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
