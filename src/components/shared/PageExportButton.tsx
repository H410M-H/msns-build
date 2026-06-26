"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportToCSV, type ExportData } from "~/lib/export-utils";
import { DownloadPdfButton, type ReportType } from "~/components/ui/DownloadPdfButton";
import { toast } from "sonner";

export interface PageExportButtonProps {
  exportData?: ExportData;
  csvFilename?: string;
  pdfReportType?: ReportType;
  buttonLabel?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function PageExportButton({
  exportData,
  csvFilename = "export",
  pdfReportType,
  buttonLabel = "Export",
  variant = "outline",
}: PageExportButtonProps) {
  const handleExportCSV = () => {
    if (!exportData || exportData.rows.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToCSV(exportData, csvFilename);
    toast.success("CSV exported successfully");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer gap-2" disabled={!exportData}>
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          Export as CSV
        </DropdownMenuItem>
        
        {pdfReportType && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <DownloadPdfButton 
                reportType={pdfReportType} 
                variant="ghost" 
                className="w-full justify-start px-2 py-1.5 font-normal h-auto text-sm gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                label="Download as PDF"
              />
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
