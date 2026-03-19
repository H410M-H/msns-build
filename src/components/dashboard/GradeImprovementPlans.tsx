"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle, AlertCircle, Target, BookOpen, Users } from "lucide-react";

interface ImprovementPlan {
  subjectId: string;
  subject: string;
  currentAverage: string;
  targetAverage: number;
  difficulty: string;
  timeline: string;
  actionItems: string[];
}

interface Recommendation {
  priority: string;
  type: string;
  title: string;
  description: string;
  resources?: string[];
}

interface TutoringPlan {
  subjectId: string;
  subject: string;
  recommendedHours: string;
  frequency: string;
  duration: string;
  expectedImprovement: string;
  costRange: string;
}

interface StudyGroup {
  subjectId: string;
  subject: string;
  suggested: boolean;
  benefit: string;
  frequency: string;
}

interface GradeImprovementData {
  improvementPlans: ImprovementPlan[];
  recommendations: Recommendation[];
  tutoringSuggestions: TutoringPlan[];
  studyGroups: StudyGroup[];
}

interface GradeImprovementProps {
  studentId: string;
}

export function GradeImprovementPlans({ studentId }: GradeImprovementProps) {
  const [data, setData] = useState<GradeImprovementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/student/grade-improvement?studentId=${studentId}`
        );
        const result = (await response.json()) as GradeImprovementData;
        setData(result);
      } catch (error) {
        console.error("Error fetching grade improvement data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return <div className="text-center py-8">Loading improvement plans...</div>;
  }

  if (!data) {
    return <div className="text-center py-8">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Improvement Plans */}
      {data.improvementPlans && data.improvementPlans.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Improvement Plans
          </h3>
          <div className="space-y-4">
            {data.improvementPlans.map((plan) => (
              <Card key={plan.subjectId} className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{plan.subject}</CardTitle>
                      <CardDescription>
                        Current: {plan.currentAverage}% → Target: {plan.targetAverage}%
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        plan.difficulty === "hard" ? "destructive" : "default"
                      }
                    >
                      {plan.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Timeline:</strong> {plan.timeline}
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Action Items:</h4>
                    <ul className="space-y-2">
                      {plan.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Study Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Study Recommendations
          </h3>
          <div className="space-y-4">
            {data.recommendations.map((rec, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                    </div>
                    <Badge
                      variant={rec.priority === "high" ? "destructive" : "default"}
                    >
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-2 uppercase tracking-wide">
                    {rec.type.replace("_", " ")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{rec.description}</p>
                  {rec.resources && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Recommended Resources:
                      </p>
                      <ul className="space-y-1">
                        {rec.resources.map((resource, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tutoring Suggestions */}
      {data.tutoringSuggestions && data.tutoringSuggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Tutoring Recommendations</h3>
          <div className="space-y-3">
            {data.tutoringSuggestions.map((tutoring) => (
              <Card key={tutoring.subjectId} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Subject</p>
                      <p className="text-sm font-bold">{tutoring.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">
                        Hours/Week
                      </p>
                      <p className="text-sm font-bold">{tutoring.recommendedHours}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Frequency</p>
                      <p className="text-sm font-bold">{tutoring.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Duration</p>
                      <p className="text-sm font-bold">{tutoring.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Expected</p>
                      <p className="text-sm font-bold text-green-600">
                        {tutoring.expectedImprovement}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Cost: {tutoring.costRange}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Study Group Suggestions */}
      {data.studyGroups && data.studyGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Study Group Suggestions
          </h3>
          <div className="space-y-3">
            {data.studyGroups
              .filter((group) => group.suggested)
              .map((group) => (
                <Card key={group.subjectId}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{group.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {group.benefit}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: {group.frequency} per week
                        </p>
                      </div>
                      <Badge variant="secondary">Suggested</Badge>
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
