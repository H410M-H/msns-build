"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { EmployeeEditDialog } from "~/components/forms/employee/EmployeeEditDialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Pencil,
  GraduationCap,
  Briefcase,
  Mail,
  AtSign,
  Shield,
  Hash,
  Heart,
  Clock,
  UserCheck,
} from "lucide-react";

// --- Helper: InfoItem ---
function InfoItem({
  label,
  value,
  icon,
  fullWidth = false,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${fullWidth ? "col-span-full" : ""}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon && <span className="opacity-70">{icon}</span>} {label}
      </p>
      <p
        className={`break-words text-base font-medium leading-snug text-slate-900 dark:text-foreground sm:text-lg ${mono ? "font-mono text-sm" : ""}`}
      >
        {value && value !== "none" ? (
          value
        ) : (
          <span className="text-sm italic text-muted-foreground dark:text-slate-600">
            Not Provided
          </span>
        )}
      </p>
    </div>
  );
}

// --- Helper: Skeleton Loader ---
function ProfileSkeleton() {
  return (
    <div className="min-h-screen space-y-6 bg-slate-50/50 p-4 dark:bg-card sm:p-6 lg:p-8">
      <div className="h-48 animate-pulse rounded-3xl bg-slate-200 dark:bg-muted sm:h-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-2xl bg-white dark:bg-card" />
          <Skeleton className="h-72 w-full rounded-2xl bg-white dark:bg-card" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-2xl bg-white dark:bg-card" />
      </div>
    </div>
  );
}

