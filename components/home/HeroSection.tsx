"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Sparkles, TrendingUp, Star } from "lucide-react";
import dynamic from "next/dynamic";

const BankVault3D = dynamic(
  () => import("@/components/3d/BankVault3D").then((mod) => mod.BankVault3D),
  { ssr: false }
);

function Loading3D() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-32 w-32">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="absolute inset-4 animate-pulse rounded-full bg-primary/30" />
        <div className="absolute inset-8 rounded-full bg-primary/40" />
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-bank-blue-light/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary/20"
            initial={{ 
              x: `${(i * 15) % 100}%`, 
              y: "100%",
              opacity: 0 
            }}
            animate={{ 
              y: "-20%",
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:px-8">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col gap-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="h-4 w-4" />
              New in 2025
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1.5 text-sm text-muted-foreground"
            >
              <Star className="h-3 w-3 fill-primary text-primary" />
              Trusted Since 1919
            </motion.span>
          </div>
          
          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
            Your Trusted{" "}
            <span className="gold-text relative">
              Banking Partner
              <motion.span 
                className="absolute -bottom-2 left-0 h-1 rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </span>{" "}
            for Life
          </h1>
          
          <p className="max-w-lg text-pretty text-lg text-muted-foreground md:text-xl">
            Experience next-gen banking with UnityTrust Bank in 2025. AI-powered insights, 
            instant transfers, and comprehensive financial solutions tailored for your future.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/open-account">
              <Button size="lg" className="group relative gap-2 overflow-hidden bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25">
                <span className="relative z-10">Open Account</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="group border-primary/50 bg-transparent text-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg">
                <span>Net Banking</span>
                <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              </Button>
            </Link>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            {[
              { value: "50M+", label: "Customers", delay: 0.3 },
              { value: "9500+", label: "Branches", delay: 0.4 },
              { value: "106", label: "Years", delay: 0.5 },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay }}
                className="group relative"
              >
                <div className="absolute -inset-2 rounded-xl bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex flex-col">
                  <span className="text-2xl font-bold text-primary md:text-3xl lg:text-4xl">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Right 3D Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[400px] lg:h-[600px]"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          </div>
          
          <Suspense fallback={<Loading3D />}>
            <BankVault3D />
          </Suspense>
          
          {/* Floating Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass absolute bottom-4 left-4 rounded-2xl p-4 shadow-xl shadow-primary/10 transition-shadow hover:shadow-2xl hover:shadow-primary/20 md:bottom-8 md:left-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">256-bit Encryption</p>
                <p className="text-xs text-muted-foreground">Bank-grade Security</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05, y: 5 }}
            className="glass absolute right-4 top-4 rounded-2xl p-4 shadow-xl shadow-primary/10 transition-shadow hover:shadow-2xl hover:shadow-primary/20 md:right-8 md:top-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Instant Transfers</p>
                <p className="text-xs text-muted-foreground">24/7 Available</p>
              </div>
            </div>
          </motion.div>
          
          {/* New 2025 Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/50 shadow-lg shadow-primary/20">
              <span className="text-xs font-bold text-primary">2025</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs font-medium text-muted-foreground">Scroll to explore</span>
          <div className="h-8 w-5 rounded-full border-2 border-primary/50 p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-full rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
