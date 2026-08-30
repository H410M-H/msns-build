"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "~/hooks/use-toast";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Bell,
  Save,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";

function getRoleTheme(accountType: string) {
  switch (accountType.toUpperCase()) {
    case "ADMIN":
      return {
        badge: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
        gradient: "from-red-500 to-rose-600",
        accent: "text-red-500",
        bg: "bg-red-500/5",
      };
    case "PRINCIPAL":
      return {
        badge: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
        gradient: "from-purple-500 to-indigo-600",
        accent: "text-purple-500",
        bg: "bg-purple-500/5",
      };
    case "HEAD":
      return {
        badge: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
        gradient: "from-amber-500 to-orange-600",
        accent: "text-amber-500",
        bg: "bg-amber-500/5",
      };
    case "CLERK":
      return {
        badge: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400",
        gradient: "from-teal-500 to-emerald-600",
        accent: "text-teal-500",
        bg: "bg-teal-500/5",
      };
    case "TEACHER":
    case "FACULTY":
      return {
        badge: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
        gradient: "from-blue-500 to-cyan-600",
        accent: "text-blue-500",
        bg: "bg-blue-500/5",
      };
    case "STUDENT":
      return {
        badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
        gradient: "from-emerald-500 to-teal-600",
        accent: "text-emerald-500",
        bg: "bg-emerald-500/5",
      };
    default:
      return {
        badge: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400",
        gradient: "from-slate-500 to-gray-600",
        accent: "text-slate-500",
        bg: "bg-slate-500/5",
      };
  }
}

export default function UserProfilePage() {
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
    if (!currentPw) {
      toast({ title: "Validation Error", description: "Current password is required.", variant: "destructive" });
      return;
    }
    if (newPw.length < 6) {
      toast({ title: "Validation Error", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setPwLoading(true);
    changePassword.mutate({
      username: user?.username ?? "",
      email: user?.email ?? "",
      currentPassword: currentPw,
      newPassword: newPw,
    });
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

  if (isLoading || !user) {
    return (
      <div className="w-full space-y-6 p-4">
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
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Avatar & Overview */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="relative overflow-hidden border-border bg-card shadow-sm">
            <div className={`h-24 w-full bg-gradient-to-r ${roleTheme.gradient} opacity-80`} />
            <CardContent className="relative pt-0 text-center">
              <div className="relative -mt-12 mb-4 flex justify-center">
                <div className="group relative">
                  <Avatar className="h-24 w-24 border-4 border-card shadow-md">
                    {user.profilePic && user.profilePic !== "/user.jpg" ? (
                      <AvatarImage src={user.profilePic} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-emerald-500/10 text-2xl font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>

              <div className="mt-3 flex justify-center">
                <Badge variant="outline" className={`px-3 py-1 font-semibold ${roleTheme.badge}`}>
                  <Shield className="mr-1 h-3 w-3 inline" />
                  {user.accountType}
                </Badge>
              </div>

              <div className="mt-6 space-y-3 text-left text-xs border-t border-border pt-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Account ID</span>
                  <span className="font-mono font-medium text-foreground">{user.accountId}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined</span>
                  <span className="font-medium text-foreground">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings & Password Forms */}
        <div className="space-y-6 lg:col-span-8">
          {/* Profile Details Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-500" /> Public Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Update your display username and personal bio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={profileLoading || !username.trim()}
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {profileLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-500" /> Change Password
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your account is using a strong password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="text-sm pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="••••••••"
                      className="text-sm pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      className="text-sm pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={pwLoading || !currentPw || !newPw}
                size="sm"
                variant="outline"
                className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
              >
                {pwLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
