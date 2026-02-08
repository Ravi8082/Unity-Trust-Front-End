"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api, Account } from "@/lib/api";
import { 
  Wallet, 
  Eye, 
  EyeOff, 
  Copy, 
  Check,
  Loader2,
  PiggyBank,
  Briefcase,
  Plus
} from "lucide-react";

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const accountsData = await api.getUserAccounts(user.id);
        setAccounts(accountsData);
        const initialShowBalance: Record<number, boolean> = {};
        accountsData.forEach((acc) => {
          initialShowBalance[acc.id] = true;
        });
        setShowBalance(initialShowBalance);
      } catch (err) {
        const mockAccounts = [
          { id: 1, accountNumber: "1234567890", balance: 125430.50, status: "ACTIVE" as const, type: "SAVINGS", userId: 1 },
          { id: 2, accountNumber: "9876543210", balance: 45000.00, status: "PARTIAL_KYC_PENDING" as const, type: "CURRENT", userId: 1 },
        ];
        setAccounts(mockAccounts);
        setShowBalance({ 1: true, 2: true });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "SAVINGS":
        return PiggyBank;
      case "CURRENT":
        return Briefcase;
      default:
        return Wallet;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts and view details</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Open New Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account, index) => {
          const Icon = getAccountIcon(account.type);
          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-border bg-card">
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{account.type} Account</p>
                        <p className="font-semibold text-foreground">Primary Account</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        account.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-500"
                          : account.status === "FROZEN"
                          ? "bg-amber-500/20 text-amber-500"
                          : account.status === "PARTIAL_KYC_PENDING"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                      title={
                        account.status === "PARTIAL_KYC_PENDING"
                          ? "Additional KYC verification required to activate account"
                          : ""
                      }
                    >
                      {account.status === "PARTIAL_KYC_PENDING" ? "PARTIAL KYC PENDING" : account.status}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Balance */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold text-foreground">
                          {showBalance[account.id] ? formatCurrency(account.balance) : "********"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setShowBalance((prev) => ({
                            ...prev,
                            [account.id]: !prev[account.id],
                          }))
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showBalance[account.id] ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>

                    {/* Account Number */}
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Account Number</p>
                          <p className="font-mono text-foreground">{account.accountNumber}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(account.id, account.accountNumber)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copied === account.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">IFSC Code</p>
                        <p className="font-mono text-sm text-foreground">UTBI0001234</p>
                      </div>
                      <div className="rounded-lg bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">Branch</p>
                        <p className="text-sm text-foreground">Mumbai Main</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {account.status === "PARTIAL_KYC_PENDING" ? (
                        <div className="rounded-lg bg-yellow-500/10 p-3 text-sm">
                          <p className="font-medium text-yellow-700">Action Required:</p>
                          <p className="text-yellow-600">Complete your KYC verification to activate your account.</p>
                        </div>
                      ) : null}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-border bg-transparent text-foreground hover:bg-secondary"
                        >
                          View Statement
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-border bg-transparent text-foreground hover:bg-secondary"
                        >
                          Transfer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