// --- Designation Badge Color ---
function designationColor(d: string) {
  switch (d) {
    case "ADMIN":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "PRINCIPAL":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "HEAD":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "CLERK":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "TEACHER":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

// --- Main Page ---
export default function EmployeeProfilePage() {
  const params = useParams();
  const employeeId = params.employeeId as string;
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: employee,
    isLoading,
    refetch,
  } = api.employee.getEmployeeWithUser.useQuery(
    { employeeId },
    { enabled: !!employeeId },
  );

  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users/faculty/view", label: "Faculty Management" },
    { href: "#", label: "Employee Profile", current: true },
  ];

  if (isLoading) return <ProfileSkeleton />;

  if (!employee) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Employee not found
      </div>
    );
  }

  const user = employee.user;
  const initials = employee.employeeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen w-full bg-slate-50/50 dark:bg-card">
      <PageHeader breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl space-y-6 p-4 pt-20 duration-500 animate-in fade-in sm:p-6 lg:p-8">
        {/* ── Banner ── */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 shadow-2xl sm:p-8 md:p-10">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl md:h-96 md:w-96" />
          <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-slate-700 bg-slate-700 shadow-xl ring-2 ring-emerald-500/30 sm:h-32 sm:w-32 md:h-40 md:w-40">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600/30 to-slate-700 text-4xl font-black text-emerald-300 sm:text-5xl">
                {initials}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 text-center md:pt-2 md:text-left">
              <div className="flex flex-col items-center gap-3 md:flex-row">
                <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm sm:text-4xl">
                  {employee.employeeName}
                </h1>
                <Badge
                  variant="outline"
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${designationColor(employee.designation)}`}
                >
                  {employee.designation}
                </Badge>
                <Badge
                  variant={employee.isAssign ? "default" : "secondary"}
                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider"
                >
                  {employee.isAssign ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="flex items-center justify-center gap-2 text-base font-medium text-slate-300 md:justify-start">
                <User className="h-4 w-4 text-emerald-400" />
                S/O {employee.fatherName}
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-1 md:justify-start">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-black/30 px-3 py-1 font-mono text-xs text-emerald-300"
                >
                  <Hash className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                  Reg: {employee.registrationNumber}
                </Badge>
                {employee.admissionNumber && (
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 bg-black/30 px-3 py-1 font-mono text-xs text-blue-300"
                  >
                    <Hash className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                    Adm: {employee.admissionNumber}
                  </Badge>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-4 w-full md:mt-0 md:w-auto">
              <Button
                onClick={() => setEditOpen(true)}
                className="w-full bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 hover:bg-emerald-500 active:scale-95 md:w-auto"
                size="lg"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Left: Professional + Personal ── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Professional Card */}
            <Card className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card">
              <CardHeader className="border-b border-slate-100 pb-3 dark:border-border">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                  <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    <Briefcase className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
                <InfoItem label="Designation" value={employee.designation} />
                <InfoItem label="Education" value={employee.education} icon={<GraduationCap className="h-4 w-4" />} />
                <InfoItem label="Date of Joining" value={employee.doj} icon={<Calendar className="h-4 w-4" />} />
                <InfoItem
                  label="Joined"
                  value={new Date(employee.doj).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
              </CardContent>
            </Card>

            {/* Personal Card */}
            <Card className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card">
              <CardHeader className="border-b border-slate-100 pb-3 dark:border-border">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-x-12 gap-y-8 pt-6 sm:grid-cols-2">
                <InfoItem
                  label="Date of Birth"
                  value={employee.dob}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <InfoItem label="Gender" value={employee.gender} />
                <InfoItem
                  label="CNIC"
                  value={employee.cnic}
                  icon={<CreditCard className="h-4 w-4" />}
                  mono
                />
                <InfoItem
                  label="Marital Status"
                  value={employee.maritalStatus}
                  icon={<Heart className="h-4 w-4" />}
                />
              </CardContent>
            </Card>

            {/* Account / User Card */}
            {user && (
              <Card className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card">
                <CardHeader className="border-b border-slate-100 pb-3 dark:border-border">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                      <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    Account Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-12 gap-y-8 pt-6 sm:grid-cols-2">
                  <InfoItem
                    label="Username"
                    value={user.username}
                    icon={<AtSign className="h-4 w-4" />}
                    mono
                  />
                  <InfoItem
                    label="Email"
                    value={user.email}
                    icon={<Mail className="h-4 w-4" />}
                    mono
                  />
                  <InfoItem
                    label="Account Type"
                    value={user.accountType}
                    icon={<Shield className="h-4 w-4" />}
                  />
                  <InfoItem
                    label="Account ID"
                    value={user.accountId}
                    icon={<Hash className="h-4 w-4" />}
                    mono
                  />
                  <InfoItem
                    label="Member Since"
                    value={new Date(user.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    icon={<Clock className="h-4 w-4" />}
                    fullWidth
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Right: Contact ── */}
          <div className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card">
              <CardHeader className="border-b border-slate-100 pb-3 dark:border-border">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                  <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                    <Phone className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="space-y-4">
                  <h4 className="border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground dark:border-border">
                    Phone Numbers
                  </h4>
                  <div className="grid gap-4">
                    <InfoItem
                      label="Mobile No."
                      value={employee.mobileNo}
                      icon={<Phone className="h-4 w-4" />}
                    />
                    {employee.additionalContact && (
                      <InfoItem
                        label="Additional Contact"
                        value={employee.additionalContact}
                        icon={<Phone className="h-4 w-4" />}
                      />
                    )}
                  </div>
                </div>

                <Separator className="dark:bg-border" />

                <div className="space-y-4">
                  <h4 className="border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground dark:border-border">
                    Address
                  </h4>
                  <InfoItem
                    label="Residential Address"
                    value={employee.residentialAddress}
                    icon={<MapPin className="h-4 w-4" />}
                    fullWidth
                  />
                </div>

                <Separator className="dark:bg-border" />

                <div className="space-y-4">
                  <h4 className="border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground dark:border-border">
                    Status
                  </h4>
                  <div className="flex items-center gap-3">
                    <UserCheck className={`h-5 w-5 ${employee.isAssign ? "text-emerald-500" : "text-slate-400"}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Assignment Status</p>
                      <p className="font-semibold text-foreground">
                        {employee.isAssign ? "Assigned / Active" : "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        {editOpen && (
          <EmployeeEditDialog
            employee={employee}
            initialUsername={user?.username ?? ""}
            initialEmail={user?.email ?? ""}
            onClose={() => {
              setEditOpen(false);
              void refetch();
            }}
          />
        )}
      </div>
    </div>
  );
}
