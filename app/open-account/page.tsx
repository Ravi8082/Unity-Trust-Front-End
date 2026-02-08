"use client";

import { Suspense } from "react";
import Header from "@/components/layout/Header";
import { AccountOpeningForm } from "@/components/account/AccountOpeningForm";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const GoldCoin3D = dynamic(
  () => import("@/components/3d/GoldCoin3D").then((mod) => mod.GoldCoin3D),
  { ssr: false }
);

function Loading3D() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-32 w-32 animate-pulse rounded-full bg-primary/20" />
    </div>
  );
}

export default function OpenAccountPage() {
  return (
    <>
      <Header />
      <main className="app-content">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-start gap-8 px-4 py-8 lg:grid-cols-2 lg:items-center lg:px-8">
          {/* Left - 3D Coin */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden h-[500px] lg:block"
          >
            <Suspense fallback={<Loading3D />}>
              <GoldCoin3D />
            </Suspense>
            
            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass absolute bottom-8 left-8 rounded-xl p-4"
            >
              <p className="text-sm font-medium text-foreground">Zero Balance Account</p>
              <p className="text-xs text-muted-foreground">No minimum balance required</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="glass absolute right-8 top-8 rounded-xl p-4"
            >
              <p className="text-sm font-medium text-foreground">Free Debit Card</p>
              <p className="text-xs text-muted-foreground">International enabled</p>
            </motion.div>
          </motion.div>
          
          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 text-center lg:text-left">
              <span className="mb-2 inline-block rounded-full bg-primary/20 px-4 py-1 text-sm text-primary">
                Open Account
              </span>
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                Start Your <span className="gold-text">Banking Journey</span>
              </h1>
              <p className="text-muted-foreground">
                Open a savings account in minutes with paperless KYC
              </p>
            </div>
            
            <AccountOpeningForm />
          </motion.div>
        </div>
      </main>
    </>
  );
}
