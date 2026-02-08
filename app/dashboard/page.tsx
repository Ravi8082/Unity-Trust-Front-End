"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api, Account, Transaction } from "@/lib/api";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard,
  TrendingUp,
  Eye,
  EyeOff
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [accountsData, transactionsData] = await Promise.all([
          api.getUserAccounts(user.id),
          accounts.length > 0 ? api.getMiniStatement(accounts[0].id) : Promise.resolve([]),
        ]);
        setAccounts(accountsData);
        if (accountsData.length > 0) {
          const txns = await api.getMiniStatement(accountsData[0].id);
          setTransactions(txns);
        }
      } catch (err) {
        // Mock data for demo
        setAccounts([
          { id: 1, accountNumber: "1234567890", balance: 125430.50, status: "ACTIVE", type: "SAVINGS", userId: 1 },
          { id: 2, accountNumber: "9876543210", balance: 45000.00, status: "ACTIVE", type: "CURRENT", userId: 1 },
        ]);
        setTransactions([
          { id: 1, type: "CREDIT", channel: "ONLINE", amount: 25000, balanceAfter: 150430.50, referenceNo: "TXN001", remark: "Salary Credit", transactionTime: "2026-01-25T10:30:00" },
          { id: 2, type: "DEBIT", channel: "ONLINE", amount: 5000, balanceAfter: 145430.50, referenceNo: "TXN002", remark: "Online Shopping", transactionTime: "2026-01-24T15:45:00" },
          { id: 3, type: "CREDIT", channel: "ONLINE", amount: 1500, balanceAfter: 146930.50, referenceNo: "TXN003", remark: "Cashback", transactionTime: "2026-01-23T09:00:00" },
          { id: 4, type: "DEBIT", channel: "ONLINE", amount: 2500, balanceAfter: 144430.50, referenceNo: "TXN004", remark: "Electricity Bill", transactionTime: "2026-01-22T11:20:00" },
          { id: 5, type: "DEBIT", channel: "MOBILE", amount: 800, balanceAfter: 143630.50, referenceNo: "TXN005", remark: "Mobile Recharge", transactionTime: "2026-01-21T16:30:00" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 p-6"
      >
        <h2 className="text-xl font-semibold text-foreground">
          Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.name || "User"}!
        </h2>
        <p className="text-muted-foreground">Here is your financial overview for today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {showBalance ? formatCurrency(totalBalance) : "********"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                <ArrowDownRight className="h-6 w-6 text-green-500" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Income (This Month)</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(26500)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/20">
                <ArrowUpRight className="h-6 w-6 text-red-500" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Expenses (This Month)</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(8300)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Accounts & Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Your Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{account.type} Account</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        ****{account.accountNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {showBalance ? formatCurrency(account.balance) : "****"}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        account.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-500"
                          : account.status === "PARTIAL_KYC_PENDING"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {account.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactions.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        txn.type === "CREDIT" ? "bg-green-500/20" : "bg-red-500/20"
                      }`}
                    >
                      {txn.type === "CREDIT" ? (
                        <ArrowDownRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{txn.remark}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.transactionTime).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      txn.type === "CREDIT" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(txn.amount)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
