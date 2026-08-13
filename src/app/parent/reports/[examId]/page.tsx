"use client";

import { useParams, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { ArrowLeft, Download, FileText, CheckCircle2, Award } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function ReportCardViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;
  const studentId = searchParams.get("studentId") || "";

  const { data: activeCard, isLoading } = api.reportCard.getStudentReportCard.useQuery(
    { studentId, examId },
    { enabled: !!studentId && !!examId }
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Button>

        <Button
          onClick={() => alert("Downloading Report Card PDF...")}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          <Download className="h-4 w-4 mr-1.5" /> Download PDF
        </Button>
      </div>

      {!activeCard ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h2 className="text-lg font-bold text-white">Report Card Not Located</h2>
          <p className="text-sm text-slate-400 mt-1">The requested examination report card is not published yet or has been updated.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 backdrop-blur-md">
          {/* Header Info */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">{activeCard.Exam?.examTypeEnum || "Official Examination Card"}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">M.S. Naz High School® — Academic Evaluation</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block uppercase">Overall Grade</span>
                <span className="text-2xl font-black text-emerald-400">{Math.round(activeCard.percentage)}%</span>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                activeCard.status === "PASSED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {activeCard.status}
              </span>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Total Marks</th>
                  <th className="px-4 py-3">Obtained Marks</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeCard.ReportCardDetail?.map((detail: any) => (
                  <tr key={detail.reportDetailId} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold text-white">{detail.Subject?.subjectName || "Subject"}</td>
                    <td className="px-4 py-3">{detail.totalMarks}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{detail.obtainedMarks}</td>
                    <td className="px-4 py-3">{Math.round(detail.percentage)}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        detail.percentage >= 45 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {detail.remarks || (detail.percentage >= 45 ? "Passed" : "Failed")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
            <span>Total Score: {activeCard.totalObtainedMarks} / {activeCard.totalMaxMarks}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Official Computerized Card
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
