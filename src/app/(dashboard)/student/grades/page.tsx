"use client";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Download, TrendingUp, AlertCircle } from "lucide-react";
import React, { useState } from "react";

interface ReportCardData {
  reportCardId: string;
  percentage: number;
  grade: string;
  subject?: string;
  status: string;
  generatedAt: Date;
}

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder data - replace with actual API call
  const reportCards: ReportCardData[] = [
    {
      reportCardId: "1",
      percentage: 85,
      grade: "A",
      subject: "Mathematics",
      status: "PASS",
      generatedAt: new Date(),
    },
    {
      reportCardId: "2",
      percentage: 78,
      grade: "B+",
      subject: "English",
      status: "PASS",
      generatedAt: new Date(),
    },
  ];

  const latestReportCard = reportCards[0];
  const averagePercentage =
    reportCards.length > 0
      ? Math.round(
          reportCards.reduce((sum, card) => sum + card.percentage, 0) /
            reportCards.length
        )
      : 0;

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Add download logic here
      console.log("Downloading report card...");
    } catch (error) {
      console.error("Error downloading report card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full">
      <PageHeader
        title="Grades"
        description="View your grades and performance."
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </PageHeader>

      <div className="space-y-6 p-6">
        {/* Overall Performance Card */}
        {latestReportCard && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle>Latest Report Card</CardTitle>
              <CardDescription>
                Generated on{" "}
                {latestReportCard.generatedAt.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Percentage
                  </p>
                  <div className="text-3xl font-bold text-foreground">
                    {latestReportCard.percentage}%
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Grade
                  </p>
                  <div className="text-3xl font-bold text-green-600">
                    {latestReportCard.grade}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="text-sm font-semibold text-green-600">
                    {latestReportCard.status}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Average
                  </p>
                  <div className="text-3xl font-bold text-foreground">
                    {averagePercentage}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Report Cards */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">All Report Cards</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {reportCards.map((card) => (
              <Card key={card.reportCardId}>
                <CardHeader>
                  <CardTitle className="text-base">{card.subject}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Score
                      </p>
                      <p className="text-2xl font-bold">{card.percentage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">
                        Grade
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {card.grade}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {reportCards.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No report cards available yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Page;
