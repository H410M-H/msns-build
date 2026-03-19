"use client";

import { GraduationCap, BookOpen, CheckCircle2, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

// Mock data for teacher classes
const TEACHER_CLASSES = [
  {
    id: 1,
    name: "Grade 10 - Mathematics",
    section: "A",
    students: 32,
    assignments: 5,
    pending: 3,
  },
  {
    id: 2,
    name: "Grade 10 - Physics",
    section: "B",
    students: 28,
    assignments: 4,
    pending: 2,
  },
  {
    id: 3,
    name: "Grade 11 - Computer Science",
    section: "A",
    students: 25,
    assignments: 3,
    pending: 1,
  },
];

const RECENT_ASSIGNMENTS = [
  {
    id: 1,
    title: "Algebra - Chapter 5 Exercises",
    class: "Grade 10 A",
    dueDate: "Tomorrow",
    submissions: "28/32",
    graded: "15/32",
  },
  {
    id: 2,
    title: "Physics Lab Report",
    class: "Grade 10 B",
    dueDate: "In 3 days",
    submissions: "20/28",
    graded: "10/28",
  },
  {
    id: 3,
    title: "Programming Project",
    class: "Grade 11 A",
    dueDate: "In 5 days",
    submissions: "18/25",
    graded: "5/25",
  },
];

export const TeacherSection = () => {
  return (
    <section className="mb-12 space-y-8">
      {/* Classes Overview */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="-rotate-1 transform rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
              <GraduationCap className="h-6 w-6 text-foreground" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Your Classes</h2>
            <p className="text-muted-foreground">
              Teaching assignments for this session
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TEACHER_CLASSES.map((cls) => (
            <Card
              key={cls.id}
              className="border-border bg-card hover:shadow-lg transition-all cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Section {cls.section}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {cls.students} students
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-semibold">{cls.assignments}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Assignments</p>
                  </div>
                  <div className="rounded-lg bg-orange-500/10 p-2">
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">{cls.pending}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-foreground hover:bg-white/5"
                >
                  View Class
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Assignment Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-xl">
              <CheckCircle2 className="h-6 w-6 text-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                Assignment Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Track submissions and grading progress
              </p>
            </div>
          </div>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <BookOpen className="h-4 w-4" />
            Create Assignment
          </Button>
        </div>

        <div className="space-y-3">
          {RECENT_ASSIGNMENTS.map((assignment) => (
            <Card
              key={assignment.id}
              className="border-border bg-card hover:shadow-md transition-all"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-blue-500/10 p-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {assignment.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {assignment.class}
                          </Badge>
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="rounded-lg bg-slate-500/10 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Submitted: {assignment.submissions}
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Graded: {assignment.graded}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-white/5"
                    >
                      Grade Submissions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
