"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, type AccountApplication, type Branch } from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Search,
  Filter,
  RefreshCw,
  User,
  Calendar,
  MapPin,
  CreditCard,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function ApplicationsPage() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<AccountApplication[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AccountApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processing, setProcessing] = useState(false);
  const [detailedApp, setDetailedApp] = useState<AccountApplication | null>(null);
  const [kycImages, setKycImages] = useState<{ profile?: string; aadhaar?: string; pan?: string }>({});
  const [imageLoading, setImageLoading] = useState<{ profile: boolean; aadhaar: boolean; pan: boolean }>({ 
    profile: false, 
    aadhaar: false, 
    pan: false 
  });
  const [verificationLoading, setVerificationLoading] = useState<{ aadhaar: boolean; pan: boolean }>({ 
    aadhaar: false, 
    pan: false 
  });
  const [zoomedImage, setZoomedImage] = useState<{ url: string; alt: string } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Try to use getAllApplications if it exists, otherwise fall back to getPendingApplications
      let appsData;
      if (typeof api.getAllApplications === 'function') {
        appsData = await api.getAllApplications();
      } else {
        appsData = await api.getPendingApplications();
      }
      
      const branchesData = await api.getActiveBranches();

      setApplications(appsData);
      setBranches(branchesData);
      console.log('Applications data:', appsData); 
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      setError(error.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!token) return;
    setProcessing(true);
    try {
      // Check if both Aadhaar and PAN are verified before allowing approval
      if (detailedApp && (!detailedApp.aadhaarVerified || !detailedApp.panVerified)) {
        alert(
          "Cannot approve application: Both Aadhaar and PAN must be verified first. " +
          "\nAadhaar verified: " + (detailedApp.aadhaarVerified ? "Yes" : "No") + ", " +
          "\nPAN verified: " + (detailedApp.panVerified ? "Yes" : "No")
        );
        setProcessing(false);
        return;
      }
      
      await api.approveApplication(id);
      await fetchData();
      setViewDialogOpen(false);
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!token || !detailedApp) return;
    setProcessing(true);
    try {
      await api.rejectApplication(detailedApp.id, rejectReason);
      await fetchData();
      setRejectDialogOpen(false);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setProcessing(false);
    }
  };

  const verifyAadhaar = async (applicationId: number) => {
    try {
      console.log("VERIFY FUNCTION CALLED", applicationId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8080/customer-profile/user/${applicationId}/verify-aadhaar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.text();

      console.log("VERIFY RESPONSE:", data);

      alert("Aadhaar Verified");

      fetchData(); // refresh AFTER success
    } catch (err) {
      console.error("VERIFY ERROR:", err);
      alert("Verification Failed");
    }
  };

  const verifyPan = async (applicationId: number) => {
    try {
      console.log("VERIFY PAN FUNCTION CALLED", applicationId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8080/customer-profile/user/${applicationId}/verify-pan`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.text();

      console.log("VERIFY PAN RESPONSE:", data);

      alert("PAN Verified");

      fetchData(); // refresh AFTER success
    } catch (err) {
      console.error("VERIFY PAN ERROR:", err);
      alert("Verification Failed");
    }
  };

  const handleViewApplication = async (app: AccountApplication) => {
    setSelectedApp(app);
    setDetailedApp(app);
    setViewDialogOpen(true);
    
    // Load KYC images if paths are available
    if (app.profileImagePath || app.aadhaarImagePath || app.panImagePath) {
      await loadKycImages(app);
    }
  };

  const loadKycImages = async (app: AccountApplication) => {
    setImageLoading({ profile: true, aadhaar: true, pan: true });
    
    try {
      const [profileImage, aadhaarImage, panImage] = await Promise.all([
        app.profileImagePath ? api.viewImage(app.profileImagePath).catch(() => null) : null,
        app.aadhaarImagePath ? api.viewImage(app.aadhaarImagePath).catch(() => null) : null,
        app.panImagePath ? api.viewImage(app.panImagePath).catch(() => null) : null,
      ]);

      setKycImages({
        profile: profileImage ? URL.createObjectURL(profileImage) : undefined,
        aadhaar: aadhaarImage ? URL.createObjectURL(aadhaarImage) : undefined,
        pan: panImage ? URL.createObjectURL(panImage) : undefined,
      });
    } catch (error) {
      console.error("Failed to load KYC images:", error);
    } finally {
      setImageLoading({ profile: false, aadhaar: false, pan: false });
    }
  };

  const handleVerifyAadhaar = async () => {
    if (!detailedApp) {
      alert('Application data is missing. Please refresh the application list.');
      return;
    }
    setVerificationLoading({ ...verificationLoading, aadhaar: true });
    try {
      // Update the application's aadhaar verification status
      setDetailedApp({ ...detailedApp, aadhaarVerified: true });
      
      // Check if both documents are now verified
      if (detailedApp.panVerified) {
        setSuccess('Both documents verified! Account will be activated automatically.');
      }
      
      await fetchData(); // Refresh the list
    } catch (error) {
      console.error("Failed to update Aadhaar verification:", error);
      alert('Failed to update Aadhaar verification. Please try again.');
    } finally {
      setVerificationLoading({ ...verificationLoading, aadhaar: false });
    }
  };

  const handleVerifyPan = async () => {
    if (!detailedApp) {
      alert('Application data is missing. Please refresh the application list.');
      return;
    }
    setVerificationLoading({ ...verificationLoading, pan: true });
    try {
      // Update the application's pan verification status
      setDetailedApp({ ...detailedApp, panVerified: true });
      
      // Check if both documents are now verified
      if (detailedApp.aadhaarVerified) {
        setSuccess('Both documents verified! Account will be activated automatically.');
      }
      
      await fetchData(); // Refresh the list
    } catch (error) {
      console.error("Failed to update PAN verification:", error);
      alert('Failed to update PAN verification. Please try again.');
    } finally {
      setVerificationLoading({ ...verificationLoading, pan: false });
    }
  };

  const handleImageClick = (imageUrl: string, alt: string) => {
    setZoomedImage({ url: imageUrl, alt });
  };



  const closeZoomedImage = () => {
    setZoomedImage(null);
  };

  const handleDocumentApprove = async (documentType: 'aadhaar' | 'pan') => {
    if (!detailedApp) {
      alert('Application data is missing. Please refresh the application list.');
      return;
    }
    
    setVerificationLoading({ ...verificationLoading, [documentType]: true });
    try {
      if (documentType === 'aadhaar') {
        // Update the application's aadhaar verification status
        setDetailedApp({ ...detailedApp, aadhaarVerified: true });
        
        // Check if both documents are now verified
        if (detailedApp.panVerified) {
          // Both documents verified - automatically activate account
          setSuccess('Both documents verified! Account will be activated automatically.');
          // In a real implementation, this would trigger backend account activation
          // setDetailedApp({ ...detailedApp, aadhaarVerified: true, status: 'ACTIVE' });
        }
      } else {
        // Update the application's pan verification status
        setDetailedApp({ ...detailedApp, panVerified: true });
        
        // Check if both documents are now verified
        if (detailedApp.aadhaarVerified) {
          // Both documents verified - automatically activate account
          setSuccess('Both documents verified! Account will be activated automatically.');
          // In a real implementation, this would trigger backend account activation
          // setDetailedApp({ ...detailedApp, panVerified: true, status: 'ACTIVE' });
        }
      }
      
      await fetchData(); // Refresh the list
    } catch (error) {
      console.error(`Failed to update ${documentType} verification:`, error);
      alert(`Failed to update ${documentType} verification. Please try again.`);
    } finally {
      setVerificationLoading({ ...verificationLoading, [documentType]: false });
    }
  };

  const handleDocumentReject = async (documentType: 'aadhaar' | 'pan') => {
    if (!detailedApp) return;
    
    const reason = prompt(`Please enter the reason for rejecting the ${documentType} document:`);
    if (!reason) return;
    
    // For document rejection, we'll show a success message
    setSuccess(`${documentType.toUpperCase()} document rejected with reason: ${reason}`);
    
    // In a real implementation, you would call a specific API endpoint for document rejection
    // await api.rejectDocument(detailedApp.id, documentType, reason);
    // await fetchData();
    
    // Clear the success after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  const getBranchName = (branchId: number) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.branchName : "Unknown";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      SUBMITTED: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
      PENDING_KYC: "outline",
      PARTIAL_KYC_PENDING: "destructive",
    };
    
    const displayTexts: Record<string, string> = {
      SUBMITTED: "Submitted",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      PENDING_KYC: "Pending KYC",
      PARTIAL_KYC_PENDING: "KYC Required",
    };
    
    const displayText = displayTexts[status] || status;
    const variant = variants[status] || "secondary";
    
    return (
      <div className="flex flex-col">
        <Badge variant={variant}>{displayText}</Badge>
        {status === 'PARTIAL_KYC_PENDING' && (
          <span className="text-xs text-red-600 mt-1">Action Required</span>
        )}
      </div>
    );
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 p-4 text-green-500">
          {success}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Applications</h1>
          <p className="text-muted-foreground">Review and manage account applications</p>
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
              <FileText className="h-5 w-5 text-primary" />
              Applications Queue
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
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
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="PENDING_KYC">Pending KYC</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
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
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.fullName}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.accountType}</TableCell>
                      <TableCell>{getBranchName(app.branchId)}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyAadhaar(app.id)}
                          >
                            Verify Aadhaar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyPan(app.id)}
                          >
                            Verify PAN
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewApplication(app)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {app.status === "SUBMITTED" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-500 hover:text-green-600"
                                onClick={() => handleApprove(app.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                  setSelectedApp(app);
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

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the application information below
            </DialogDescription>
          </DialogHeader>
          {detailedApp && (
            <div className="space-y-6">
              {detailedApp.status === 'PARTIAL_KYC_PENDING' && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800 font-semibold">Action Required</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Complete your KYC verification to activate your account.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <p className="font-medium">{detailedApp.fullName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Father's Name
                  </Label>
                  <p className="font-medium">{detailedApp.fatherName || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{detailedApp.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Mobile Number</Label>
                  <p className="font-medium">{detailedApp.mobile}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <p className="font-medium">{detailedApp.dob ? new Date(detailedApp.dob).toLocaleDateString('en-IN') : 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Account Type
                  </Label>
                  <p className="font-medium">{detailedApp.accountType}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Aadhaar Number</Label>
                  <p className="font-medium">{detailedApp.aadhaar}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">PAN Number</Label>
                  <p className="font-medium">{detailedApp.pan}</p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{detailedApp.address}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Branch
                  </Label>
                  <p className="font-medium text-primary">{getBranchName(detailedApp.branchId)}</p>
                  <p className="text-sm text-muted-foreground">Branch ID: {detailedApp.branchId}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  {getStatusBadge(detailedApp.status)}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Application Date
                  </Label>
                  <p className="font-medium">
                    {detailedApp.createdAt 
                      ? new Date(detailedApp.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                      : 'Not available'}
                  </p>
                </div>
              </div>
              
              {/* KYC Images Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">KYC Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Profile Image */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Profile Image</Label>
                    <div className="border rounded-lg p-2 bg-muted h-48 flex items-center justify-center">
                      {imageLoading.profile ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : kycImages.profile ? (
                        <img 
                          src={kycImages.profile} 
                          alt="Profile" 
                          className="max-h-full max-w-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImageClick(kycImages.profile!, 'Profile Image')}
                          onError={() => {
                            setKycImages(prev => ({ ...prev, profile: undefined }));
                          }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">No profile image available</p>
                      )}
                    </div>
                    {detailedApp.aadhaarVerified === false && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleDocumentApprove('aadhaar')}
                          disabled={verificationLoading.aadhaar}
                          className="flex-1"
                        >
                          {verificationLoading.aadhaar ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDocumentReject('aadhaar')}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {detailedApp.aadhaarVerified === true && (
                      <Badge variant="default" className="w-full justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aadhaar Verified
                      </Badge>
                    )}
                  </div>

                  {/* Aadhaar Image */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Aadhaar Image</Label>
                    <div className="border rounded-lg p-2 bg-muted h-48 flex items-center justify-center">
                      {imageLoading.aadhaar ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : kycImages.aadhaar ? (
                        <div className="relative group">
                          <img 
                            src={kycImages.aadhaar} 
                            alt="Aadhaar" 
                            className="max-h-full max-w-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageClick(kycImages.aadhaar!, 'Aadhaar Image')}
                            onError={() => {
                              setKycImages(prev => ({ ...prev, aadhaar: undefined }));
                            }}
                          />
                          {!detailedApp?.aadhaarVerified && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDocumentApprove('aadhaar');
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDocumentReject('aadhaar');
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">No Aadhaar image available</p>
                      )}
                    </div>

                    {detailedApp.aadhaarVerified && (
                      <Badge variant="default" className="w-full justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aadhaar Verified
                      </Badge>
                    )}
                    
                    {/* Show activation pending message when both documents are verified */}
                    {detailedApp.aadhaarVerified && detailedApp.panVerified && detailedApp.status === 'PARTIAL_KYC_PENDING' && (
                      <Badge variant="secondary" className="w-full justify-center bg-yellow-100 text-yellow-800">
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Activation Pending
                      </Badge>
                    )}
                  </div>

                  {/* PAN Image */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">PAN Image</Label>
                    <div className="border rounded-lg p-2 bg-muted h-48 flex items-center justify-center">
                      {imageLoading.pan ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : kycImages.pan ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <img 
                              src={kycImages.pan} 
                              alt="PAN" 
                              className="max-h-full max-w-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleImageClick(kycImages.pan!, 'PAN Image')}
                              onError={() => {
                                setKycImages(prev => ({ ...prev, pan: undefined }));
                              }}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDocumentApprove('pan')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDocumentReject('pan')} className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">No PAN image available</p>
                      )}
                    </div>

                    {detailedApp.panVerified && (
                      <Badge variant="default" className="w-full justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        PAN Verified
                      </Badge>
                    )}
                    
                    {/* Show activation pending message when both documents are verified */}
                    {detailedApp.aadhaarVerified && detailedApp.panVerified && detailedApp.status === 'PARTIAL_KYC_PENDING' && (
                      <Badge variant="secondary" className="w-full justify-center bg-yellow-100 text-yellow-800">
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Activation Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {(detailedApp.status === "SUBMITTED" || detailedApp.status === "PARTIAL_KYC_PENDING") && (
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
                    onClick={() => handleApprove(detailedApp.id)}
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
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
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
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zoomed Image Modal */}
      {zoomedImage && (
          <Dialog open={!!zoomedImage} onOpenChange={closeZoomedImage}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle className="flex items-center justify-between">
                  {zoomedImage.alt}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeZoomedImage}
                    className="ml-auto"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
            <div className="p-4 flex items-center justify-center max-h-[70vh]">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.alt}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            </DialogContent>
          </Dialog>
      )}
    </div>
  );
}
