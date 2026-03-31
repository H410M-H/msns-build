"use client";

import { useState } from "react";
import { BookOpen, CalendarIcon, Loader2, User, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSession } from "next-auth/react";

type Diary = {
  subjectDiaryId: string;
  ClassSubject: {
    Subject: { subjectName: string };
  };
  date: string | Date;
  Teacher: { employeeName: string };
  content: string;
};

type ClassSubject = {
  csId: string;
  Subject: { subjectId: string; subjectName: string };
  Employees: { employeeId: string; employeeName: string };
};

export function ClassDiariesTab({
  classId,
  sessionId,
}: {
  classId: string;
  sessionId: string;
}) {
  const { data: session } = useSession();
  const isTeacherOrAdmin = ["ADMIN", "HEAD", "PRINCIPAL", "CLERK", "TEACHER"].includes(
    session?.user?.accountType ?? ""
  );

  const [filterDate, setFilterDate] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedCsId, setSelectedCsId] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const utils = api.useUtils();

  const { data: diaries, isLoading } = api.subjectDiary.getClassDiaries.useQuery({
    classId,
    sessionId,
    ...(filterDate ? { date: new Date(filterDate) } : {}),
  });

  // Fetch assigned subjects for this class/session for the form
  const { data: classSubjects = [], isLoading: subjectsLoading } =
    api.class.getAssignedSubjects.useQuery(
      { classId, sessionId },
      { enabled: open && !!classId && !!sessionId }
    );

  const createDiary = api.subjectDiary.createDiary.useMutation({
    onSuccess: () => {
      setOpen(false);
      setContent("");
      setSelectedCsId("");
      void utils.subjectDiary.getClassDiaries.invalidate();
    },
  });

  const updateDiary = api.subjectDiary.updateDiary.useMutation({
    onSuccess: () => {
      setEditOpen(false);
      setEditId(null);
      setEditContent("");
      void utils.subjectDiary.getClassDiaries.invalidate();
    },
  });

  const deleteDiary = api.subjectDiary.deleteDiary.useMutation({
    onSuccess: () => void utils.subjectDiary.getClassDiaries.invalidate(),
  });

  // Find teacher from selected class subject
  const selectedCs = (classSubjects as ClassSubject[]).find((cs) => cs.csId === selectedCsId);

  const handleCreate = () => {
    if (!selectedCsId || !content.trim() || !selectedCs) return;
    createDiary.mutate({
      classSubjectId: selectedCsId,
      teacherId: selectedCs.Employees.employeeId,
      date: new Date(),
      content,
    });
  };

  const openEdit = (diary: Diary) => {
    setEditId(diary.subjectDiaryId);
    setEditContent(diary.content);
    setEditOpen(true);
  };

  return (
    <Card className="rounded-2xl border-border bg-card shadow-2xl duration-500 animate-in fade-in md:mt-4">
      <CardHeader className="border-b border-border pb-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-indigo-400">
              <BookOpen className="h-5 w-5" />
              Subject Diaries
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Daily updates and homework assigned by teachers.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Filter */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5 text-sm">
              <CalendarIcon className="ml-1 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="mr-2 border-none bg-transparent text-foreground outline-none"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Add Diary Button for authorized roles */}
            {isTeacherOrAdmin && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Diary
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-400" />
                      Add Subject Diary Entry
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    {/* Subject selector – shows only subjects assigned to this class */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Subject
                      </Label>
                      {subjectsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading subjects…
                        </div>
                      ) : (classSubjects as ClassSubject[]).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No subjects assigned to this class yet.
                        </p>
                      ) : (
                        <Select value={selectedCsId} onValueChange={setSelectedCsId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {(classSubjects as ClassSubject[]).map((cs) => (
                              <SelectItem key={cs.csId} value={cs.csId}>
                                {cs.Subject.subjectName}{" "}
                                <span className="text-muted-foreground text-xs">
                                  — {cs.Employees.employeeName}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Content / Homework
                      </Label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write today's diary, assignments or notes…"
                        rows={5}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreate}
                        disabled={
                          !selectedCsId ||
                          !content.trim() ||
                          createDiary.isPending
                        }
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        {createDiary.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Save Entry
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 md:px-8">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : !diaries || diaries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-20" />
            No diaries recorded {filterDate ? "for this date" : "yet"}.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {diaries.map((diary: Diary) => (
              <Card
                key={diary.subjectDiaryId}
                className="overflow-hidden border-t-4 border-border border-t-indigo-500 bg-card shadow-lg"
              >
                <CardHeader className="bg-white/[0.02] p-4 pb-2">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
                    >
                      {diary.ClassSubject.Subject.subjectName}
                    </Badge>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(diary.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {diary.Teacher.employeeName}
                    </div>
                    {isTeacherOrAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-indigo-400"
                          onClick={() => openEdit(diary)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-400"
                          onClick={() =>
                            deleteDiary.mutate({
                              subjectDiaryId: diary.subjectDiaryId,
                            })
                          }
                          disabled={deleteDiary.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="min-h-[80px] whitespace-pre-wrap rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
                    {diary.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Diary Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editId)
                    updateDiary.mutate({
                      subjectDiaryId: editId,
                      content: editContent,
                    });
                }}
                disabled={!editContent.trim() || updateDiary.isPending}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {updateDiary.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
