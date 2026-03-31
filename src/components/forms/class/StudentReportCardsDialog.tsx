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

  const updateReportCardMutation = api.reportCard.updateReportCard?.useMutation(
    {
      onSuccess: async () => {
        await refetch();
        setEditingReportId(null);
      },
    },
  );

  const handleEditClick = (report: ReportType) => {
    setEditingReportId(report.reportCardId);
    setEditData(report.ReportCardDetail.map((detail) => ({ ...detail })));
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
    });
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
              <div
                key={report.reportCardId}
                className="space-y-4 rounded-xl border border-border bg-muted p-4"
              >
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
                    <div className="col-span-2">Subject (ID)</div>
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
                        {detail.subjectId}
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

                <div className="flex justify-end border-t border-border pt-2">
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(report)}
                      className="h-8 border-border bg-transparent text-foreground hover:bg-white/5 hover:text-foreground"
                    >
                      <Edit className="mr-1 h-3.5 w-3.5" /> Edit Report
                    </Button>
                  )}
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
