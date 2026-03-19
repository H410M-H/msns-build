"use client";

import {
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";

// Mock data for student courses
const STUDENT_COURSES = [
  {
    id: 1,
    name: "Mathematics",
    teacher: "Mr. Ahmed Khan",
    progress: 85,
    grade: "A",
    assignments: 12,
    completed: 10,
  },
  {
    id: 2,
    name: "Physics",
    teacher: "Mrs. Fatima Ahmed",
    progress: 78,
    grade: "B+",
    assignments: 10,
    completed: 8,
  },
  {
    id: 3,
    name: "Computer Science",
    teacher: "Mr. Hassan Ali",
    progress: 92,
    grade: "A+",
    assignments: 8,
    completed: 8,
  },
  {
    id: 4,
    name: "English",
    teacher: "Ms. Aisha Khan",
    progress: 88,
    grade: "A",
    assignments: 9,
    completed: 9,
  },
];

const UPCOMING_ASSESSMENTS = [
  {
    id: 1,
    title: "Algebra Midterm Exam",
    course: "Mathematics",
    date: "Tomorrow, 9:00 AM",
    type: "exam",
  },
  {
    id: 2,
    title: "Physics Lab Report",
    course: "Physics",
    date: "Due in 2 days",
    type: "assignment",
  },
  {
    id: 3,
    title: "Programming Project Submission",
    course: "Computer Science",
    date: "Due in 5 days",
    type: "assignment",
  },
];

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "text-emerald-500";
  if (grade.startsWith("B")) return "text-blue-500";
  if (grade.startsWith("C")) return "text-orange-500";
  return "text-red-500";
};

export const StudentSection = () => {
  return (
    <section className="mb-12 space-y-8">
      {/* Enrolled Courses */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="rotate-1 transform rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
              <BookOpen className="h-6 w-6 text-foreground" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Your Courses</h2>
            <p className="text-muted-foreground">Track your academic progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {STUDENT_COURSES.map((course) => (
            <Card
              key={course.id}
              className="border-border bg-card hover:shadow-lg transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.teacher}
                    </p>
                  </div>
                  <Badge
                    className={`ml-2 ${getGradeColor(course.grade)} border-none bg-white/10`}
                  >
                    {course.grade}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-semibold text-foreground">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress
                    value={course.progress}
                    className="h-2 bg-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-semibold">
                        {course.completed}/{course.assignments}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Assignments</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">
                        {Math.round((course.completed / course.assignments) * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-foreground hover:bg-white/5"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Assessments */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-xl">
            <Award className="h-6 w-6 text-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">
              Upcoming Assessments
            </h3>
            <p className="text-sm text-muted-foreground">
              Exams and assignments coming up
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {UPCOMING_ASSESSMENTS.map((assessment) => (
            <Card
              key={assessment.id}
              className="border-border bg-card hover:shadow-md transition-all"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 rounded-full p-2 ${
                        assessment.type === "exam"
                          ? "bg-red-500/10"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {assessment.type === "exam" ? (
                        <AlertCircle
                          className={`h-4 w-4 ${
                            assessment.type === "exam"
                              ? "text-red-500"
                              : "text-blue-500"
                          }`}
                        />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {assessment.title}
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {assessment.course} • {assessment.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      assessment.type === "exam"
                        ? "border-red-500/20 text-red-400"
                        : "border-blue-500/20 text-blue-400"
                    }`}
                  >
                    {assessment.type === "exam" ? "Exam" : "Assignment"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
