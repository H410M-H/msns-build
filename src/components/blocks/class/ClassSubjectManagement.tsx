"use client";

import { useState } from "react";
import { BookOpen, Users, Loader2, Edit, Trash2, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";

export function ClassSubjectManagement({
  classId,
  sessionId,
}: {
  classId: string;
  sessionId: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const utils = api.useUtils();

  // Fetch all subjects
  const { data: allSubjects = [], isLoading: subjectsLoading } =
    api.subject.getAllSubjects.useQuery();

  // Fetch all employees
  const { data: allEmployees = [], isLoading: employeesLoading } =
    api.employee.getEmployees.useQuery();

  // Fetch class subjects
  const { data: classSubjects = [], refetch: refetchClassSubjects } =
    api.subject.getSubjectsByClass.useQuery({ classId, sessionId });

  // Get subjects not yet assigned
  const availableSubjects = allSubjects.filter(
    (subject) => !classSubjects.some((cs) => cs.Subject.subjectId === subject.subjectId)
  );

  // Mutation to assign subject to class
  const assignSubject = api.subject.assignSubjectToClass.useMutation({
    onSuccess: () => {
      toast.success("Subject assigned successfully");
      void refetchClassSubjects();
      void utils.subject.getSubjectsByClass.invalidate({ classId, sessionId });
      setSelectedSubject("");
      setSelectedEmployee("");
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign subject");
    },
  });

  // Mutation to remove subject from class
  const removeSubject = api.subject.removeSubjectFromClass.useMutation({
    onSuccess: () => {
      toast.success("Subject removed successfully");
      void refetchClassSubjects();
      void utils.subject.getSubjectsByClass.invalidate({ classId, sessionId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove subject");
    },
  });

  const handleAssign = async () => {
    if (!selectedSubject || !selectedEmployee) {
      toast.error("Please select both a subject and an employee");
      return;
    }

    try {
      await assignSubject.mutateAsync({
        classId,
        subjectId: selectedSubject,
        employeeId: selectedEmployee,
        sessionId,
      });
    } catch (error) {
      console.error("Assignment error:", error);
    }
  };

  const handleUnassign = async (classSubjectId: string) => {
    if (
      window.confirm("Are you sure you want to remove this subject from the class?")
    ) {
      try {
        await removeSubject.mutateAsync({
          csId: classSubjectId,
        });
      } catch (error) {
        console.error("Removal error:", error);
      }
    }
  };

  return (
    <Card className="rounded-2xl border-border bg-card shadow-2xl duration-500 animate-in fade-in md:mt-4">
      <CardHeader className="border-b border-border pb-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5" />
              Class Subjects
            </CardTitle>
            <CardDescription className="mt-1">
              Manage subjects and teacher assignments for this class.
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Assign Subject
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Subject to Class</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  {subjectsLoading ? (
                    <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : availableSubjects.length === 0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      All subjects already assigned to this class
                    </div>
                  ) : (
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjects.map((subject) => (
                          <SelectItem key={subject.subjectId} value={subject.subjectId}>
                            {subject.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Teacher</Label>
                  {employeesLoading ? (
                    <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : allEmployees.length === 0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      No employees available
                    </div>
                  ) : (
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {allEmployees.map((employee) => (
                          <SelectItem key={employee.employeeId} value={employee.employeeId}>
                            <div className="flex flex-col">
                              <span>{employee.employeeName}</span>
                              {employee.designation && (
                                <span className="text-xs text-muted-foreground">
                                  {employee.designation}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssign}
                    disabled={
                      !selectedSubject ||
                      !selectedEmployee ||
                      assignSubject.isPending
                    }
                    className="flex-1"
                  >
                    {assignSubject.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="pt-6 md:px-8">
        {classSubjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-20" />
            No subjects assigned to this class yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classSubjects.map((classSubject) => (
              <Card
                key={classSubject.csId}
                className="overflow-hidden border-l-4 border-l-blue-500"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {classSubject.Subject.subjectName}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {classSubject.Employees.employeeName}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {classSubject.Subject.description && (
                    <p className="mb-3 text-sm text-foreground">
                      {classSubject.Subject.description}
                    </p>
                  )}
                  {classSubject.Subject.book && (
                    <Badge variant="outline" className="mb-3 block text-xs">
                      📖 {classSubject.Subject.book}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnassign(classSubject.csId)}
                    disabled={removeSubject.isPending}
                    className="w-full text-xs hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
