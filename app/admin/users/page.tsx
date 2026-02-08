"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Plus, 
  Loader2, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, UserResponseDto, AdminCreateDto, Branch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [customers, setCustomers] = useState<UserResponseDto[]>([]);
  const [searchType, setSearchType] = useState("email"); // email, mobile, aadhaar, accountNumber, branch
  
  // Form state
  const [formData, setFormData] = useState<{
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    fatherName: string;
    gender: string;
    address: string;
    aadhaar: string;
    pan: string;
    branchId: string;
  }>({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    fatherName: "",
    gender: "",
    address: "",
    aadhaar: "",
    pan: "",
    branchId: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const branchesData = await api.getActiveBranches();
      setBranches(branchesData);
      
      // Fetch all admin users data including customers
      const usersData = await api.getAdminUsers();
      
      // Convert AdminUserDto to UserResponseDto for compatibility
      const convertedUsers: UserResponseDto[] = usersData.map(user => ({
        id: user.userId,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        active: user.active,
        createdAt: new Date().toISOString(), // Default value
        updatedAt: new Date().toISOString(), // Default value
        lastLogin: null, // Default value
        failedLoginAttempts: 0, // Default value
        lockedUntil: null, // Default value
        customerProfile: {
          id: 0, // Default value
          fullName: user.fullName,
          fatherName: "", // Not in AdminUserDto
          motherName: "", // Not in AdminUserDto
          dateOfBirth: null, // Not in AdminUserDto
          gender: "", // Not in AdminUserDto
          maritalStatus: "", // Not in AdminUserDto
          address: user.address,
          city: "", // Not in AdminUserDto
          state: "", // Not in AdminUserDto
          pincode: "", // Not in AdminUserDto
          occupation: "", // Not in AdminUserDto
          annualIncome: 0, // Not in AdminUserDto
          aadhaar: "", // Not in AdminUserDto
          pan: "", // Not in AdminUserDto
          nomineeName: "", // Not in AdminUserDto
          nomineeRelation: "", // Not in AdminUserDto
          nomineeAadhaar: "", // Not in AdminUserDto
          kycStatus: "PENDING", // Default value
          accountStatus: "ACTIVE", // Default value
          verifiedBy: null, // Default value
          verifiedAt: null, // Default value
          createdAt: new Date().toISOString(), // Default value
          updatedAt: new Date().toISOString(), // Default value
        },
        branch: {
          id: 0, // Default value
          branchName: user.branchName,
          branchCode: "", // Not in AdminUserDto
          address: "", // Not in AdminUserDto
          city: "", // Not in AdminUserDto
          state: "", // Not in AdminUserDto
          pincode: "", // Not in AdminUserDto
          phone: "", // Not in AdminUserDto
          email: "", // Not in AdminUserDto
          managerId: null, // Not in AdminUserDto
          isActive: true, // Default value
          createdAt: new Date().toISOString(), // Default value
          updatedAt: new Date().toISOString(), // Default value
        },
        accounts: user.accountNumbers?.map(accNum => ({
          id: 0, // Default value
          accountNumber: accNum,
          accountType: "SAVINGS", // Default value
          balance: 0, // Default value
          status: "ACTIVE", // Default value
          createdAt: new Date().toISOString(), // Default value
          updatedAt: new Date().toISOString(), // Default value
        })) || [],
      }));
      
      setUsers(convertedUsers);
      setCustomers(convertedUsers.filter(user => user.role === "ROLE_USER"));
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // If search term is empty, load all users
      fetchData();
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const searchParams: any = {};
      
      switch (searchType) {
        case "branch":
          // Find branch by name or code
          const branch = branches.find(b => 
            b.branchName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            b.branchCode.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (branch) {
            searchParams.branchId = branch.id;
          }
          break;
        case "accountNumber":
          searchParams.accountNumber = searchTerm;
          break;
        case "aadhaar":
          searchParams.aadhaar = searchTerm.replace(/\s/g, ''); // Remove spaces
          break;
        case "mobile":
          searchParams.mobile = searchTerm;
          break;
        case "email":
        default:
          searchParams.email = searchTerm;
          break;
      }
      
      const results = await api.searchUsers(searchParams);
      setUsers(results);
      setCustomers(results.filter(user => user.role === "ROLE_USER"));
    } catch (err: any) {
      setError(err.message || "Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateAdmin = async () => {
    // Validation
    if (!formData.email || !formData.mobile || !formData.password || !formData.branchId) {
      setError("Please fill all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email");
      return;
    }

    if (!formData.mobile.match(/^\d{10}$/)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const dto: AdminCreateDto = {
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        branchId: parseInt(formData.branchId),
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        gender: formData.gender,
        address: formData.address,
        aadhaar: formData.aadhaar,
        pan: formData.pan
      };

      const result = await api.createAdminWithProfile(dto);
      setUsers(prev => [...prev, result]);
      setSuccess("Admin user created successfully!");
      
      // Reset form
      setFormData({
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        fatherName: "",
        gender: "",
        address: "",
        aadhaar: "",
        pan: "",
        branchId: ""
      });
    } catch (err: any) {
      setError(err.message || "Failed to create admin user");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    
    try {
      // Both Admin and Manager can deactivate any user
      await api.deactivateUser(userId);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, active: false } : user
      ));
      setSuccess("User deactivated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to deactivate user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobile.includes(searchTerm);
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatRole = (role: string) => {
    return role.replace("ROLE_", "");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ROLE_ADMIN": return "default";
      case "ROLE_MANAGER": return "secondary";
      case "ROLE_USER": return "outline";
      default: return "outline";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage admin users and customer accounts</p>
        </div>
        <CreateAdminDialog 
          branches={branches}
          onCreate={handleCreateAdmin}
          creating={creating}
          formData={formData}
          setFormData={setFormData}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          error={error}
        />
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

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <Search className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Search by..." />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="aadhaar">Aadhaar</SelectItem>
                  <SelectItem value="accountNumber">Account Number</SelectItem>
                  <SelectItem value="branch">Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Input
                placeholder={`Search by ${searchType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-border bg-secondary/50 text-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div>
              <Button 
                onClick={handleSearch}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ROLE_USER">Customers</SelectItem>
                  <SelectItem value="ROLE_ADMIN">Admins</SelectItem>
                  <SelectItem value="ROLE_MANAGER">Managers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSearchType("email");
                fetchData();
              }}
              className="border-border bg-secondary/50 text-foreground hover:bg-secondary"
            >
              Clear Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-foreground">{user.email}</CardTitle>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {formatRole(user.role)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.mobile}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {user.active ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Inactive</span>
                      </div>
                    )}
                  </div>
                  {!user.active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(user.id)}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No users found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || roleFilter !== "ALL" 
              ? "Try adjusting your search or filters" 
              : "Get started by creating your first admin user"}
          </p>
        </div>
      )}
    </div>
  );
}

interface CreateAdminDialogProps {
  branches: Branch[];
  onCreate: () => void;
  creating: boolean;
  formData: {
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    fatherName: string;
    gender: string;
    address: string;
    aadhaar: string;
    pan: string;
    branchId: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    fatherName: string;
    gender: string;
    address: string;
    aadhaar: string;
    pan: string;
    branchId: string;
  }>>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  error: string;
}

function CreateAdminDialog({
  branches,
  onCreate,
  creating,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  error
}: CreateAdminDialogProps) {
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData({
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        fatherName: "",
        gender: "",
        address: "",
        aadhaar: "",
        pan: "",
        branchId: ""
      });
    }
  }, [open, setFormData]);



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Admin User
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Admin User</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new admin user with full profile
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="border-border bg-secondary/50 text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-foreground">Mobile *</Label>
              <Input
                id="mobile"
                placeholder="9876543210"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ""))}
                className="border-border bg-secondary/50 text-foreground"
                maxLength={10}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="border-border bg-secondary/50 text-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="border-border bg-secondary/50 text-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="border-border bg-secondary/50 text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fatherName" className="text-foreground">Father's Name</Label>
              <Input
                id="fatherName"
                placeholder="Father's Name"
                value={formData.fatherName}
                onChange={(e) => handleChange("fatherName", e.target.value)}
                className="border-border bg-secondary/50 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-foreground">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branch" className="text-foreground">Branch *</Label>
              <Select value={formData.branchId} onValueChange={(value) => handleChange("branchId", value)}>
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.branchName} ({branch.branchCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground">Address</Label>
            <Input
              id="address"
              placeholder="Full address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="border-border bg-secondary/50 text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar" className="text-foreground">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                placeholder="1234 5678 9012"
                value={formData.aadhaar}
                onChange={(e) => handleChange("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                className="border-border bg-secondary/50 text-foreground"
                maxLength={12}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pan" className="text-foreground">PAN Number</Label>
              <Input
                id="pan"
                placeholder="ABCDE1234F"
                value={formData.pan}
                onChange={(e) => handleChange("pan", e.target.value.toUpperCase().slice(0, 10))}
                className="border-border bg-secondary/50 text-foreground"
                maxLength={10}
              />
            </div>
          </div>

          <Button
            onClick={onCreate}
            disabled={creating}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create Admin User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}