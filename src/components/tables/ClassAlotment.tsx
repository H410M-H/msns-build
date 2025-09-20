"use client"

import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { api } from "~/trpc/react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { SubjectCreationDialog } from "../forms/class/SubjectCreation"
import { SubjectAssignmentDialog } from "../forms/class/SubjectAssignment"
import { SubjectDeletionDialog } from "../forms/class/SubjectDeletion"
import AllotmentDialog from "../forms/class/StudentAlotment"
import { toast } from "~/hooks/use-toast"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import Link from "next/link"

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
  "1": "bg-blue-100 text-blue-800",
  "2": "bg-green-100 text-green-800",
  "3": "bg-purple-100 text-purple-800",
}

const columns = [
  {
    id: "select",
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
  {
    id: "studentName",
    accessorFn: (row: StudentClassWithRelations) => row.Students.studentName,
    header: "Student Name",
  },
  {
    id: "fatherName",
    accessorFn: (row: StudentClassWithRelations) => row.Students.fatherName,
    header: "Father Name",
  },
  {
    id: "grade",
    accessorFn: (row: StudentClassWithRelations) => row.Grades.grade,
    header: "Class",
    cell: ({ row }: { row: { original: StudentClassWithRelations } }) => (
      <Badge className={classColors[row.original.Grades.grade] ?? ""}>Grade {row.original.Grades.grade}</Badge>
    ),
  },
  {
    id: "sessionName",
    accessorFn: (row: StudentClassWithRelations) => row.Sessions.sessionName,
    header: "Session",
  },
  {
    id: "fee",
    accessorFn: (row: StudentClassWithRelations) => row.Grades.fee,
    header: "Monthly Fee",
    cell: ({ row }: { row: { original: StudentClassWithRelations } }) =>
      `Rs. ${row.original.Grades.fee.toLocaleString()}`,
  },
] satisfies ColumnDef<StudentClassWithRelations, unknown>[]

export const ClassAllotmentTable = ({ classId, sessionId }: ClassAllotmentTableProps) => {
  const [rowSelection, setRowSelection] = useState({})
  const [allotmentOpen, setAllotmentOpen] = useState(false)
  const [subjectCreationOpen, setSubjectCreationOpen] = useState(false)
  const [subjectAssignmentOpen, setSubjectAssignmentOpen] = useState(false)

  const utils = api.useUtils()

  const { data: studentResult, isLoading: studentsLoading } = api.allotment.getStudentsByClassAndSession.useQuery({
    classId,
    sessionId,
  })

  const students = studentResult?.data ?? []

  const { data: subjects, isLoading: subjectsLoading } = api.subject.getSubjectsByClass.useQuery({ classId, sessionId })

  const deleteStudents = api.allotment.deleteStudentsFromClass.useMutation({
    onSuccess: async () => {
      toast({ title: "Students removed successfully" })
      await utils.allotment.invalidate()
      setRowSelection({})
    },
    onError: (error: { message: string }) => {
      toast({
        title: "Error",
        description: error.message,
      })
    },
  })

  const table = useReactTable<StudentClassWithRelations>({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  })

  const refreshData = async () => {
    await Promise.all([utils.allotment.invalidate(), utils.subject.invalidate()])
  }

  return (
    <div className="w-full space-y-6 p-4">
      {/* Header Section */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white shadow-lg">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              {students.length > 0 && students[0]?.Grades?.grade ? `Grade ${students[0].Grades.grade}` : "No Students"}
            </h1>
            <div className="flex gap-3">
              <Badge className="bg-white/10 backdrop-blur-sm">📚 {subjects?.length ?? 0} Subjects</Badge>
              <Badge className="bg-white/10 backdrop-blur-sm">👥 {students.length} Students</Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <AllotmentDialog
              classId={classId}
              open={allotmentOpen}
              onOpenChange={setAllotmentOpen}
              sessions={[{ sessionId, sessionName: students[0]?.Sessions.sessionName ?? "" }]}
              students={[students.map((s) => s.Students)].flat()}
            />
            <Button onClick={refreshData} variant="ghost" className="gap-2 bg-white/10 hover:bg-white/20">
              <ReloadIcon className={studentsLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Academia</h2>
          <div className="flex gap-2">
            <SubjectCreationDialog classId={classId} open={subjectCreationOpen} onOpenChange={setSubjectCreationOpen} />
            <SubjectAssignmentDialog
              classId={classId}
              open={subjectAssignmentOpen}
              onOpenChange={setSubjectAssignmentOpen}
            />
          </div>
        </div>

        {subjectsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
          </div>
        ) : subjects?.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => (
              <div
                key={subject.csId}
                className="group relative rounded-xl border bg-white p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">{subject.Subject?.subjectName}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{subject.Subject?.description}</p>
                  </div>
                  <SubjectDeletionDialog csId={subject.csId} classId={classId} sessionId={sessionId} />
                </div>
                {subject.Employees && (
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      👨🏫 {subject.Employees.employeeName}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-gray-200 p-8">
            <div className="rounded-full bg-gray-100 p-4">📚</div>
            <p className="text-gray-500">No subjects assigned yet</p>
          </div>
        )}
      </section>

      {/* Students Section */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Enrolled Students</h2>
          <Button
            variant="destructive"
            disabled={!table.getSelectedRowModel().rows.length || deleteStudents.isPending}
            onClick={() => {
              deleteStudents.mutate({
                studentIds: table.getSelectedRowModel().rows.map((row) => row.original.Students.studentId),
                classId,
                sessionId,
              })
            }}
          >
            {deleteStudents.isPending ? <ReloadIcon className="h-4 w-4 animate-spin" /> : "Remove Selected"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {studentsLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="group relative rounded-xl border bg-white p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-800">{row.original.Students.studentName}</h3>
                      <p className="text-sm text-gray-600">👨 {row.original.Students.fatherName}</p>
                    </div>
                  </div>
                  <Badge className={classColors[row.original.Grades.grade] ?? ""}>
                    Grade {row.original.Grades.grade}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="text-sm bg-transparent">
                    <Link href={`/students/${row.original.Students.studentId}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-gray-200 p-8">
              <div className="rounded-full bg-gray-100 p-4">👥</div>
              <p className="text-gray-500">No students enrolled yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
