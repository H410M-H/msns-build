"use client"

import { useRef, useState } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "~/components/ui/button"
import { Printer, Loader2 } from "lucide-react"
// [FIX] Import 'VoucherData' instead of 'StudentFeeProps' to match FeeVoucher.tsx
import { FeeVoucher, type VoucherData } from "./FeeVoucher"

interface ClassData {
  className: string
  section: string
  month: number
  year: number
  // [FIX] Use VoucherData[] so TypeScript knows the shape of 'students'
  students: VoucherData[] 
}

export function ClassFeeManager({ data }: { data: ClassData }) {
  const componentRef = useRef<HTMLDivElement>(null)
  // [FIX] We will use this state in the Button now
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = useReactToPrint({
    contentRef: componentRef, 
    // [FIX] Renamed 'onBeforeGetContent' to 'onBeforePrint' to fix type error
    onBeforePrint: () => {
      setIsPrinting(true)
      return Promise.resolve()
    },
    onAfterPrint: () => {
      setIsPrinting(false)
    },
    documentTitle: `Fees-${data.className}-${data.section}-${data.month}-${data.year}`
  })

  return (
    <div className="p-4 space-y-4">
      
      {/* Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-xs border">
        <div>
           <h2 className="font-bold text-lg">Generate Class Vouchers</h2>
           <p className="text-slate-500 text-sm">
             {data.students.length} students in {data.className} - {data.section}
           </p>
        </div>
        <Button 
          onClick={() => handlePrint()} 
          disabled={isPrinting}
          className="bg-slate-900 text-white gap-2"
        >
          {/* [FIX] Using 'isPrinting' state for UI feedback */}
          {isPrinting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Printer className="w-4 h-4" />
          )}
          {isPrinting ? "Preparing..." : "Print All Vouchers"}
        </Button>
      </div>

      {/* Print Preview Area */}
      <div className="bg-slate-100 p-8 rounded-xl border overflow-auto max-h-[600px]">
        <div ref={componentRef} className="bg-white">
          <style type="text/css" media="print">
            {`
              @page { size: auto; margin: 20mm; }
              .page-break { page-break-after: always; }
            `}
          </style>

          {/* [FIX] Removed unused 'index'. Passing data via 'data' prop to match FeeVoucher component */}
          {data.students.map((studentData) => (
            <div key={studentData.sfcId} className="page-break pb-8 mb-8 border-b border-dashed print:border-none print:mb-0 print:pb-0">
               <FeeVoucher data={studentData} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}