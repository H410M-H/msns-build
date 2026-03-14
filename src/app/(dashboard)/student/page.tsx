// File: src/app/(dashboard)/student/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  AlertCircle,
  Calendar,
  GraduationCap,
  BookOpen,
  DollarSign,
  FileText,
  ArrowRight,
  Clock,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { api } from "~/trpc/react";
import { TodayAtAGlance } from "~/components/dashboard/TodayAtAGlance";
import { PinnedNotices } from "~/components/dashboard/PinnedNotices";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function FeeStatusWidget() {
  const { data: profile, isLoading: isProfileLoading } = api.student.getProfileByUserId.useQuery();
  const { data: feeData, isLoading: isFeeLoading } = api.fee.getStudentFees.useQuery(
    { studentId: profile?.studentId ?? "" },
    { enabled: !!profile?.studentId }
  );

  const latestClass = profile?.StudentClass?.[0];
  const ledger = feeData?.ledger ?? [];
  const totalPending = ledger.filter((l) => !l.isPaid).length;

  if (isProfileLoading || isFeeLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full bg-muted" />
        <Skeleton className="h-6 w-2/3 bg-muted" />
      </div>
    );
  }

  if (totalPending === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
        <GraduationCap className="h-4 w-4 text-emerald-400" />
        <span className="text-sm text-emerald-300">All fees cleared — No outstanding balance</span>
      </div>
    );
  }

  return (
    <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-200">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Outstanding Fees</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You have {totalPending} pending fee {totalPending === 1 ? "entry" : "entries"} for{" "}
          {latestClass?.Sessions?.sessionName ?? "this session"}.
        </span>
        <Link href="/student/grades">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
          >
            View Details
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}

function AcademicSummaryWidget() {
  const { data: profile, isLoading } = api.student.getProfileByUserId.useQuery();
  const { data: exams } = api.exam.getAllExams.useQuery();

  const latestClass = profile?.StudentClass?.[0];
  const reportCards = profile?.ReportCard ?? [];

  if (isLoading) {
    return (
      <Card className="h-full border-border bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const studentClass = latestClass?.Grades;
  const className = studentClass ? `${studentClass.grade} - ${studentClass.section}` : "Not enrolled";
  const session = latestClass?.Sessions?.sessionName ?? "—";

  const studentExams =
    latestClass
      ? (exams?.filter((e) => e.Grades?.classId === latestClass.classId) ?? [])
      : [];
  const ongoingExams = studentExams.filter((e) => e.status === "ONGOING");
  const scheduledExams = studentExams.filter((e) => e.status === "SCHEDULED");

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <CardTitle>Academic Summary</CardTitle>
          </div>
          <Link href="/student/grades">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View Report <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
        <CardDescription>Current enrollment and exam status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enrollment Info */}
        <div className="rounded-lg border border-border bg-black/10 p-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-semibold text-foreground">{className}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Session</p>
              <p className="font-semibold text-foreground">{session}</p>
            </div>
          </div>
        </div>

        {/* Exam Status */}
        {ongoingExams.length > 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="mb-2 text-xs font-semibold text-amber-400">
              🔔 {ongoingExams.length} Exam{ongoingExams.length > 1 ? "s" : ""} Ongoing
            </p>
            {ongoingExams.slice(0, 2).map((e) => (
              <div key={e.examId} className="flex items-center justify-between py-1">
                <span className="text-xs text-foreground">
                  {e.ExamType?.name ?? e.examTypeEnum}
                </span>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
                  ONGOING
                </Badge>
              </div>
            ))}
          </div>
        )}

        {scheduledExams.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming Exams
            </p>
            {scheduledExams.slice(0, 3).map((e) => {
              const daysLeft = Math.ceil(
                (new Date(e.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              );
              return (
                <div key={e.examId} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <span className="text-xs text-foreground">{e.ExamType?.name ?? e.examTypeEnum}</span>
                  <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px]">
                    {daysLeft}d
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Report Cards */}
        {reportCards.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Past Results
            </p>
            {reportCards.slice(0, 3).map((rc) => (
              <div key={rc.reportCardId} className="flex items-center justify-between py-1">
                <span className="text-xs text-foreground">
                  {new Date(rc.generatedAt).toLocaleDateString("en-PK", { year: "numeric", month: "short" })}
                </span>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                  PASSED
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StudentQuickLinks() {
  const links = [
    { label: "My Grades", href: "/student/grades", icon: GraduationCap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" },
    { label: "Timetable", href: "/student", icon: Calendar, color: "text-blue-400 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20" },
    { label: "Fee Details", href: "/student/grades", icon: DollarSign, color: "text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20" },
    { label: "Subject Diary", href: "/student", icon: BookOpen, color: "text-purple-400 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20" },
    { label: "Report Card", href: "/student/grades", icon: FileText, color: "text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20" },
    { label: "Attendance", href: "/student", icon: Clock, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20" },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.label} href={link.href}>
              <div className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:scale-105 ${link.color}`}>
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  const breadcrumbs = [{ href: "/student", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section: Welcome & Profile */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 lg:col-span-8"
        >
          <WelcomeSection />
          {/* Live fee status from tRPC */}
          <FeeStatusWidget />
          <PinnedNotices />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 lg:col-span-4"
        >
          <ProfileSection />
          <TodayAtAGlance />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Academic Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <AcademicSummaryWidget />
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StudentQuickLinks />
        </motion.div>
      </div>
    </div>
  );
}
