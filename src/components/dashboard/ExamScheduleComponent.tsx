"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface ExamScheduleProps {
  studentId: string;
  classId: string;
}

export function ExamScheduleComponent({ studentId, classId }: ExamScheduleProps) {
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          `/api/student/exam-schedule?studentId=${studentId}&classId=${classId}`
        );
        const data = await response.json();
        setScheduleData(data);
      } catch (error) {
        console.error("Error fetching exam schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [studentId, classId]);

  if (loading) {
    return <div className="text-center py-8">Loading exam schedule...</div>;
  }

  if (!scheduleData?.upcomingExams || scheduleData.upcomingExams.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No upcoming exams scheduled
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Exams */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Upcoming Exams</h3>
        <div className="space-y-4">
          {scheduleData.upcomingExams.map((exam: any) => (
            <Card key={exam.examId} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{exam.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(exam.startDate).toLocaleDateString()} -{" "}
                      {new Date(exam.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      exam.daysUntilStart <= 7
                        ? "destructive"
                        : exam.daysUntilStart <= 14
                          ? "default"
                          : "secondary"
                    }
                  >
                    {exam.daysUntilStart} days away
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Marks</p>
                    <p className="text-xl font-bold">{exam.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passing Marks</p>
                    <p className="text-xl font-bold text-green-600">
                      {exam.passingMarks}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subjects</p>
                    <p className="text-xl font-bold">{exam.subjects.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-xl font-bold">{exam.duration}</p>
                  </div>
                </div>

                {/* Subject Schedule */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Subject Schedule
                  </h4>
                  <div className="space-y-2">
                    {exam.subjects.map((subject: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{subject.subject}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {subject.startTime} - {subject.endTime}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(subject.date).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Study Timeline */}
      {scheduleData.suggestedTimeline && scheduleData.suggestedTimeline.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Suggested Study Timeline</h3>
          <div className="space-y-4">
            {scheduleData.suggestedTimeline.map((timeline: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{timeline.examName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Start studying from{" "}
                      {new Date(timeline.studyStartDate).toLocaleDateString()}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {timeline.milestones.map((milestone: any) => (
                      <div
                        key={milestone.week}
                        className="p-3 border rounded-lg bg-slate-50"
                      >
                        <p className="font-semibold">Week {milestone.week}</p>
                        <p className="text-sm text-gray-600 mt-1">{milestone.goal}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Weekly Schedule</h4>
                    <div className="space-y-2">
                      {timeline.weeklySchedule.map((week: any) => (
                        <div key={week.week} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <span className="text-sm">Week {week.week}</span>
                          <Badge variant="outline">
                            {week.hoursPerDay.toFixed(1)} hrs/day
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Study Resources */}
      {scheduleData.studyResources && scheduleData.studyResources.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Past Exam Resources</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {scheduleData.studyResources.map((resource: any) => (
              <Card key={resource.examId}>
                <CardHeader>
                  <CardTitle className="text-base">{resource.name}</CardTitle>
                  <CardDescription>{resource.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resource.subjects.map((subject: string) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
