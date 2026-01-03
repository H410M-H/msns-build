"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { 
  type ColumnDef, 
  getCoreRowModel, 
  useReactTable, 
  getFilteredRowModel,
} from "@tanstack/react-table";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

// --- Components ---
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Input } from "~/components/ui/input";
import { toast } from "~/hooks/use-toast";

// --- Dialogs ---
import { SubjectCreationDialog } from "../forms/class/SubjectCreation";
import { SubjectAssignmentDialog } from "../forms/class/SubjectAssignment";
import { SubjectDeletionDialog } from "../forms/class/SubjectDeletion";
import AllotmentDialog from "../forms/class/StudentAlotment";

// --- Icons ---
import { 
  Search, 
  Users, 
  BookOpen, 
  Trash2, 
  UserPlus, 
  GraduationCap,
  Banknote,
  Loader,
} from "lucide-react";

// --- Types ---
interface StudentClassWithRelations {
  Students: {
    studentId: string;
    section?: string;
    studentName: string;
    fatherName: string;
    guardianName?: string | null;
  };
  Grades: {
    grade: string;
    fee: number;
    classId: string;
    section: string;
  };
  Sessions: {
    sessionName: string;
    sessionId: string;
  };
  Subject?: {
    subjectName: string;
    description?: string;
  };
  Employees?: {
    employeeName: string;
  };
  csId?: string;
}

interface ClassAllotmentTableProps {
  classId: string;
  sessionId: string;
}

const classColors: Record<string, string> = {
  "1": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "2": "bg-green-500/10 text-green-400 border-green-500/20",
  "3": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  default: "bg-slate-500/10 text-slate-400 border-slate-500/20"
};

