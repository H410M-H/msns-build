"use client"

import { useMemo, useState } from "react"
import { api } from "~/trpc/react"
import { FileSearch } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

// Define types to ensure safety
type FeeAssignment = {
  sfcId: string
  studentClass: {
    student: {
      studentName: string
      registrationNumber: string
    }
  }
  fees: {
    level: string
    tuitionFee: number
  }
  discount: number
  discountByPercent: number
  lateFee: number
  tuitionPaid: boolean
}

export function FeeAssignmentTable() {
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")

  const { data: sessions, isLoading: isLoadingSessions } = api.session.getSessions.useQuery()
  const { data: classes, isLoading: isLoadingClasses } = api.class.getClasses.useQuery()
  
  const { data: classFeesData, isLoading: isLoadingFeeAssignments } =
    api.fee.getClassFees.useQuery(
      { classId: selectedClass, sessionId: selectedSession },
      { enabled: !!selectedClass && !!selectedSession },
    )

  // Explicitly type the transformation result to avoid implicit 'any'
  const feeAssignments: FeeAssignment[] = useMemo(() => {
    if (!classFeesData?.studentClasses) return [];
    
    return classFeesData.studentClasses.flatMap((sc) => {
      // Ensure FeeStudentClass exists before mapping
      if (!sc.FeeStudentClass) return [];

      return sc.FeeStudentClass.map((f) => ({
        sfcId: f.sfcId,
        studentClass: {
          student: sc.Students,
        },
        fees: f.fees,
        discount: f.discount,
        discountByPercent: f.discountByPercent,
        lateFee: f.lateFee,
        tuitionPaid: f.tuitionPaid
      })) as FeeAssignment[];
    });
  }, [classFeesData]);

  return (
    <Card className="shadow-xs">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold">Fee Assignments</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Filters Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-[240px]">
                {isLoadingSessions ? (
                  <Skeleton className="h-4 w-[160px]" />
                ) : (
                  <SelectValue placeholder="Select Session" />
                )}
              </SelectTrigger>
              <SelectContent>
                {sessions?.map((session) => (
                  <SelectItem key={session.sessionId} value={session.sessionId}>
                    <div className="flex items-center gap-2">
                      <span>{session.sessionName}</span>
                      {session.isActive && (
                        <Badge variant="outline" className="ml-2 text-[10px] h-5">Active</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[240px]">
                {isLoadingClasses ? (
                  <Skeleton className="h-4 w-[160px]" />
                ) : (
                  <SelectValue placeholder="Select Class" />
                )}
              </SelectTrigger>
              <SelectContent>
                {classes?.map((class_) => (
                  <SelectItem key={class_.classId} value={class_.classId}>
                    <div className="flex items-center gap-2">
                      <span>{class_.grade}</span>
                      <Badge variant="outline" className="ml-2 text-[10px] h-5">
                        {class_.section}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {feeAssignments && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline">Total Assignments:</span>
              <Badge variant="secondary">{feeAssignments.length}</Badge>
            </div>
          )}
        </div>

        {/* Table Section */}
        {isLoadingFeeAssignments ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : feeAssignments && feeAssignments.length > 0 ? (
          <div className="rounded-md border">
            <div className="relative overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="w-[25%]">Student</TableHead>
                    <TableHead>Fee Details</TableHead>
                    <TableHead className="text-right">Base Amount</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Final Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeAssignments.map((assignment) => {
                    // Safe calculation with fallbacks
                    const baseFee = assignment.fees.tuitionFee || 0;
                    const discount = assignment.discount || 
                      (assignment.discountByPercent > 0 ? (baseFee * assignment.discountByPercent) / 100 : 0);
                    const finalAmount = baseFee - discount + (assignment.lateFee || 0);

                    return (
                      <TableRow 
                        key={assignment.sfcId}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {assignment.studentClass.student.studentName}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="w-fit text-xs font-mono mt-1"
                            >
                              Reg: {assignment.studentClass.student.registrationNumber}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{assignment.fees.level}</span>
                            <span className="text-sm text-muted-foreground">
                              {assignment.fees.level} Type
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rs. {baseFee.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-red-600">
                              - Rs. {discount.toLocaleString()}
                            </span>
                            {assignment.discountByPercent > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({assignment.discountByPercent.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-700">
                          Rs. {finalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center border-2 border-dashed rounded-lg bg-slate-50/50">
            <FileSearch className="h-12 w-12 text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="font-medium text-slate-900">No fee assignments found</h3>
              <p className="text-sm text-muted-foreground">
                {selectedClass && selectedSession 
                  ? "No students have fees assigned for this selection" 
                  : "Select a class and session to view assignments"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}