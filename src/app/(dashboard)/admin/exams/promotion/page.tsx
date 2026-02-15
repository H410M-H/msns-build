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
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { AlertCircle, CheckCircle2, Loader2, Users } from "lucide-react";

export default function PromotionManagementPage() {
  const [selectedFromSession, setSelectedFromSession] = useState<string>("");
  const [selectedToSession, setSelectedToSession] = useState<string>("");
  const [selectedFromClass, setSelectedFromClass] = useState<string>("");
  const [selectedToClass, setSelectedToClass] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionResult, setPromotionResult] = useState<any>(null);

  // API queries
  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: classes } = api.class.getClasses.useQuery();

  const { data: examsForSession } = api.exam.getExamsForSession.useQuery(
    { sessionId: selectedFromSession },
    { enabled: !!selectedFromSession }
  );

  const { data: promotionCheck } = api.promotion.canPromoteClass.useQuery(
    {
      fromClassId: selectedFromClass,
      fromSessionId: selectedFromSession,
      examIdForCheck: selectedExam,
    },
    { enabled: !!selectedFromClass && !!selectedFromSession && !!selectedExam }
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
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/exams", label: "Exams" },
          { href: "/admin/exams/promotion", label: "Student Promotion" },
        ]}
      />

      {/* Promotion Success Alert */}
      {promotionResult && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>{promotionResult.promotedCount}</strong> students promoted successfully!
            {promotionResult.failedCount > 0 && (
              <> {promotionResult.failedCount} students could not be promoted.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Promotion Form */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Promotion</CardTitle>
          <CardDescription>
            Promote students who passed the final exam to the next class
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Details */}
          <div>
            <h3 className="mb-4 font-semibold">From (Current Class)</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Session</label>
                <Select
                  value={selectedFromSession}
                  onValueChange={setSelectedFromSession}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((session: any) => (
                      <SelectItem key={session.sessionId} value={session.sessionId}>
                        {session.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select
                  value={selectedFromClass}
                  onValueChange={setSelectedFromClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls: any) => (
                      <SelectItem key={cls.classId} value={cls.classId}>
                        {cls.grade} {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Final Exam</label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {examsForSession?.map((exam: any) => (
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
                  <label className="text-sm font-medium">Status</label>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p>
                      <strong>{promotionCheck.passedStudents}</strong> of{" "}
                      <strong>{promotionCheck.totalStudents}</strong> can be promoted
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* To Details */}
          <div>
            <h3 className="mb-4 font-semibold">To (New Class)</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Session</label>
                <Select
                  value={selectedToSession}
                  onValueChange={setSelectedToSession}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((session: any) => (
                      <SelectItem key={session.sessionId} value={session.sessionId}>
                        {session.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Class</label>
                <Select
                  value={selectedToClass}
                  onValueChange={setSelectedToClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls: any) => (
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
            <div className="rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{promotionCheck.totalStudents}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Passed (Eligible)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {promotionCheck.passedStudents}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed (Ineligible)</p>
                  <p className="text-2xl font-bold text-red-600">
                    {promotionCheck.failedStudents}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Can Promote</p>
                  <Badge className={promotionCheck.canPromote ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {promotionCheck.canPromote ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Promotion Button */}
          <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="w-full"
                disabled={!promotionCheck?.canPromote}
              >
                <Users className="mr-2 h-4 w-4" />
                Promote {promotionCheck?.passedStudents || 0} Students
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Promotion</DialogTitle>
                <DialogDescription>
                  You are about to promote{" "}
                  <strong>{promotionCheck?.passedStudents}</strong> students from{" "}
                  <strong>
                    {classes?.find((c: any) => c.classId === selectedFromClass)?.grade}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {classes?.find((c: any) => c.classId === selectedToClass)?.grade}
                  </strong>
                  . This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Students who failed will remain in their current class.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPromotionDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBatchPromotion}
                    disabled={batchPromoteMutation.isPending}
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

      {/* Promotion History */}
      {promotionHistoryQuery.data && promotionHistoryQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Promotions</CardTitle>
            <CardDescription>
              History of student promotions for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Student Name</TableHead>
                    <TableHead>From Class</TableHead>
                    <TableHead>To Class</TableHead>
                    <TableHead>Promoted By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotionHistoryQuery.data.map((promo: any) => (
                    <TableRow key={promo.promotionHistoryId}>
                      <TableCell className="font-medium">
                        {promo.Students.studentName}
                      </TableCell>
                      <TableCell>
                        {promo.FromGrades.grade} {promo.FromGrades.section}
                      </TableCell>
                      <TableCell>
                        {promo.ToGrades.grade} {promo.ToGrades.section}
                      </TableCell>
                      <TableCell>{promo.Employees.employeeName}</TableCell>
                      <TableCell>
                        {new Date(promo.promotedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
