"use client";

import React, { useState } from "react";
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
import { FileText, Loader2, Edit, Save, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";

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
  
  const { data: reports, isLoading, refetch } = api.reportCard.getStudentSessionReports.useQuery(
    { studentId, sessionId },
    { enabled: open }
  );

  type ReportType = NonNullable<typeof reports>[number];
  type ReportDetailType = ReportType["ReportCardDetail"][number];
  type EditDetailType = Omit<ReportDetailType, "obtainedMarks" | "totalMarks"> & {
    obtainedMarks: number | string;
    totalMarks: number | string;
  };

  // Edit State
  const [editData, setEditData] = useState<EditDetailType[]>([]);

  const updateReportCardMutation = api.reportCard.updateReportCard?.useMutation({
    onSuccess: async () => {
      await refetch();
      setEditingReportId(null);
    }
  });

  const handleEditClick = (report: ReportType) => {
    setEditingReportId(report.reportCardId);
    setEditData(report.ReportCardDetail.map((detail) => ({ ...detail })));
  };

  const handleSaveEdit = async (report: ReportType) => {
    if (!updateReportCardMutation) return;

    await updateReportCardMutation.mutateAsync({
      reportCardId: report.reportCardId,
      details: editData.map(d => ({
        subjectId: d.subjectId,
        obtainedMarks: Number(d.obtainedMarks),
        totalMarks: Number(d.totalMarks),
      }))
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="h-3.5 w-3.5 mr-2" /> View Report Cards
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-900 border-white/10 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Cards - {studentName}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Performance overview for the current session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : reports && reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.reportCardId}
                className="border border-white/10 p-4 rounded-xl bg-slate-800/50 space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <h4 className="font-bold text-lg text-emerald-400">
                      {report.Exam?.examTypeEnum}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Started: {new Date(report.Exam?.startDate ?? "").toLocaleDateString()}
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
                      {report.totalObtainedMarks} / {report.totalMaxMarks} ({report.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-400 pb-2 border-b border-white/5">
                    <div className="col-span-2">Subject (ID)</div>
                    <div className="text-right">Marks</div>
                    <div className="text-right">Grade/Remarks</div>
                  </div>
                  {(editingReportId === report.reportCardId ? editData : report.ReportCardDetail).map(
                    (detail, index: number) => (
                      <div
                        key={detail.subjectId}
                        className="grid grid-cols-4 gap-2 text-sm items-center"
                      >
                        <div className="col-span-2 truncate">{detail.subjectId}</div>
                        <div className="text-right font-mono">
                          {editingReportId === report.reportCardId ? (
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="number"
                                className="w-16 h-7 text-xs p-1 bg-slate-950 border-white/10 text-white text-right"
                                value={detail.obtainedMarks}
                                onChange={(e) => {
                                  const newData = [...editData];
                                  newData[index]!.obtainedMarks = e.target.value;
                                  setEditData(newData);
                                }}
                              />
                              <span className="text-slate-500">/</span>
                              <Input
                                type="number"
                                className="w-16 h-7 text-xs p-1 bg-slate-950 border-white/10 text-white text-right"
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
                        <div className="text-right text-xs">
                          {detail.remarks}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  {editingReportId === report.reportCardId ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingReportId(null)}
                        className="h-8 text-slate-400 hover:text-white hover:bg-white/5"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(report)}
                        disabled={updateReportCardMutation?.isPending}
                        className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        {updateReportCardMutation?.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5 mr-1" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(report)}
                      className="h-8 border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit Report
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No report cards generated yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
