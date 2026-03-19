import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const sessionId = searchParams.get('sessionId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    // Get student's report cards and marks
    const reportCards = await db.reportCard.findMany({
      where: {
        studentId,
        ...(sessionId && { sessionId }),
      },
      include: {
        ReportCardDetail: {
          include: { Subject: true },
        },
        Exam: { include: { ExamType: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    // Get student's marks across exams
    await db.marks.findMany({
      where: { studentId },
      include: {
        Exam: { include: { ExamType: true } },
        Subject: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // Calculate analytics
    const performanceData = reportCards.map((rc) => ({
      date: rc.generatedAt,
      percentage: rc.percentage,
      examType: rc.Exam.examTypeEnum,
      status: rc.status,
    }));

    interface SubjectPerformance {
      subjectId: string;
      subjectName: string;
      marks: number[];
      percentages: number[];
      average: number;
    }

    const subjectWisePerformance = reportCards
      .flatMap((rc) => rc.ReportCardDetail)
      .reduce((acc: SubjectPerformance[], detail) => {
        const existing = acc.find((s: SubjectPerformance) => s.subjectId === detail.subjectId);
        if (existing) {
          existing.marks.push(detail.obtainedMarks);
          existing.percentages.push(detail.percentage);
        } else {
          acc.push({
            subjectId: detail.subjectId,
            subjectName: detail.Subject.subjectName,
            marks: [detail.obtainedMarks],
            percentages: [detail.percentage],
            average: detail.percentage,
          });
        }
        return acc;
      }, []);

    // Recalculate averages
    subjectWisePerformance.forEach((subject: SubjectPerformance) => {
      subject.average =
        subject.percentages.reduce((a: number, b: number) => a + b, 0) /
        subject.percentages.length;
    });

    const overallAverage =
      reportCards.length > 0
        ? reportCards.reduce((sum, rc) => sum + rc.percentage, 0) /
          reportCards.length
        : 0;

    const trend = reportCards.slice(0, 5).reverse();

    return NextResponse.json({
      performanceData,
      subjectWisePerformance,
      overallAverage,
      trend,
      totalExams: reportCards.length,
      passingRate:
        reportCards.length > 0
          ? (reportCards.filter((rc) => rc.status === 'PASS').length /
              reportCards.length) *
            100
          : 0,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
