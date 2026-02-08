"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, HelpCircle } from "lucide-react";
import dynamic from "next/dynamic";

const NotFound3D = dynamic(
  () => import("@/components/3d/ClosedSign3D").then((mod) => mod.ClosedSign3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">U</span>
            </div>
            <span className="font-bold text-xl">
              <span className="text-primary">Unity</span>
              <span className="text-foreground">Trust</span>
            </span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 3D Closed Sign */}
          <div className="relative">
            <Suspense
              fallback={
                <div className="w-full h-[300px] flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <NotFound3D />
            </Suspense>
          </div>

          {/* Error Text */}
          <div className="space-y-4">
            <h1 className="text-8xl font-bold gold-text">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-balance">
              The page you are looking for does not exist or has been moved to another location. 
              Please check the URL or return to the homepage.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Back to Homepage
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 bg-transparent"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Help Link */}
          <div className="pt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Need help? Contact our support team
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>UnityTrust Bank - Your Trusted Banking Partner</p>
        </div>
      </footer>
    </div>
  );
}
