"use client";

import React from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, type Branch } from "@/lib/api";
import {
  Building2,
  Plus,
  Edit,
  Power,
  Search,
  RefreshCw,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";

const INDIAN_STATES = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

interface BranchFormData {
  branchName: string;
  branchCode: string;
  ifscCode: string;
  accountPrefix: string;
  city: string;
  state: string;
  active: boolean;
}

const initialFormData: BranchFormData = {
  branchName: "",
  branchCode: "",
  ifscCode: "",
  accountPrefix: "",
  city: "",
  state: "",
  active: true,
};

export default function BranchesPage() {
  const { token } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchFormData>(initialFormData);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        ifscCode: branch.ifscCode,
        accountPrefix: branch.accountPrefix,
        city: branch.city,
        state: branch.state,
        active: branch.active,
      });
    } else {
      setEditingBranch(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, {
          branchName: formData.branchName,
          branchCode: formData.branchCode,
          ifscCode: formData.ifscCode,
          accountPrefix: formData.accountPrefix,
          city: formData.city,
          state: formData.state,
          active: formData.active
        });
      } else {
        await api.createBranch({
          branchName: formData.branchName,
          branchCode: formData.branchCode,
          ifscCode: formData.ifscCode,
          accountPrefix: formData.accountPrefix,
          city: formData.city,
          state: formData.state,
          active: formData.active
        });
      }
      await fetchBranches();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save branch:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      if (branch.active) {
        await api.deactivateBranch(branch.id);
      } else {
        await api.updateBranch(branch.id, { ...branch, active: true });
      }
      await fetchBranches();
    } catch (error) {
      console.error("Failed to toggle branch status:", error);
    }
  };

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.ifscCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === "all" || branch.state === stateFilter;
    return matchesSearch && matchesState;
  });

  const getStateName = (code: string) => {
    const state = INDIAN_STATES.find((s) => s.code === code);
    return state ? state.name : code;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branch Management</h1>
          <p className="text-muted-foreground">Manage bank branches across India</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchBranches} variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Branch
          </Button>
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              All Branches
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
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
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No branches found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>IFSC Code</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.branchName}</TableCell>
                      <TableCell className="font-mono text-sm">{branch.ifscCode}</TableCell>
                      <TableCell>{branch.city}</TableCell>
                      <TableCell>{getStateName(branch.state)}</TableCell>
                      <TableCell>
                        <Badge variant={branch.active ? "default" : "secondary"}>
                          {branch.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(branch)}
                            className={branch.active ? "text-destructive" : "text-green-500"}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
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

      {/* Add/Edit Branch Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
            <DialogDescription>
              {editingBranch
                ? "Update the branch information below"
                : "Fill in the details to create a new branch"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  placeholder="Enter branch name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="UTBI0000001"
                  pattern="[A-Z]{4}0[A-Z0-9]{6}"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountPrefix">Account Prefix</Label>
                <Input
                  id="accountPrefix"
                  value={formData.accountPrefix}
                  onChange={(e) => setFormData({ ...formData, accountPrefix: e.target.value.toUpperCase() })}
                  placeholder="Account number prefix"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  value={formData.branchCode}
                  onChange={(e) => setFormData({ ...formData, branchCode: e.target.value.toUpperCase() })}
                  placeholder="Enter branch code"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountPrefix">Account Prefix</Label>
                <Input
                  id="accountPrefix"
                  value={formData.accountPrefix}
                  onChange={(e) => setFormData({ ...formData, accountPrefix: e.target.value.toUpperCase() })}
                  placeholder="Account number prefix"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingBranch ? "Update Branch" : "Create Branch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
