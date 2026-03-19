"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { StudentEditDialog } from "~/components/forms/student/StudentEdit";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  Pencil,
  GraduationCap,
  Activity,
  Hash,
} from "lucide-react";
import Image from "next/image";

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: student,
    isLoading,
    refetch,
  } = api.student.getStudentById.useQuery(
    { studentId },
    { enabled: !!studentId },
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Student not found
      </div>
    );
  }

  const currentClass = student.StudentClass?.[0];

  return (
    <div className="min-h-screen w-full space-y-6 bg-slate-50/50 p-4 duration-500 animate-in fade-in dark:bg-card sm:p-6 lg:p-8">
      {/* Header / Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 shadow-2xl sm:p-8 md:p-10">
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Profile Image */}
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-border bg-muted shadow-xl ring-2 ring-emerald-500/30 sm:h-32 sm:w-32 md:h-40 md:w-40">
            {student.profilePic ? (
              <Image
                src={student.profilePic}
                alt={student.studentName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-700 text-4xl font-bold text-muted-foreground sm:text-5xl">
                {student.studentName.charAt(0)}
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 space-y-3 text-center md:pt-2 md:text-left">
            <div className="flex flex-col items-center gap-3 md:flex-row">
              <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm sm:text-4xl">
                {student.studentName}
              </h1>
              <Badge
                variant={student.isAssign ? "default" : "destructive"}
                className="px-2 py-0.5 text-[10px] uppercase tracking-wider shadow-sm"
              >
                {student.isAssign ? "Enrolled" : "Unassigned"}
              </Badge>
            </div>

            <p className="flex items-center justify-center gap-2 text-base font-medium text-foreground sm:text-lg md:justify-start">
              <Users className="h-5 w-5 text-emerald-400" />
              S/O {student.fatherName}
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-card px-3 py-1 font-mono text-xs text-emerald-300 backdrop-blur-sm sm:text-sm"
              >
                <Hash className="mr-2 h-3.5 w-3.5 opacity-70" />
                Reg: {student.registrationNumber}
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-500/30 bg-card px-3 py-1 font-mono text-xs text-blue-300 backdrop-blur-sm sm:text-sm"
              >
                <Hash className="mr-2 h-3.5 w-3.5 opacity-70" />
                Adm: {student.admissionNumber}
              </Badge>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 w-full md:mt-0 md:w-auto">
            <Button
              onClick={() => setEditOpen(true)}
              className="w-full bg-emerald-600 text-foreground shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 hover:bg-emerald-500 active:scale-95 md:w-auto"
              size="lg"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Decorative Background Pattern */}
        <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl md:h-96 md:w-96" />
        <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Personal & Academic */}
        <div className="space-y-6 lg:col-span-2">
          {/* Academic Info Card */}
          <Card className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 pb-3 dark:border-border">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                  <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
              <InfoItem
                label="Current Grade"
                value={currentClass?.Grades.grade ?? "Not Assigned"}
              />
              <InfoItem
                label="Section"
                value={currentClass?.Grades.section ?? "N/A"}
              />
              <InfoItem
                label="Session"
                value={currentClass?.Sessions.sessionName ?? "N/A"}
              />
              <InfoItem
                label="Admission Date"
                value={new Date(student.createdAt).toLocaleDateString()}
              />
            </CardContent>
          </Card>

          {/* Personal Info Card */}
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
                value={student.dateOfBirth}
                icon={<Calendar className="h-4 w-4" />}
              />
              <InfoItem label="Gender" value={student.gender} />
              <InfoItem
                label="Student CNIC"
                value={student.studentCNIC}
                icon={<CreditCard className="h-4 w-4" />}
              />
              <InfoItem label="Caste" value={student.caste} />
              <InfoItem
                label="Medical Conditions"
                value={student.medicalProblem ?? "None"}
                icon={<Activity className="h-4 w-4" />}
                fullWidth
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contact & Family */}
        <div className="space-y-6">
          <Card className="h-full border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 pb-3 dark:border-border">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                  <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Contact & Family
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="space-y-4">
                <h4 className="border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground dark:border-border">
                  Contact Numbers
                </h4>
                <div className="grid gap-4">
                  <InfoItem
                    label="Student Mobile"
                    value={student.studentMobile}
                  />
                  <InfoItem
                    label="Father Mobile"
                    value={student.fatherMobile}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground dark:border-border">
                  Family Details
                </h4>
                <div className="grid gap-4">
                  <InfoItem label="Father Name" value={student.fatherName} />
                  <InfoItem label="Father CNIC" value={student.fatherCNIC} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground dark:border-border">
                  Address
                </h4>
                <div className="grid gap-4">
                  <InfoItem
                    label="Current Address"
                    value={student.currentAddress}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <InfoItem
                    label="Permanent Address"
                    value={student.permanentAddress}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog - Hidden by default */}
      {editOpen && (
        <StudentEditDialog
          student={student}
          onClose={() => {
            setEditOpen(false);
            void refetch();
          }}
        />
      )}
    </div>
  );
}

// Helper Component for Data Items
function InfoItem({
  label,
  value,
  icon,
  fullWidth = false,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${fullWidth ? "col-span-full" : ""}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
        {icon && <span className="opacity-70">{icon}</span>} {label}
      </p>
      <p className="break-words text-base font-medium leading-snug text-slate-900 dark:text-foreground sm:text-lg">
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

// Skeleton Loader
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
