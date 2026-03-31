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
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
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
  const { data: user, isLoading } = api.profile.getProfile.useQuery();
  const roleTheme = getRoleTheme(session?.user?.accountType ?? "");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const changePassword = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast({ title: "Password changed successfully." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwLoading(false);
    },
    onError: (err: { message: string }) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setPwLoading(false);
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
          <Card className="relative overflow-hidden border-slate-200 shadow-lg dark:border-border dark:bg-card">
            {/* Gradient blob */}
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br ${roleTheme.gradient} opacity-10 blur-2xl`}
            />
            <CardContent className="flex flex-col items-center gap-6 p-8">
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${roleTheme.gradient} opacity-20 blur-xl`}
                />
                <div className="relative rounded-full border-4 border-white bg-slate-100 p-1 shadow-xl dark:border-border dark:bg-black/30">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback
                      className={`bg-gradient-to-br ${roleTheme.gradient} text-3xl font-black text-white`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-card">
                  <div className="h-2 w-2 animate-ping rounded-full bg-emerald-200 opacity-75" />
                </div>
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

        {/* RIGHT: Security */}
        <div className="space-y-6 lg:col-span-2">
          {/* Suggested Features Banner */}
          <Fade delay={0.08}>
            <Card className="border-amber-200/70 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Suggested Improvements
                  </h4>
                  <ul className="mt-1 space-y-1 text-xs text-amber-700 dark:text-amber-400">
                    <li>• Enable 2-Factor Authentication for added security</li>
                    <li>• Upload a profile picture to personalize your account</li>
                    <li>• Set notification preferences for emails and alerts</li>
                    <li>• Add a recovery email or phone number</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </Fade>

          {/* Account Info */}
          <Fade delay={0.12}>
            <Card className="border-slate-200 shadow-sm dark:border-border dark:bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-emerald-500" />
                  Account Details
                </CardTitle>
                <CardDescription>Your account information (read-only)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Username</Label>
                  <Input value={user.username} readOnly className="bg-slate-50 dark:bg-black/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <Input value={user.email} readOnly className="bg-slate-50 dark:bg-black/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Account Type</Label>
                  <Input value={user.accountType} readOnly className="bg-slate-50 dark:bg-black/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Account ID</Label>
                  <Input value={user.accountId} readOnly className="font-mono text-xs bg-slate-50 dark:bg-black/20" />
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
