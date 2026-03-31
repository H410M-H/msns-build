"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  CalendarDays,
  Search,
  Save,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
type Designation =
  | "PRINCIPAL"
  | "ADMIN"
  | "HEAD"
  | "CLERK"
  | "TEACHER"
  | "WORKER";

export default function MarkEmployeeAttendancePage() {
  const [selectedDesignation, setSelectedDesignation] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] ?? "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceData, setAttendanceData] = useState<
    Record<
      string,
      {
        status: AttendanceStatus;
        notes: string;
        checkInTime?: string;
        checkOutTime?: string;
      }
    >
  >({});

  const { data: employees } = api.employee.getEmployeesByDesignation.useQuery(
    { designation: selectedDesignation as Designation },
    { enabled: !!selectedDesignation },
  );

  const markAttendanceMutation =
    api.attendance.addEmployeeAttendance.useMutation({
      onSuccess: () => {
        toast.success("Employee attendance marked successfully!");
        setAttendanceData({});
      },
      onError: (error) => {
        toast.error(`Failed to mark attendance: ${error.message}`);
      },
    });

  const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        status,
        notes: prev[employeeId]?.notes ?? "",
        checkInTime: prev[employeeId]?.checkInTime,
        checkOutTime: prev[employeeId]?.checkOutTime,
      },
    }));
  };

  const handleNotesChange = (employeeId: string, notes: string) => {
    setAttendanceData((prev) => {
      const existing = prev[employeeId];
      if (!existing) return prev; // do not update if no status set yet
      return {
        ...prev,
        [employeeId]: { ...existing, notes },
      };
    });
  };

  const handleTimeChange = (
    employeeId: string,
    field: "checkInTime" | "checkOutTime",
    time: string,
  ) => {
    setAttendanceData((prev) => {
      const existing = prev[employeeId];
      if (!existing) return prev; // do not update if no status set yet
      return {
        ...prev,
        [employeeId]: { ...existing, [field]: time },
      };
    });
  };

  const handleSubmit = () => {
    if (!selectedDesignation) {
      toast.error("Please select a designation");
      return;
    }

    const attendanceRecords = Object.entries(attendanceData).map(
      ([employeeId, data]) => ({
        employeeId,
        date: selectedDate,
        status: data.status,
        notes: data.notes,
        timeSlot:
          data.checkInTime && data.checkOutTime
            ? "both"
            : data.checkInTime
              ? "checkin"
              : data.checkOutTime
                ? "checkout"
                : "none",
        checkInTime: data.checkInTime
          ? `${selectedDate}T${data.checkInTime}`
          : undefined,
        checkOutTime: data.checkOutTime
          ? `${selectedDate}T${data.checkOutTime}`
          : undefined,
      }),
    );

    attendanceRecords.forEach((record) => {
      return markAttendanceMutation.mutate(record);
    });
  };

  const filteredEmployees = employees?.filter(
    (employee) =>
      employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "ABSENT":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "LATE":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "EXCUSED":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "LATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "EXCUSED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const designations = [
    { value: "PRINCIPAL", label: "Principal" },
    { value: "ADMIN", label: "Admin" },
    { value: "HEAD", label: "Head" },
    { value: "CLERK", label: "Clerk" },
    { value: "TEACHER", label: "Teacher" },
    { value: "WORKER", label: "Worker" },
  ];

  return (
    <div className="container mx-auto min-h-screen space-y-6 bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Mark Employee Attendance
          </h1>
          <p className="mt-2 text-slate-600">
            Record daily attendance for staff members by designation
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <CalendarDays className="mr-1 h-3 w-3" />
          {new Date(selectedDate).toLocaleDateString()}
        </Badge>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">
            Select Department & Date
          </CardTitle>
          <CardDescription>
            Choose the designation and date to mark attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Select
                value={selectedDesignation}
                onValueChange={setSelectedDesignation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((designation) => (
                    <SelectItem
                      key={designation.value}
                      value={designation.value}
                    >
                      {designation.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search Employees</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDesignation && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800">
                  Employee List
                </CardTitle>
                <CardDescription>
                  {filteredEmployees?.length ?? 0} employees found
                </CardDescription>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={markAttendanceMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Save className="mr-2 h-4 w-4" />
                {markAttendanceMutation.isPending
                  ? "Saving..."
                  : "Save Attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEmployees?.map((employee) => {
                const currentStatus =
                  attendanceData[employee.employeeId]?.status;
                const currentNotes =
                  attendanceData[employee.employeeId]?.notes ?? "";
                const checkInTime =
                  attendanceData[employee.employeeId]?.checkInTime ?? "";
                const checkOutTime =
                  attendanceData[employee.employeeId]?.checkOutTime ?? "";

                return (
                  <div
                    key={employee.employeeId}
                    className="rounded-lg border bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 font-semibold text-foreground">
                          {employee.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {employee.employeeName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {employee.registrationNumber}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            <Briefcase className="mr-1 h-3 w-3" />
                            {employee.designation}
                          </Badge>
                        </div>
                      </div>
                      {currentStatus && (
                        <Badge className={getStatusColor(currentStatus)}>
                          {getStatusIcon(currentStatus)}
                          <span className="ml-1">{currentStatus}</span>
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <Label className="mb-2 block text-sm font-medium text-slate-700">
                            Attendance Status
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                "PRESENT",
                                "ABSENT",
                                "LATE",
                                "EXCUSED",
                              ] as AttendanceStatus[]
                            ).map((status) => (
                              <Button
                                key={status}
                                variant={
                                  currentStatus === status
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    employee.employeeId,
                                    status,
                                  )
                                }
                                className={
                                  currentStatus === status
                                    ? getStatusColor(status)
                                    : ""
                                }
                              >
                                {getStatusIcon(status)}
                                <span className="ml-1">{status}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {currentStatus === "PRESENT" && (
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <Label
                                htmlFor={`checkin-${employee.employeeId}`}
                                className="text-sm font-medium text-slate-700"
                              >
                                Check In Time
                              </Label>
                              <Input
                                id={`checkin-${employee.employeeId}`}
                                type="time"
                                value={checkInTime}
                                onChange={(e) =>
                                  handleTimeChange(
                                    employee.employeeId,
                                    "checkInTime",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`checkout-${employee.employeeId}`}
                                className="text-sm font-medium text-slate-700"
                              >
                                Check Out Time
                              </Label>
                              <Input
                                id={`checkout-${employee.employeeId}`}
                                type="time"
                                value={checkOutTime}
                                onChange={(e) =>
                                  handleTimeChange(
                                    employee.employeeId,
                                    "checkOutTime",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor={`notes-${employee.employeeId}`}
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Notes (Optional)
                        </Label>
                        <Textarea
                          id={`notes-${employee.employeeId}`}
                          placeholder="Add any notes..."
                          value={currentNotes}
                          onChange={(e) =>
                            handleNotesChange(
                              employee.employeeId,
                              e.target.value,
                            )
                          }
                          className="h-20 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredEmployees?.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-4 h-12 w-12 text-foreground" />
                  <p>No employees found for the selected designation.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
