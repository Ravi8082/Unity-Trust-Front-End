"use client";

import React from "react"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api, type LedgerEntry } from "@/lib/api";
import {
  BookOpen,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Hash,
  User,
  CreditCard,
  IndianRupee,
  Loader2,
  FileText,
} from "lucide-react";

export default function LedgerPage() {
  const { token } = useAuth();
  const [referenceId, setReferenceId] = useState("");
  const [ledgerEntry, setLedgerEntry] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !referenceId.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const data = await api.getLedgerByReference(referenceId.trim(), token);
      setLedgerEntry(data);
    } catch (err) {
      setError("No ledger entry found with this reference ID");
      setLedgerEntry(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transaction Ledger</h1>
        <p className="text-muted-foreground">Track transactions by reference ID</p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Ledger Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="referenceId">Transaction Reference ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="referenceId"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="Enter reference ID (e.g., TXN-123456789)"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading || !referenceId.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Ledger Entry Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : ledgerEntry ? (
              <div className="space-y-6">
                {/* Transaction Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${ledgerEntry.type === "CREDIT" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                      {ledgerEntry.type === "CREDIT" ? (
                        <ArrowDownLeft className="h-6 w-6 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Type</p>
                      <Badge variant={ledgerEntry.type === "CREDIT" ? "default" : "destructive"} className={ledgerEntry.type === "CREDIT" ? "bg-green-600" : ""}>
                        {ledgerEntry.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className={`text-2xl font-bold ${ledgerEntry.type === "CREDIT" ? "text-green-500" : "text-red-500"}`}>
                      {ledgerEntry.type === "CREDIT" ? "+" : "-"} {formatCurrency(ledgerEntry.amount)}
                    </p>
                  </div>
                </div>

                {/* Transaction Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span className="text-sm">Reference ID</span>
                    </div>
                    <p className="font-mono text-sm">{ledgerEntry.referenceId}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Account ID</span>
                    </div>
                    <p className="font-mono">{ledgerEntry.accountId}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Transaction Date</span>
                    </div>
                    <p>{new Date(ledgerEntry.transactionDate).toLocaleString()}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      <span className="text-sm">Balance After</span>
                    </div>
                    <p className="font-medium">{formatCurrency(ledgerEntry.balanceAfter)}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-border space-y-1 sm:col-span-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Description</span>
                    </div>
                    <p>{ledgerEntry.description}</p>
                  </div>
                </div>

                {/* Counter Party Info */}
                {ledgerEntry.counterPartyAccount && (
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Counter Party</span>
                    </div>
                    <p className="font-mono">{ledgerEntry.counterPartyAccount}</p>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
