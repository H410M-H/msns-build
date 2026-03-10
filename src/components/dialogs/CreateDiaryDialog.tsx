"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { PlusIcon, Loader2, Trash2, X } from "lucide-react";
import { api } from "~/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card } from "~/components/ui/card";

interface SubjectWork {
  classSubjectId: string;
  subjectName: string;
  teacherName: string;
  content: string;
}

interface CreateDiaryDialogProps {
  classId: string;
  sessionId: string;
  refetch: () => void;
}

export function CreateDiaryDialog({
  classId,
  sessionId,
  refetch,
}: CreateDiaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [diaryDate, setDiaryDate] = useState<string>(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [subjectWorks, setSubjectWorks] = useState<SubjectWork[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [content, setContent] = useState("");

  const router = useRouter();

  const { data: subjectsData, isLoading: subjectsLoading } =
    api.subject.getSubjectsByClass.useQuery(
      { classId, sessionId },
      { enabled: open }
    );

  const createDiary = api.subjectDiary.createDiary.useMutation({
    onSuccess: () => {
      toast.success("Diary created successfully");
      setSubjectWorks([]);
      setSelectedSubject("");
      setContent("");
      refetch();
      router.refresh();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create diary");
    },
  });

  const handleAddSubjectWork = () => {
    if (!selectedSubject || !content.trim()) {
      toast.error("Please select a subject and enter content");
      return;
    }

    const subject = subjectsData?.find((s) => s.csId === selectedSubject);
    if (!subject) {
      toast.error("Subject not found");
      return;
    }

    // Check for duplicates
    if (subjectWorks.find((sw) => sw.classSubjectId === selectedSubject)) {
      toast.error("This subject is already added");
      return;
    }

    setSubjectWorks([
      ...subjectWorks,
      {
        classSubjectId: selectedSubject,
        subjectName: subject.Subject.subjectName,
        teacherName: subject.Employees.employeeName,
        content: content.trim(),
      },
    ]);

    setSelectedSubject("");
    setContent("");
  };

  const handleCreateDiary = async () => {
    if (subjectWorks.length === 0) {
      toast.error("Please add at least one diary entry");
      return;
    }

    try {
      await Promise.all(
        subjectWorks.map((sw) =>
          createDiary.mutateAsync({
            classSubjectId: sw.classSubjectId,
            date: new Date(diaryDate),
            content: sw.content,
          })
        )
      );
    } catch (error) {
      console.error("Diary creation error:", error);
    }
  };

  const handleRemoveEntry = (index: number) => {
    setSubjectWorks(subjectWorks.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Diary
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Subject Diaries</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <input
              type="date"
              value={diaryDate}
              onChange={(e) => setDiaryDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label>Select Subject</Label>
            {subjectsLoading ? (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading subjects...
              </div>
            ) : !subjectsData || subjectsData.length === 0 ? (
              <div className="rounded-md border border-dashed border-muted-foreground bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                No subjects assigned to this class
              </div>
            ) : (
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectsData.map((subject) => (
                    <SelectItem key={subject.csId} value={subject.csId}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {subject.Subject.subjectName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          by {subject.Employees.employeeName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Label>Diary Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter what was taught today, homework, notes, etc..."
              className="min-h-24 resize-none rounded-md"
            />
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddSubjectWork}
            disabled={!selectedSubject || !content.trim() || subjectsLoading}
            className="w-full"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Entry
          </Button>

          {/* Added Entries List */}
          {subjectWorks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Diary Entries ({subjectWorks.length})</h3>
              <div className="space-y-2">
                {subjectWorks.map((entry, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-semibold text-sm">
                          {entry.subjectName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.teacherName}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {entry.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEntry(idx)}
                        className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleCreateDiary}
              disabled={subjectWorks.length === 0 || createDiary.isPending}
              className="flex-1"
            >
              {createDiary.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create All
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
