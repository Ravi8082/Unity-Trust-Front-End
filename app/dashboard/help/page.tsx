"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Phone, Mail, LifeBuoy } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Get assistance with your UnityTrust Bank account</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* FAQ Section */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>How do I reset my password?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>How to activate my ATM card?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Transaction limits and charges</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>How to update personal information?</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full mt-4">
              View All FAQs
            </Button>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Call Us</p>
                <p className="text-xs text-muted-foreground">1800-123-4567</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Email Us</p>
                <p className="text-xs text-muted-foreground">support@unitytrust.com</p>
              </div>
            </div>
            
            <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Live Chat
            </Button>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <HelpCircle className="h-5 w-5 text-primary" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Never share your PIN or passwords</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Log out after each session</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Monitor your account regularly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Report suspicious activity immediately</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full mt-4">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/atm" className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
              <CreditCard className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm text-center">ATM Services</span>
            </Link>
            <Link href="/dashboard/upi" className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
              <div className="h-6 w-6 text-primary mb-2 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">UPI</span>
              </div>
              <span className="text-sm text-center">UPI Transfer</span>
            </Link>
            <Link href="/dashboard/transactions" className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
              <div className="h-6 w-6 text-primary mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 12l5 5L22 7" />
                </svg>
              </div>
              <span className="text-sm text-center">Transactions</span>
            </Link>
            <Link href="/dashboard/accounts" className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
              <div className="h-6 w-6 text-primary mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 10v4h4" />
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
              </div>
              <span className="text-sm text-center">My Accounts</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}