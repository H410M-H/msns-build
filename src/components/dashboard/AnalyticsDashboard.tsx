"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Award,
  AlertCircle,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";

// --- START OF TYPE DEFINITIONS ---
interface SubjectPerformance {
  subjectName: string;
  average: number;
}

interface AnalyticsData {
  performanceData: unknown[];
  subjectWisePerformance: SubjectPerformance[];
  overallAverage: number;
  trend: unknown[];
  totalExams: number;
  passingRate: number;
}

interface TrendData {
  improvementRate: number;
  trends: Array<{ date: string; percentage: number }>;
  projection?: number;
}

interface ComparativeData {
  studentPercentage: number;
  classAverage: number;
  percentile: number;
  rank: number;
  subjectComparison: Array<{ subject: string; studentPercentage: number; classAverage: number }>;
  subjectDifficulty: Array<{ subject: string; classAverage: number; difficulty: string }>;
}

interface AchievementData {
  totalPoints: number;
  badges: Array<{ id: string; name: string; description: string; icon: string; points: number }>;
  milestones: Array<{ id: string; title: string; description: string }>;
  certificates: Array<{ id: string; title: string; description: string; certificateNumber: string }>;
}

interface FeedbackData {
  strengths: Array<{ subjectId: string; subjectName: string; average: number }>;
  weaknesses: Array<{ subjectId: string; subjectName: string; average: number }>;
  recommendations: Array<{ title: string; description: string; priority: string }>;
  diaries: Array<{ date: string; subject: string; teacher: string; content: string }>;
}

interface DashboardProps {
  studentId: string;
  classId: string;
}
// --- END OF TYPE DEFINITIONS ---

