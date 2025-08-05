"use client"

import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

// Updated to match the reportType values expected by the backend
type ReportType = "students" | "employees" | "classes" | "fees" | "sessions"

interface DownloadPdfButtonProps {
  reportType: ReportType
}

// Type for the API response
type GenerateReportResponse = {
  pdf: unknown // The API might return different types
}

export function DownloadPdfButton({ reportType }: DownloadPdfButtonProps) {
  const { mutateAsync: generateReport, isPending } = api.report.generateReport.useMutation()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const result = (await generateReport({ reportType })) as GenerateReportResponse

      // Check if PDF data exists
      if (!result?.pdf) {
        throw new Error("No PDF data received")
      }

      const pdfData = result.pdf

      // Type guard functions for better type checking
      const isUint8Array = (data: unknown): data is Uint8Array => {
        return typeof data === "object" && data !== null && data.constructor?.name === "Uint8Array"
      }

      const isArrayLike = (data: unknown): data is ArrayLike<number> => {
        return (
          typeof data === "object" &&
          data !== null &&
          "length" in data &&
          typeof (data as { length: unknown }).length === "number"
        )
      }

      const isBuffer = (data: unknown): data is { buffer: ArrayBuffer } => {
        return (
          typeof data === "object" &&
          data !== null &&
          "buffer" in data &&
          (data as { buffer: unknown }).buffer instanceof ArrayBuffer
        )
      }

      // Convert to Uint8Array based on the data type
      let finalPdfData: Uint8Array

      if (isUint8Array(pdfData)) {
        finalPdfData = pdfData
      } else if (isBuffer(pdfData)) {
        finalPdfData = new Uint8Array(pdfData.buffer)
      } else if (Array.isArray(pdfData)) {
        // Handle regular arrays of numbers
        finalPdfData = new Uint8Array(pdfData)
      } else if (isArrayLike(pdfData)) {
        // Handle other array-like objects
        const numbers: number[] = []
        for (let i = 0; i < pdfData.length; i++) {
          const item = (pdfData as unknown[])[i]
          if (typeof item === "number") {
            numbers.push(item)
          }
        }
        finalPdfData = new Uint8Array(numbers)
      } else if (typeof pdfData === "string") {
        // Handle base64 encoded strings
        try {
          const binaryString = atob(pdfData)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          finalPdfData = bytes
        } catch {
          throw new Error("Invalid base64 PDF data")
        }
      } else {
        throw new Error("Unsupported PDF data format")
      }

      // Create blob and download
      const blob = new Blob([finalPdfData], { type: "application/pdf" })

      // Create download link
      const link = document.createElement("a")
      const blobUrl = URL.createObjectURL(blob)
      link.href = blobUrl
      link.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup URL object
      URL.revokeObjectURL(blobUrl)
    } catch (error: unknown) {
      let errorMessage = "Failed to generate PDF. Please try again."

      // Safer error message extraction
      if (typeof error === "object" && error !== null && "message" in error) {
        const err = error as { message: string }
        console.error("Error generating PDF:", err.message)
        errorMessage = err.message
      } else {
        console.error("Unknown error occurred:", error)
      }

      alert(errorMessage)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isPending || downloading}
      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
      aria-busy={isPending || downloading}
    >
      {(isPending || downloading) && <Loader2 className="animate-spin h-4 w-4" />}
      {isPending || downloading ? "Generating..." : `Download ${reportType} Report`}
    </Button>
  )
}
