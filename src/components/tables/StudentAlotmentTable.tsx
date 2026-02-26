"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Plus, RefreshCw, Trash2 } from "lucide-react";
import AllotmentDialog from "../forms/class/StudentAlotment";
import { toast } from "~/hooks/use-toast";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// The type for our table's transformed data
type StudentAllotmentProps = {
  registrationNumber: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  grade: string;
  employeeName: string;
  sessionName: string;
  sessionId: string;
  classId: string;
};

// Define the shape of a single raw student record from the API
type APIStudentAllotment = {
  Students: {
    registrationNumber: string;
    studentId: string;
    studentName: string;
    fatherName: string;
  };
  Grades: {
    grade: string;
    classId: string;
  };
  Employees?: {
    employeeName: string;
  };
  Sessions: {
    sessionName: string;
    sessionId: string;
  };
};

type APIStudentAllotmentResponse = {
  data: APIStudentAllotment[];
  meta?: unknown;
};

interface StudentAllotmentTableProps {
  classId: string;
  sessionId: string;
}

export function StudentAllotmentTable({
  classId,
  sessionId,
}: StudentAllotmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [data, setData] = useState<StudentAllotmentProps[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [allotmentOpen, setAllotmentOpen] = useState(false);

  const utils = api.useUtils();

  // Fetch students in class
  const studentsInClass = api.allotment.getStudentsByClassAndSession.useQuery({
    classId,
    sessionId,
  });

  // Fetch available sessions for allotment dialog - provide empty input if required
  const { data: sessions } = api.session.getSessions.useQuery(undefined, {
    enabled: allotmentOpen, // Only fetch when dialog is open
  });

  const removeStudent = api.allotment.deleteStudentsFromClass.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Student(s) removed from class successfully",
      });
      await utils.allotment.invalidate();
      setRowSelection({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message ?? "Failed to remove student(s)",
      });
    },
  });

  // Transform API data
  useEffect(() => {
    if (studentsInClass.data) {
      const raw =
        studentsInClass.data as unknown as APIStudentAllotmentResponse;
      const transformedData: StudentAllotmentProps[] = raw.data.map(
        (item: APIStudentAllotment) => ({
          registrationNumber: item.Students.registrationNumber,
          studentId: item.Students.studentId,
          studentName: item.Students.studentName,
          fatherName: item.Students.fatherName,
          grade: item.Grades.grade,
          employeeName: item.Employees?.employeeName ?? "Not Assigned",
          sessionName: item.Sessions.sessionName,
          sessionId: item.Sessions.sessionId,
          classId: item.Grades.classId,
        }),
      );
      setData(transformedData);
    }
  }, [studentsInClass.data]);

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
      id: "registrationNumber",
      accessorFn: (row: StudentAllotmentProps) => row.registrationNumber,
      header: "Reg #",
      cell: ({ getValue }) => (
        <div className="font-medium text-blue-600">{getValue() as string}</div>
      ),
    },
    {
      id: "studentName",
      accessorFn: (row: StudentAllotmentProps) => row.studentName,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Student Name
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => (
        <div className="font-semibold">{getValue() as string}</div>
      ),
    },
    {
      id: "fatherName",
      accessorFn: (row: StudentAllotmentProps) => row.fatherName,
      header: "Father Name",
    },
    {
      id: "employeeName",
      accessorFn: (row: StudentAllotmentProps) => row.employeeName,
      header: "Teacher",
      cell: ({ getValue }) => {
        const teacher = getValue() as string;
        return (
          <Badge variant={teacher === "Not Assigned" ? "secondary" : "default"}>
            {teacher}
          </Badge>
        );
      },
    },
    {
      id: "grade",
      accessorFn: (row: StudentAllotmentProps) => row.grade,
      header: "Class",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Grade {getValue() as string}
        </Badge>
      ),
    },
    {
      id: "sessionName",
      accessorFn: (row: StudentAllotmentProps) => row.sessionName,
      header: "Session",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          {getValue() as string}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            removeStudent.mutate({
              studentIds: [row.original.studentId],
              classId: classId,
              sessionId: sessionId,
            });
          }}
          disabled={removeStudent.isPending}
          className="h-8"
        >
          {removeStudent.isPending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      ),
    },
  ] satisfies ColumnDef<StudentAllotmentProps, unknown>[];

  const table = useReactTable<StudentAllotmentProps>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const selectedStudentIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.studentId);

  const handleBulkRemove = () => {
    if (selectedStudentIds.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select students to remove",
      });
      return;
    }

    removeStudent.mutate({
      studentIds: selectedStudentIds,
      classId: classId,
      sessionId: sessionId,
    });
  };

  const refreshData = async () => {
    await utils.allotment.invalidate();
    toast({
      title: "Data Refreshed",
      description: "Student data has been refreshed",
    });
  };

  // Transform sessions data for the dialog - around line 312
  const transformedSessions =
    sessions?.map((session) => ({
      sessionId: session.sessionId,
      sessionName: session.sessionName,
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Allotments</span>
            <Badge variant="secondary" className="px-3 py-1 text-lg">
              {data.length} Students
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setAllotmentOpen(true)}
                className="gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
              <Button
                variant="outline"
                onClick={refreshData}
                size="sm"
                className="gap-2 bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Input
                placeholder="Search students..."
                value={globalFilter ?? ""}
                onChange={(event) =>
                  setGlobalFilter(String(event.target.value))
                }
                className="max-w-sm"
              />

              {selectedStudentIds.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkRemove}
                  disabled={removeStudent.isPending}
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Selected ({selectedStudentIds.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {studentsInClass.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <RefreshCw className="mx-auto mb-2 h-4 w-4 animate-spin" />
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-gray-400">📚</div>
                        <div>No students allotted to this class.</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAllotmentOpen(true)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add First Student
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Allotment Dialog */}
      <AllotmentDialog
        classId={classId}
        open={allotmentOpen}
        onOpenChange={setAllotmentOpen}
        sessions={transformedSessions}
      />
    </div>
  );
}
