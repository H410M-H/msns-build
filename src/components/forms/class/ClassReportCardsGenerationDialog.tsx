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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { FileText, Loader2, Sparkles, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { toast } from "sonner";


interface ClassReportCardsGenerationDialogProps {
  classId: string;
  sessionId: string;
}

export function ClassReportCardsGenerationDialog({
  classId,
  sessionId,
}: ClassReportCardsGenerationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    generatedCount: number;
    skippedCount: number;
    message: string;
  } | null>(null);

  // Fetch all exams for this class
  const { data: exams, isLoading: examsLoading } = api.exam.getExamsForClass.useQuery(
    { classId, sessionId },
    { enabled: open }
  );

  const generateMutation = api.reportCard.generateClassReportCards.useMutation({
    onSuccess: (data) => {
      setResult({
        generatedCount: data.generatedCount,
        skippedCount: data.skippedCount,
        message: data.message,
      });
      toast.success("Batch generation completed!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate report cards");
    },
  });

  const handleGenerate = async () => {
    if (!selectedExam) {
      toast.error("Please select an exam first");
      return;
    }
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({
        classId,
        examId: selectedExam,
        sessionId,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setSelectedExam("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="border-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-foreground shadow-lg shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500 transition-all font-medium"
        >
          <Sparkles className="mr-2 h-4 w-4 text-emerald-100 animate-pulse" /> Auto-Generate Report Cards
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            <span>Generate Class Report Cards</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fetch obtained marks and automatically compile report cards for all students in this class.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!result ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Exam
                </label>
                {examsLoading ? (
                  <div className="flex h-10 items-center justify-center rounded-lg border border-border bg-muted/50">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  </div>
                ) : exams && exams.length > 0 ? (
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger className="border-border bg-card text-foreground">
                      <SelectValue placeholder="Choose an examination" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-foreground">
                      {exams.map((exam) => (
                        <SelectItem key={exam.examId} value={exam.examId}>
                          {exam.ExamType.name} ({exam.examTypeEnum})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    No exams found for this class. Create an exam first.
                  </div>
                )}
              </div>

              {selectedExam && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span>Evaluation Prep</span>
                  </div>
                  <p className="text-xs">
                    This will fetch obtained marks in all subjects for each student and calculate their total scores, passing status, and details. Students missing marks in any subject will be skipped.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-border bg-transparent text-foreground hover:bg-white/5"
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedExam}
                  className="bg-emerald-600 text-foreground hover:bg-emerald-500 shadow-md shadow-emerald-900/10"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Now"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold">Process Completed</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {result.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-border bg-emerald-500/5 p-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated</p>
                  <p className="text-2xl font-bold text-emerald-400">{result.generatedCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-amber-500/5 p-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skipped</p>
                  <p className="text-2xl font-bold text-amber-400">{result.skippedCount}</p>
                </div>
              </div>

              {result.skippedCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Some students were skipped because their marks for one or more subjects have not been uploaded in the marking centre yet.
                  </span>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button onClick={handleClose} className="bg-emerald-600 text-foreground hover:bg-emerald-500 px-6">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
