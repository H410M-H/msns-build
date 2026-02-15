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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2, Calendar } from "lucide-react";

export default function ExamManagementPage() {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form states for new exam
  const [newExamData, setNewExamData] = useState({
    examType: "MIDTERM" as const,
    totalMarks: 100,
    passingMarks: 40,
    startDate: "",
    endDate: "",
  });

  // API queries
  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: examsForSession, refetch: refetchExams } =
    api.exam.getExamsForSession.useQuery(
      { sessionId: selectedSession },
      { enabled: !!selectedSession }
    );

  const { data: classes } = api.class.getClasses.useQuery();

  // API mutations
  const createExamMutation = api.exam.createExam.useMutation();
  const deleteExamMutation = api.exam.deleteExam.useMutation();
  const utils = api.useUtils();

  const handleCreateExam = async () => {
    if (!selectedSession || !selectedClass) {
      alert("Please select session and class");
      return;
    }

    try {
      await createExamMutation.mutateAsync({
        sessionId: selectedSession,
        classId: selectedClass,
        examTypeEnum: newExamData.examType,
        startDate: new Date(newExamData.startDate),
        endDate: new Date(newExamData.endDate),
        totalMarks: newExamData.totalMarks,
        passingMarks: newExamData.passingMarks,
      });

      await refetchExams();
      setShowCreateDialog(false);
      setNewExamData({
        examType: "MIDTERM",
        totalMarks: 100,
        passingMarks: 40,
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create exam");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExamMutation.mutateAsync({ examId });
        await refetchExams();
      } catch (error) {
        alert("Failed to delete exam");
      }
    }
  };

  const handlePromotionCheck = async (classId: string, examId: string) => {
    try {
      const result = await utils.promotion.canPromoteClass.fetch({
        fromClassId: classId,
        fromSessionId: selectedSession,
        examIdForCheck: examId,
      });
      
      alert(
        `Total: ${result.totalStudents}, Passed: ${result.passedStudents}, Failed: ${result.failedStudents}`
      );
    } catch (error) {
      alert("Failed to check promotion status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "ONGOING":
        return "bg-amber-100 text-amber-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/exams", label: "Exam Management" },
        ]}
      />

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Exams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
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
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
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

            <div className="flex items-end">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
                    <DialogDescription>
                      Add a new exam for the selected class and session
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Exam Type</Label>
                      <Select
                        value={newExamData.examType}
                        onValueChange={(value: any) =>
                          setNewExamData({ ...newExamData, examType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MIDTERM">Mid-Term</SelectItem>
                          <SelectItem value="FINAL">Final</SelectItem>
                          <SelectItem value="PHASE_1">Phase 1</SelectItem>
                          <SelectItem value="PHASE_2">Phase 2</SelectItem>
                          <SelectItem value="PHASE_3">Phase 3</SelectItem>
                          <SelectItem value="PHASE_4">Phase 4</SelectItem>
                          <SelectItem value="PHASE_5">Phase 5</SelectItem>
                          <SelectItem value="PHASE_6">Phase 6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Total Marks</Label>
                        <Input
                          type="number"
                          value={newExamData.totalMarks}
                          onChange={(e) =>
                            setNewExamData({
                              ...newExamData,
                              totalMarks: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Passing Marks</Label>
                        <Input
                          type="number"
                          value={newExamData.passingMarks}
                          onChange={(e) =>
                            setNewExamData({
                              ...newExamData,
                              passingMarks: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={newExamData.startDate}
                          onChange={(e) =>
                            setNewExamData({
                              ...newExamData,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={newExamData.endDate}
                          onChange={(e) =>
                            setNewExamData({
                              ...newExamData,
                              endDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateExam}
                      disabled={createExamMutation.isPending}
                      className="w-full"
                    >
                      {createExamMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Exam"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      {examsForSession && examsForSession.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exams</CardTitle>
            <CardDescription>
              All exams for {selectedSession ? "selected session" : "all sessions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examsForSession.map((exam: any) => (
                    <TableRow key={exam.examId}>
                      <TableCell className="font-medium">
                        {exam.examTypeEnum}
                      </TableCell>
                      <TableCell>
                        {exam.Grades.grade} {exam.Grades.section}
                      </TableCell>
                      <TableCell>
                        {new Date(exam.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(exam.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {exam.passingMarks}/{exam.totalMarks}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handlePromotionCheck(exam.classId, exam.examId)
                          }
                        >
                          Check Promotion
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteExam(exam.examId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {selectedSession && examsForSession?.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No exams found for the selected session. Create one to get started.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
