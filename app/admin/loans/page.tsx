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
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api, type LoanRequestDto } from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Search,
  Filter,
  RefreshCw,
  User,
  DollarSign,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function LoansPage() {
  const { user, token } = useAuth();
  const [loans, setLoans] = useState<LoanRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequestDto | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const loadLoans = async () => {
    try {
      setLoading(true);
      const allLoans = await api.getPendingLoans();
      setLoans(allLoans);
    } catch (err: any) {
      console.error("Error fetching loans:", err);
      toast.error(err.message || "Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleApprove = async () => {
    if (!selectedLoan) return;

    try {
      await api.approveLoan(selectedLoan.id);
      toast.success("Loan approved successfully!");
      setApproveDialogOpen(false);
      setSelectedLoan(null);
      loadLoans(); // Reload the list
    } catch (err: any) {
      console.error("Error approving loan:", err);
      toast.error(err.message || "Failed to approve loan");
    }
  };

  const handleReject = async () => {
    if (!selectedLoan || !rejectReason.trim()) return;

    try {
      await api.rejectLoan(selectedLoan.id, rejectReason);
      toast.success("Loan rejected successfully!");
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedLoan(null);
      loadLoans(); // Reload the list
    } catch (err: any) {
      console.error("Error rejecting loan:", err);
      toast.error(err.message || "Failed to reject loan");
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = ((loan.applicantName || loan.userName)?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (loan.loanType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (loan.branchName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "REJECTED":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Loan Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage loan applications and disbursements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadLoans}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Pending Loan Applications
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 border-border bg-secondary/50 w-full"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No loans found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filterStatus === "PENDING" 
                    ? "No pending loan applications at the moment." 
                    : "No loan applications match your filters."}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden space-y-4">
                  {filteredLoans.map((loan) => (
                    <Card key={loan.id} className="border-border bg-card">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-foreground">#{loan.id}</h3>
                            <p className="text-sm text-muted-foreground">{loan.applicantName || loan.userName || 'N/A'}</p>
                          </div>
                          <Badge className={`${getStatusBadgeVariant(loan.status)} capitalize text-xs`}>
                            {loan.status?.toLowerCase() || 'N/A'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">{loan.loanType?.toLowerCase() || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-medium">
                              <DollarSign className="inline h-3 w-3 mr-1" />
                              {loan.amount ? loan.amount.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tenure:</span>
                            <span className="font-medium">{loan.tenure !== null && loan.tenure !== undefined ? `${loan.tenure} months` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Applied:</span>
                            <span className="font-medium">
                              {loan.appliedAt ? new Date(loan.appliedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Branch:</span>
                            <span className="font-medium flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {loan.branchName || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {loan.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-green-600 hover:text-green-700 border-green-600 hover:border-green-700"
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setApproveDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-destructive hover:text-destructive/90 border-destructive hover:border-destructive/90"
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Desktop View - Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Tenure</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">#{loan.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {loan.applicantName || loan.userName || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{loan.loanType?.toLowerCase() || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              {loan.amount ? loan.amount.toLocaleString() : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {loan.tenure !== null && loan.tenure !== undefined ? `${loan.tenure} months` : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {loan.appliedAt ? new Date(loan.appliedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {loan.branchName || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusBadgeVariant(loan.status)} capitalize`}>
                              {loan.status?.toLowerCase() || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {loan.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLoan(loan);
                                      setApproveDialogOpen(true);
                                    }}
                                    className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLoan(loan);
                                      setRejectDialogOpen(true);
                                    }}
                                    className="text-destructive hover:text-destructive/90 border-destructive hover:border-destructive/90"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Loan Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle>Loan Application Details</DialogTitle>
            <DialogDescription>
              Review the loan application information below
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Applicant Name</span>
                  </div>
                  <p className="font-medium">{selectedLoan.applicantName || selectedLoan.userName || 'N/A'}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Loan Type</span>
                  </div>
                  <p className="font-medium capitalize">{selectedLoan.loanType?.toLowerCase() || 'N/A'}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Amount</span>
                  </div>
                  <p className="font-medium">{selectedLoan.amount ? selectedLoan.amount.toLocaleString() : 'N/A'}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Tenure</span>
                  </div>
                  <p className="font-medium">{selectedLoan.tenure ? `${selectedLoan.tenure} months` : 'N/A'}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Applied Date</span>
                  </div>
                  <p className="font-medium">
                    {selectedLoan.appliedAt ? new Date(selectedLoan.appliedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Branch</span>
                  </div>
                  <p className="font-medium">{selectedLoan.branchName || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Status</div>
                <Badge className={`${getStatusBadgeVariant(selectedLoan.status)} capitalize`}>
                  {selectedLoan.status?.toLowerCase() || 'N/A'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Loan Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Loan Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this loan application? This will disburse the funds to the user's account.
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-secondary/50 p-4">
                <div className="text-sm text-muted-foreground">Loan Details</div>
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Applicant:</span>
                    <span className="font-medium">{selectedLoan.applicantName || selectedLoan.userName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">{selectedLoan.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tenure:</span>
                    <span className="font-medium">{selectedLoan.tenure} months</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 text-primary-foreground hover:bg-green-700"
            >
              Approve Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Loan Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Loan Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this loan application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason</Label>
              <Input
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="border-border bg-secondary/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}