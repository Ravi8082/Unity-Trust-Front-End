"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, type LoanApplicationDto } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Home,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";

export default function LoansPage() {
  const { user } = useAuth();
  const [loanType, setLoanType] = useState<"PERSONAL" | "HOME" | "EDUCATION">("PERSONAL");
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !tenure) {
      setError("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    const tenureNum = parseInt(tenure);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid loan amount");
      return;
    }

    if (isNaN(tenureNum) || tenureNum <= 0) {
      setError("Please enter a valid tenure in months");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const loanData: LoanApplicationDto = {
        loanType,
        amount: amountNum,
        tenure: tenureNum,
      };

      await api.applyForLoan(loanData);
      setSuccess("Loan application submitted successfully! Your request is under review.");
      setAmount("");
      setTenure("");
      
      toast.success("Loan application submitted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to submit loan application");
      toast.error(err.message || "Failed to submit loan application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 self-start sm:self-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Loan Application</h1>
            <p className="text-sm text-muted-foreground">Apply for a personal, home, or education loan</p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-500"
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Apply for Loan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanType" className="text-foreground">
                    Loan Type
                  </Label>
                  <Select value={loanType} onValueChange={(v: any) => setLoanType(v)}>
                    <SelectTrigger className="border-border bg-secondary/50 text-foreground w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card w-full">
                      <SelectItem value="PERSONAL">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span>Personal Loan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="HOME">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary" />
                          <span>Home Loan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="EDUCATION">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span>Education Loan</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-foreground">
                    Loan Amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter loan amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="border-border bg-secondary/50 pl-10 text-foreground w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenure" className="text-foreground">
                    Tenure (months)
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="tenure"
                      type="number"
                      placeholder="Enter tenure in months"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      className="border-border bg-secondary/50 pl-10 text-foreground w-full"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Apply for Loan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">My Loan Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Your loan applications will appear here once submitted</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}