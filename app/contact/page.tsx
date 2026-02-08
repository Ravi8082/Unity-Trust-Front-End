"use client";

import React from "react"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Shield,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Customer Care",
      details: ["1800-123-4567 (Toll Free)", "+91 22-1234-5678"],
    },
    {
      icon: Mail,
      title: "Email Support",
      details: ["support@unitytrust.com", "complaints@unitytrust.com"],
    },
    {
      icon: MapPin,
      title: "Head Office",
      details: ["UnityTrust Bank Tower", "Bandra Kurla Complex, Mumbai - 400051"],
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Mon - Fri: 9:00 AM - 5:00 PM", "Sat: 9:00 AM - 1:00 PM"],
    },
  ];

  const supportCategories = [
    { icon: MessageSquare, title: "General Inquiry", description: "Questions about our services" },
    { icon: Shield, title: "Security Concern", description: "Report suspicious activity" },
    { icon: HelpCircle, title: "Technical Support", description: "Help with online banking" },
  ];

  return (
    <>
      <Header />
      <main className="app-content">
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="py-16 bg-gradient-to-b from-card to-background">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gold-text">Contact Us</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
                We are here to help. Reach out to us through any of the channels below.
              </p>
            </div>
          </section>

          {/* Contact Info Cards */}
          <section className="py-8 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {contactInfo.map((info) => (
                  <Card key={info.title} className="glass text-center">
                    <CardContent className="pt-6">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form and Categories */}
          <section className="py-12 pb-16">
            <div className="container mx-auto px-4">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Support Categories */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">How Can We Help?</h2>
                  {supportCategories.map((category) => (
                    <Card key={category.title} className="glass hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <category.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.title}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Send us a Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {submitted ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                          <p className="text-muted-foreground mb-4">
                            Thank you for contacting us. We will get back to you within 24 hours.
                          </p>
                          <Button onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }}>
                            Send Another Message
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 XXXXXXXXXX"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subject">Subject</Label>
                              <Select
                                value={formData.subject}
                                onValueChange={(value) => setFormData({ ...formData, subject: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General Inquiry</SelectItem>
                                  <SelectItem value="account">Account Related</SelectItem>
                                  <SelectItem value="card">Card Services</SelectItem>
                                  <SelectItem value="loan">Loan Services</SelectItem>
                                  <SelectItem value="complaint">Complaint</SelectItem>
                                  <SelectItem value="feedback">Feedback</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                              id="message"
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              placeholder="How can we help you?"
                              rows={5}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Message
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </>
  );
}
