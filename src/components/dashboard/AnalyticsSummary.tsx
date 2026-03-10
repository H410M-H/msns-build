import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

interface SummaryMetrics {
  overallAverage: number;
  trend: number;
  passingRate: number;
  totalExams: number;
  averagePerExam: number;
  highestScore: number;
  lowestScore: number;
}

interface AnalyticsSummaryProps {
  metrics: SummaryMetrics;
  className?: string;
}

export function AnalyticsSummary({ metrics, className }: AnalyticsSummaryProps) {
  const isImproving = metrics.trend > 0;
  const isPassing = metrics.passingRate >= 60;

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Main Score Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
          <CardDescription>Your academic performance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Overall Average */}
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Average</p>
              <p className="text-3xl font-bold text-blue-600">
                {metrics.overallAverage.toFixed(1)}%
              </p>
            </div>

            {/* Trend */}
            <div>
              <p className="text-sm font-medium text-gray-600">Trend</p>
              <div className="flex items-center gap-1 mt-1">
                {isImproving ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <p
                  className={`text-2xl font-bold ${
                    isImproving ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.abs(metrics.trend).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Passing Rate */}
            <div>
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-2xl font-bold text-indigo-600">
                  {metrics.passingRate.toFixed(0)}%
                </p>
                <Badge variant="secondary" className="ml-1">
                  {isPassing ? "Good" : "Needs Work"}
                </Badge>
              </div>
            </div>

            {/* Total Exams */}
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-3xl font-bold text-purple-600">
                {metrics.totalExams}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Average Per Exam */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score Per Exam</p>
              <p className="text-lg font-bold mt-1">{metrics.averagePerExam.toFixed(1)}%</p>
            </div>
            <Target className="h-5 w-5 text-blue-500" />
          </div>

          {/* Score Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600">Highest Score</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {metrics.highestScore.toFixed(0)}%
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600">Lowest Score</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {metrics.lowestScore.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Recommendation Alert */}
          {metrics.overallAverage < 60 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Zap className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                Your performance is below average. Consider seeking extra tuition or study
                support.
              </AlertDescription>
            </Alert>
          )}

          {metrics.overallAverage >= 80 && (
            <Alert className="border-green-200 bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                Excellent performance! Keep up the great work and maintain this momentum.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
