"use client"

import { useState, useRef, useMemo } from "react"
import { useReactToPrint } from "react-to-print"
import { api } from "~/trpc/react"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Loader2, Printer, AlertCircle } from "lucide-react"
// [FIX] Update import to include named exports
import { FeeVoucher, type VoucherData, MONTH_NAMES } from "~/components/forms/fee/FeeVoucher"

export default function BulkPrintPage() {
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [isPrinting, setIsPrinting] = useState(false)

  const { data: sessions } = api.session.getSessions.useQuery()
  const { data: classes } = api.class.getClasses.useQuery()

  const { data: classFeesData, isLoading } = api.fee.getClassFees.useQuery(
    { classId: selectedClass, year: selectedYear },
    { enabled: !!selectedClass && !!selectedYear }
  )

  const voucherList: VoucherData[] = useMemo(() => {
    if (!classFeesData?.studentClasses || !selectedClass) return []

    const currentClass = classes?.find(c => c.classId === selectedClass)
    const gradeDisplay = currentClass ? currentClass.grade : "Unknown"
    const sectionDisplay = currentClass ? currentClass.section : ""

    const processed: VoucherData[] = []

    for (const sc of classFeesData.studentClasses) {
      const feeEntry = sc.FeeStudentClass?.find(f => f.month === selectedMonth && f.year === selectedYear)
      
      if (!feeEntry || !sc.Students) continue

      const fees = feeEntry.fees
      
      const baseFee = fees.tuitionFee + fees.examFund + (fees.computerLabFund ?? 0) + fees.studentIdCardFee + fees.infoAndCallsFee + fees.admissionFee
      
      const discountVal = feeEntry.discount || 
        (feeEntry.discountByPercent > 0 ? (baseFee * feeEntry.discountByPercent) / 100 : 0)
      
      const totalDue = baseFee - discountVal + feeEntry.lateFee
      
      let paidTotal = 0
      if (feeEntry.tuitionPaid) paidTotal += fees.tuitionFee
      if (feeEntry.examFundPaid) paidTotal += fees.examFund
      if (feeEntry.computerLabPaid) paidTotal += (fees.computerLabFund ?? 0)
      if (feeEntry.studentIdCardPaid) paidTotal += fees.studentIdCardFee
      if (feeEntry.infoAndCallsPaid) paidTotal += fees.infoAndCallsFee

      processed.push({
        studentName: sc.Students.studentName,
        registrationNumber: sc.Students.registrationNumber,
        fatherName: sc.Students.fatherName,
        className: gradeDisplay,
        section: sectionDisplay,
        
        sfcId: feeEntry.sfcId,
        month: feeEntry.month,
        year: feeEntry.year,
        issueDate: new Date(),

        tuitionFee: fees.tuitionFee,
        examFund: fees.examFund,
        computerLabFund: fees.computerLabFund ?? 0,
        studentIdCardFee: fees.studentIdCardFee,
        infoAndCallsFee: fees.infoAndCallsFee,
        admissionFee: fees.admissionFee,
        lateFee: feeEntry.lateFee,
        discount: discountVal,

        totalDue,
        totalPaid: paidTotal,
        isPaid: paidTotal >= totalDue && totalDue > 0,
        paidAt: feeEntry.paidAt
      })
    }

    return processed
  }, [classFeesData, selectedClass, selectedMonth, selectedYear, classes]) // [FIX] Added selectedSession to deps

  const printRef = useRef<HTMLDivElement>(null)
  
  // [FIX] Updated to standard useReactToPrint syntax to avoid type errors
  const handlePrint = useReactToPrint({
    contentRef: printRef, // Use contentRef for react-to-print v3+
    onBeforePrint: () => {
      setIsPrinting(true)
      return Promise.resolve()
    },
    onAfterPrint: () => setIsPrinting(false),
    documentTitle: `Fees-${selectedYear}-${selectedMonth}`
  })

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Print Fee Vouchers</h1>
          <p className="text-slate-500">Generate and print bulk fee vouchers for specific classes.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Select the criteria to generate vouchers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map((s) => (
                    <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c.classId} value={c.classId}>
                      {c.grade} - {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select 
                value={String(selectedMonth)} 
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* [FIX] Typed arguments to remove implicit any error */}
                  {MONTH_NAMES.map((m: string, idx: number) => (
                    <SelectItem key={idx} value={String(idx + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select 
                value={String(selectedYear)} 
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0,1,2].map((i) => {
                    const y = new Date().getFullYear() - 1 + i
                    return <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : voucherList.length > 0 ? (
                <span className="text-emerald-600 font-medium">{voucherList.length} vouchers ready to print</span>
              ) : (
                <span className="text-slate-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> No records found for this selection
                </span>
              )}
            </div>

            <Button 
              onClick={() => handlePrint()} 
              disabled={isLoading || voucherList.length === 0}
              className="bg-slate-900 text-white min-w-37.s5"
            >
              {isPrinting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
              ) : (
                <Printer className="h-4 w-4 mr-2" />
              )}
              Print Batch
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="hidden">
        <div ref={printRef}>
          <style type="text/css" media="print">
            {`
              @page { size: auto; margin: 10mm; }
              .page-break { page-break-after: always; }
            `}
          </style>
          
          {/* [FIX] Typed argument to remove implicit any error */}
          {voucherList.map((voucher: VoucherData) => (
            <div key={voucher.sfcId} className="page-break pb-10">
              <FeeVoucher data={voucher} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}