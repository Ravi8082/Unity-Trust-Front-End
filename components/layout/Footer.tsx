"use client";

import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  services: [
    { label: "Personal Banking", href: "/services/personal" },
    { label: "Corporate Banking", href: "/services/corporate" },
    { label: "Home Loans", href: "/services/home-loans" },
    { label: "Vehicle Loans", href: "/services/vehicle-loans" },
    { label: "Education Loans", href: "/services/education-loans" },
  ],
  quickLinks: [
    { label: "Open Account", href: "/open-account" },
    { label: "Net Banking", href: "/login" },
    { label: "Find Branch", href: "/branches" },
    { label: "ATM Locator", href: "/atm-locator" },
    { label: "Contact Us", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="gold-text text-lg font-bold leading-tight">UnityTrust</span>
                <span className="text-xs text-muted-foreground">Bank</span>
              </div>
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">
              Your trusted banking partner since 1919. Building financial futures with integrity and innovation.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>1800-123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@unitytrust.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 UnityTrust Bank. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-xs text-muted-foreground">
              Licensed by RBI | DICGC Insured up to 5 Lakh
            </span>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="text-xs text-muted-foreground">
              ISO 27001:2022 Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
