"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Award, FileText } from "lucide-react";
import Link from "next/link";

export default function StudentExamReportPage() {
  const params = useParams();
  const examId = params.examId as string;

  const breadcrumbs = [
    { href: "/student", label: "Dashboard" },
    { href: "#", label: "Exam Report", current: true },
  ];

  return (
    <section className="relative w-full">
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />
        <div className="container mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-slate-700 bg-card text-foreground hover:bg-muted"
            >
              <Link href="/student">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
              </Link>
            </Button>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Examination Report Card
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Exam Reference: {examId}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="text-base font-semibold text-foreground">
                Report Card Details
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Please view and verify official report cards with your class teacher or through the parent portal.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  <Link href={`/parent/reports/${examId}`}>
                    Open in Report Viewer
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
