"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  CreditCard, 
  KeyRound,
  Save,
  Loader2
} from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
  });
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    biometricLogin: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (field: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSecurityToggle = (field: keyof typeof security) => {
    setSecurity(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Simulate API call to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would call the API here
      // await api.updateUserProfile(formData);
      
      // Update user context
      if (user) {
        updateUser({ ...user, ...formData });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">Manage your UnityTrust Bank account preferences</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-border bg-secondary/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-border bg-secondary/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border-border bg-secondary/50 text-foreground"
                />
              </div>
              
              <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              
              {saved && (
                <div className="mt-3 p-3 bg-green-500/10 text-green-500 rounded-lg text-sm">
                  Profile updated successfully!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive account updates via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationToggle('email')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">SMS Alerts</Label>
                  <p className="text-xs text-muted-foreground">Receive account alerts via SMS</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={() => handleNotificationToggle('sms')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive app notifications</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationToggle('push')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">Add extra layer of security</p>
                </div>
                <Switch
                  checked={security.twoFactorAuth}
                  onCheckedChange={() => handleSecurityToggle('twoFactorAuth')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Biometric Login</Label>
                  <p className="text-xs text-muted-foreground">Use fingerprint or face recognition</p>
                </div>
                <Switch
                  checked={security.biometricLogin}
                  onCheckedChange={() => handleSecurityToggle('biometricLogin')}
                />
              </div>
              
              <Separator />
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Download Account Statement
              </Button>
              
              <Button variant="outline" className="w-full">
                Close Account
              </Button>
              
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  Last login: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-muted-foreground">
                  IP Address: 127.0.0.1
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}