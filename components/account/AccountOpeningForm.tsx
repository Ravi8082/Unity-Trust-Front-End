"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, Branch } from "@/lib/api";
import { 
  Mail, 
  Check, 
  Loader2, 
  User, 
  Calendar, 
  MapPin, 
  Building,
  Upload,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

type Step = "email" | "otp" | "details" | "kyc" | "success";

export function AccountOpeningForm() {
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  
  // Form data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [accountType, setAccountType] = useState("SAVINGS");
  const [applicationId, setApplicationId] = useState<number | null>(null);
  
  // Branches and States
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [states, setStates] = useState<string[]>([]);
  
  // KYC Files
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [aadhaarImage, setAadhaarImage] = useState<File | null>(null);
  const [panImage, setPanImage] = useState<File | null>(null);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const data = await api.getActiveBranches();
        // Filter only active branches
        const activeBranches = data.filter(branch => branch.active);
        setBranches(activeBranches);
        
        // Extract unique states from branches
        const uniqueStates = [...new Set(activeBranches.map(branch => branch.state))].sort();
        setStates(uniqueStates);
        
        console.log('Successfully loaded branches from database:', activeBranches);
      } catch (err: any) {
        console.error('Failed to fetch branches from database:', err);
        // Show error to user but continue with empty array
        setError("Failed to load branch information. Using default branches.");
        
        // Provide fallback static data to allow the form to function
        const fallbackBranches: Branch[] = [
          { id: 1, branchName: "Mumbai Main Branch", branchCode: "MB001", ifscCode: "UTBI0001234", accountPrefix: "UTB", state: "MH", city: "Mumbai", active: true },
          { id: 2, branchName: "Delhi Central Branch", branchCode: "DL001", ifscCode: "UTBI0005678", accountPrefix: "UTB", state: "DL", city: "New Delhi", active: true },
          { id: 3, branchName: "Bangalore Tech Park", branchCode: "BLR001", ifscCode: "UTBI0009012", accountPrefix: "UTB", state: "KA", city: "Bangalore", active: true },
          { id: 4, branchName: "Chennai Business District", branchCode: "CHN001", ifscCode: "UTBI0003456", accountPrefix: "UTB", state: "TN", city: "Chennai", active: true },
          { id: 5, branchName: "Hyderabad HITEC City", branchCode: "HYD001", ifscCode: "UTBI0007890", accountPrefix: "UTB", state: "TS", city: "Hyderabad", active: true },
        ];
        
        setBranches(fallbackBranches);
        const uniqueStates = [...new Set(fallbackBranches.map(branch => branch.state))].sort();
        setStates(uniqueStates);
      }
    }
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedState) {
      setFilteredBranches(branches.filter(b => b.state === selectedState));
      setSelectedBranch("");
    } else {
      setFilteredBranches(branches); // Show all branches if no state selected
    }
  }, [selectedState, branches]);

  useEffect(() => {
    // Load timer state from localStorage on component mount
    const savedTimerState = localStorage.getItem('otpTimerState');
    if (savedTimerState) {
      const { expiryTime } = JSON.parse(savedTimerState);
      const currentTime = Date.now();
      const timeRemaining = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
      
      if (timeRemaining > 0) {
        setTimer(timeRemaining);
        setIsResendDisabled(true);
        startTimer(timeRemaining);
      } else {
        setTimer(0);
        setIsResendDisabled(false);
        localStorage.removeItem('otpTimerState');
      }
    }
  }, []);

  const startTimer = (initialSeconds: number) => {
    let seconds = initialSeconds;
    setIsResendDisabled(true);
    
    const interval = setInterval(() => {
      seconds--;
      setTimer(seconds);
      
      if (seconds <= 0) {
        clearInterval(interval);
        setIsResendDisabled(false);
        localStorage.removeItem('otpTimerState');
      } else {
        // Update localStorage with new expiry time
        const expiryTime = Date.now() + seconds * 1000;
        localStorage.setItem('otpTimerState', JSON.stringify({ expiryTime }));
      }
    }, 1000);
    
    return interval;
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.sendOtp(email);
      setStep("otp");
      
      // Start the 2-minute timer
      const initialSeconds = 120; // 2 minutes
      setTimer(initialSeconds);
      startTimer(initialSeconds);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email is required to resend OTP");
      return;
    }
    
    setLoading(true);
    try {
      await api.resendOtp(email);
      
      // Restart the 2-minute timer
      const initialSeconds = 120; // 2 minutes
      setTimer(initialSeconds);
      startTimer(initialSeconds);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.verifyOtp(email, otp);
      setStep("details");
      
      // Clear the timer when OTP is verified successfully
      setTimer(0);
      setIsResendDisabled(false);
      localStorage.removeItem('otpTimerState');
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Also clear the timer when going back to email step
  const handleGoBackToEmail = () => {
    setStep("email");
    setOtp(""); // Clear OTP
    setTimer(0); // Clear timer
    setIsResendDisabled(false);
    localStorage.removeItem('otpTimerState');
  };

  const handleSubmitDetails = async () => {
    if (!name || !fatherName || !mobile || !dob || !address || !aadhaar || !pan || !selectedState || !selectedBranch) {
      setError("Please fill all required fields");
      return;
    }
    
    // Validate Aadhaar (should be 12 digits)
    if (!/^\d{12}$/.test(aadhaar)) {
      setError("Aadhaar number must be 12 digits");
      return;
    }
    
    // Validate PAN (should be 10 characters)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      setError("PAN number must be 10 characters (5 letters, 4 digits, 1 letter)");
      return;
    }
    
    // Validate mobile (should be 10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      setError("Mobile number must be 10 digits");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const result = await api.applyForAccount({
        fullName: name,
        fatherName,
        email,
        mobile,
        dob,
        address,
        aadhaar,
        pan,
        state: selectedState,
        branchId: parseInt(selectedBranch, 10),
        accountType,
      });
      setApplicationId(result.id);
      setStep("kyc");
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadKyc = async () => {
    if (!profileImage || !aadhaarImage || !panImage) {
      setError("Please upload all required documents");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("aadhaarImage", aadhaarImage);
      formData.append("panImage", panImage);
      
      if (applicationId) {
        await api.uploadKyc(applicationId, formData);
      }
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to upload documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Verify Your Email</h3>
              <p className="text-sm text-muted-foreground">We will send a one-time password to verify your email address</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button 
              onClick={handleSendOtp} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send OTP
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        );

      case "otp":
        return (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Enter OTP</h3>
              <p className="text-sm text-muted-foreground">We have sent a 6-digit OTP to {email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-foreground">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="border-border bg-secondary/50 text-center font-mono text-lg tracking-widest text-foreground placeholder:text-muted-foreground"
                maxLength={6}
              />
            </div>
            
            {/* Timer Display */}
            {timer > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Resend OTP in <span className="font-semibold text-primary">{timer}s</span>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={handleGoBackToEmail}
                className="border-border bg-transparent text-foreground"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleResendOtp} 
                  disabled={isResendDisabled || loading}
                  className={`${isResendDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Resend OTP
                </Button>
                
                <Button 
                  onClick={handleVerifyOtp} 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify OTP
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case "details":
        return (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Personal Details</h3>
              <p className="text-sm text-muted-foreground">Please provide your information as per official documents</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="As per Aadhaar card"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fatherName" className="text-foreground">Father's Name</Label>
              <Input
                id="fatherName"
                type="text"
                placeholder="As per Aadhaar card"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-foreground">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-foreground">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="border-border bg-secondary/50 text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aadhaar" className="text-foreground">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                type="text"
                placeholder="12-digit Aadhaar number"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pan" className="text-foreground">PAN Number</Label>
              <Input
                id="pan"
                type="text"
                placeholder="10-digit PAN number"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-foreground">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {states.map((stateCode) => {
                    // Create a mapping for state codes to full names
                    const stateCodeToNameMap: Record<string, string> = {
                      'MH': 'Maharashtra',
                      'DL': 'Delhi',
                      'KA': 'Karnataka',
                      'TN': 'Tamil Nadu',
                      'UP': 'Uttar Pradesh',
                      'GJ': 'Gujarat',
                      'RJ': 'Rajasthan',
                      'WB': 'West Bengal',
                      'AP': 'Andhra Pradesh',
                      'TS': 'Telangana',
                      'KL': 'Kerala',
                      'PB': 'Punjab',
                      'HR': 'Haryana',
                      'BR': 'Bihar',
                      'MP': 'Madhya Pradesh',
                      'CT': 'Chhattisgarh',
                      'JH': 'Jharkhand',
                      'AS': 'Assam',
                      'HP': 'Himachal Pradesh',
                      'UK': 'Uttarakhand',
                      'OR': 'Odisha',
                      'JK': 'Jammu and Kashmir',
                      'PY': 'Puducherry',
                      'CH': 'Chandigarh',
                      'AN': 'Andaman and Nicobar Islands',
                      'LD': 'Lakshadweep',
                      'DN': 'Dadra and Nagar Haveli',
                      'DD': 'Daman and Diu',
                      'LA': 'Ladakh'
                    };
                    
                    const stateName = stateCodeToNameMap[stateCode] || stateCode;
                    return (
                      <SelectItem key={stateCode} value={stateCode} className="text-foreground">
                        {stateName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-foreground">Branch</Label>
              <Select 
                value={selectedBranch} 
                onValueChange={setSelectedBranch}
                disabled={!selectedState}
              >
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder={selectedState ? "Select branch" : "Select state first"} />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {filteredBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()} className="text-foreground">
                      {branch.branchName} ({branch.ifscCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-foreground">Account Type</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="SAVINGS" className="text-foreground">
                    Savings Account
                  </SelectItem>
                  <SelectItem value="CURRENT" className="text-foreground">
                    Current Account
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep("otp")}
                className="border-border bg-transparent text-foreground"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleSubmitDetails} 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case "kyc":
        return (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Upload KYC Documents</h3>
              <p className="text-sm text-muted-foreground">Upload clear images of your documents for verification</p>
            </div>
            
            <div className="space-y-4">
              <FileUploadField
                label="Profile Photo"
                description="Passport size photo with white background"
                file={profileImage}
                onFileChange={setProfileImage}
              />
              <FileUploadField
                label="Aadhaar Card"
                description="Front side of your Aadhaar card"
                file={aadhaarImage}
                onFileChange={setAadhaarImage}
              />
              <FileUploadField
                label="PAN Card"
                description="Clear image of your PAN card"
                file={panImage}
                onFileChange={setPanImage}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep("details")}
                className="border-border bg-transparent text-foreground"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleUploadKyc} 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Application
              </Button>
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Application Submitted!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account opening application has been submitted successfully. 
                Our team will review your documents and you will receive your account 
                details via email within 24-48 hours.
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 text-left">
              <p className="text-xs text-muted-foreground">Application Reference</p>
              <p className="font-mono text-lg text-primary">UTB{applicationId?.toString().padStart(8, "0")}</p>
            </div>
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Back to Home
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <Card className="glass border-border/50">
      <CardContent className="p-6">
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {["email", "otp", "details", "kyc", "success"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ["email", "otp", "details", "kyc", "success"].indexOf(step) > i
                      ? "bg-green-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {["email", "otp", "details", "kyc", "success"].indexOf(step) > i ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 4 && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 ${
                      ["email", "otp", "details", "kyc", "success"].indexOf(step) > i
                        ? "bg-green-500"
                        : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function FileUploadField({
  label,
  description,
  file,
  onFileChange,
}: {
  label: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>
      <div
        className={`relative rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          file ? "border-green-500/50 bg-green-500/10" : "border-border hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-green-500">
            <Check className="h-5 w-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">Click or drag to upload</p>
          </>
        )}
      </div>
    </div>
  );
}
