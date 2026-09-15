"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { exportToCSV, type ExportData } from "~/lib/export-utils";
import { exportToPDF } from "~/lib/pdf-reports";
import { DownloadPdfButton, type ReportType } from "~/components/ui/DownloadPdfButton";
import { toast } from "sonner";

export interface PageExportButtonProps {
  exportData?: ExportData;
  csvFilename?: string;
  pdfReportType?: ReportType;
  buttonLabel?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  sessionId?: string;
  classId?: string;
}

export function PageExportButton({
  exportData,
  csvFilename = "export",
  pdfReportType,
  buttonLabel = "Export",
  variant = "outline",
  sessionId,
  classId,
}: PageExportButtonProps) {
  const handleExportCSV = () => {
    if (!exportData || exportData.rows.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToCSV(exportData, csvFilename);
    toast.success("CSV exported successfully");
  };

  const handleExportTablePDF = async () => {
    if (!exportData || exportData.rows.length === 0) {
      toast.error("No data to export");
      return;
    }
    try {
      await exportToPDF(exportData);
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl rounded-xl">
        <DropdownMenuItem
          onClick={handleExportCSV}
          className="cursor-pointer gap-2 text-xs font-medium"
          disabled={!exportData}
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          Export as CSV
        </DropdownMenuItem>

        {exportData && (
          <DropdownMenuItem
            onClick={handleExportTablePDF}
            className="cursor-pointer gap-2 text-xs font-medium"
          >
            <FileText className="h-4 w-4 text-rose-600" />
            Export Table as PDF
          </DropdownMenuItem>
        )}

        {pdfReportType && (
          <>
            <DropdownMenuSeparator className="my-1.5" />
            <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Periodic PDF Reports
            </div>
            <div className="flex flex-col gap-0.5">
              <DownloadPdfButton
                reportType={pdfReportType}
                period="daily"
                sessionId={sessionId}
                classId={classId}
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-xs font-normal hover:bg-slate-100 dark:hover:bg-slate-800"
                label="Daily PDF Report"
              />
              <DownloadPdfButton
                reportType={pdfReportType}
                period="weekly"
                sessionId={sessionId}
                classId={classId}
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-xs font-normal hover:bg-slate-100 dark:hover:bg-slate-800"
                label="Weekly PDF Report"
              />
              <DownloadPdfButton
                reportType={pdfReportType}
                period="monthly"
                sessionId={sessionId}
                classId={classId}
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-xs font-normal hover:bg-slate-100 dark:hover:bg-slate-800"
                label="Monthly PDF Report"
              />
              <DownloadPdfButton
                reportType={pdfReportType}
                period="annual"
                sessionId={sessionId}
                classId={classId}
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-xs font-normal hover:bg-slate-100 dark:hover:bg-slate-800"
                label="Annual PDF Report"
              />
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
