"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, type Account } from "@/lib/api";
import {
  CreditCard,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  XCircle,
  Filter,
  Loader2,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";

export default function AccountsAdminPage() {
  const { token, user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "freeze" | "unfreeze" | "close" | null;
  }>({ open: false, action: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [token, user]);

  const fetchAccounts = async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      // Fetch all accounts for the logged-in admin's branch
      const data = await api.getAccountsByBranch();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedAccount || !actionDialog.action) return;
    setProcessing(true);
    try {
      switch (actionDialog.action) {
        case "freeze":
          await api.freezeAccount(selectedAccount.id);
          break;
        case "unfreeze":
          await api.unfreezeAccount(selectedAccount.id);
          break;
        case "close":
          await api.closeAccount(selectedAccount.id);
          break;
      }
      await fetchAccounts();
      setActionDialog({ open: false, action: null });
    } catch (error) {
      console.error("Failed to perform action:", error);
    } finally {
      setProcessing(false);
    }
  };

  const openActionDialog = (account: Account, action: "freeze" | "unfreeze" | "close") => {
    setSelectedAccount(account);
    setActionDialog({ open: true, action });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      ACTIVE: { variant: "default", className: "bg-green-600" },
      FROZEN: { variant: "destructive" },
      CLOSED: { variant: "secondary" },
      DORMANT: { variant: "outline" },
    };
    const config = variants[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getActionDialogContent = () => {
    if (!selectedAccount || !actionDialog.action) return null;

    const actions = {
      freeze: {
        title: "Freeze Account",
        description: "This will temporarily freeze the account. The user will not be able to make any transactions.",
        buttonText: "Freeze Account",
        buttonClass: "bg-orange-600 hover:bg-orange-700",
        icon: Lock,
      },
      unfreeze: {
        title: "Unfreeze Account",
        description: "This will restore full access to the account. The user will be able to make transactions again.",
        buttonText: "Unfreeze Account",
        buttonClass: "bg-green-600 hover:bg-green-700",
        icon: Unlock,
      },
      close: {
        title: "Close Account",
        description: "This will permanently close the account. This action cannot be undone.",
        buttonText: "Close Account",
        buttonClass: "",
        icon: XCircle,
      },
    };

    const config = actions[actionDialog.action];
    const Icon = config.icon;

    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Number</span>
              <span className="font-mono">{selectedAccount.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span>{selectedAccount.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Balance</span>
              <span className="font-medium">{formatCurrency(selectedAccount.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Status</span>
              {getStatusBadge(selectedAccount.status)}
            </div>
          </div>
          {actionDialog.action === "close" && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>Warning: Closing an account is permanent and cannot be reversed. Ensure all funds have been transferred before proceeding.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setActionDialog({ open: false, action: null })}
          >
            Cancel
          </Button>
          <Button
            variant={actionDialog.action === "close" ? "destructive" : "default"}
            className={config.buttonClass}
            onClick={handleAction}
            disabled={processing}
          >
            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {config.buttonText}
          </Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Management</h1>
          <p className="text-muted-foreground">Monitor and control customer accounts</p>
        </div>
        <Button onClick={fetchAccounts} variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              All Accounts
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="FROZEN">Frozen</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="DORMANT">Dormant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No accounts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.accountNumber}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {account.balance.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {account.status === "ACTIVE" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(account, "freeze")}
                              className="text-orange-500 hover:text-orange-600"
                              title="Freeze Account"
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                          {account.status === "FROZEN" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(account, "unfreeze")}
                              className="text-green-500 hover:text-green-600"
                              title="Unfreeze Account"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                          {account.status !== "CLOSED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(account, "close")}
                              className="text-destructive hover:text-destructive"
                              title="Close Account"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, action: actionDialog.action })}
      >
        <DialogContent>{getActionDialogContent()}</DialogContent>
      </Dialog>
    </div>
  );
}
