"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Users, FileCheck, Save, CalendarIcon, Loader2 } from "lucide-react";

import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/hooks/use-toast";

interface ClassAttendanceTabProps {
  classId: string;
  sessionId: string;
}

type AttendanceStatus = "P" | "A" | "L";

export function ClassAttendanceTab({
  classId,
  sessionId,
}: ClassAttendanceTabProps) {
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({});

  const utils = api.useUtils();

  const { data: studentsData, isLoading: studentsLoading } =
    api.allotment.getStudentsByClassAndSession.useQuery({
      classId,
      sessionId,
    });

  const {
    data: existingAttendance,
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
  } = api.attendance.getStudentAttendanceByClass.useQuery(
    {
      classId,
      sessionId,
      date,
    },
    {
      enabled: !!date,
    },
  );

  const markAttendanceMutation =
    api.attendance.markStudentAttendance.useMutation({
      onSuccess: async () => {
        toast({ title: "Success", description: "Attendance records saved." });
        await utils.attendance.getStudentAttendanceByClass.invalidate({
          classId,
          sessionId,
          date,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const students = useMemo(
    () => studentsData?.data ?? [],
    [studentsData?.data],
  );

  useEffect(() => {
    if (existingAttendance && students.length > 0 && !attendanceFetching) {
      const newState: Record<
        string,
        { status: AttendanceStatus; remarks: string }
      > = {};
      students.forEach((allotment) => {
        const studentId = allotment.Students.studentId;
        const existingRecord = existingAttendance.find(
          (a) => a.studentId === studentId,
        );
        if (existingRecord) {
          newState[studentId] = {
            status: existingRecord.status as AttendanceStatus,
            remarks: existingRecord.remarks ?? "",
          };
        } else {
          newState[studentId] = { status: "P", remarks: "" }; // default to Present
        }
      });
      setAttendanceState(newState);
    }
  }, [existingAttendance, students, attendanceFetching]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { status, remarks: prev[studentId]?.remarks ?? "" },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { status: prev[studentId]?.status ?? "P", remarks },
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newState = { ...attendanceState };
    students.forEach((allotment) => {
      const studentId = allotment.Students?.studentId;
      if (!studentId) return;

      const studentState = newState[studentId];
      if (studentState) {
        studentState.status = status;
      }
    });
    setAttendanceState(newState);
  };

  const handleSave = async () => {
    const records = Object.entries(attendanceState).map(
      ([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks,
      }),
    );

    if (records.length === 0) return;

    await markAttendanceMutation.mutateAsync({
      classId,
      sessionId,
      date,
      records,
    });
  };

  const isLoading = studentsLoading || attendanceLoading;

  return (
    <Card className="rounded-2xl border-border bg-card shadow-2xl md:mt-4">
      <CardHeader className="border-b border-border pb-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-emerald-400">
              <FileCheck className="h-5 w-5" />
              Daily Attendance
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Mark student attendance for the selected date.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5 text-sm">
              <CalendarIcon className="ml-1 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mr-2 border-none bg-transparent text-foreground outline-none"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 md:px-8">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-8 w-8 opacity-20" />
            No students allotted to this class yet.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-border bg-card text-emerald-400 hover:bg-card hover:text-emerald-300"
                onClick={() => markAll("P")}
              >
                Mark All Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border bg-card text-red-400 hover:bg-card hover:text-red-300"
                onClick={() => markAll("A")}
              >
                Mark All Absent
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-card text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Reg. No</th>
                      <th className="px-4 py-3 text-center font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((allotment) => {
                      const student = allotment.Students;
                      const state = attendanceState[student.studentId] ?? {
                        status: "P",
                        remarks: "",
                      };

                      return (
                        <tr
                          key={student.studentId}
                          className="border-b border-border transition-colors last:border-0 hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">
                              {student.studentName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.fatherName}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            ---{" "}
                            {/* Could not find reg no in current relation quickly */}
                          </td>
                          <td className="min-w-[140px] px-4 py-3">
                            <Select
                              value={state.status}
                              onValueChange={(val: AttendanceStatus) =>
                                handleStatusChange(student.studentId, val)
                              }
                            >
                              <SelectTrigger
                                className={`h-8 w-full ${state.status === "P" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : state.status === "A" ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-amber-500/30 bg-amber-500/10 text-amber-400"}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-border bg-card text-foreground">
                                <SelectItem
                                  value="P"
                                  className="text-emerald-400 focus:bg-emerald-500/20"
                                >
                                  Present
                                </SelectItem>
                                <SelectItem
                                  value="A"
                                  className="text-red-400 focus:bg-red-500/20"
                                >
                                  Absent
                                </SelectItem>
                                <SelectItem
                                  value="L"
                                  className="text-amber-400 focus:bg-amber-500/20"
                                >
                                  Leave
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              placeholder="Optional note..."
                              value={state.remarks}
                              onChange={(e) =>
                                handleRemarksChange(
                                  student.studentId,
                                  e.target.value,
                                )
                              }
                              className="h-8 border-border bg-card text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={markAttendanceMutation.isPending}
                className="bg-emerald-600 text-foreground hover:bg-emerald-500"
              >
                {markAttendanceMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Register
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
