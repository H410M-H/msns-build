"use client"

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "~/components/ui/table"
import { Button } from "~/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { api } from "~/trpc/react"
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  MoreHorizontal
} from "lucide-react"
import { toast } from "~/hooks/use-toast"
import { SalaryHistoryDialog } from "../blocks/salary/SalaryHistoryDialog" // Ensure this path is correct
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { EditAssignmentDialog } from '../blocks/salary/EditAssignmentDialog'

type SortField = 'employeeName' | 'baseSalary' | 'totalSalary' | 'assignedDate'
type SortOrder = 'asc' | 'desc'

type SalaryData = {
  id: string
  employeeId: string
  baseSalary: number
  increment: number
  totalSalary: number
  assignedDate: Date
  sessionId: string
  Employees: {
    employeeName: string
    designation: string
    registrationNumber: string
  }
  Sessions: {
    sessionName: string
  }
}

type SalaryTableProps = {
  page: number
  pageSize: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  setPageSize: React.Dispatch<React.SetStateAction<number>>
  searchTerm: string
}

export function SalaryTable({ 
  page,
  pageSize,
  setPage,
  setPageSize,
  searchTerm
}: SalaryTableProps) {
  const [sortField, setSortField] = useState<SortField>('assignedDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Edit State
  const [editOpen, setEditOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<{
    id: string;
    baseSalary: number;
    increment: number;
    employeeName: string;
  } | null>(null)

  // History State
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState<SalaryData | null>(null)

  const utils = api.useUtils()

  const { data, isLoading, error } = api.salary.getSalaries.useQuery({
    page,
    pageSize,
    searchTerm,
    sortField,
    sortOrder
  })

  const deleteBulkMutation = api.salary.deleteBulkSalaryAssignments.useMutation({
    onSuccess: () => {
      toast({ title: "Deleted", description: `${selectedIds.length} records deleted.` })
      setSelectedIds([])
      void utils.salary.getSalaries.invalidate()
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message})
    }
  })

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const toggleSelectAll = () => {
    if (!data?.salaries) return
    if (selectedIds.length === data.salaries.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.salaries.map(s => s.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleEdit = (salary: SalaryData) => {
    setEditingAssignment({
      id: salary.id,
      baseSalary: salary.baseSalary,
      increment: salary.increment,
      employeeName: salary.Employees.employeeName
    })
    setEditOpen(true)
  }

  const handleViewHistory = (salary: SalaryData) => {
    setSelectedEmployeeForHistory(salary)
    setHistoryOpen(true)
  }

  const handleDeleteSelected = () => {
    deleteBulkMutation.mutate({ ids: selectedIds })
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>

  const totalPages = Math.ceil((data?.totalCount ?? 0) / pageSize)

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
        <Select 
          value={pageSize.toString()} 
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 rows</SelectItem>
            <SelectItem value="20">20 rows</SelectItem>
            <SelectItem value="50">50 rows</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the selected salary assignments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700">
                  {deleteBulkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={data?.salaries.length ? selectedIds.length === data.salaries.length : false}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[200px]">
                <Button variant="ghost" onClick={() => handleSort('employeeName')}>
                  Employee Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('baseSalary')}>
                  Base Salary
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Increment</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('totalSalary')}>
                  Total Salary
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('assignedDate')}>
                  Assigned Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.salaries.map((salary: SalaryData) => (
              <TableRow key={salary.id} className={selectedIds.includes(salary.id) ? "bg-slate-50" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(salary.id)}
                    onCheckedChange={() => toggleSelect(salary.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {salary.Employees.employeeName}
                </TableCell>
                <TableCell>{salary.baseSalary.toLocaleString()} PKR</TableCell>
                <TableCell className="text-green-600">+{salary.increment.toLocaleString()}</TableCell>
                <TableCell className="font-bold">{salary.totalSalary.toLocaleString()} PKR</TableCell>
                <TableCell>
                  {new Date(salary.assignedDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewHistory(salary)}>
                        <FileText className="w-4 h-4 mr-2" /> View Details & Slips
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(salary)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit Structure
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data?.totalCount ?? 0)} of {data?.totalCount ?? 0} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditAssignmentDialog 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        assignment={editingAssignment} 
        onSuccess={() => setEditingAssignment(null)}
      />

      {/* History & Generation Dialog */}
      {selectedEmployeeForHistory && (
        <SalaryHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          employeeId={selectedEmployeeForHistory.employeeId}
          employeeName={selectedEmployeeForHistory.Employees.employeeName}
          designation={selectedEmployeeForHistory.Employees.designation}
          registrationNumber={selectedEmployeeForHistory.Employees.registrationNumber}
          currentSessionId={selectedEmployeeForHistory.sessionId}
          baseSalary={selectedEmployeeForHistory.totalSalary}
        />
      )}
    </div>
  )
}