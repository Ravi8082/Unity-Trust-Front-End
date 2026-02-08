"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api, Account, Transaction } from "@/lib/api";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter,
  Download,
  Loader2,
  Calendar
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const accountsData = await api.getUserAccounts(user.id);
        setAccounts(accountsData);
        if (accountsData.length > 0) {
          setSelectedAccount(accountsData[0].id.toString());
          // Use mini statement for better performance
          const txns = await api.getMiniStatement(accountsData[0].id);
          setTransactions(txns);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setAccounts([
          { id: 1, accountNumber: "1234567890", balance: 125430.50, status: "ACTIVE", type: "SAVINGS", userId: 1 },
        ]);
        setSelectedAccount("1");
        setTransactions([
          { id: 1, type: "CREDIT", channel: "ONLINE", amount: 50000, balanceAfter: 175430.50, referenceNo: "TXN001", remark: "Salary Credit - January", transactionTime: "2026-01-25T10:30:00" },
          { id: 2, type: "DEBIT", channel: "ONLINE", amount: 5000, balanceAfter: 170430.50, referenceNo: "TXN002", remark: "Online Shopping - Amazon", transactionTime: "2026-01-24T15:45:00" },
          { id: 3, type: "CREDIT", channel: "ONLINE", amount: 1500, balanceAfter: 171930.50, referenceNo: "TXN003", remark: "Cashback Reward", transactionTime: "2026-01-23T09:00:00" },
          { id: 4, type: "DEBIT", channel: "ONLINE", amount: 2500, balanceAfter: 169430.50, referenceNo: "TXN004", remark: "Electricity Bill Payment", transactionTime: "2026-01-22T11:20:00" },
          { id: 5, type: "DEBIT", channel: "MOBILE", amount: 800, balanceAfter: 168630.50, referenceNo: "TXN005", remark: "Mobile Recharge", transactionTime: "2026-01-21T16:30:00" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Add effect to fetch transactions when account changes
  useEffect(() => {
    async function fetchTransactions() {
      if (!selectedAccount || !user) return;
      try {
        const accountId = parseInt(selectedAccount);
        const txns = await api.getMiniStatement(accountId);
        setTransactions(txns);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    }
    fetchTransactions();
  }, [selectedAccount, user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = txn.remark.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || txn.type === filterType.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  const totalCredit = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebit = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);

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
          <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground">View and manage your transaction history</p>
        </div>
        <Button variant="outline" className="gap-2 border-border bg-transparent text-foreground">
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <ArrowDownRight className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Credit</p>
                  <p className="text-lg font-semibold text-green-500">{formatCurrency(totalCredit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Debit</p>
                  <p className="text-lg font-semibold text-red-500">{formatCurrency(totalDebit)}</p>
                </div>
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
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold text-foreground">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-border bg-secondary/50 pl-10 text-foreground"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full border-border bg-secondary/50 text-foreground sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                <SelectItem value="all" className="text-foreground">All</SelectItem>
                <SelectItem value="credit" className="text-foreground">Credit</SelectItem>
                <SelectItem value="debit" className="text-foreground">Debit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full border-border bg-secondary/50 text-foreground sm:w-48">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id.toString()} className="text-foreground">
                    ****{acc.accountNumber.slice(-4)} ({acc.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No transactions found
              </div>
            ) : (
              filteredTransactions.map((txn, index) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(txn.transactionTime).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{txn.referenceNo}</span>
                      </div>
                    </div>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      txn.type === "CREDIT" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(txn.amount)}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
