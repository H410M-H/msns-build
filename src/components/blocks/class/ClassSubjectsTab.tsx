"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { toast } from "~/hooks/use-toast";
import { BookOpen, Users, Plus, Trash2, Loader2 } from "lucide-react";

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

  const utils = api.useUtils();

  const { data: subjects = [], isLoading } = api.class.getAssignedSubjects.useQuery(
    { classId, sessionId },
    { enabled: !!classId && !!sessionId }
  );

  const globalSubjects = api.subject.getAllSubjects.useQuery(undefined, { enabled: open });
  const globalEmployees = api.employee.getEmployees.useQuery(undefined, { enabled: open });

  const assignMutation = api.class.assignSubject.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Subject assigned to class successfully." });
      setOpen(false);
      setSelectedSubject("");
      setSelectedEmployee("");
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
                        {globalSubjects.data?.map(s => (
                          <SelectItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</SelectItem>
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
                        {globalEmployees.data?.filter(e => e.designation !== "TEACHER" && e.employeeName !== "").map(e => (
                          <SelectItem key={e.employeeId} value={e.employeeId}>{e.employeeName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <footer className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMutation.mutate({ csId: cs.csId })}
                        disabled={removeMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
