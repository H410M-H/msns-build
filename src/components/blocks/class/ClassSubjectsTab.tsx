"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { toast } from "~/hooks/use-toast";
import { BookOpen, Users, Plus, Trash2, Pencil, Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";

interface ClassSubjectsTabProps {
  classId: string;
  sessionId: string;
}

export function ClassSubjectsTab({ classId, sessionId }: ClassSubjectsTabProps) {
  const { data: session } = useSession();
  const isAdminOrHead = ["ADMIN", "HEAD", "PRINCIPAL", "CLERK"].includes(
    session?.user?.accountType ?? ""
  );

  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Edit teacher modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{
    csId: string;
    subjectId: string;
    subjectName: string;
    employeeId: string;
  } | null>(null);
  const [editEmployeeId, setEditEmployeeId] = useState("");

  const utils = api.useUtils();

  const { data: subjects = [], isLoading } = api.class.getAssignedSubjects.useQuery(
    { classId, sessionId },
    { enabled: !!classId && !!sessionId }
  );

  const globalSubjects = api.subject.getAllSubjects.useQuery(undefined, { enabled: open });
  const globalEmployees = api.employee.getEmployees.useQuery(undefined, { enabled: open || editOpen });

  const assignMutation = api.class.assignSubject.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Subject assignment updated successfully." });
      setOpen(false);
      setEditOpen(false);
      setSelectedSubject("");
      setSelectedEmployee("");
      setEditingSubject(null);
      setEditEmployeeId("");
      void utils.class.getAssignedSubjects.invalidate({ classId, sessionId });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeMutation = api.class.removeAssignedSubject.useMutation({
    onSuccess: () => {
      toast({ title: "Removed", description: "Subject removed from class." });
      void utils.class.getAssignedSubjects.invalidate({ classId, sessionId });
    },
  });

  const handleAssign = () => {
    if (!selectedSubject || !selectedEmployee) return;
    assignMutation.mutate({
      classId,
      sessionId,
      subjectId: selectedSubject,
      employeeId: selectedEmployee,
    });
  };

  const handleOpenEdit = (cs: (typeof subjects)[number]) => {
    setEditingSubject({
      csId: cs.csId,
      subjectId: cs.subjectId,
      subjectName: cs.Subject.subjectName,
      employeeId: cs.employeeId,
    });
    setEditEmployeeId(cs.employeeId);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingSubject || !editEmployeeId) return;
    assignMutation.mutate({
      classId,
      sessionId,
      subjectId: editingSubject.subjectId,
      employeeId: editEmployeeId,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white/50 p-4 shadow-sm backdrop-blur-md dark:border-border dark:bg-card/50">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Assigned Subjects
        </h2>
        {isAdminOrHead && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-white">
                <Plus className="h-4 w-4" /> Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Subject to Class</DialogTitle>
                <DialogDescription>
                  Select the subject and the primary teacher responsible for it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  {globalSubjects.isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {globalSubjects.data?.map((s) => (
                          <SelectItem key={s.subjectId} value={s.subjectId}>
                            {s.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  {globalEmployees.isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {globalEmployees.data
                          ?.filter((e) => e.employeeName && e.employeeName.trim() !== "")
                          .map((e) => (
                            <SelectItem key={e.employeeId} value={e.employeeId}>
                              {e.employeeName} ({e.designation})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <footer className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedSubject || !selectedEmployee || assignMutation.isPending}
                >
                  {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
                </Button>
              </footer>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Teacher Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Assigned Teacher</DialogTitle>
            <DialogDescription>
              Change the teacher assigned to{" "}
              <span className="font-semibold text-foreground">
                {editingSubject?.subjectName}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
                {editingSubject?.subjectName}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Teacher</Label>
              {globalEmployees.isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={editEmployeeId} onValueChange={setEditEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {globalEmployees.data
                      ?.filter((e) => e.employeeName && e.employeeName.trim() !== "")
                      .map((e) => (
                        <SelectItem key={e.employeeId} value={e.employeeId}>
                          {e.employeeName} ({e.designation})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <footer className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                !editEmployeeId ||
                editEmployeeId === editingSubject?.employeeId ||
                assignMutation.isPending
              }
            >
              {assignMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </footer>
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead>Subject Code</TableHead>
              <TableHead>Subject Name</TableHead>
              <TableHead>Assigned Teacher</TableHead>
              {isAdminOrHead && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Skeleton className="h-8 w-[200px] mx-auto" />
                </TableCell>
              </TableRow>
            ) : subjects && subjects.length > 0 ? (
              subjects.map((cs) => (
                <TableRow key={cs.csId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {cs.Subject.subjectId}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {cs.Subject.subjectName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium">{cs.Employees.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{cs.Employees.designation}</p>
                      </div>
                    </div>
                  </TableCell>
                  {isAdminOrHead && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cs)}
                          title="Edit Teacher"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMutation.mutate({ csId: cs.csId })}
                          disabled={removeMutation.isPending}
                          title="Remove Subject"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdminOrHead ? 4 : 3} className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p>No subjects assigned to this class yet.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
