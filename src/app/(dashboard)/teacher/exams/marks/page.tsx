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
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";

export default function MarksUploadPage() {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [marksData, setMarksData] = useState<
    Array<{ studentId: string; studentName: string; admissionNumber: string; obtainedMarks: number }>
  >([]);

  // API queries
  const { data: sessions, isLoading: sessionsLoading } = api.session.getSessions.useQuery();
  
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

  const handleMarksChange = (
    index: number,
    value: string
  ) => {
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
      // Group marks by class subject
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

    // Load students for this class
    if (classStudents?.data) {
      setMarksData(
        classStudents.data.map((student: any) => ({
          studentId: student.studentId,
          studentName: student.studentName,
          admissionNumber: student.admissionNumber,
          obtainedMarks: 0,
        }))
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbs={[
          { href: "/teacher", label: "Teacher" },
          { href: "/teacher/exams", label: "Exams" },
          { href: "/teacher/exams/marks", label: "Upload Marks" },
        ]}
      />

      {/* Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam Details</CardTitle>
          <CardDescription>
            Choose session, class, exam, and subject to upload marks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Session Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Session</label>
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

            {/* Exam Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {examsForSession?.map((exam: any) => (
                    <SelectItem key={exam.examId} value={exam.examId}>
                      {exam.examTypeEnum} - {exam.Grades.grade}
                      {exam.Grades.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {examsForSession?.map((exam: any) => (
                    <SelectItem key={exam.classId} value={exam.classId}>
                      {exam.Grades.grade} {exam.Grades.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Subject assigned"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleLoadStudents} className="w-full">
            Load Students for This Class
          </Button>
        </CardContent>
      </Card>

      {/* Marks Entry Section */}
      {marksData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Student Marks</CardTitle>
            <CardDescription>
              Enter obtained marks for each student (out of {examDetails?.totalMarks || 100})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Marks Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission Number</TableHead>
                    <TableHead className="w-32">Obtained Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marksData.map((mark, index) => (
                    <TableRow key={mark.studentId}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{mark.studentName}</TableCell>
                      <TableCell>{mark.admissionNumber}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={examDetails?.totalMarks || 100}
                          value={mark.obtainedMarks}
                          onChange={(e) => handleMarksChange(index, e.target.value)}
                          className="w-24"
                          placeholder="0"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Validation Info */}
            <div className="grid grid-cols-3 gap-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Total Students: <strong>{marksData.length}</strong>
                </AlertDescription>
              </Alert>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Marks Entered: <strong>{marksData.filter((m) => m.obtainedMarks > 0).length}</strong>
                </AlertDescription>
              </Alert>
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Pending: <strong>{marksData.filter((m) => m.obtainedMarks === 0).length}</strong>
                </AlertDescription>
              </Alert>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUploadMarks}
              disabled={uploadMarksMutation.isPending || marksData.length === 0}
              className="w-full"
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
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {uploadMarksMutation.isSuccess && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {uploadMarksMutation.data?.message}
          </AlertDescription>
        </Alert>
      )}

      {uploadMarksMutation.isError && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to upload marks. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
