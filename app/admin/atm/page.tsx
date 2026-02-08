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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { api, type AtmRequestDetailDto } from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  User,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";

export default function AtmRequestsPage() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<AtmRequestDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AtmRequestDetailDto | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Try to get all ATM requests if the method exists, otherwise get pending
      let requestsData;
      if (typeof api.getAllAtmRequests === 'function') {
        requestsData = await api.getAllAtmRequests();
        // Filter to show only pending requests in the admin panel
        requestsData = requestsData.filter(request => request.status === 'PENDING');
      } else {
        requestsData = await api.getPendingAtmRequests();
      }
      
      // If user is an admin, filter requests by their branch
      // No need to manually filter by branch as backend handles it
      setRequests(requestsData);
    } catch (error) {
      console.error("Failed to fetch ATM requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!token) return;
    setProcessing(true);
    try {
      await api.approveAtmRequest(id);
      // Hide the approved request by refreshing the list
      await fetchData();
      setViewDialogOpen(false);
    } catch (error) {
      console.error("Failed to approve ATM request:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!token || !selectedRequest) return;
    setProcessing(true);
    try {
      await api.rejectAtmRequest(selectedRequest.id, rejectReason);
      await fetchData();
      setRejectDialogOpen(false);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject ATM request:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      (req.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (req.accountNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (req.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ATM Card Requests</h1>
          <p className="text-muted-foreground">Review and manage ATM card requests</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              ATM Requests Queue
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search by name or account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pl-9 sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No ATM requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.customerName || 'N/A'}</TableCell>
                      <TableCell>{req.accountNumber || 'N/A'}</TableCell>
                      <TableCell>
                        {req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRequest(req);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-500 hover:text-green-600"
                                onClick={() => handleApprove(req.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setRejectDialogOpen(true);
                                }}
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
          )}
        </CardContent>
      </Card>

      {/* View ATM Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ATM Request Details</DialogTitle>
            <DialogDescription>
              Review the ATM request information below
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Customer Name
                  </div>
                  <p className="font-medium">{selectedRequest.customerName || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{selectedRequest.email || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Account Number
                  </div>
                  <p className="font-medium">{selectedRequest.accountNumber || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Branch
                  </div>
                  <p className="font-medium">{selectedRequest.branchName || 'N/A'} ({selectedRequest.branchCode || 'N/A'})</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Request Date
                  </div>
                  <p className="font-medium">
                    {selectedRequest.requestDate ? new Date(selectedRequest.requestDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {selectedRequest.approvedDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Approved Date
                    </div>
                    <p className="font-medium">
                      {new Date(selectedRequest.approvedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="space-y-2">
                    <div className="text-muted-foreground">Rejection Reason</div>
                    <p className="font-medium">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="text-muted-foreground">Status</div>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              {selectedRequest.status === "PENDING" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false);
                      setRejectDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject ATM Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this ATM request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject ATM Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}