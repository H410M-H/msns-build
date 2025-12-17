"use client"

import { 
  type ColumnDef, 
  getCoreRowModel, 
  useReactTable, 
  getFilteredRowModel,
} from "@tanstack/react-table"
import { useState, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { api } from "~/trpc/react"
import { SubjectCreationDialog } from "../forms/class/SubjectCreation"
import { SubjectAssignmentDialog } from "../forms/class/SubjectAssignment"
import { SubjectDeletionDialog } from "../forms/class/SubjectDeletion"
import AllotmentDialog from "../forms/class/StudentAlotment"
import { toast } from "~/hooks/use-toast"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Input } from "~/components/ui/input"
import Link from "next/link"
import { 
  ReloadIcon, 
} from "@radix-ui/react-icons"
import { 
  Search, 
  Users, 
  BookOpen, 
  Trash2, 
  UserPlus, 
  GraduationCap 
} from "lucide-react"

// --- Types ---
interface StudentClassWithRelations {
  Students: {
    studentId: string
    section?: string
    studentName: string
    fatherName: string
    guardianName?: string | null
  }
  Grades: {
    grade: string
    fee: number
    classId: string
    section: string
  }
  Sessions: {
    sessionName: string
    sessionId: string
  }
  Subject?: {
    subjectName: string
    description?: string
  }
  Employees?: {
    employeeName: string
  }
  csId?: string
}

interface ClassAllotmentTableProps {
  classId: string
  sessionId: string
}

const classColors: Record<string, string> = {
  "1": "bg-blue-100 text-blue-800 border-blue-200",
  "2": "bg-green-100 text-green-800 border-green-200",
  "3": "bg-purple-100 text-purple-800 border-purple-200",
  default: "bg-slate-100 text-slate-800 border-slate-200"
}

