import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { MessageCircle, ThumbsUp, AlertCircle } from "lucide-react";

interface Feedback {
  id: string;
  subjectName: string;
  teacherName: string;
  feedback: string;
  date: Date;
  rating?: number;
}

interface Strength {
  title: string;
  description: string;
  subject: string;
}

interface Weakness {
  title: string;
  description: string;
  subject: string;
  improvementTips: string[];
}

interface TeacherFeedbackDisplayProps {
  feedback?: Feedback[];
  strengths?: Strength[];
  weaknesses?: Weakness[];
  loading?: boolean;
}

export function TeacherFeedbackDisplay({
  feedback = [],
  strengths = [],
  weaknesses = [],
  loading = false,
}: TeacherFeedbackDisplayProps) {
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Loading feedback...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Feedback</CardTitle>
        <CardDescription>Comments and insights from your teachers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback">Feedback ({feedback.length})</TabsTrigger>
            <TabsTrigger value="strengths">Strengths ({strengths.length})</TabsTrigger>
            <TabsTrigger value="weaknesses">Areas to Improve ({weaknesses.length})</TabsTrigger>
          </TabsList>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            {feedback.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No feedback yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpandedFeedback(
                        expandedFeedback === item.id ? null : item.id
                      )
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{item.subjectName}</p>
                          <Badge variant="secondary" className="text-xs">
                            {item.teacherName}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.feedback.substring(0, 100)}
                          {item.feedback.length > 100 ? "..." : ""}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      {item.rating && (
                        <div className="text-right">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < item.rating!
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {expandedFeedback === item.id && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-700">{item.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Strengths Tab */}
          <TabsContent value="strengths" className="space-y-4">
            {strengths.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <ThumbsUp className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No identified strengths yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {strengths.map((strength, idx) => (
                  <Alert key={idx} className="border-green-200 bg-green-50">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900">
                      <p className="font-semibold">{strength.title}</p>
                      <p className="text-sm mt-1">{strength.description}</p>
                      <Badge variant="outline" className="mt-2 text-green-700">
                        {strength.subject}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Weaknesses Tab */}
          <TabsContent value="weaknesses" className="space-y-4">
            {weaknesses.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No areas to improve identified yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weaknesses.map((weakness, idx) => (
                  <Alert key={idx} className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900">
                      <p className="font-semibold">{weakness.title}</p>
                      <p className="text-sm mt-1">{weakness.description}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold">Tips for improvement:</p>
                        <ul className="text-sm list-disc list-inside">
                          {weakness.improvementTips.map((tip, tipIdx) => (
                            <li key={tipIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                      <Badge variant="outline" className="mt-2 text-yellow-700">
                        {weakness.subject}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
