"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api, DashboardStats } from "@/lib/api";
import { 
  Users, 
  CreditCard, 
  ArrowLeftRight, 
  FileText,
  TrendingUp,
  TrendingDown,
  Loader2,
  Building
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, refreshUserDetails } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        // Use mock data when the endpoint is not available
        setStats({
          totalAccounts: 12450,
          totalTransactions: 89234,
          totalDeposits: 45678900,
          totalWithdrawals: 23456700,
          pendingApplications: 45,
        });
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchUserData() {
      try {
        // Refresh user data to ensure we have the latest branch info
        await refreshUserDetails();
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setUserLoading(false);
      }
    }
    
    fetchStats();
    fetchUserData();
  }, [refreshUserDetails]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getTitle = (name: string) => {
    if (!name) return '';
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('mr.')) return 'Mr.';
    if (lowerName.includes('mrs.')) return 'Mrs.';
    if (lowerName.includes('ms.')) return 'Ms.';
    if (lowerName.includes('miss')) return 'Miss';
    if (lowerName.includes('dr.')) return 'Dr.';
    
    // If the name starts with common male/female indicators
    const firstName = name.trim().split(' ')[0]?.toLowerCase();
    if (firstName === 'mr' || firstName === 'mister') return 'Mr.';
    if (firstName === 'mrs') return 'Mrs.';
    if (firstName === 'ms' || firstName === 'miss') return 'Ms.';
    
    // Default return empty string to just show the name
    return '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  if (loading || userLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {user?.name ? `${getTitle(user.name)} ${user.name}` : 'Admin'}
        </h1>
        <p className="text-muted-foreground">
          {user?.branchName ? `${user.branchName} Branch` : 'Main Branch'} - ID: {user?.branchId || 'N/A'}
        </p>
      </div>

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
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.totalAccounts || 0)}</p>
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
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  +8%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalDeposits || 0)}</p>
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
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/20">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <TrendingDown className="h-3 w-3" />
                  -3%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalWithdrawals || 0)}</p>
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
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                  <FileText className="h-6 w-6 text-amber-500" />
                </div>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-500">
                  Pending
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-2xl font-bold text-foreground">{stats?.pendingApplications || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Total Transactions</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-foreground">{formatNumber(stats?.totalTransactions || 0)}</p>
              </div>
              
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Active Users</p>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-foreground">{formatNumber(8945)}</p>
              </div>
              
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Active Branches</p>
                    <p className="text-xs text-muted-foreground">Nationwide</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-foreground">{formatNumber(156)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { action: "New account application", user: "john.doe@email.com", time: "2 minutes ago", type: "application" },
                { action: "Account approved", user: "jane.smith@email.com", time: "15 minutes ago", type: "approved" },
                { action: "Large transaction flagged", user: "ACC-1234567890", time: "1 hour ago", type: "flagged" },
                { action: "New branch added", user: "Mumbai South Branch", time: "2 hours ago", type: "branch" },
                { action: "Account frozen", user: "ACC-9876543210", time: "3 hours ago", type: "frozen" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.type === "approved"
                          ? "bg-green-500"
                          : activity.type === "flagged" || activity.type === "frozen"
                          ? "bg-red-500"
                          : "bg-primary"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
