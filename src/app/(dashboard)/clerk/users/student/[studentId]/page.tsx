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
  Hash
} from "lucide-react";
import Image from "next/image";

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const [editOpen, setEditOpen] = useState(false);

  const { data: student, isLoading, refetch } = api.student.getStudentById.useQuery(
    { studentId },
    { enabled: !!studentId }
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!student) {
    return <div className="p-8 text-center text-slate-400">Student not found</div>;
  }

  const currentClass = student.StudentClass?.[0];

  return (
    <div className="min-h-screen w-full space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 bg-slate-50/50 dark:bg-slate-950">
      
      {/* Header / Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 md:p-10 shadow-2xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
          
          {/* Profile Image */}
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-40 md:w-40 shrink-0 rounded-full border-4 border-slate-800/80 bg-slate-800 shadow-xl overflow-hidden ring-2 ring-emerald-500/30">
            {student.profilePic ? (
              <Image 
                src={student.profilePic} 
                alt={student.studentName} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-700 text-4xl sm:text-5xl font-bold text-slate-400">
                {student.studentName.charAt(0)}
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 text-center md:text-left space-y-3 md:pt-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-xs">{student.studentName}</h1>
              <Badge variant={student.isAssign ? "default" : "destructive"} className="uppercase tracking-wider text-[10px] px-2 py-0.5 shadow-xs">
                {student.isAssign ? "Enrolled" : "Unassigned"}
              </Badge>
            </div>
            
            <p className="text-slate-300 font-medium flex items-center justify-center md:justify-start gap-2 text-base sm:text-lg">
              <Users className="h-5 w-5 text-emerald-400" />
              S/O {student.fatherName}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <Badge variant="outline" className="bg-slate-900/40 text-emerald-300 border-emerald-500/30 px-3 py-1 text-xs sm:text-sm font-mono backdrop-blur-xs">
                <Hash className="mr-2 h-3.5 w-3.5 opacity-70" />
                Reg: {student.registrationNumber}
              </Badge>
              <Badge variant="outline" className="bg-slate-900/40 text-blue-300 border-blue-500/30 px-3 py-1 text-xs sm:text-sm font-mono backdrop-blur-xs">
                <Hash className="mr-2 h-3.5 w-3.5 opacity-70" />
                Adm: {student.admissionNumber}
              </Badge>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Button 
              onClick={() => setEditOpen(true)} 
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
              size="lg"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Decorative Background Pattern */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 md:h-96 md:w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal & Academic */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Academic Info Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <InfoItem label="Current Grade" value={currentClass?.Grades.grade ?? "Not Assigned"} />
              <InfoItem label="Section" value={currentClass?.Grades.section ?? "N/A"} />
              <InfoItem label="Session" value={currentClass?.Sessions.sessionName ?? "N/A"} />
              <InfoItem label="Admission Date" value={new Date(student.createdAt).toLocaleDateString()} />
            </CardContent>
          </Card>

          {/* Personal Info Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 pt-6">
              <InfoItem label="Date of Birth" value={student.dateOfBirth} icon={<Calendar className="h-4 w-4" />} />
              <InfoItem label="Gender" value={student.gender} />
              <InfoItem label="Student CNIC" value={student.studentCNIC} icon={<CreditCard className="h-4 w-4" />} />
              <InfoItem label="Caste" value={student.caste} />
              <InfoItem label="Medical Conditions" value={student.medicalProblem ?? "None"} icon={<Activity className="h-4 w-4" />} fullWidth />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contact & Family */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Contact & Family
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Contact Numbers</h4>
                <div className="grid gap-4">
                  <InfoItem label="Student Mobile" value={student.studentMobile} />
                  <InfoItem label="Father Mobile" value={student.fatherMobile} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Family Details</h4>
                <div className="grid gap-4">
                  <InfoItem label="Father Name" value={student.fatherName} />
                  <InfoItem label="Father CNIC" value={student.fatherCNIC} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Address</h4>
                <div className="grid gap-4">
                  <InfoItem label="Current Address" value={student.currentAddress} icon={<MapPin className="h-4 w-4" />} />
                  <InfoItem label="Permanent Address" value={student.permanentAddress} />
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
  fullWidth = false 
}: { 
  label: string; 
  value: string | null | undefined; 
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${fullWidth ? "col-span-full" : ""}`}>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
        {icon && <span className="opacity-70">{icon}</span>} {label}
      </p>
      <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-200 wrap-break-word leading-snug">
        {value && value !== "none" ? value : <span className="text-slate-400 dark:text-slate-600 italic text-sm">Not Provided</span>}
      </p>
    </div>
  );
}

// Skeleton Loader
function ProfileSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="h-48 sm:h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl bg-white dark:bg-slate-900" />
          <Skeleton className="h-72 w-full rounded-2xl bg-white dark:bg-slate-900" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-2xl bg-white dark:bg-slate-900" />
      </div>
    </div>
  );
}