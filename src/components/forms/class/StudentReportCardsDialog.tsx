"use client";

import React, { useState, useRef } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { FileText, Loader2, Edit, Save, X, Download } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import * as jsPDF from "jspdf";
import * as html2canvas from "html2canvas-pro";
import { toast } from "sonner";

export function StudentReportCardsDialog({
  studentId,
  studentName,
  sessionId,
}: {
  studentId: string;
  studentName: string;
  sessionId: string;
}) {
  const [open, setOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  const reportRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    data: reports,
    isLoading,
    refetch,
  } = api.reportCard.getStudentSessionReports.useQuery(
    { studentId, sessionId },
    { enabled: open },
  );

  type ReportType = NonNullable<typeof reports>[number];
  type ReportDetailType = ReportType["ReportCardDetail"][number];
  type EditDetailType = Omit<
    ReportDetailType,
    "obtainedMarks" | "totalMarks"
  > & {
    obtainedMarks: number | string;
    totalMarks: number | string;
  };

  // Edit State
  const [editData, setEditData] = useState<EditDetailType[]>([]);
  const [teacherRemarks, setTeacherRemarks] = useState<string>("");
  const [headRemarks, setHeadRemarks] = useState<string>("");

  const updateReportCardMutation = api.reportCard.updateReportCard?.useMutation(
    {
      onSuccess: async () => {
        await refetch();
        setEditingReportId(null);
        toast.success("Report card updated successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update report card");
      },
    },
  );

  const handleEditClick = (report: ReportType) => {
    setEditingReportId(report.reportCardId);
    setEditData(report.ReportCardDetail.map((detail) => ({ ...detail })));
    setTeacherRemarks(report.teacherRemarks ?? "");
    setHeadRemarks(report.headRemarks ?? "");
  };

  const handleSaveEdit = async (report: ReportType) => {
    if (!updateReportCardMutation) return;

    await updateReportCardMutation.mutateAsync({
      reportCardId: report.reportCardId,
      details: editData.map((d) => ({
        subjectId: d.subjectId,
        obtainedMarks: Number(d.obtainedMarks),
        totalMarks: Number(d.totalMarks),
      })),
      teacherRemarks,
      headRemarks,
    });
  };

  const handleDownloadPdf = async (report: ReportType) => {
    const element = reportRefs.current[report.reportCardId];
    if (!element) {
      toast.error("Unable to generate PDF: Render element not found");
      return;
    }

    setIsGeneratingPdf(report.reportCardId);
    toast.info("Generating report card PDF...");

    try {
      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF.default({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image with 10mm top margin
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Report_Card_${studentName.replace(/\s+/g, "_")}_${report.Exam?.examTypeEnum || "Exam"}.pdf`
      );
      toast.success("PDF Downloaded!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full border border-border bg-muted text-foreground hover:bg-muted hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="mr-2 h-3.5 w-3.5" /> View Report Cards
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Report Cards - {studentName}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Performance overview for the current session.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : reports && reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.reportCardId}>
                {/* Display Card in UI */}
                <div className="space-y-4 rounded-xl border border-border bg-muted p-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h4 className="text-lg font-bold text-emerald-400">
                        {report.Exam?.examTypeEnum}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Started:{" "}
                        {new Date(
                          report.Exam?.startDate ?? "",
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`mb-1 ${
                          report.status === "PASSED"
                            ? "border-emerald-500 text-emerald-400"
                            : report.status === "FAILED"
                              ? "border-red-500 text-red-400"
                              : "border-amber-500 text-amber-400"
                        }`}
                      >
                        {report.status}
                      </Badge>
                      <p className="font-mono text-sm">
                        {report.totalObtainedMarks} / {report.totalMaxMarks} (
                        {report.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 border-b border-border pb-2 text-xs font-semibold text-muted-foreground">
                      <div className="col-span-2">Subject</div>
                      <div className="text-right">Marks</div>
                      <div className="text-right">Grade/Remarks</div>
                    </div>
                    {(editingReportId === report.reportCardId
                      ? editData
                      : report.ReportCardDetail
                    ).map((detail, index: number) => (
                      <div
                        key={detail.subjectId}
                        className="grid grid-cols-4 items-center gap-2 text-sm"
                      >
                        <div className="col-span-2 truncate">
                          {detail.Subject?.subjectName || detail.subjectId}
                        </div>
                        <div className="text-right font-mono">
                          {editingReportId === report.reportCardId ? (
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="number"
                                className="h-7 w-16 border-border bg-card p-1 text-right text-xs text-foreground"
                                value={detail.obtainedMarks}
                                onChange={(e) => {
                                  const newData = [...editData];
                                  newData[index]!.obtainedMarks = e.target.value;
                                  setEditData(newData);
                                }}
                              />
                              <span className="text-muted-foreground">/</span>
                              <Input
                                type="number"
                                className="h-7 w-16 border-border bg-card p-1 text-right text-xs text-foreground"
                                value={detail.totalMarks}
                                onChange={(e) => {
                                  const newData = [...editData];
                                  newData[index]!.totalMarks = e.target.value;
                                  setEditData(newData);
                                }}
                              />
                            </div>
                          ) : (
                            `${detail.obtainedMarks} / ${detail.totalMarks}`
                          )}
                        </div>
                        <div className="text-right text-xs">{detail.remarks}</div>
                      </div>
                    ))}
                  </div>

                  {/* Remarks Section */}
                  <div className="mt-4 pt-3 border-t border-border space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        {"Class Teacher's Remarks"}
                      </label>
                      {editingReportId === report.reportCardId ? (
                        <Input
                          className="h-8 border-border bg-card text-foreground text-xs"
                          placeholder="Enter teacher's remarks..."
                          value={teacherRemarks}
                          onChange={(e) => setTeacherRemarks(e.target.value)}
                        />
                      ) : (
                        <p className="text-xs text-foreground bg-black/10 dark:bg-white/5 p-2 rounded border border-border/50 min-h-[32px] flex items-center italic">
                          {report.teacherRemarks ?? "No remarks added yet."}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        {"Headmaster's/Principal's Remarks"}
                      </label>
                      {editingReportId === report.reportCardId ? (
                        <Input
                          className="h-8 border-border bg-card text-foreground text-xs"
                          placeholder="Enter head's remarks..."
                          value={headRemarks}
                          onChange={(e) => setHeadRemarks(e.target.value)}
                        />
                      ) : (
                        <p className="text-xs text-foreground bg-black/10 dark:bg-white/5 p-2 rounded border border-border/50 min-h-[32px] flex items-center italic">
                          {report.headRemarks ?? "No remarks added yet."}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border pt-2">
                    {editingReportId === report.reportCardId ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingReportId(null)}
                          className="h-8 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(report)}
                          disabled={updateReportCardMutation?.isPending}
                          className="h-8 bg-emerald-600 text-foreground hover:bg-emerald-500"
                        >
                          {updateReportCardMutation?.isPending ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="mr-1 h-3.5 w-3.5" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPdf(report)}
                          disabled={isGeneratingPdf === report.reportCardId}
                          className="h-8 border-border bg-transparent text-foreground hover:bg-white/5 hover:text-foreground"
                        >
                          {isGeneratingPdf === report.reportCardId ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                          )}
                          Download PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(report)}
                          className="h-8 border-border bg-transparent text-foreground hover:bg-white/5 hover:text-foreground"
                        >
                          <Edit className="mr-1 h-3.5 w-3.5 text-amber-500" /> Edit Report
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hidden Printable HTML Template (Off-Screen rendering) */}
                <div
                  ref={(el) => {
                    reportRefs.current[report.reportCardId] = el;
                  }}
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                  }}
                  className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-16 flex flex-col justify-between font-sans"
                >
                  <div className="flex flex-col space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-6 w-full">
                      <div className="flex items-center gap-4">
                        <img
                          src="/api/images/logos/Official_LOGO_grn_ic9ldd.png"
                          alt="M.S. Naz High School Logo"
                          className="w-16 h-16 object-contain"
                          crossOrigin="anonymous"
                        />
                        <div className="text-left">
                          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-800 uppercase">
                            M.S. Naz High School
                          </h1>
                          <p className="text-xs font-semibold text-slate-500">
                            G.T Road Gakhar
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Academic Progress
                        </p>
                        <p className="text-base font-bold text-slate-700">
                          Report Card
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Name</span>
                        <p className="font-semibold text-slate-800 text-base">{studentName}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Admission No.</span>
                        <p className="font-semibold text-slate-800 text-base">
                          {report.Students?.admissionNumber || studentId.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Class & Section</span>
                        <p className="font-semibold text-slate-800 text-base">
                          {report.Exam?.Grades
                            ? `${report.Exam.Grades.grade} ${report.Exam.Grades.section}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Examination</span>
                        <p className="font-semibold text-slate-800 text-base">{report.Exam?.examTypeEnum}</p>
                      </div>
                    </div>

                    {/* Subject Table */}
                    <div className="pt-4">
                      <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200">
                            <th className="p-3 text-xs font-bold uppercase text-slate-500">Subject</th>
                            <th className="p-3 text-xs font-bold uppercase text-slate-500 text-right">Max Marks</th>
                            <th className="p-3 text-xs font-bold uppercase text-slate-500 text-right">Obtained Marks</th>
                            <th className="p-3 text-xs font-bold uppercase text-slate-500 text-right">Percentage</th>
                            <th className="p-3 text-xs font-bold uppercase text-slate-500 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.ReportCardDetail.map((detail) => (
                            <tr key={detail.subjectId} className="border-b border-slate-200 text-sm">
                              <td className="p-3 font-medium text-slate-800">
                                {detail.Subject?.subjectName || detail.subjectId}
                              </td>
                              <td className="p-3 text-right font-mono text-slate-600">{detail.totalMarks}</td>
                              <td className="p-3 text-right font-mono font-semibold text-slate-800">{detail.obtainedMarks}</td>
                              <td className="p-3 text-right font-mono text-slate-600">{detail.percentage.toFixed(1)}%</td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    detail.remarks === "Passed"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-red-50 text-red-700 border border-red-200"
                                  }`}
                                >
                                  {detail.remarks}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary statistics */}
                    <div className="grid grid-cols-3 gap-4 border border-slate-200 rounded-xl p-5 bg-slate-50">
                      <div className="text-center border-r border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Marks</span>
                        <p className="text-lg font-bold text-slate-700">{report.totalObtainedMarks} / {report.totalMaxMarks}</p>
                      </div>
                      <div className="text-center border-r border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Percentage</span>
                        <p className="text-lg font-bold text-slate-700">{report.percentage.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Result</span>
                        <p
                          className={`text-lg font-extrabold ${
                            report.status === "PASSED" ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {report.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="grid grid-cols-2 gap-8 border border-slate-200 rounded-xl p-5 bg-slate-50/50 mt-4 text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {"Class Teacher's Remarks"}
                      </span>
                      <p className="text-sm font-medium text-slate-700 italic min-h-[40px] whitespace-pre-wrap">
                        {report.teacherRemarks ?? "No remarks added."}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {"Headmaster's/Principal's Remarks"}
                      </span>
                      <p className="text-sm font-medium text-slate-700 italic min-h-[40px] whitespace-pre-wrap">
                        {report.headRemarks ?? "No remarks added."}
                      </p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between border-t border-slate-100 pt-8 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-40 border-b border-slate-300 mb-2"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Class Teacher</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-40 border-b border-slate-300 mb-2"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Principal</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-8 w-8 opacity-50" />
              <p>No report cards generated yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
