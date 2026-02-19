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
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardEdit,
  Filter,
  Loader2,
  TableIcon,
  Upload,
  Users,
  Clock,
} from "lucide-react";

// Define local interfaces for data structures to avoid 'any'
interface Session {
  sessionId: string;
  sessionName: string;
}

interface Grade {
  grade: string;
  section: string;
}

interface Exam {
  examId: string;
  examTypeEnum: string;
  classId: string;
  Grades: Grade;
}

interface StudentData {
  studentId: string;
  studentName: string;
  admissionNumber: string;
}

export default function MarksUploadPage() {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [marksData, setMarksData] = useState<
    Array<{
      studentId: string;
      studentName: string;
      admissionNumber: string;
      obtainedMarks: number;
    }>
  >([]);

  // API queries
  const { data: sessions } = api.session.getSessions.useQuery();

  const { data: examsForSession } = api.exam.getExamsForSession.useQuery(
    { sessionId: selectedSession },
    { enabled: !!selectedSession }
  );

  const { data: examDetails } = api.exam.getExamDetails.useQuery(
    { examId: selectedExam },
    { enabled: !!selectedExam }
  );

  const { data: classStudents } = api.student.getUnAllocateStudents.useQuery(
    { page: 1, pageSize: 1000 },
    { enabled: !!selectedClass }
  );

  // API mutations
  const uploadMarksMutation = api.marks.uploadMarks.useMutation();

  const handleMarksChange = (index: number, value: string) => {
    const updatedData = [...marksData];
    updatedData[index] = {
      ...updatedData[index]!,
      obtainedMarks: parseFloat(value) || 0,
    };
    setMarksData(updatedData);
  };

  const handleUploadMarks = async () => {
    if (!selectedExam || !selectedSubject || marksData.length === 0) {
      alert("Please select exam, subject and add marks data");
      return;
    }

    try {
      const classSubjectId = selectedSubject;
      await uploadMarksMutation.mutateAsync({
        examId: selectedExam,
        classSubjectId,
        marks: marksData.map((mark) => ({
          studentId: mark.studentId,
          obtainedMarks: mark.obtainedMarks,
        })),
      });

      alert("Marks uploaded successfully!");
      setMarksData([]);
    } catch (error) {
      console.error("Error uploading marks:", error);
      alert("Failed to upload marks");
    }
  };

  const handleLoadStudents = () => {
    if (!selectedClass) {
      alert("Please select a class");
      return;
    }

    if (classStudents?.data) {
      setMarksData(
        classStudents.data.map((student: StudentData) => ({
          studentId: student.studentId,
          studentName: student.studentName,
          admissionNumber: student.admissionNumber,
          obtainedMarks: 0,
        }))
      );
    }
  };

  const enteredCount = marksData.filter((m) => m.obtainedMarks > 0).length;
  const pendingCount = marksData.filter((m) => m.obtainedMarks === 0).length;

  return (
    <div className="w-full space-y-6">
      <PageHeader
        breadcrumbs={[
          { href: "/teacher", label: "Teacher" },
          { href: "/teacher/exams", label: "Exams" },
          { href: "/teacher/exams/marks", label: "Upload Marks" },
        ]}
      />

      {/* --- Header Section --- */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-2 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ClipboardEdit className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Upload{" "}
              <span className="text-emerald-600 dark:text-emerald-500">
                Marks
              </span>
            </h1>
          </div>
          <p className="max-w-xl pl-1 text-sm text-slate-500 dark:text-slate-400">
            Upload marks for your assigned subjects and exams.
          </p>
        </div>
      </div>

      {/* --- Selection Section --- */}
      <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md transition-all dark:border-white/5 dark:bg-slate-900/40 dark:shadow-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-white/5 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Select Exam Details
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Choose session, class, exam, and subject to upload marks
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Session */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Session
              </label>
              <Select
                value={selectedSession}
                onValueChange={setSelectedSession}
              >
                <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
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

            {/* Exam */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Exam
              </label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {examsForSession?.map((exam: Exam) => (
                    <SelectItem key={exam.examId} value={exam.examId}>
                      {exam.examTypeEnum} - {exam.Grades.grade}
                      {exam.Grades.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Class
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {examsForSession?.map((exam: Exam) => (
                    <SelectItem key={exam.classId} value={exam.classId}>
                      {exam.Grades.grade} {exam.Grades.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Subject
              </label>
              <Input
                placeholder="Subject assigned"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <Button
            onClick={handleLoadStudents}
            className="w-full bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20"
          >
            <Users className="mr-2 h-4 w-4" />
            Load Students for This Class
          </Button>
        </CardContent>
      </Card>

      {/* --- Marks Entry Section --- */}
      {marksData.length > 0 && (
        <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md transition-all dark:border-white/5 dark:bg-slate-900/40 dark:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-white/5 dark:bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <TableIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Enter Student Marks
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Enter obtained marks for each student (out of{" "}
                    {examDetails?.totalMarks ?? 100})
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            {/* Marks Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-white/5 dark:bg-black/10">
                    <TableHead className="w-12 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Student Name
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Admission No.
                    </TableHead>
                    <TableHead className="w-32 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Obtained Marks
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marksData.map((mark, index) => (
                    <TableRow
                      key={mark.studentId}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <TableCell className="text-center font-mono text-sm text-slate-400 dark:text-slate-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {mark.studentName}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-300">
                        {mark.admissionNumber}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={examDetails?.totalMarks ?? 100}
                          value={mark.obtainedMarks}
                          onChange={(e) =>
                            handleMarksChange(index, e.target.value)
                          }
                          className="w-24 border-slate-200 bg-white text-center font-mono transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                          placeholder="0"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Stats + Upload */}
            <div className="space-y-4 px-6 pb-6">
              {/* Validation Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-white/5 dark:bg-black/20">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-blue-100 p-1 dark:bg-blue-500/20">
                      <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Total
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {marksData.length}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-emerald-100 p-1 dark:bg-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                      Entered
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {enteredCount}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-500/10 dark:bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-amber-100 p-1 dark:bg-amber-500/20">
                      <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                      Pending
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
                    {pendingCount}
                  </p>
                </div>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUploadMarks}
                disabled={
                  uploadMarksMutation.isPending || marksData.length === 0
                }
                className="w-full bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20"
                size="lg"
              >
                {uploadMarksMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Marks
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- Status Messages --- */}
      {uploadMarksMutation.isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 animate-in fade-in slide-in-from-top-2 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            {uploadMarksMutation.data?.message}
          </p>
        </div>
      )}

      {uploadMarksMutation.isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 animate-in fade-in slide-in-from-top-2 dark:border-red-500/20 dark:bg-red-500/5">
          <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Failed to upload marks. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
