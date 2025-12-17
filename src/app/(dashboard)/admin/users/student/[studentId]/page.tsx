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
    <div className="min-h-screen w-full space-y-6 p-4 sm:p-6 animate-in fade-in duration-500">
      
      {/* Header / Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 shadow-2xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
          
          {/* Profile Image */}
          <div className="relative h-32 w-32 shrink-0 rounded-full border-4 border-slate-800 bg-slate-800 shadow-xl overflow-hidden">
            {student.profilePic ? (
              <Image 
                src={student.profilePic} 
                alt={student.studentName} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-700 text-3xl font-bold text-slate-400">
                {student.studentName.charAt(0)}
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">{student.studentName}</h1>
              <Badge variant={student.isAssign ? "default" : "destructive"} className="uppercase tracking-wider text-[10px]">
                {student.isAssign ? "Enrolled" : "Unassigned"}
              </Badge>
            </div>
            
            <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              S/O {student.fatherName}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <Badge variant="outline" className="bg-slate-800/50 text-emerald-400 border-emerald-500/30 px-3 py-1">
                <Hash className="mr-2 h-3 w-3" />
                Reg: {student.registrationNumber}
              </Badge>
              <Badge variant="outline" className="bg-slate-800/50 text-blue-400 border-blue-500/30 px-3 py-1">
                <Hash className="mr-2 h-3 w-3" />
                Adm: {student.admissionNumber}
              </Badge>
            </div>
          </div>

          {/* Action Button */}
          <div>
            <Button 
              onClick={() => setEditOpen(true)} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Decorative Background Pattern */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal & Academic */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Academic Info Card */}
          <Card className="bg-white/50 border-slate-200 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Current Grade" value={currentClass?.Grades.grade ?? "Not Assigned"} />
              <InfoItem label="Section" value={currentClass?.Grades.section ?? "N/A"} />
              <InfoItem label="Session" value={currentClass?.Sessions.sessionName ?? "N/A"} />
              <InfoItem label="Admission Date" value={new Date(student.createdAt).toLocaleDateString()} />
            </CardContent>
          </Card>

          {/* Personal Info Card */}
          <Card className="bg-white/50 border-slate-200 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
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
          <Card className="bg-white/50 border-slate-200 shadow-sm backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Phone className="h-5 w-5 text-purple-600" />
                Contact & Family
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Contact Numbers</h4>
                <div className="grid gap-3">
                  <InfoItem label="Student Mobile" value={student.studentMobile} />
                  <InfoItem label="Father Mobile" value={student.fatherMobile} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Family Details</h4>
                <div className="grid gap-3">
                  <InfoItem label="Father Name" value={student.fatherName} />
                  <InfoItem label="Father CNIC" value={student.fatherCNIC} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Address</h4>
                <InfoItem label="Current Address" value={student.currentAddress} icon={<MapPin className="h-4 w-4" />} />
                <InfoItem label="Permanent Address" value={student.permanentAddress} />
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
    <div className={`space-y-1 ${fullWidth ? "col-span-full" : ""}`}>
      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 break-words">
        {value && value !== "none" ? value : <span className="text-slate-400 italic">Not Provided</span>}
      </p>
    </div>
  );
}

// Skeleton Loader
function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-48 rounded-3xl bg-slate-900/5 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    </div>
  );
}