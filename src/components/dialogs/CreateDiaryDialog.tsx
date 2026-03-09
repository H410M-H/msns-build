"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";

interface SubjectWork {
  csId: string;
  subjectName: string;
  work: string;
  employeeName?: string;
}

interface CreateDiaryDialogProps {
  classId: string;
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateDiaryDialog({
  classId,
  sessionId,
  open,
  onOpenChange,
  onSuccess,
}: CreateDiaryDialogProps) {
  const [diaryDate, setDiaryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [subjectWorks, setSubjectWorks] = useState<SubjectWork[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [workText, setWorkText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch class subjects
  const { data: classSubjects, isLoading: isLoadingSubjects } =
    api.class.getClassSubjects.useQuery(
      { classId, sessionId },
      { enabled: open }
    );

  // Create diary mutation
  const createDiaryMutation = api.subjectDiary.createDiary.useMutation();

  // Initialize subject works when subjects load
  useEffect(() => {
    if (classSubjects && classSubjects.length > 0) {
      const initialWorks = classSubjects.map((cs) => ({
        csId: cs.csId,
        subjectName: cs.Subject?.subjectName ?? "Unknown",
        work: "",
        employeeName: cs.Employees?.employeeName,
      }));
      setSubjectWorks(initialWorks);
      if (initialWorks.length > 0) {
        setSelectedSubject(initialWorks[0]?.csId ?? "");
      }
    }
  }, [classSubjects]);

  // Get current subject work
  const currentSubjectIndex = subjectWorks.findIndex(
    (sw) => sw.csId === selectedSubject
  );
  const currentSubjectWork = subjectWorks[currentSubjectIndex];

  const handleAddWork = () => {
    if (!selectedSubject || !workText.trim()) return;

    setSubjectWorks((prev) =>
      prev.map((sw) =>
        sw.csId === selectedSubject ? { ...sw, work: workText } : sw
      )
    );

    // Move to next subject
    const nextIndex = currentSubjectIndex + 1;
    if (nextIndex < subjectWorks.length) {
      setSelectedSubject(subjectWorks[nextIndex]?.csId ?? "");
      setWorkText("");
    } else {
      setWorkText("");
    }
  };

  const handleRemoveWork = (csId: string) => {
    setSubjectWorks((prev) =>
      prev.map((sw) => (sw.csId === csId ? { ...sw, work: "" } : sw))
    );
  };

  const handleSubmit = async () => {
    if (!diaryDate) return;

    setIsSubmitting(true);
    try {
      // Create a diary entry for each subject with work
      const workToCreate = subjectWorks.filter((sw) => sw.work.trim());

      if (workToCreate.length === 0) {
        alert("Please add work for at least one subject");
        setIsSubmitting(false);
        return;
      }

      // Create diaries in parallel
      await Promise.all(
        workToCreate.map((sw) =>
          createDiaryMutation.mutateAsync({
            classSubjectId: sw.csId,
            date: new Date(diaryDate),
            content: sw.work,
            attachments: [],
          })
        )
      );

      onSuccess();
    } catch (error) {
      console.error("Error creating diaries:", error);
      alert("Failed to create diaries. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectsWithWork = subjectWorks.filter((sw) => sw.work.trim()).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Daily Work
          </DialogTitle>
          <DialogDescription>
            Add work/homework for all subjects in this class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={diaryDate}
              onChange={(e) => setDiaryDate(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {isLoadingSubjects ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !classSubjects || classSubjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
              No subjects assigned to this class yet.
            </div>
          ) : (
            <>
              {/* Subject Selection and Work Input */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Add Work for Subject
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedSubject}
                      onChange={(e) => {
                        setWorkText(subjectWorks.find(
                          (sw) => sw.csId === e.target.value
                        )?.work ?? "");
                        setSelectedSubject(e.target.value);
                      }}
                      className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                    >
                      {subjectWorks.map((sw) => (
                        <option key={sw.csId} value={sw.csId}>
                          {sw.subjectName}
                          {sw.work ? " ✓" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  {currentSubjectWork?.employeeName && (
                    <p className="text-xs text-muted-foreground">
                      Teacher: {currentSubjectWork.employeeName}
                    </p>
                  )}
                </div>

                <Textarea
                  placeholder="Enter daily work, homework, or assignments for this subject..."
                  value={workText}
                  onChange={(e) => setWorkText(e.target.value)}
                  className="min-h-32 resize-none"
                />

                <Button
                  onClick={handleAddWork}
                  variant="outline"
                  className="w-full"
                  disabled={!workText.trim()}
                >
                  Add Work for This Subject
                </Button>
              </div>

              {/* Subjects Work Summary Table */}
              {subjectWorks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Work Summary ({subjectsWithWork} of {subjectWorks.length})
                    </label>
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card">
                        <TableRow className="border-b border-border hover:bg-transparent">
                          <TableHead className="w-40">Subject</TableHead>
                          <TableHead className="flex-1">Work</TableHead>
                          <TableHead className="w-12 text-center">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjectWorks.map((sw) => (
                          <TableRow
                            key={sw.csId}
                            className={`border-b border-border transition-colors ${
                              sw.work
                                ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <TableCell className="font-medium">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {sw.subjectName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {sw.employeeName}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {sw.work ? (
                                <div className="space-y-1">
                                  <Badge
                                    variant="secondary"
                                    className="inline-block bg-emerald-500/20 text-emerald-300"
                                  >
                                    Added
                                  </Badge>
                                  <p className="line-clamp-2 text-xs">
                                    {sw.work}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  No work added
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {sw.work && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveWork(sw.csId)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || subjectsWithWork === 0}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create Diaries (${subjectsWithWork})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
