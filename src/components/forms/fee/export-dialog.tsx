"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  exportToCSV,
  generateMonthlyFeeReportData,
  generateDefaultersReportData,
  type ExportData,
} from "~/lib/export-utils";

interface ExportDialogProps {
  sessionId: string;
  year: number;
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

type ReportType = "monthly-summary" | "defaulters" | "class-wise" | "analytics";

export function ExportDialog({ sessionId, year }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("monthly-summary");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [includeDetails, setIncludeDetails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const summaryQuery = api.fee.getClassFeeSummary.useQuery(
    { sessionId, year },
    { enabled: !!sessionId && open && reportType === "monthly-summary" },
  );

  const defaultersQuery = api.fee.getDefaultersList.useQuery(
    { sessionId, month: selectedMonth, year },
    { enabled: !!sessionId && open && reportType === "defaulters" },
  );

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let exportData: ExportData | null = null;
      let filename = "";

      switch (reportType) {
        case "monthly-summary":
          if (summaryQuery.data?.classes) {
            exportData = generateMonthlyFeeReportData(
              summaryQuery.data.classes,
              year,
            );
            filename = `fee-summary-${year}`;
          }
          break;

        case "defaulters":
          if (defaultersQuery.data) {
            exportData = generateDefaultersReportData(
              defaultersQuery.data,
              selectedMonth,
              year,
            );
            filename = `defaulters-${months[selectedMonth - 1]?.label}-${year}`;
          }
          break;

        case "class-wise":
          if (summaryQuery.data?.classes) {
            const columns = [
              { key: "className", label: "Class", width: 15 },
              ...months.map((m) => ({
                key: m.label.toLowerCase(),
                label: m.label.slice(0, 3),
                width: 10,
              })),
              { key: "total", label: "Total", width: 12 },
            ];

            const rows = summaryQuery.data.classes.map((cls) => {
              const row: Record<string, unknown> = { className: cls.className };
              cls.monthlyData.forEach((m, idx) => {
                row[months[idx]?.label?.toLowerCase() ?? ""] = m.totalCollected;
              });
              row.total = cls.yearlyTotals.totalCollected;
              return row;
            });

            exportData = {
              columns,
              rows,
              sheetName: "Class-wise Collection",
              title: `Class-wise Fee Collection ${year}`,
            };
            filename = `class-wise-collection-${year}`;
          }
          break;
      }

      if (exportData) {
        exportToCSV(exportData, filename);
        toast.success("Report exported successfully");
        setOpen(false);
      } else {
        toast.error("No data available to export");
      }
    } catch {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Fee Report
          </DialogTitle>
          <DialogDescription>
            Select the report type and options to export your fee data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(v) => setReportType(v as ReportType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly-summary">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Monthly Summary
                  </div>
                </SelectItem>
                <SelectItem value="defaulters">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Defaulters List
                  </div>
                </SelectItem>
                <SelectItem value="class-wise">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Class-wise Collection
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportType === "defaulters" && (
            <div className="space-y-2">
              <Label>Month</Label>
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="details"
              checked={includeDetails}
              onCheckedChange={(c) => setIncludeDetails(!!c)}
            />
            <Label htmlFor="details" className="text-sm text-slate-600">
              Include detailed breakdown
            </Label>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Export Format: CSV</p>
            <p className="mt-1">
              The report will be downloaded as a CSV file that can be opened in
              Excel or Google Sheets.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
