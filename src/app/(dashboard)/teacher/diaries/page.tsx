"use client";

import { useState } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { BookOpen, Plus, Edit2, Trash2, Loader2, Filter } from "lucide-react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { motion } from "framer-motion";

interface DiaryEntry {
  subjectDiaryId: string;
  ClassSubject: {
    csId: string;
    Subject: { subjectName: string };
    Grades: { grade: string; section: string };
  };
  date: string;
  content: string;
  attachments: string[];
}

const breadcrumbs = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/diaries", label: "Subject Diaries" },
];

export default function TeacherDiariesPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchSubject, setSearchSubject] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Get teacher ID from profile or session
  const { data: userProfile } = api.profile.getProfile.useQuery(undefined, {
    onSuccess: (data) => {
      if (data?.accountId) {
        setTeacherId(data.accountId);
      }
    },
  });

  // Fetch user's diaries
  const { data: diaries, isLoading, refetch } = api.subjectDiary.getTeacherDiaries.useQuery(
    {
      teacherId: teacherId || "",
      ...(selectedDate ? { date: new Date(selectedDate) } : {}),
    },
    { enabled: !!teacherId }
  );

  const updateDiaryMutation = api.subjectDiary.updateDiary.useMutation();
  const deleteDiaryMutation = api.subjectDiary.deleteDiary.useMutation();

  const handleEditOpen = (diary: DiaryEntry) => {
    setEditingId(diary.subjectDiaryId);
    setEditContent(diary.content);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await updateDiaryMutation.mutateAsync({
        subjectDiaryId: editingId,
        content: editContent,
        attachments: [],
      });
      setShowEditDialog(false);
      setEditingId(null);
      refetch();
    } catch (error) {
      console.error("Error updating diary:", error);
      alert("Failed to update diary");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (diaryId: string) => {
    if (!confirm("Are you sure you want to delete this diary entry?")) return;

    try {
      await deleteDiaryMutation.mutateAsync({ subjectDiaryId: diaryId });
      refetch();
    } catch (error) {
      console.error("Error deleting diary:", error);
      alert("Failed to delete diary");
    }
  };

  const filteredDiaries = diaries?.filter((diary) =>
    diary.ClassSubject.Subject.subjectName
      .toLowerCase()
      .includes(searchSubject.toLowerCase())
  ) || [];

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Filter Section */}
        <Card className="rounded-2xl border-border bg-card shadow-lg">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter Diaries
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Subject</label>
                <Input
                  placeholder="Search by subject name..."
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diaries List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredDiaries.length === 0 ? (
          <Card className="rounded-2xl border-border bg-card shadow-lg">
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-4 h-8 w-8 opacity-20" />
              <p>
                {diaries?.length === 0
                  ? "No diary entries yet. Start by creating one!"
                  : "No diaries match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDiaries.map((diary, index) => (
              <motion.div
                key={diary.subjectDiaryId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group border-t-4 border-t-indigo-500 transition-all hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="bg-indigo-500/20 text-indigo-300"
                        >
                          {diary.ClassSubject.Subject.subjectName}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {diary.ClassSubject.Grades.grade} -{" "}
                          {diary.ClassSubject.Grades.section}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOpen(diary as DiaryEntry)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(diary.subjectDiaryId)}
                          className="h-8 w-8 p-0 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(diary.date), "MMM dd, yyyy")}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm leading-relaxed text-foreground">
                      {diary.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Edit Diary Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your diary entry..."
              className="min-h-40 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting || !editContent.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
