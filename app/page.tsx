"use client";

import Header from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { BranchesPreview } from "@/components/home/BranchesPreview";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="app-content">
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <BranchesPreview />
        <Footer />
      </main>
    </>
  );
}
