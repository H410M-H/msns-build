"use client";

import { useState } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { BookOpen, Filter, Loader2, Eye } from "lucide-react";
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
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { motion } from "framer-motion";

// Mock data for diaries - would be fetched from API
const MOCK_DIARIES = [
  {
    subjectDiaryId: "diary-1",
    subject: "Mathematics",
    class: "Class 5 - A",
    teacher: "Mr. Ahmed Hassan",
    date: new Date("2024-01-15"),
    content: "Completed Chapter 3 - Algebra Basics. Students practiced 20 problems on linear equations.",
    classSubject: { grade: "Class 5", section: "A" },
  },
  {
    subjectDiaryId: "diary-2",
    subject: "English",
    class: "Class 5 - A",
    teacher: "Ms. Fatima Khan",
    date: new Date("2024-01-15"),
    content: "Reading comprehension exercise with short stories. Vocabulary building session on literary devices.",
    classSubject: { grade: "Class 5", section: "A" },
  },
  {
    subjectDiaryId: "diary-3",
    subject: "Science",
    class: "Class 4 - B",
    teacher: "Dr. Ali Raza",
    date: new Date("2024-01-14"),
    content: "Lab experiment on water cycle. Students observed and documented evaporation, condensation, and precipitation.",
    classSubject: { grade: "Class 4", section: "B" },
  },
];

const breadcrumbs = [
  { href: "/head", label: "Dashboard" },
  { href: "/head/diaries", label: "Subject Diaries" },
];

export default function HeadDiariesPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [viewingDiary, setViewingDiary] = useState<(typeof MOCK_DIARIES)[0] | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  // Filter diaries
  const filteredDiaries = MOCK_DIARIES.filter((diary) => {
    if (
      selectedDate &&
      format(diary.date, "yyyy-MM-dd") !== selectedDate
    )
      return false;
    if (selectedClass && !diary.class.includes(selectedClass)) return false;
    if (selectedSubject && diary.subject !== selectedSubject) return false;
    return true;
  });

  const uniqueClasses = [...new Set(MOCK_DIARIES.map((d) => d.class))];
  const uniqueSubjects = [...new Set(MOCK_DIARIES.map((d) => d.subject))];

  const handleViewDiary = (diary: (typeof MOCK_DIARIES)[0]) => {
    setViewingDiary(diary);
    setShowViewDialog(true);
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Diaries", value: MOCK_DIARIES.length, icon: "📚" },
            {
              label: "Classes",
              value: uniqueClasses.length,
              icon: "🏫",
            },
            {
              label: "Subjects",
              value: uniqueSubjects.length,
              icon: "📖",
            },
            {
              label: "Teachers",
              value: new Set(MOCK_DIARIES.map((d) => d.teacher)).size,
              icon: "👨‍🏫",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="rounded-2xl border-border bg-gradient-to-br from-card to-card/50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className="text-3xl opacity-20">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter Section */}
        <Card className="rounded-2xl border-border bg-card shadow-lg">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter Diaries
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {uniqueClasses.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {uniqueSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diaries List */}
        {filteredDiaries.length === 0 ? (
          <Card className="rounded-2xl border-border bg-card shadow-lg">
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-4 h-8 w-8 opacity-20" />
              <p>No diaries match your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDiaries.map((diary, index) => (
              <motion.div
                key={diary.subjectDiaryId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group border-l-4 border-l-indigo-500 transition-all hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-indigo-500/20 text-indigo-300"
                            >
                              {diary.subject}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-blue-500/20 text-blue-300"
                            >
                              {diary.class}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {diary.teacher}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(diary.date, "MMMM dd, yyyy")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDiary(diary)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>

                      {/* Content Preview */}
                      <p className="line-clamp-2 text-sm text-foreground">
                        {diary.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results Info */}
        {filteredDiaries.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Showing {filteredDiaries.length} of {MOCK_DIARIES.length} diaries
          </p>
        )}
      </motion.div>

      {/* View Diary Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Diary Entry Details</DialogTitle>
          </DialogHeader>

          {viewingDiary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subject
                  </p>
                  <p className="font-medium">{viewingDiary.subject}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Class
                  </p>
                  <p className="font-medium">{viewingDiary.class}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Teacher
                  </p>
                  <p className="font-medium">{viewingDiary.teacher}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Date
                  </p>
                  <p className="font-medium">
                    {format(viewingDiary.date, "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Content
                </p>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {viewingDiary.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
