"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff,
  Loader2
} from "lucide-react";

export default function PasswordResetPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters with at least one uppercase, lowercase, number, and special character
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      requirements: [
        { met: hasMinLength, text: "At least 8 characters" },
        { met: hasUpperCase, text: "At least one uppercase letter" },
        { met: hasLowerCase, text: "At least one lowercase letter" },
        { met: hasNumbers, text: "At least one number" },
        { met: hasSpecialChar, text: "At least one special character" }
      ]
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError("Password does not meet requirements");
      return;
    }

    // Simulate API call
    setLoading(true);
    try {
      // In a real app, you would call the API here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful password change
      setSuccess("Password changed successfully! You will be logged out shortly.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // In a real app, you would redirect or log out the user
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <div className="container mx-auto py-6 px-4 max-w-md">
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground mt-4">Change Password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Secure your account with a new password
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="border-border bg-secondary/50 text-foreground pl-10 pr-10"
                />
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-foreground">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="border-border bg-secondary/50 text-foreground pl-10 pr-10"
                />
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password requirements */}
              <div className="mt-2 space-y-1">
                {passwordValidation.requirements.map((req, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className={`h-2 w-2 rounded-full mr-2 ${req.met ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`${req.met ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="border-border bg-secondary/50 text-foreground pl-10 pr-10"
                />
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <AlertDescription className="text-green-500">{success}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Need help? <a href="/dashboard/help" className="text-primary hover:underline">Contact support</a></p>
      </div>
    </div>
  );
}