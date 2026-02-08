"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type Branch } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Building2,
  Search,
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

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await api.getActiveBranches();
        setBranches(data);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

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
    <>
      <Header />
      <main className="app-content">
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="py-16 bg-gradient-to-b from-card to-background">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gold-text">Our Branches</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
                Find a UnityTrust Bank branch near you. We have branches across India ready to serve you.
              </p>
            </div>
          </section>

          {/* Search and Filter */}
          <section className="py-8 bg-background">
            <div className="container mx-auto px-4">
              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by branch name, IFSC code, or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={stateFilter} onValueChange={setStateFilter}>
                      <SelectTrigger className="w-full md:w-64">
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
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Branches Grid */}
          <section className="py-8 pb-16">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="text-center py-16">
                  <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No branches found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    Showing {filteredBranches.length} branch{filteredBranches.length !== 1 ? "es" : ""}
                  </p>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBranches.map((branch) => (
                      <Card key={branch.id} className="glass hover:border-primary/50 transition-colors">
                        <CardHeader>
                          <CardTitle className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{branch.branchName}</h3>
                              <p className="text-sm font-mono text-muted-foreground">{branch.ifscCode}</p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <p>{branch.address}</p>
                              <p>{branch.city}, {getStateName(branch.state)} - {branch.pincode}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{branch.phone}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </>
  );
}