export function AnalyticsDashboard({ studentId, classId }: DashboardProps) {
  // Apply the strict types to our state to satisfy ESLint
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [comparative, setComparative] = useState<ComparativeData | null>(null);
  const [achievements, setAchievements] = useState<AchievementData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, trendsRes, comparativeRes, achievementsRes, feedbackRes] =
          await Promise.all([
            fetch(`/api/student/analytics?studentId=${studentId}`),
            fetch(`/api/student/performance-trends?studentId=${studentId}`),
            fetch(`/api/student/comparative-analytics?studentId=${studentId}&classId=${classId}`),
            fetch(`/api/student/achievements?studentId=${studentId}`),
            fetch(`/api/teacher/feedback?studentId=${studentId}`),
          ]);

        // Cast the parsed JSON to our defined interfaces
        const analyticsData = (await analyticsRes.json()) as AnalyticsData;
        const trendsData = (await trendsRes.json()) as TrendData;
        const comparativeData = (await comparativeRes.json()) as ComparativeData;
        const achievementsData = (await achievementsRes.json()) as AchievementData;
        const feedbackData = (await feedbackRes.json()) as FeedbackData;

        setAnalytics(analyticsData);
        setTrends(trendsData);
        setComparative(comparativeData);
        setAchievements(achievementsData);
        setFeedback(feedbackData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, classId]);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall Average"
              value={`${analytics?.overallAverage.toFixed(1) ?? '0'}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              color="blue"
            />
            <StatCard
              title="Total Exams"
              value={analytics?.totalExams.toString() ?? "0"}
              icon={<BookOpen className="h-4 w-4" />}
              color="green"
            />
            <StatCard
              title="Passing Rate"
              value={`${analytics?.passingRate.toFixed(1) ?? '0'}%`}
              icon={<Target className="h-4 w-4" />}
              color="amber"
            />
            <StatCard
              title="Points"
              value={achievements?.totalPoints.toString() ?? "0"}
              icon={<Zap className="h-4 w-4" />}
              color="purple"
            />
          </div>

          {/* Subject Performance */}
          {analytics && analytics.subjectWisePerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.subjectWisePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="subjectName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Strengths & Weaknesses */}
          {feedback && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.strengths?.slice(0, 3).map((s) => (
                      <div key={s.subjectId} className="flex items-center justify-between">
                        <span className="font-medium">{s.subjectName}</span>
                        <Badge variant="default">
                          {s.average.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.weaknesses?.slice(0, 3).map((w) => (
                      <div key={w.subjectId} className="flex items-center justify-between">
                        <span className="font-medium">{w.subjectName}</span>
                        <Badge variant="secondary">
                          {w.average.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations */}
          {feedback?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Improvement Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback.recommendations.map((rec, idx) => (
                  <Alert key={idx}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">{rec.title}</div>
                      <p className="text-sm mt-1">{rec.description}</p>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {trends?.trends && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Improvement Rate: {trends.improvementRate}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {trends.projection && (
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Based on your trends, your expected performance in the next exam
                    is approximately {trends.projection.toFixed(1)}%
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          {comparative && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  title="Your Score"
                  value={`${comparative.studentPercentage}%`}
                  color="blue"
                />
                <StatCard
                  title="Class Average"
                  value={`${comparative.classAverage}%`}
                  color="green"
                />
                <StatCard
                  title="Percentile"
                  value={`${comparative.percentile.toFixed(1)}%`}
                  color="amber"
                />
                <StatCard
                  title="Class Rank"
                  value={`#${comparative.rank}`}
                  color="purple"
                />
              </div>

              {comparative.subjectComparison && (
                <Card>
                  <CardHeader>
                    <CardTitle>Subject-wise Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparative.subjectComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="studentPercentage" fill="#3b82f6" name="You" />
                        <Bar dataKey="classAverage" fill="#10b981" name="Class Avg" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {comparative.subjectDifficulty && (
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Difficulty Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comparative.subjectDifficulty.map((sd) => (
                        <div
                          key={sd.subject}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{sd.subject}</p>
                            <p className="text-sm text-gray-600">
                              Class Avg: {sd.classAverage.toFixed(1)}%
                            </p>
                          </div>
                          <Badge
                            variant={
                              sd.difficulty === "Hard"
                                ? "destructive"
                                : sd.difficulty === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {sd.difficulty}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          {feedback && (
            <>
              {feedback.recommendations?.map((rec, idx) => (
                <Alert key={idx}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold">{rec.title}</div>
                    <p className="text-sm mt-1">{rec.description}</p>
                    <Badge className="mt-2" variant={rec.priority === "high" ? "destructive" : "default"}>
                      {rec.priority} priority
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}

              {feedback.diaries && feedback.diaries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Teacher Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {feedback.diaries.slice(0, 5).map((diary, idx) => (
                      <div key={idx} className="p-3 border-l-4 border-blue-500 bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{diary.subject}</p>
                            <p className="text-sm text-gray-600">By {diary.teacher}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(diary.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-2">{diary.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {achievements && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Total Points</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {achievements.totalPoints}
                </div>
              </div>

              {achievements.badges && achievements.badges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Badges Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {achievements.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="p-4 border rounded-lg text-center hover:shadow-lg transition"
                        >
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <p className="font-semibold text-sm">{badge.name}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {badge.description}
                          </p>
                          <Badge className="mt-2" variant="outline">
                            +{badge.points}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {achievements.milestones && achievements.milestones.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Milestones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.milestones.map((milestone) => (
                      <div key={milestone.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{milestone.title}</p>
                            <p className="text-sm text-gray-600">
                              {milestone.description}
                            </p>
                          </div>
                          <Award className="h-5 w-5 text-amber-500" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {achievements.certificates && achievements.certificates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certificates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.certificates.map((cert) => (
                      <div key={cert.id} className="p-3 border-l-4 border-amber-500 bg-amber-50">
                        <p className="font-semibold">{cert.title}</p>
                        <p className="text-sm text-gray-600">{cert.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Cert #: {cert.certificateNumber}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <Card className={colorClasses[color as keyof typeof colorClasses]}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          {icon && <div className="text-2xl">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
