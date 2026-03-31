"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Search,
  User,
  FileText,
  Printer,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { FeeReceipt } from "./fee-reciept";

interface StudentData {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  fatherName?: string;
  fatherMobile?: string;
}

interface LedgerEntry {
  sfcId: string;
  month?: number;
  year?: number;
  baseFee: number;
  discountAmount: number;
  totalDue: number;
  paidAmount: number;
  outstanding: number;
  isPaid: boolean;
  lateFee?: number;
  // Fix: Replaced Record<string, any> with specific type definition
  fees: {
    level?: string;
    tuitionFee?: number;
    examFund?: number;
    computerLabFund?: number | null;
    studentIdCardFee?: number;
    infoAndCallsFee?: number;
    admissionFee?: number;
    [key: string]: unknown;
  };
  StudentClass: {
    Grades: {
      grade: string;
      section: string;
    };
  };
}

interface LedgerData {
  student: StudentData | null;
  ledger: LedgerEntry[];
}

interface StudentFeeLedgerProps {
  sessionId?: string;
}

export function StudentFeeLedger({}: StudentFeeLedgerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const studentsQuery = api.student.getStudents.useQuery();

  const ledgerQuery = api.fee.getStudentFees.useQuery(
    { studentId: selectedStudentId! },
    { enabled: !!selectedStudentId },
  );

  const students = (studentsQuery.data ?? []) as StudentData[];
  const filteredStudents = students.filter(
    (s: StudentData) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const ledger = ledgerQuery.data as LedgerData | undefined;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Student Search Panel */}
        <Card className="bg-white lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Select Student
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or reg. no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {studentsQuery.isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              ) : filteredStudents.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No students found
                </p>
              ) : (
                filteredStudents.slice(0, 20).map((student: StudentData) => (
                  <div
                    key={student.studentId}
                    onClick={() => setSelectedStudentId(student.studentId)}
                    className={cn(
                      "cursor-pointer rounded-lg border p-3 transition-all",
                      selectedStudentId === student.studentId
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    <p className="font-medium text-slate-900">
                      {student.studentName}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {student.registrationNumber}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ledger Details */}
        <Card className="bg-white lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Fee Ledger
              </CardTitle>
              {ledger?.student && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedStudentId ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <User className="mb-4 h-12 w-12 text-foreground" />
                <p className="font-medium text-slate-600">
                  Select a student to view their fee ledger
                </p>
              </div>
            ) : ledgerQuery.isLoading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : !ledger ? (
              <div className="py-12 text-center text-muted-foreground">
                No ledger data found
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {ledger.student?.studentName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Registration No.
                      </p>
                      <p className="font-mono text-sm">
                        {ledger.student?.registrationNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Father&apos;s Name
                      </p>
                      <p className="font-medium">
                        {ledger.student?.fatherName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="font-medium">
                        {ledger.student?.fatherMobile}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary - with typed reduce */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <p className="text-xs text-blue-600">Total Due</p>
                    <p className="text-xl font-bold text-blue-700">
                      Rs.{" "}
                      {ledger.ledger
                        .reduce(
                          (sum: number, e: LedgerEntry) => sum + e.totalDue,
                          0,
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 text-center">
                    <p className="text-xs text-emerald-600">Total Paid</p>
                    <p className="text-xl font-bold text-emerald-700">
                      Rs.{" "}
                      {ledger.ledger
                        .reduce(
                          (sum: number, e: LedgerEntry) => sum + e.paidAmount,
                          0,
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4 text-center">
                    <p className="text-xs text-orange-600">Outstanding</p>
                    <p className="text-xl font-bold text-orange-700">
                      Rs.{" "}
                      {ledger.ledger
                        .reduce(
                          (sum: number, e: LedgerEntry) => sum + e.outstanding,
                          0,
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Base Fee</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">Total Due</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledger.ledger.map((entry: LedgerEntry) => (
                        <TableRow
                          key={entry.sfcId}
                          className="hover:bg-slate-50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {months[(entry.month ?? 1) - 1]} {entry.year}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {entry.StudentClass.Grades.grade} -{" "}
                              {entry.StudentClass.Grades.section}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            Rs. {entry.baseFee.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {entry.discountAmount > 0
                              ? `-Rs. ${entry.discountAmount.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            Rs. {entry.totalDue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium text-emerald-600">
                            Rs. {entry.paidAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {entry.isPaid ? (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Paid
                              </Badge>
                            ) : entry.paidAmount > 0 ? (
                              <Badge className="bg-amber-100 text-amber-700">
                                Partial
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Unpaid
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={selectedReceipt === entry.sfcId}
                              onOpenChange={(open) =>
                                setSelectedReceipt(open ? entry.sfcId : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  disabled={!entry.isPaid}
                                >
                                  <Printer className="h-4 w-4" />
                                  Receipt
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Fee Receipt</DialogTitle>
                                </DialogHeader>
                                <FeeReceipt
                                  student={{
                                    ...ledger.student!,
                                    fatherName:
                                      ledger.student!.fatherName ?? "",
                                    fatherMobile:
                                      ledger.student!.fatherMobile ?? "",
                                  }}
                                  entry={{
                                    ...entry,
                                    fees: {
                                      level: entry.fees.level ?? "",
                                      tuitionFee: entry.fees.tuitionFee ?? 0,
                                      examFund: entry.fees.examFund ?? 0,
                                      computerLabFund:
                                        entry.fees.computerLabFund ?? null,
                                      studentIdCardFee:
                                        entry.fees.studentIdCardFee ?? 0,
                                      infoAndCallsFee:
                                        entry.fees.infoAndCallsFee ?? 0,
                                      admissionFee:
                                        entry.fees.admissionFee ?? 0,
                                    },
                                  }}
                                  className={entry.StudentClass.Grades.grade}
                                  section={entry.StudentClass.Grades.section}
                                />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
