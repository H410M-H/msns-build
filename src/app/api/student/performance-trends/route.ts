import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const reportCards = await db.reportCard.findMany({
      where: { studentId },
      include: { Exam: true },
      orderBy: { generatedAt: 'asc' },
      take: 12, // Last 12 exams
    });

    const trendData = reportCards.map((rc) => ({
      examId: rc.examId,
      percentage: rc.percentage,
      date: rc.generatedAt.toISOString().split('T')[0],
      status: rc.status,
      totalMarks: rc.totalObtainedMarks,
    }));

    // Calculate improvement rate
    if (trendData.length > 1) {
      const firstPercentage = trendData[0].percentage;
      const lastPercentage = trendData[trendData.length - 1].percentage;
      const improvementRate =
        ((lastPercentage - firstPercentage) / firstPercentage) * 100;
      
      return NextResponse.json({
        trends: trendData,
        improvementRate: Math.round(improvementRate * 100) / 100,
        projection: predictFuturePerformance(trendData),
      });
    }

    return NextResponse.json({
      trends: trendData,
      improvementRate: 0,
      projection: null,
    });
  } catch (error) {
    console.error('Performance trends API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance trends' },
      { status: 500 }
    );
  }
}

function predictFuturePerformance(data: any[]) {
  if (data.length < 3) return null;

  const percentages = data.map((d) => d.percentage);
  const n = percentages.length;
  const mean = percentages.reduce((a, b) => a + b, 0) / n;

  // Simple linear regression
  const sumXY = percentages.reduce((sum, val, i) => sum + i * val, 0);
  const sumX = (n * (n - 1)) / 2;
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * mean) / (n * sumX2 - sumX * sumX);
  const nextValue = mean + slope * n;

  return Math.min(100, Math.max(0, Math.round(nextValue * 100) / 100));
}