export const ClassAllotmentTable = ({ classId, sessionId }: ClassAllotmentTableProps) => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  
  // Dialog States
  const [allotmentOpen, setAllotmentOpen] = useState(false)
  const [subjectCreationOpen, setSubjectCreationOpen] = useState(false)
  const [subjectAssignmentOpen, setSubjectAssignmentOpen] = useState(false)

  const utils = api.useUtils()

  // --- Data Fetching ---
  const { data: studentResult, isLoading: studentsLoading, isRefetching } = api.allotment.getStudentsByClassAndSession.useQuery({
    classId,
    sessionId,
  })
  const students = studentResult?.data ?? []

  const { data: subjects, isLoading: subjectsLoading } = api.subject.getSubjectsByClass.useQuery({ classId, sessionId })

  // --- Mutations ---
  const deleteStudents = api.allotment.deleteStudentsFromClass.useMutation({
    onSuccess: async () => {
      toast({ title: "Students removed", description: "Selected students have been removed from this class." })
      await utils.allotment.invalidate()
      setRowSelection({})
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    },
  })

  // --- Table Configuration ---
  const columns = useMemo<ColumnDef<StudentClassWithRelations>[]>(
    () => [
      {
        id: "select", // Needed for selection logic
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      // Accessors for filtering
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
  )

  const table = useReactTable<StudentClassWithRelations>({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Enables search
    onRowSelectionChange: setRowSelection,
    state: { 
      rowSelection,
      globalFilter, 
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString", // Simple string matching
  })

  const refreshData = async () => {
    await Promise.all([utils.allotment.invalidate(), utils.subject.invalidate()])
  }

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="w-full space-y-6 p-2 sm:p-4 animate-in fade-in duration-500">
      
      {/* --- Header Section (Sticky) --- */}
      <div className="sticky top-2 z-30 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-6 text-white shadow-xl border border-slate-700/50 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-emerald-400" />
              {students.length > 0 ? `Grade ${students[0]?.Grades.grade ?? '?'}` : "Class Details"}
            </h1>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-white/10 text-emerald-300 hover:bg-white/20 backdrop-blur-sm border-0">
                <BookOpen className="mr-1 h-3 w-3" /> {subjects?.length ?? 0} Subjects
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-blue-300 hover:bg-white/20 backdrop-blur-sm border-0">
                <Users className="mr-1 h-3 w-3" /> {students.length} Students
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
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
                <UserPlus className="mr-2 h-4 w-4" /> Allot Student
              </Button>
            </AllotmentDialog>

            <Button 
              size="sm"
              onClick={refreshData} 
              variant="outline" 
              className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <ReloadIcon className={`mr-2 h-4 w-4 ${isRefetching || studentsLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* --- Subjects Section --- */}
      <section className="rounded-xl border border-slate-200 bg-white/50 p-4 sm:p-6 shadow-sm backdrop-blur-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <BookOpen className="h-5 w-5" />
             </div>
             <h2 className="text-xl font-bold text-slate-800">Subjects</h2>
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
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : subjects?.length ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => (
              <div
                key={subject.csId}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-blue-300"
              >
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <SubjectDeletionDialog 
                            csId={subject.csId} 
                            classId={classId} 
                            // Passing the actual subject name for the confirmation dialog
                            subjectName={subject.Subject?.subjectName ?? "Unknown Subject"} 
                        />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{subject.Subject?.subjectName}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">{subject.Subject?.description ?? "No description provided."}</p>
                </div>
                
                {subject.Employees && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                        {subject.Employees.employeeName.charAt(0)}
                    </div>
                    <span className="font-medium truncate">{subject.Employees.employeeName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border-2 border-dashed border-slate-200 py-12 bg-slate-50/50">
            <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                <BookOpen className="h-8 w-8" />
            </div>
            <p className="text-slate-500 font-medium">No subjects assigned yet</p>
            <Button variant="link" onClick={() => setSubjectAssignmentOpen(true)} className="text-blue-600">
                Assign a subject
            </Button>
          </div>
        )}
      </section>

      {/* --- Students Section --- */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <Users className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Enrolled Students</h2>
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
                        className="animate-in fade-in zoom-in"
                    >
                        {deleteStudents.isPending ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Remove ({selectedCount})
                    </Button>
                )}
            </div>

            {/* Toolbar: Search + Select All */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 pl-1">
                        <Checkbox
                            id="select-all"
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        />
                        <label
                            htmlFor="select-all"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                        >
                            Select All
                        </label>
                    </div>
                 </div>

                 <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search student or father..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                 </div>
            </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {studentsLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                onClick={() => row.toggleSelected()}
                className={`
                    group relative rounded-xl border p-4 transition-all cursor-pointer select-none
                    ${row.getIsSelected() 
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md ring-1 ring-emerald-500" 
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
                    }
                `}
              >
                <div className="absolute top-4 right-4">
                     <Checkbox 
                        checked={row.getIsSelected()} 
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        className="data-[state=checked]:bg-emerald-600 border-slate-300" 
                     />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-lg font-bold text-slate-500">
                            {row.original.Students.studentName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 leading-tight">{row.original.Students.studentName}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">S/O {row.original.Students.fatherName}</p>
                        </div>
                    </div>
                  
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100/50">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Class</span>
                            <Badge variant="outline" className={`${classColors[row.original.Grades.grade] ?? classColors.default}`}>
                                Grade {row.original.Grades.grade}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Monthly Fee</span>
                            <span className="font-mono font-medium text-slate-700">Rs. {row.original.Grades.fee.toLocaleString()}</span>
                        </div>
                    </div>

                    <Button 
                        asChild 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-1 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 border border-slate-200"
                        onClick={(e) => e.stopPropagation()} // Prevent triggering selection
                    >
                        <Link href={`/students/${row.original.Students.studentId}`}>View Profile</Link>
                    </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-slate-200 p-12 bg-slate-50/50">
              <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                  <Search className="h-8 w-8" />
              </div>
              <div className="text-center">
                  <p className="text-lg font-medium text-slate-700">No students found</p>
                  <p className="text-sm text-slate-500">{globalFilter ? "Try adjusting your search criteria" : "Enrolled students will appear here"}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}