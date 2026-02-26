"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  History,
  Loader2,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

// --- Interfaces ---
interface Session {
  sessionId: string;
  sessionName: string;
}

interface Class {
  classId: string;
  grade: string;
  section: string;
}

interface Exam {
  examId: string;
  examTypeEnum: string;
}

interface PromotionResult {
  promotedCount: number;
  failedCount: number;
}

interface PromotionHistoryItem {
  promotionHistoryId: string;
  promotedAt: string | Date;
  Students: {
    studentName: string;
  };
  FromGrades: {
    grade: string;
    section: string;
  };
  ToGrades: {
    grade: string;
    section: string;
  };
  Employees: {
    employeeName: string;
  };
}

export default function PromotionManagementPage() {
  const [selectedFromSession, setSelectedFromSession] = useState<string>("");
  const [selectedToSession, setSelectedToSession] = useState<string>("");
  const [selectedFromClass, setSelectedFromClass] = useState<string>("");
  const [selectedToClass, setSelectedToClass] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionResult, setPromotionResult] =
    useState<PromotionResult | null>(null);

  // API queries
  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: classes } = api.class.getClasses.useQuery();

  const { data: examsForSession } = api.exam.getExamsForSession.useQuery(
    { sessionId: selectedFromSession },
    { enabled: !!selectedFromSession },
  );

  const { data: promotionCheck } = api.promotion.canPromoteClass.useQuery(
    {
      fromClassId: selectedFromClass,
      fromSessionId: selectedFromSession,
      examIdForCheck: selectedExam,
    },
    { enabled: !!selectedFromClass && !!selectedFromSession && !!selectedExam },
  );

  // API mutations
  const batchPromoteMutation = api.promotion.batchPromoteStudents.useMutation();
  const promotionHistoryQuery = api.promotion.getPromotionHistory.useQuery({
    fromSessionId: selectedFromSession,
    limit: 100,
  });

  const handleBatchPromotion = async () => {
    if (
      !selectedFromSession ||
      !selectedToSession ||
      !selectedFromClass ||
      !selectedToClass ||
      !selectedExam
    ) {
      alert("Please select all required fields");
      return;
    }

    try {
      const result = await batchPromoteMutation.mutateAsync({
        fromSessionId: selectedFromSession,
        toSessionId: selectedToSession,
        fromClassId: selectedFromClass,
        toClassId: selectedToClass,
        examIdForFinalCheck: selectedExam,
      });

      setPromotionResult(result);
      setShowPromotionDialog(false);

      // Refetch promotion history
      await promotionHistoryQuery.refetch();

      // Reset form
      setTimeout(() => {
        setPromotionResult(null);
        setSelectedToClass("");
        setSelectedToSession("");
      }, 3000);
    } catch (error) {
      console.error("Error promoting students:", error);
      alert("Failed to promote students");
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/exams", label: "Exams" },
          { href: "/admin/exams/promotion", label: "Student Promotion" },
        ]}
      />

      {/* --- Header Section --- */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-2 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Student{" "}
              <span className="text-emerald-600 dark:text-emerald-500">
                Promotion
              </span>
            </h1>
          </div>
          <p className="max-w-xl pl-1 text-sm text-muted-foreground dark:text-muted-foreground">
            Promote students who passed their exams to the next class and
            session.
          </p>
        </div>
      </div>

      {/* --- Success Alert --- */}
      {promotionResult && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 animate-in fade-in slide-in-from-top-2 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            <strong>{promotionResult.promotedCount}</strong> students promoted
            successfully!
            {promotionResult.failedCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-300">
                {" "}
                {promotionResult.failedCount} students could not be promoted.
              </span>
            )}
          </p>
        </div>
      )}

      {/* --- Promotion Form --- */}
      <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md transition-all dark:border-border dark:bg-card dark:shadow-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-border dark:bg-black/20">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground">
                Batch Promotion
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground dark:text-muted-foreground">
                Promote students who passed the final exam to the next class
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* From Details */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                From (Current Class)
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                  Session
                </label>
                <Select
                  value={selectedFromSession}
                  onValueChange={setSelectedFromSession}
                >
                  <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((session: Session) => (
                      <SelectItem
                        key={session.sessionId}
                        value={session.sessionId}
                      >
                        {session.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                  Class
                </label>
                <Select
                  value={selectedFromClass}
                  onValueChange={setSelectedFromClass}
                >
                  <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls: Class) => (
                      <SelectItem key={cls.classId} value={cls.classId}>
                        {cls.grade} {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                  Final Exam
                </label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground">
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {examsForSession?.map((exam: Exam) => (
                      <SelectItem key={exam.examId} value={exam.examId}>
                        {exam.examTypeEnum}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Promotion Check Summary */}
              {promotionCheck && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                    Status
                  </label>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-500/20 dark:bg-emerald-500/5">
                    <p className="font-medium text-emerald-800 dark:text-emerald-200">
                      <strong>{promotionCheck.passedStudents}</strong> of{" "}
                      <strong>{promotionCheck.totalStudents}</strong> can be
                      promoted
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* To Details */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                To (New Class)
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                  New Session
                </label>
                <Select
                  value={selectedToSession}
                  onValueChange={setSelectedToSession}
                >
                  <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground">
                    <SelectValue placeholder="Select new session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((session: Session) => (
                      <SelectItem
                        key={session.sessionId}
                        value={session.sessionId}
                      >
                        {session.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                  New Class
                </label>
                <Select
                  value={selectedToClass}
                  onValueChange={setSelectedToClass}
                >
                  <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground">
                    <SelectValue placeholder="Select new class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls: Class) => (
                      <SelectItem key={cls.classId} value={cls.classId}>
                        {cls.grade} {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Promotion Check Details */}
          {promotionCheck && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-border dark:bg-black/20">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-foreground">
                    {promotionCheck.totalStudents}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                    Passed (Eligible)
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {promotionCheck.passedStudents}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
                    Failed (Ineligible)
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {promotionCheck.failedStudents}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                    Can Promote
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1 border font-semibold ${
                      promotionCheck.canPromote
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                    }`}
                  >
                    {promotionCheck.canPromote ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {promotionCheck.canPromote ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Promotion Button */}
          <Dialog
            open={showPromotionDialog}
            onOpenChange={setShowPromotionDialog}
          >
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="w-full bg-emerald-600 text-foreground shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20"
                disabled={!promotionCheck?.canPromote}
              >
                <Users className="mr-2 h-4 w-4" />
                Promote {promotionCheck?.passedStudents ?? 0} Students
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-200 bg-white dark:border-border dark:bg-card">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-foreground">
                  Confirm Promotion
                </DialogTitle>
                <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
                  You are about to promote{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {promotionCheck?.passedStudents}
                  </strong>{" "}
                  students from{" "}
                  <strong className="text-slate-700 dark:text-foreground">
                    {
                      classes?.find(
                        (c: Class) => c.classId === selectedFromClass,
                      )?.grade
                    }
                  </strong>{" "}
                  to{" "}
                  <strong className="text-slate-700 dark:text-foreground">
                    {
                      classes?.find((c: Class) => c.classId === selectedToClass)
                        ?.grade
                    }
                  </strong>
                  . This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/5">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Students who failed will remain in their current class.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPromotionDialog(false)}
                    className="border-slate-200 dark:border-border dark:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBatchPromotion}
                    disabled={batchPromoteMutation.isPending}
                    className="bg-emerald-600 text-foreground hover:bg-emerald-700"
                  >
                    {batchPromoteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Promoting...
                      </>
                    ) : (
                      "Confirm Promotion"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* --- Promotion History --- */}
      {promotionHistoryQuery.data && promotionHistoryQuery.data.length > 0 && (
        <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md transition-all dark:border-border dark:bg-card dark:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-border dark:bg-black/20">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground">
                  Recent Promotions
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground dark:text-muted-foreground">
                  History of student promotions for this session
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                      Student Name
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                      From Class
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                      To Class
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                      Promoted By
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotionHistoryQuery.data.map(
                    (promo: PromotionHistoryItem) => (
                      <TableRow
                        key={promo.promotionHistoryId}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5"
                      >
                        <TableCell className="font-semibold text-slate-900 dark:text-foreground">
                          {promo.Students.studentName}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-foreground">
                          {promo.FromGrades.grade} {promo.FromGrades.section}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-foreground">
                          {promo.ToGrades.grade} {promo.ToGrades.section}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-foreground">
                          {promo.Employees.employeeName}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600 dark:text-foreground">
                          {new Date(promo.promotedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
