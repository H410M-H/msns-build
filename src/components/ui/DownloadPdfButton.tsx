"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"
import { Loader2, FileDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "~/lib/utils"

export type ReportType = "students" | "employees" | "classes" | "fees" | "sessions"

interface DownloadPdfButtonProps {
  reportType: ReportType
  label?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

// Explicitly define the response type
interface ReportResponse {
  pdf: string;
  filename: string;
}

export function DownloadPdfButton({ 
  reportType, 
  label, 
  className,
  variant = "outline" 
}: DownloadPdfButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  
  const generateReport = api.report.generateReport.useMutation({
    onSuccess: (data: ReportResponse) => {
      try {
        const binaryString = window.atob(data.pdf);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = data.filename ?? `${reportType}-report.pdf`;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success(`${label ?? reportType} report downloaded`);
      } catch (error) {
        console.error("PDF processing error:", error);
        toast.error("Failed to process the report file");
      } finally {
        setIsDownloading(false);
      }
    },
    // Fix: Use a structural type that matches TRPCClientErrorLike
    onError: (error: { message: string }) => {
      console.error("Report generation error:", error);
      toast.error(error.message ?? "Failed to generate report");
      setIsDownloading(false);
    }
  });

  const handleDownload = () => {
    setIsDownloading(true);
    generateReport.mutate({ reportType });
  }

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("gap-2", className)}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {label ?? `Download ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
    </Button>
  )
}