export const ClassAllotmentTable = ({ classId, sessionId }: ClassAllotmentTableProps) => {
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Dialog States
  const [allotmentOpen, setAllotmentOpen] = useState(false);
  const [subjectCreationOpen, setSubjectCreationOpen] = useState(false);
  const [subjectAssignmentOpen, setSubjectAssignmentOpen] = useState(false);

  const utils = api.useUtils();

  // --- Data Fetching ---
  const { data: studentResult, isLoading: studentsLoading, isRefetching } = api.allotment.getStudentsByClassAndSession.useQuery({
    classId,
    sessionId,
  });
  const students = studentResult?.data ?? [];

  const { data: subjects, isLoading: subjectsLoading } = api.subject.getSubjectsByClass.useQuery({ classId, sessionId });

  // --- Mutations ---
  const deleteStudents = api.allotment.deleteStudentsFromClass.useMutation({
    onSuccess: async () => {
      toast({ title: "Students removed", description: "Selected students have been removed from this class." });
      await utils.allotment.invalidate();
      setRowSelection({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // --- Table Configuration ---
  const columns = useMemo<ColumnDef<StudentClassWithRelations>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="border-white/20 data-[state=checked]:bg-emerald-600"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-white/20 data-[state=checked]:bg-emerald-600"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "studentName",
        accessorFn: (row) => row.Students.studentName,
      },
      {
        id: "fatherName",
        accessorFn: (row) => row.Students.fatherName,
      },
    ],
    []
  );

  const table = useReactTable<StudentClassWithRelations>({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { 
      rowSelection,
      globalFilter, 
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const refreshData = async () => {
    await Promise.all([utils.allotment.invalidate(), utils.subject.invalidate()]);
  };

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* --- Header Section (Sticky) --- */}
      <div className="sticky top-0 z-30 rounded-xl bg-slate-900/80 p-4 sm:p-6 shadow-xl border border-white/5 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                 <GraduationCap className="h-6 w-6 text-emerald-400" />
              </div>
              {students.length > 0 ? `Grade ${students[0]?.Grades.grade ?? '?'}` : "Class Details"}
            </h1>
            <div className="flex flex-wrap gap-3 pl-1">
              <Badge variant="secondary" className="bg-white/5 text-emerald-300 hover:bg-white/10 border border-white/5">
                <BookOpen className="mr-1.5 h-3 w-3" /> {subjects?.length ?? 0} Subjects
              </Badge>
              <Badge variant="secondary" className="bg-white/5 text-blue-300 hover:bg-white/10 border border-white/5">
                <Users className="mr-1.5 h-3 w-3" /> {students.length} Students
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AllotmentDialog
              classId={classId}
              open={allotmentOpen}
              onOpenChange={setAllotmentOpen}
              sessions={[{ sessionId, sessionName: students[0]?.Sessions.sessionName ?? "" }]}
            >
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border-0">
                <UserPlus className="mr-2 h-4 w-4" /> Allot Student
              </Button>
            </AllotmentDialog>

            <Button 
              size="sm"
              onClick={refreshData} 
              variant="outline" 
              className="bg-slate-900/50 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Loader className={`mr-2 h-4 w-4 ${isRefetching || studentsLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* --- Subjects Section --- */}
      <section className="rounded-xl border border-white/5 bg-slate-900/40 p-4 sm:p-6 shadow-xs backdrop-blur-xs">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                <BookOpen className="h-5 w-5" />
             </div>
             <h2 className="text-xl font-bold text-white">Subjects</h2>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <SubjectCreationDialog open={subjectCreationOpen} onOpenChange={setSubjectCreationOpen} />
            <SubjectAssignmentDialog
              classId={classId}
              open={subjectAssignmentOpen}
              onOpenChange={setSubjectAssignmentOpen} 
              dayOfWeek={"Monday"} 
              lectureNumber={0} 
              sessionId={sessionId}            
            />
          </div>
        </div>

        {subjectsLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />)}
          </div>
        ) : subjects?.length ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => (
              <div
                key={subject.csId}
                className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-slate-900/60 p-5 transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10 hover:-translate-y-1"
              >
                <div>
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <SubjectDeletionDialog 
                            csId={subject.csId} 
                            classId={classId} 
                            subjectName={subject.Subject?.subjectName ?? "Unknown Subject"} 
                        />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{subject.Subject?.subjectName}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 min-h-10">{subject.Subject?.description ?? "No description provided."}</p>
                </div>
                
                {subject.Employees && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-sm text-slate-300">
                    <div className="h-6 w-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                        {subject.Employees.employeeName.charAt(0)}
                    </div>
                    <span className="font-medium truncate">{subject.Employees.employeeName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border-2 border-dashed border-white/10 py-12 bg-white/5">
            <div className="rounded-full bg-slate-900 p-4 border border-white/5 text-slate-500">
                <BookOpen className="h-8 w-8" />
            </div>
            <p className="text-slate-400 font-medium">No subjects assigned yet</p>
            <Button variant="link" onClick={() => setSubjectAssignmentOpen(true)} className="text-blue-400">
                Assign a subject
            </Button>
          </div>
        )}
      </section>

      {/* --- Students Section --- */}
      <section className="rounded-xl border border-white/5 bg-slate-900/40 p-4 sm:p-6 shadow-xs backdrop-blur-xs">
        <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                        <Users className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Enrolled Students</h2>
                </div>
                
                {selectedCount > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteStudents.isPending}
                        onClick={() => {
                        deleteStudents.mutate({
                            studentIds: table.getSelectedRowModel().rows.map((row) => row.original.Students.studentId),
                            classId,
                            sessionId,
                        })
                        }}
                        className="animate-in fade-in zoom-in bg-red-900/50 hover:bg-red-900 border border-red-500/20 text-red-200"
                    >
                        {deleteStudents.isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Remove ({selectedCount})
                    </Button>
                )}
            </div>

            {/* Toolbar: Search + Select All */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <div className="flex items-center space-x-2 pl-1">
                        <Checkbox
                            id="select-all"
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            className="border-white/20 data-[state=checked]:bg-emerald-600"
                        />
                        <label
                            htmlFor="select-all"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                        >
                            Select All
                        </label>
                     </div>
                  </div>

                  <div className="relative w-full sm:max-w-xs group">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                     <Input
                        placeholder="Search student or father..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/50"
                     />
                  </div>
            </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {studentsLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl bg-white/5" />)
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                onClick={() => row.toggleSelected()}
                className={cn(
                  "group relative rounded-xl border p-4 transition-all cursor-pointer select-none overflow-hidden",
                  row.getIsSelected() 
                    ? "border-emerald-500 bg-emerald-900/20 shadow-lg ring-1 ring-emerald-500/50" 
                    : "border-white/5 bg-slate-900/40 hover:border-emerald-500/30 hover:shadow-md hover:bg-slate-900/60"
                )}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 right-4 z-10">
                      <Checkbox 
                         checked={row.getIsSelected()} 
                         onCheckedChange={(value) => row.toggleSelected(!!value)}
                         className="border-white/20 data-[state=checked]:bg-emerald-600" 
                      />
                </div>

                <div className="flex flex-col gap-4">
                    {/* Student Info Header */}
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-lg font-bold text-slate-400 group-hover:text-white transition-colors">
                            {row.original.Students.studentName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">{row.original.Students.studentName}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">S/O {row.original.Students.fatherName}</p>
                        </div>
                    </div>
                  
                    {/* Details */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Class</span>
                            <Badge variant="outline" className={cn("border-white/10 text-xs", classColors[row.original.Grades.grade] ?? classColors.default)}>
                                Grade {row.original.Grades.grade}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Monthly Fee</span>
                            <div className="flex items-center gap-1 font-mono font-medium text-emerald-400">
                                <Banknote className="h-3 w-3" />
                                <span>{row.original.Grades.fee.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <Button 
                        asChild 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <Link href={`/admin/users/student/${row.original.Students.studentId}`}>View Profile</Link>
                    </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-white/10 p-12 bg-white/5">
              <div className="rounded-full bg-slate-900 p-4 border border-white/5 text-slate-600">
                  <Search className="h-8 w-8" />
              </div>
              <div className="text-center">
                  <p className="text-lg font-medium text-white">No students found</p>
                  <p className="text-sm text-slate-500">{globalFilter ? "Try adjusting your search criteria" : "Enrolled students will appear here"}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}