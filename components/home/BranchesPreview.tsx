"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Phone, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { api, Branch } from "@/lib/api";

export function BranchesPreview() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const data = await api.getActiveBranches();
        setBranches(data.slice(0, 4));
      } catch (error) {
        // Mock data for demo
        setBranches([
          { id: 1, name: "Mumbai Main Branch", ifscCode: "UTBI0001234", state: "MH", city: "Mumbai", address: "123 Fort Area, Mumbai 400001", status: "ACTIVE" },
          { id: 2, name: "Delhi Central Branch", ifscCode: "UTBI0005678", state: "DL", city: "New Delhi", address: "456 Connaught Place, New Delhi 110001", status: "ACTIVE" },
          { id: 3, name: "Bangalore Tech Park", ifscCode: "UTBI0009012", state: "KA", city: "Bangalore", address: "789 Electronic City, Bangalore 560100", status: "ACTIVE" },
          { id: 4, name: "Chennai Marina Branch", ifscCode: "UTBI0003456", state: "TN", city: "Chennai", address: "101 Marina Beach Road, Chennai 600001", status: "ACTIVE" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchBranches();
  }, []);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row"
        >
          <div>
            <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1 text-sm text-primary">
              Our Network
            </span>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Find a <span className="gold-text">Branch</span> Near You
            </h2>
          </div>
          <Link href="/branches">
            <Button variant="outline" className="gap-2 border-primary/50 bg-transparent text-foreground hover:bg-primary/10">
              View All Branches
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="glass animate-pulse rounded-xl p-6">
                  <div className="mb-4 h-12 w-12 rounded-lg bg-muted" />
                  <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                  <div className="mb-4 h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              ))
            : branches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass group rounded-xl p-6 transition-all hover:border-primary/50"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary/30">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h3 className="mb-1 font-semibold text-foreground">
                    {branch.name}
                  </h3>
                  
                  <p className="mb-3 text-sm text-muted-foreground">
                    {branch.address}
                  </p>
                  
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-secondary px-2 py-0.5 font-mono">
                      {branch.ifscCode}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>9 AM - 5 PM</span>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Map Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass mt-8 overflow-hidden rounded-xl"
        >
          <div className="flex h-64 items-center justify-center bg-secondary/50">
            <div className="text-center">
              <MapPin className="mx-auto mb-2 h-12 w-12 text-primary/50" />
              <p className="text-muted-foreground">Interactive map coming soon</p>
              <Link href="/branches">
                <Button variant="link" className="text-primary">
                  Browse all branches
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
