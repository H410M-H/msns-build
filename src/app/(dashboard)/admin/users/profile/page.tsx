"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Mail,
  User,
  CalendarDays,
  Key,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Camera,
  Settings2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { getRoleTheme } from "~/lib/utils";
import { toast } from "~/hooks/use-toast";
import { PageHeader } from "~/components/blocks/nav/PageHeader";

function Fade({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
  color = "text-emerald-500",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-border dark:bg-black/20">
      <div className={`mt-0.5 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const { data: user, isLoading } = api.profile.getProfile.useQuery();
  const roleTheme = getRoleTheme(session?.user?.accountType ?? "");

  // Password state
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Profile details state
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Settings state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [visibility, setVisibility] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
      setEmailNotifs(user.emailNotifications);
      setPushNotifs(user.pushNotifications);
      setMarketing(user.marketingEmails);
      setVisibility(user.profileVisibility);
      setTwoFactor(user.twoFactorAuth);
    }
  }, [user]);

  const changePassword = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast({ title: "Password changed successfully." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwLoading(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setPwLoading(false);
    },
  });

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast({ title: "Profile updated successfully." });
      void utils.profile.getProfile.invalidate();
      setProfileLoading(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setProfileLoading(false);
    },
  });

  const updateSettings = api.profile.updateSettings.useMutation({
    onSuccess: () => {
      toast({ title: "Settings updated successfully." });
      void utils.profile.getProfile.invalidate();
      setSettingsLoading(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setSettingsLoading(false);
    },
  });

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast({ title: "All fields are required.", variant: "destructive" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ title: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPw.length < 8) {
      toast({ title: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    changePassword.mutate({ username: user?.username ?? "", email: user?.email ?? "", currentPassword: currentPw, newPassword: newPw });
  };

  const handleUpdateProfile = () => {
    setProfileLoading(true);
    updateProfile.mutate({ username, bio, email: user?.email ?? "" });
  };

  const handleUpdateSettings = () => {
    setSettingsLoading(true);
    updateSettings.mutate({
      emailNotifications: emailNotifs,
      pushNotifications: pushNotifs,
      marketingEmails: marketing,
      profileVisibility: visibility,
      twoFactorAuth: twoFactor,
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error ?? "Upload failed");
      }

      const data = (await res.json()) as { url: string };
      const imageUrl = data.url;

      // Update profile with new avatar URL
      updateProfile.mutate({
        username: user?.username ?? "",
        email: user?.email ?? "",
        profilePic: imageUrl,
      });
      
    } catch (err) {
      const error = err as Error;
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const breadcrumbs = [
    { href: `/${session?.user?.accountType?.toLowerCase() ?? "admin"}`, label: "Dashboard" },
    { href: "/admin/users/profile", label: "My Profile", current: true },
  ];

  if (isLoading || !user) {
    return (
      <div className="w-full space-y-6">
        <PageHeader breadcrumbs={breadcrumbs} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl" />
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
      new Date(date)
    );

  const initials = user.username
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT: Identity Card */}
        <Fade delay={0}>
          <Card className="relative overflow-hidden border-slate-200 shadow-lg dark:border-border dark:bg-card h-full">
            {/* Gradient blob */}
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br ${roleTheme.gradient} opacity-10 blur-2xl`}
            />
            <CardContent className="flex flex-col items-center gap-6 p-8">
              {/* Avatar */}
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${roleTheme.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`}
                />
                <div className="relative rounded-full border-4 border-white bg-slate-100 p-1 shadow-xl dark:border-border dark:bg-black/30 overflow-hidden">
                  <Avatar className="h-24 w-24">
                    {user.profilePic && user.profilePic !== "/user.jpg" && <AvatarImage src={user.profilePic} className="object-cover" />}
                    <AvatarFallback
                      className={`bg-gradient-to-br ${roleTheme.gradient} text-3xl font-black text-white`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Hover overlay for upload */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full m-1">
                    {uploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-card">
                  <div className="h-2 w-2 animate-ping rounded-full bg-emerald-200 opacity-75" />
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                />
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-foreground">
                  {user.username}
                </h2>
                <Badge className="mt-2 border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <Shield className="mr-1 h-3 w-3" />
                  {user.accountType}
                </Badge>
              </div>

              <Separator className="dark:bg-border" />

              <div className="w-full space-y-3">
                <InfoChip icon={Mail} label="Email" value={user.email} color="text-blue-500" />
                <InfoChip
                  icon={Fingerprint}
                  label="Account ID"
                  value={user.accountId}
                  color="text-purple-500"
                />
                <InfoChip
                  icon={CalendarDays}
                  label="Member Since"
                  value={formatDate(new Date(user.createdAt))}
                  color="text-amber-500"
                />
              </div>

              {/* Account Health */}
              <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Account Status
                  </span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Fade>

        {/* RIGHT: Details & Security */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Account Details & Bio */}
          <Fade delay={0.08}>
            <Card className="border-slate-200 shadow-sm dark:border-border dark:bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-blue-500" />
                  Account Details
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Username</Label>
                    <Input 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-slate-50 dark:bg-black/20" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Email Address</Label>
                    <Input value={user.email} readOnly className="bg-slate-50 dark:bg-black/20 opacity-70" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Bio</Label>
                  <Textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself..."
                    className="resize-none h-24 bg-slate-50 dark:bg-black/20" 
                  />
                </div>
                
                <div>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={profileLoading || !username}
                    className="mt-2 gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {profileLoading ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Fade>
          
          {/* Settings & Preferences */}
          <Fade delay={0.12}>
            <Card className="border-slate-200 shadow-sm dark:border-border dark:bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-5 w-5 text-purple-500" />
                  Preferences & Security
                </CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notifications</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive daily summaries.</p>
                      </div>
                      <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Get alerted immediately.</p>
                      </div>
                      <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Marketing Emails</Label>
                        <p className="text-xs text-muted-foreground">Offers and newsletters.</p>
                      </div>
                      <Switch checked={marketing} onCheckedChange={setMarketing} />
                    </div>
                  </div>
                  
                  {/* Security & Privacy */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Privacy & Security</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Profile Visibility</Label>
                        <p className="text-xs text-muted-foreground">Allow others to see your profile.</p>
                      </div>
                      <Switch checked={visibility} onCheckedChange={setVisibility} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex items-center gap-2">
                        <Label className="text-sm font-medium">Two-Factor Auth</Label>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">Recommended</Badge>
                      </div>
                      <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                    </div>
                  </div>
                </div>
                
                <Separator className="dark:bg-border" />
                
                <div>
                  <Button
                    onClick={handleUpdateSettings}
                    disabled={settingsLoading}
                    className="mt-2 gap-2 bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {settingsLoading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Fade>

          {/* Change Password */}
          <Fade delay={0.16}>
            <Card className="border-slate-200 shadow-sm dark:border-border dark:bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-5 w-5 text-red-500" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password. Use at least 8 characters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Current Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="current-password"
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        placeholder="New password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="pl-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        className={`pl-9 pr-10 ${
                          confirmPw && confirmPw !== newPw
                            ? "border-red-400 focus-visible:ring-red-400"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPw && confirmPw !== newPw && (
                      <p className="flex items-center gap-1 text-[11px] text-red-500">
                        <AlertCircle className="h-3 w-3" /> Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Strength Hint */}
                {newPw.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            newPw.length >= i * 3
                              ? i <= 1
                                ? "bg-red-400"
                                : i <= 2
                                  ? "bg-amber-400"
                                  : i <= 3
                                    ? "bg-blue-400"
                                    : "bg-emerald-500"
                              : "bg-slate-200 dark:bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {newPw.length < 4
                        ? "Too short"
                        : newPw.length < 7
                          ? "Weak"
                          : newPw.length < 10
                            ? "Fair"
                            : "Strong"}
                    </p>
                  </div>
                )}

                <Button
                  id="save-password-btn"
                  onClick={handleChangePassword}
                  disabled={pwLoading || !currentPw || !newPw || !confirmPw || newPw !== confirmPw}
                  className="mt-2 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {pwLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {pwLoading ? "Saving..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </Fade>
        </div>
      </div>
    </div>
  );
}
