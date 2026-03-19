"use client";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Download } from "lucide-react";
import React, { useState } from "react";
import { AnalyticsDashboard } from "~/components/dashboard/AnalyticsDashboard";
import { ExamScheduleComponent } from "~/components/dashboard/ExamScheduleComponent";
import { ParentPortal } from "~/components/dashboard/ParentPortal";
import { GradeImprovementPlans } from "~/components/dashboard/GradeImprovementPlans";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Get current student ID and class ID from session/context
  // For now using placeholder - in production, get from useSession or similar
  const studentId = "student-id-placeholder";
  const classId = "class-id-placeholder";

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Generate PDF report
      const response = await fetch(`/api/student/analytics?studentId=${studentId}`);
      const data = await response.json() as { 
        overallAverage: number;
        totalExams: number;
        passingRate: number;
        subjectWisePerformance?: Array<{ subjectName: string; average: number }>;
      };
      
      // Create CSV or PDF
      const csv = generateReportCSV(data);
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
      element.setAttribute("download", "performance-report.csv");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full">
      <PageHeader
        title="Academic Performance Center"
        description="Comprehensive view of your grades, analytics, and academic progress."
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? "Downloading..." : "Export Report"}
          </Button>
        </div>
      </PageHeader>

      <div className="p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Analytics</TabsTrigger>
            <TabsTrigger value="schedule">Exams</TabsTrigger>
            <TabsTrigger value="improvement">Improvement</TabsTrigger>
            <TabsTrigger value="parent">Parent Portal</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Analytics Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AnalyticsDashboard studentId={studentId} classId={classId} />
          </TabsContent>

          {/* Exam Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <ExamScheduleComponent studentId={studentId} classId={classId} />
          </TabsContent>

          {/* Improvement Plans Tab */}
          <TabsContent value="improvement" className="space-y-6">
            <GradeImprovementPlans studentId={studentId} />
          </TabsContent>

          {/* Parent Portal Tab */}
          <TabsContent value="parent" className="space-y-6">
            <ParentPortal studentId={studentId} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-900">Notification preferences and account settings coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface AnalyticsData {
  overallAverage: number;
  totalExams: number;
  passingRate: number;
  subjectWisePerformance?: Array<{ subjectName: string; average: number }>;
}

function generateReportCSV(data: AnalyticsData): string {
  let csv = "Performance Report\n";
  csv += `Overall Average,${data.overallAverage}\n`;
  csv += `Total Exams,${data.totalExams}\n`;
  csv += `Passing Rate,${data.passingRate}\n\n`;
  
  csv += "Subject Performance\n";
  csv += "Subject,Average\n";
  data.subjectWisePerformance?.forEach((subject) => {
    csv += `${subject.subjectName},${subject.average.toFixed(2)}\n`;
  });
  
  return csv;
}

export default Page;
