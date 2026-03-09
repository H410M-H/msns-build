"use client";

import { useState } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { BookOpen, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
    status: "active",
  },
  {
    subjectDiaryId: "diary-2",
    subject: "English",
    class: "Class 5 - A",
    teacher: "Ms. Fatima Khan",
    date: new Date("2024-01-15"),
    content: "Reading comprehension exercise with short stories. Vocabulary building session on literary devices.",
    status: "active",
  },
  {
    subjectDiaryId: "diary-3",
    subject: "Science",
    class: "Class 4 - B",
    teacher: "Dr. Ali Raza",
    date: new Date("2024-01-14"),
    content: "Lab experiment on water cycle. Students observed and documented evaporation, condensation, and precipitation.",
    status: "active",
  },
  {
    subjectDiaryId: "diary-4",
    subject: "Urdu",
    class: "Class 3 - C",
    teacher: "Mrs. Saira Ahmed",
    date: new Date("2024-01-13"),
    content: "Poetry writing exercise. Students learned about couplets and ghazals.",
    status: "active",
  },
  {
    subjectDiaryId: "diary-5",
    subject: "Islamic Studies",
    class: "Class 6 - A",
    teacher: "Mr. Hassan Ali",
    date: new Date("2024-01-12"),
    content: "Quran recitation practice. Focus on Tajweed rules for Surah Al-Fatiha.",
    status: "active",
  },
];

const breadcrumbs = [
  { href: "/principal", label: "Dashboard" },
  { href: "/principal/diaries", label: "Subject Diaries" },
];

export default function PrincipalDiariesPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
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
    if (selectedTeacher && diary.teacher !== selectedTeacher) return false;
    return true;
  });

  const uniqueClasses = [...new Set(MOCK_DIARIES.map((d) => d.class))];
  const uniqueSubjects = [...new Set(MOCK_DIARIES.map((d) => d.subject))];
  const uniqueTeachers = [...new Set(MOCK_DIARIES.map((d) => d.teacher))];

  const handleViewDiary = (diary: (typeof MOCK_DIARIES)[0]) => {
    setViewingDiary(diary);
    setShowViewDialog(true);
  };

  // Calculate statistics
  const stats = {
    total: MOCK_DIARIES.length,
    thisWeek: MOCK_DIARIES.filter(
      (d) =>
        new Date().getTime() - new Date(d.date).getTime() <
        7 * 24 * 60 * 60 * 1000
    ).length,
    classes: uniqueClasses.length,
    subjects: uniqueSubjects.length,
    teachers: uniqueTeachers.length,
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
        <div className="grid gap-4 md:grid-cols-5">
          {[
            {
              label: "Total Entries",
              value: stats.total,
              color: "from-indigo-500/20 to-indigo-500/5",
            },
            {
              label: "This Week",
              value: stats.thisWeek,
              color: "from-blue-500/20 to-blue-500/5",
            },
            {
              label: "Classes",
              value: stats.classes,
              color: "from-emerald-500/20 to-emerald-500/5",
            },
            {
              label: "Subjects",
              value: stats.subjects,
              color: "from-purple-500/20 to-purple-500/5",
            },
            {
              label: "Teachers",
              value: stats.teachers,
              color: "from-amber-500/20 to-amber-500/5",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`rounded-2xl border-border bg-gradient-to-br ${stat.color} shadow-lg`}>
                <CardContent className="pt-6">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
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
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher</label>
                <Select
                  value={selectedTeacher}
                  onValueChange={setSelectedTeacher}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Teachers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Teachers</SelectItem>
                    {uniqueTeachers.map((teacher) => (
                      <SelectItem key={teacher} value={teacher}>
                        {teacher}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diaries Table */}
        {filteredDiaries.length === 0 ? (
          <Card className="rounded-2xl border-border bg-card shadow-lg">
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-4 h-8 w-8 opacity-20" />
              <p>No diaries match your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-border bg-card shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiaries.map((diary, index) => (
                    <motion.tr
                      key={diary.subjectDiaryId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="text-sm">
                        {format(diary.date, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-indigo-500/20 text-indigo-300"
                        >
                          {diary.subject}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{diary.class}</TableCell>
                      <TableCell className="text-sm">{diary.teacher}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDiary(diary)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Diary Entry Details
            </DialogTitle>
          </DialogHeader>

          {viewingDiary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                  <p className="font-medium text-sm">{viewingDiary.teacher}</p>
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
                  Work Details
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
