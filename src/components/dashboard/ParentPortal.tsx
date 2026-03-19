"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Bell, Mail, MessageSquare, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  average: number;
}

interface AnalyticsData {
  overallAverage: number;
  totalExams: number;
  passingRate: number;
  subjectWisePerformance: SubjectPerformance[];
}

interface PortalNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  date: Date;
  actionable: boolean;
}

interface ParentPortalProps {
  studentId: string;
  studentName?: string;
}

export function ParentPortal({ studentId, studentName = "Your Child" }: ParentPortalProps) {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes] = await Promise.all([
          fetch(`/api/student/analytics?studentId=${studentId}`),
        ]);

        const analyticsData = (await analyticsRes.json()) as AnalyticsData;
        setAnalytics(analyticsData);

        // Generate notifications based on analytics
        generateNotifications(analyticsData);
      } catch (error) {
        console.error("Error fetching parent portal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const generateNotifications = (data: AnalyticsData) => {
    const notifs: PortalNotification[] = [];

    if (data.overallAverage < 60) {
      notifs.push({
        id: "low-performance",
        type: "warning",
        title: "Performance Alert",
        message: `${studentName}&apos;s average performance (${data.overallAverage.toFixed(1)}%) is below 60%. Consider arranging extra tuition.`,
        icon: <AlertCircle className="h-4 w-4" />,
        date: new Date(),
        actionable: true,
      });
    }

    if (data.passingRate < 75) {
      notifs.push({
        id: "low-passing-rate",
        type: "warning",
        title: "Passing Rate Below Target",
        message: `${studentName}&apos;s passing rate is ${data.passingRate.toFixed(1)}%. Intervention may be needed.`,
        icon: <TrendingDown className="h-4 w-4" />,
        date: new Date(),
        actionable: true,
      });
    } else {
      notifs.push({
        id: "good-progress",
        type: "success",
        title: "Excellent Progress",
        message: `${studentName} is doing well with a ${data.passingRate.toFixed(1)}% passing rate.`,
        icon: <TrendingUp className="h-4 w-4" />,
        date: new Date(),
        actionable: false,
      });
    }

    setNotifications(notifs);
  };

  if (loading) {
    return <div className="text-center py-8">Loading parent portal...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.overallAverage.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1">Based on {analytics?.totalExams} exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Passing Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                (analytics?.passingRate ?? 0) >= 75 ? "text-green-600" : "text-amber-600"
              }`}
            >
              {analytics?.passingRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round(((analytics?.passingRate ?? 0) / 100) * (analytics?.totalExams ?? 0))} out of{" "}
              {analytics?.totalExams} exams passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">Today</div>
            <p className="text-xs text-gray-600 mt-1">Real-time performance tracking</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Important Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notif) => (
              <Alert
                key={notif.id}
                className={`border-l-4 ${
                  notif.type === "warning"
                    ? "border-l-amber-500 bg-amber-50"
                    : "border-l-green-500 bg-green-50"
                }`}
              >
                <AlertDescription>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{notif.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{notif.title}</p>
                      <p className="text-sm mt-1">{notif.message}</p>
                      {notif.actionable && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Contact Teacher
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3 mr-1" />
                            Schedule Meeting
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Subject Performance Summary */}
      {analytics?.subjectWisePerformance && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance Summary</CardTitle>
            <CardDescription>Average performance across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.subjectWisePerformance.map((subject) => (
                <div key={subject.subjectId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{subject.subjectName}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          subject.average >= 80
                            ? "bg-green-500"
                            : subject.average >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(subject.average, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-lg font-bold">{subject.average.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communication Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Teacher
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Email School
            </Button>
            <Button variant="outline" className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
            <Button variant="outline" className="w-full">
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>School Recommendations</CardTitle>
          <CardDescription>Suggestions to improve your child&apos;s performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertDescription>
              <p className="font-semibold">Regular Communication</p>
              <p className="text-sm mt-1">Stay updated with your child&apos;s progress through regular parent-teacher meetings and updates.</p>
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertDescription>
              <p className="font-semibold">Home Study Support</p>
              <p className="text-sm mt-1">Create a dedicated study space and ensure your child dedicates 1-2 hours daily to studies.</p>
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertDescription>
              <p className="font-semibold">Additional Tuition</p>
              <p className="text-sm mt-1">For subjects where performance is below 60%, consider arranging extra tuition or coaching.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
