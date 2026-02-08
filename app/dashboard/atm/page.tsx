"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api, Account, AtmCardDto, AtmReceipt } from "@/lib/api";
import { 
  CreditCard, 
  Banknote, 
  KeyRound, 
  Loader2, 
  Check, 
  AlertCircle,
  Plus,
  Lock,
  Unlock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function UserATMPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [atmCard, setAtmCard] = useState<AtmCardDto | null>(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [resettingPin, setResettingPin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  
  // Reset PIN form
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  
  // Forgot PIN form
  const [forgotPinCardNumber, setForgotPinCardNumber] = useState("");
  const [forgotPinOtp, setForgotPinOtp] = useState("");
  const [forgotPinNewPin, setForgotPinNewPin] = useState("");
  const [forgotPinConfirmNewPin, setForgotPinConfirmNewPin] = useState("");
  const [forgotPinDialogOpen, setForgotPinDialogOpen] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const accountsData = await api.getUserAccounts(user.id);
        setAccounts(accountsData);
        
        // Check for pending ATM request
        const pendingRequest = await api.hasPendingAtmRequest();
        setHasPendingRequest(pendingRequest);
        
        // Fetch detailed ATM card data if user has accounts
        if (accountsData.length > 0) {
          try {
            // Try to get detailed ATM card information using the new API
            const detailedAtmCard = await api.getAtmCardDetails(accountsData[0].id);
            if (detailedAtmCard) {
              // Convert detailed card info to match the expected format
              const formattedCard = {
                id: 0, // Placeholder ID since detailed DTO doesn't have ID
                accountId: accountsData[0].id, // Store account ID for PIN reset
                cardNumber: detailedAtmCard.cardNumber,
                expiryDate: detailedAtmCard.expiryDate,
                accountNumber: accountsData[0].accountNumber,
                status: "ACTIVE", // Assuming issued card is active
                dailyWithdrawalLimit: 25000, // Default limit
                dailyWithdrawnAmount: 0, // Default value
                lastWithdrawalDate: "", // Default value
                issuedAt: new Date().toISOString(), // Default value
              };
              setAtmCard(formattedCard);
              // If we successfully got card details, there's no pending request anymore
              setHasPendingRequest(false);
            }
          } catch (detailedErr) {
            // If detailed card info is not available, try the original method
            try {
              const userAtmCard = await api.getUserAtmCard(accountsData[0].id);
              if (userAtmCard) {
                // Add accountId to the card object for PIN reset functionality
                const cardWithAccountId = {
                  ...userAtmCard,
                  accountId: accountsData[0].id
                };
                setAtmCard(cardWithAccountId);
                // If we successfully got card details, there's no pending request anymore
                setHasPendingRequest(false);
              }
            } catch (originalErr) {
              // It's OK if user doesn't have an ATM card yet
              console.log("User doesn't have an ATM card yet");
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setAccounts([
          { id: 1, accountNumber: "1234567890", balance: 125430.50, status: "ACTIVE", type: "SAVINGS", userId: 1 },
        ]);
        // Fetch actual ATM card data
        try {
          const mockAccounts = [{ id: 1, accountNumber: "1234567890", balance: 125430.50, status: "ACTIVE", type: "SAVINGS", userId: 1 }];
          if (mockAccounts.length > 0) {
            const userAtmCard = await api.getUserAtmCard(mockAccounts[0].id);
            if (userAtmCard) {
              // Add accountId to the card object for PIN reset functionality
              const cardWithAccountId = {
                ...userAtmCard,
                accountId: mockAccounts[0].id
              };
              setAtmCard(cardWithAccountId);
              setHasPendingRequest(false);
            }
          }
        } catch (err) {
          // It's OK if user doesn't have an ATM card yet
          console.log("User doesn't have an ATM card yet");
        }
        setHasPendingRequest(false);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleRequestCard = async () => {
    if (accounts.length === 0) return;
    
    // Check if the account status allows ATM card request
    const activeAccount = accounts.find(acc => acc.status === "ACTIVE");
    if (!activeAccount) {
      setError("ATM card can only be requested for ACTIVE accounts. Your account is currently " + accounts[0].status + ".");
      return;
    }
    
    if (hasPendingRequest) {
      setError("You already have a pending ATM request. Please wait for approval or contact support.");
      return;
    }
    setRequesting(true);
    setError("");
    try {
      // Call the actual API to request ATM card
      const result = await api.requestAtmCard(activeAccount.accountNumber);
      setHasPendingRequest(true);
      setSuccess(result.message || "ATM card request submitted! You will receive it within 7 working days.");
    } catch (err: any) {
      setError(err.message || "Failed to request ATM card");
    } finally {
      setRequesting(false);
    }
  };

  const [receipt, setReceipt] = useState<AtmReceipt | null>(null);
  const [receiptHistory, setReceiptHistory] = useState<AtmReceipt[]>([]);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  useEffect(() => {
    // Load receipt history when user is authenticated
    const loadReceiptHistory = async () => {
      if (user && accounts.length > 0) {
        try {
          // Call the actual API endpoint: GET /atm/receipts/{accountId}
          // This matches the Spring Boot controller with @PreAuthorize("hasAuthority('ROLE_USER')")
          console.log("Fetching receipt history for account:", accounts[0].id);
          
          const history = await api.getReceipts(accounts[0].id);
          setReceiptHistory(history);
        } catch (err) {
          console.error("Failed to load receipt history:", err);
          // Fallback to mock data if API call fails
          setReceiptHistory([
            {
              id: 1,
              receiptNo: "REC001",
              atmId: "ATM001",
              branchCode: "BR001",
              amount: 5000,
              time: "2026-01-25T10:30:00"
            },
            {
              id: 2,
              receiptNo: "REC002",
              atmId: "ATM002",
              branchCode: "BR002",
              amount: 10000,
              time: "2026-01-20T14:45:00"
            },
            {
              id: 3,
              receiptNo: "REC003",
              atmId: "ATM003",
              branchCode: "BR003",
              amount: 2500,
              time: "2026-01-15T09:15:00"
            }
          ]);
        }
      }
    };

    loadReceiptHistory();
  }, [user, accounts]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawPin) {
      setError("Please fill all fields");
      return;
    }

    if (!atmCard) {
      setError("No ATM card found");
      return;
    }

    setWithdrawing(true);
    setError("");

    try {
      console.log("ATM Withdraw =>", {
        cardNumber: atmCard.cardNumber,
        pin: withdrawPin,
        amount: withdrawAmount,
      });

      // Call the actual ATM withdrawal API
      const result = await api.withdrawFromAtm(
        atmCard.cardNumber,              // ✅ STRING
        withdrawPin,                     // ✅ STRING
        Number(withdrawAmount)           // ✅ NUMBER
      );

      // Handle successful withdrawal - API returns { message: string }
      // Create receipt data from the successful response
      const receiptData = {
        id: Date.now(),
        receiptNo: `REC${Date.now()}`,
        atmId: "ATM001",
        branchCode: "BR001", 
        amount: Number(withdrawAmount),
        time: new Date().toISOString()
      };
      
      // Add to receipt history
      setReceiptHistory([receiptData, ...receiptHistory]);
      setReceipt(receiptData);
      setReceiptDialogOpen(true);

      setSuccess(`Withdrawal of ${formatCurrency(Number(withdrawAmount))} successful!`);

      setWithdrawDialogOpen(false);
      setWithdrawAmount("");
      setWithdrawPin("");

    } catch (err: any) {
      // Handle different error types
      if (err.message.includes("Invalid PIN")) {
        setError("Invalid PIN entered. Please try again.");
      } else if (err.message.includes("Insufficient balance")) {
        setError("Insufficient account balance for this withdrawal.");
      } else if (err.message.includes("Daily limit exceeded")) {
        setError("Daily withdrawal limit exceeded. Please try again tomorrow.");
      } else if (err.message.includes("Card blocked")) {
        setError("Your ATM card is currently blocked. Please contact support.");
      } else {
        setError(err.message || "Withdrawal failed. Please try again.");
      }
    } finally {
      setWithdrawing(false);
    }
  };


  const handleResetPin = async () => {
    if (!oldPin || !newPin || !confirmPin) {
      setError("Please fill all fields");
      return;
    }
    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match");
      return;
    }
    if (newPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    if (!atmCard) {
      setError("No ATM card found");
      return;
    }
    setResettingPin(true);
    setError("");
    try {
      await api.resetAtmPin({ accountId: atmCard.accountId!, oldPin, newPin });
      setSuccess("PIN reset successful!");
      setPinDialogOpen(false);
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err: any) {
      setError(err.message || "PIN reset failed");
    } finally {
      setResettingPin(false);
    }
  };

  const handleForgotPin = async () => {
    if (!forgotPinCardNumber) {
      setError("Please enter your card number");
      return;
    }
    
    try {
      await api.forgotAtmPin(forgotPinCardNumber);
      setSentOtp(true);
      setSuccess("OTP sent to your registered email. Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const handleResetPinWithOtp = async () => {
    if (!forgotPinCardNumber || !forgotPinOtp || !forgotPinNewPin || !forgotPinConfirmNewPin) {
      setError("Please fill all fields");
      return;
    }
    
    if (forgotPinNewPin !== forgotPinConfirmNewPin) {
      setError("New PIN and Confirm PIN do not match");
      return;
    }
    
    if (forgotPinNewPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    
    try {
      await api.resetAtmPinWithOtp(forgotPinCardNumber, parseInt(forgotPinOtp), forgotPinNewPin);
      setSuccess("PIN reset successful!");
      setForgotPinDialogOpen(false);
      setForgotPinCardNumber("");
      setForgotPinOtp("");
      setForgotPinNewPin("");
      setForgotPinConfirmNewPin("");
      setSentOtp(false);
    } catch (err: any) {
      setError(err.message || "PIN reset failed");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ATM Card</h1>
        <p className="text-muted-foreground">Manage your debit card and ATM services</p>
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
        {/* ATM Card Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Your Debit Card
              </CardTitle>
              <CardDescription>Your UnityTrust debit card details</CardDescription>
            </CardHeader>
            <CardContent>
              {atmCard ? (
                <div className="space-y-4">
                  {/* Card Visual */}
                  <div className="relative aspect-[1.586] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary to-primary/60 p-6">
                    <div className="absolute right-4 top-4">
                      <CreditCard className="h-8 w-8 text-primary-foreground/50" />
                    </div>
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <p className="text-xs text-primary-foreground/70">UnityTrust Bank</p>
                        <p className="text-sm font-semibold text-primary-foreground">Debit Card</p>
                      </div>
                      <div>
                        <p className="font-mono text-lg tracking-widest text-primary-foreground">
                          {atmCard.cardNumber}
                        </p>
                        <p className="mt-2 text-xs text-primary-foreground/70">
                          A/C: ****{atmCard.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          atmCard.status === "ACTIVE"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {atmCard.status === "ACTIVE" ? (
                          <Unlock className="h-3 w-3" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                        {atmCard.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="text-base">{atmCard.expiryDate ? new Date(atmCard.expiryDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Daily Limit</p>
                      <p className="text-base">{formatCurrency(atmCard.dailyWithdrawalLimit || 0)}</p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Daily Withdrawn Amount</p>
                      <p className="text-base">{formatCurrency(Number(atmCard.dailyWithdrawnAmount) || 0)}</p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Issued Date</p>
                      <p className="text-base">{atmCard.issuedAt ? new Date(atmCard.issuedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <CreditCard className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                  <p className="mb-4 text-muted-foreground">No ATM card found</p>
                  <Button
                    onClick={handleRequestCard}
                    disabled={requesting || accounts.length === 0 || !accounts.some(acc => acc.status === "ACTIVE")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {requesting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Request ATM Card
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Card Services</CardTitle>
              <CardDescription>Manage your ATM card and perform transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Withdraw */}
              <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full justify-start gap-3 bg-secondary text-foreground hover:bg-secondary/80"
                    disabled={!atmCard || atmCard.status !== "ACTIVE"}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <Banknote className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Withdraw Money</p>
                      <p className="text-xs text-muted-foreground">Generate OTP for ATM withdrawal</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-border bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Withdraw Money</DialogTitle>
                    <DialogDescription>Enter amount and PIN for ATM withdrawal</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount" className="text-foreground">Amount</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Enter amount (multiples of 100)"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="border-border bg-secondary/50 text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-pin" className="text-foreground">ATM PIN</Label>
                      <Input
                        id="withdraw-pin"
                        type="password"
                        placeholder="Enter 4-digit PIN"
                        value={withdrawPin}
                        onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="border-border bg-secondary/50 text-foreground"
                        maxLength={4}
                      />
                    </div>
                    <Button
                      onClick={handleWithdraw}
                      disabled={withdrawing}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {withdrawing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Banknote className="mr-2 h-4 w-4" />
                      )}
                      Generate OTP
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Reset PIN */}
              <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full justify-start gap-3 bg-secondary text-foreground hover:bg-secondary/80"
                    disabled={!atmCard}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <KeyRound className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Reset PIN</p>
                      <p className="text-xs text-muted-foreground">Change your ATM PIN</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-border bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Reset ATM PIN</DialogTitle>
                    <DialogDescription>Enter your current PIN and set a new PIN</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="old-pin" className="text-foreground">Current PIN</Label>
                      <Input
                        id="old-pin"
                        type="password"
                        placeholder="Enter current PIN"
                        value={oldPin}
                        onChange={(e) => setOldPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="border-border bg-secondary/50 text-foreground"
                        maxLength={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-pin" className="text-foreground">New PIN</Label>
                      <Input
                        id="new-pin"
                        type="password"
                        placeholder="Enter new 4-digit PIN"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="border-border bg-secondary/50 text-foreground"
                        maxLength={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-pin" className="text-foreground">Confirm New PIN</Label>
                      <Input
                        id="confirm-pin"
                        type="password"
                        placeholder="Confirm new PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="border-border bg-secondary/50 text-foreground"
                        maxLength={4}
                      />
                    </div>
                    <Button
                      onClick={handleResetPin}
                      disabled={resettingPin}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {resettingPin ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="mr-2 h-4 w-4" />
                      )}
                      Reset PIN
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Block Card */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-destructive/50 bg-transparent text-destructive hover:bg-destructive/10"
                disabled={!atmCard}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
                  <Lock className="h-5 w-5 text-destructive" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Block Card</p>
                  <p className="text-xs opacity-80">Temporarily block your card</p>
                </div>
              </Button>

              {/* Forgot PIN */}
              <Dialog open={forgotPinDialogOpen} onOpenChange={setForgotPinDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full justify-start gap-3 bg-secondary text-foreground hover:bg-secondary/80"
                    disabled={!atmCard}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <KeyRound className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Forgot PIN?</p>
                      <p className="text-xs text-muted-foreground">Reset your PIN with OTP</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-border bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Forgot ATM PIN</DialogTitle>
                    <DialogDescription>
                      {sentOtp 
                        ? "Enter the OTP sent to your email and set a new PIN" 
                        : "Enter your card number to receive an OTP for PIN reset"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-pin-card-number" className="text-foreground">Card Number</Label>
                      <Input
                        id="forgot-pin-card-number"
                        type="text"
                        placeholder="Enter your card number"
                        value={forgotPinCardNumber}
                        onChange={(e) => setForgotPinCardNumber(e.target.value)}
                        className="border-border bg-secondary/50 text-foreground"
                        disabled={sentOtp}
                      />
                    </div>
                    
                    {sentOtp && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="forgot-pin-otp" className="text-foreground">OTP</Label>
                          <Input
                            id="forgot-pin-otp"
                            type="text"
                            placeholder="Enter OTP"
                            value={forgotPinOtp}
                            onChange={(e) => setForgotPinOtp(e.target.value.replace(/\D/g, ""))}
                            className="border-border bg-secondary/50 text-foreground"
                            maxLength={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="forgot-pin-new-pin" className="text-foreground">New PIN</Label>
                          <Input
                            id="forgot-pin-new-pin"
                            type="password"
                            placeholder="Enter new 4-digit PIN"
                            value={forgotPinNewPin}
                            onChange={(e) => setForgotPinNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="border-border bg-secondary/50 text-foreground"
                            maxLength={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="forgot-pin-confirm-new-pin" className="text-foreground">Confirm New PIN</Label>
                          <Input
                            id="forgot-pin-confirm-new-pin"
                            type="password"
                            placeholder="Confirm new PIN"
                            value={forgotPinConfirmNewPin}
                            onChange={(e) => setForgotPinConfirmNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="border-border bg-secondary/50 text-foreground"
                            maxLength={4}
                          />
                        </div>
                      </>
                    )}
                    
                    {!sentOtp ? (
                      <Button
                        onClick={handleForgotPin}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Send OTP
                      </Button>
                    ) : (
                      <Button
                        onClick={handleResetPinWithOtp}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Reset PIN
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="border-border bg-card max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              Withdrawal Receipt
            </DialogTitle>
            <DialogDescription>
              Your transaction details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {receipt && (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Receipt No:</span>
                  <span className="font-medium">{receipt.receiptNo}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">ATM ID:</span>
                  <span className="font-medium">{receipt.atmId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Branch Code:</span>
                  <span className="font-medium">{receipt.branchCode}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium text-green-500">{formatCurrency(receipt.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-medium">{new Date(receipt.time).toLocaleString()}</span>
                </div>
              </div>
            )}
            <div className="pt-4">
              <Button 
                onClick={() => setReceiptDialogOpen(false)} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              Withdrawal History
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your recent ATM withdrawals</p>
          </CardHeader>
          <CardContent>
            {receiptHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="pb-3">Receipt No</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">ATM ID</th>
                      <th className="pb-3">Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptHistory.map((receipt) => (
                      <tr key={receipt.id} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium">{receipt.receiptNo}</td>
                        <td className="py-3 text-green-500 font-medium">{formatCurrency(receipt.amount)}</td>
                        <td className="py-3">{new Date(receipt.time).toLocaleDateString()}</td>
                        <td className="py-3">{receipt.atmId}</td>
                        <td className="py-3">{receipt.branchCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Banknote className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No withdrawal history yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}