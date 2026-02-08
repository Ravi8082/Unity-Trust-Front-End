"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api, Account } from "@/lib/api";
import { 
  QrCode, 
  Send, 
  Plus, 
  Loader2, 
  Check, 
  AlertCircle,
  Copy,
  RefreshCw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function UPIPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [upiId, setUpiId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Payment form
  const [receiverVpa, setReceiverVpa] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [remark, setRemark] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const accountsData = await api.getUserAccounts(user.id);
        setAccounts(accountsData);
        // Check if UPI exists for the first account
        if (accountsData.length > 0) {
          const emailPrefix = user.email?.split("@")[0] || "user";
          const suggestedVpa = `${emailPrefix}@utb`;
          setUpiId(suggestedVpa);
        }
      } catch (err) {
        setAccounts([
          { id: 1, accountNumber: "1234567890", balance: 125430.50, status: "ACTIVE", type: "SAVINGS", userId: 1 },
        ]);
        setUpiId("user@utb");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const generateQrCode = async (vpa: string, amt?: number) => {
    try {
      const blob = await api.generateQrCode(vpa, amt);
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);
      return url;
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      return null;
    }
  };

  const handleCreateUpi = async (customVpa: string, upiPin: string) => {
    if (accounts.length === 0) return;
    setCreating(true);
    setError("");
    try {
      const result = await api.createUpi(accounts[0].id, customVpa, upiPin);
      setUpiId(customVpa);
      setSuccess(result.message || "UPI ID created successfully!");
      // Generate QR code for the new UPI ID
      generateQrCode(customVpa);
    } catch (err: any) {
      setError(err.message || "Failed to create UPI ID");
    } finally {
      setCreating(false);
    }
  };

  const handlePayment = async () => {
    if (!receiverVpa || !amount || !pin) {
      setError("Please fill all fields");
      return;
    }
    if (!upiId) {
      setError("Create UPI ID first");
      return;
    }
    setPaying(true);
    setError("");
    try {
      const result = await api.upiPay(upiId, receiverVpa, pin, parseFloat(amount), remark);
      setSuccess(result.message || `Payment of ${formatCurrency(parseFloat(amount))} sent successfully!`);
      setPaymentDialogOpen(false);
      setReceiverVpa("");
      setAmount("");
      setPin("");
      setRemark("");
    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("UPI ID copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleShowQr = async () => {
    if (!upiId) return;
    const url = await generateQrCode(upiId);
    if (url) {
      setQrDialogOpen(true);
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">UPI Payments</h1>
        <p className="text-muted-foreground">Manage your UPI ID and make instant payments</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive"
        >
          <AlertCircle className="h-5 w-5" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-500"
        >
          <Check className="h-5 w-5" />
          {success}
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* UPI ID Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <QrCode className="h-5 w-5 text-primary" />
                Your UPI ID
              </CardTitle>
              <CardDescription>Use this ID to receive payments</CardDescription>
            </CardHeader>
            <CardContent>
              {upiId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">UPI ID</p>
                      <p className="font-mono text-lg font-semibold text-primary">{upiId}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(upiId)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* QR Code Section */}
                  <div className="space-y-4">
                    <Button
                      onClick={handleShowQr}
                      variant="outline"
                      className="w-full border-border bg-transparent text-foreground"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Show QR Code
                    </Button>
                    
                    <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                      <DialogContent className="border-border bg-card max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Your UPI QR Code</DialogTitle>
                          <DialogDescription>Scan this QR code to receive payments</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-4">
                          {qrCodeUrl ? (
                            <img 
                              src={qrCodeUrl} 
                              alt="UPI QR Code" 
                              className="h-64 w-64 rounded-lg border border-border"
                            />
                          ) : (
                            <div className="flex h-64 w-64 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          <div className="mt-4 text-center">
                            <p className="font-mono text-sm font-semibold text-primary">{upiId}</p>
                            <p className="text-xs text-muted-foreground mt-1">Scan to pay via UPI</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                  <p className="mb-4 text-muted-foreground">No UPI ID created yet</p>
                  <CreateUpiDialog 
                    accounts={accounts}
                    onCreate={handleCreateUpi}
                    creating={creating}
                    userEmail={user?.email || ""}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Send Money Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Send className="h-5 w-5 text-primary" />
                Send Money
              </CardTitle>
              <CardDescription>Transfer money instantly via UPI</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!upiId}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-border bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Send Money</DialogTitle>
                    <DialogDescription>Enter the recipient UPI ID and amount</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="receiver" className="text-foreground">Recipient UPI ID</Label>
                      <Input
                        id="receiver"
                        placeholder="example@upi"
                        value={receiverVpa}
                        onChange={(e) => setReceiverVpa(e.target.value)}
                        className="border-border bg-secondary/50 text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-foreground">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="border-border bg-secondary/50 text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pin" className="text-foreground">UPI PIN</Label>
                      <Input
                        id="pin"
                        type="password"
                        placeholder="Enter 4-digit PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="border-border bg-secondary/50 text-foreground"
                        maxLength={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="remark" className="text-foreground">Remark (Optional)</Label>
                      <Input
                        id="remark"
                        placeholder="Payment description"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className="border-border bg-secondary/50 text-foreground"
                      />
                    </div>
                    <Button
                      onClick={handlePayment}
                      disabled={paying}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {paying ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Pay {amount ? formatCurrency(parseFloat(amount)) : ""}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-foreground">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-col gap-2 h-auto py-4 border-border bg-transparent text-foreground"
                    onClick={() => setPaymentDialogOpen(true)}
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-xs">Self Transfer</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-col gap-2 h-auto py-4 border-border bg-transparent text-foreground"
                    onClick={handleShowQr}
                  >
                    <QrCode className="h-5 w-5" />
                    <span className="text-xs">My QR Code</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

interface CreateUpiDialogProps {
  accounts: Account[];
  onCreate: (vpa: string, pin: string) => void;
  creating: boolean;
  userEmail: string;
}

function CreateUpiDialog({ accounts, onCreate, creating, userEmail }: CreateUpiDialogProps) {
  const [open, setOpen] = useState(false);
  const [vpa, setVpa] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  
  const emailPrefix = userEmail.split("@")[0] || "user";
  
  useEffect(() => {
    if (open) {
      setVpa(`${emailPrefix}@utb`);
      setError("");
      setPin("");
      setConfirmPin("");
    }
  }, [open, emailPrefix]);
  
  const handleSubmit = () => {
    setError("");
    
    if (!vpa || !pin || !confirmPin) {
      setError("All fields are required");
      return;
    }
    
    if (!vpa.match(/^[a-zA-Z0-9._]+@utb$/)) {
      setError("Invalid VPA format. Example: username@utb");
      return;
    }
    
    if (pin.length !== 4 || !pin.match(/^\d{4}$/)) {
      setError("UPI PIN must be exactly 4 digits");
      return;
    }
    
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    
    onCreate(vpa, pin);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={creating || accounts.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Create UPI ID
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create UPI ID</DialogTitle>
          <DialogDescription>Set up your UPI ID and PIN for instant payments</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="vpa" className="text-foreground">UPI ID (VPA)</Label>
            <div className="flex">
              <Input
                id="vpa"
                value={vpa.split("@")[0]}
                onChange={(e) => setVpa(`${e.target.value}@utb`)}
                placeholder="username"
                className="border-border bg-secondary/50 text-foreground rounded-r-none"
              />
              <div className="flex items-center px-3 bg-secondary/50 border border-l-0 border-border rounded-r-md text-muted-foreground">
                @utb
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Format: username@utb</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pin" className="text-foreground">UPI PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="border-border bg-secondary/50 text-foreground"
              maxLength={4}
            />
            <p className="text-xs text-muted-foreground">Must be exactly 4 digits</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPin" className="text-foreground">Confirm UPI PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              placeholder="Re-enter 4-digit PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="border-border bg-secondary/50 text-foreground"
              maxLength={4}
            />
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={creating}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create UPI ID
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
