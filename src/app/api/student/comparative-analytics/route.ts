import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    if (!studentId || !classId) {
      return NextResponse.json(
        { error: 'studentId and classId are required' },
        { status: 400 }
      );
    }

    // Get student's latest report card
    const studentReportCard = await db.reportCard.findFirst({
      where: { studentId, classId },
      orderBy: { generatedAt: 'desc' },
    });

    if (!studentReportCard) {
      return NextResponse.json({
        studentPercentage: 0,
        classAverage: 0,
        percentile: 0,
        rank: 0,
        totalStudents: 0,
      });
    }

    // Get all report cards for the class in the same exam
    const classReportCards = await db.reportCard.findMany({
      where: {
        classId,
        examId: studentReportCard.examId,
      },
    });

    // Calculate class statistics
    const percentages = classReportCards.map((rc) => rc.percentage);
    const classAverage =
      percentages.reduce((a: number, b: number) => a + b, 0) / percentages.length;

    // Calculate percentile and rank
    const studentPercentage = studentReportCard.percentage;
    const betterScores = percentages.filter((p: number) => p > studentPercentage).length;
    const percentile =
      ((percentages.length - betterScores) / percentages.length) * 100;
    const rank = betterScores + 1;

    // Subject-wise class comparison
    const studentDetails = await db.reportCardDetail.findMany({
      where: { reportCardId: studentReportCard.reportCardId },
      include: { Subject: true },
    });

    const classDetails = await db.reportCardDetail.findMany({
      where: {
        reportCard: {
          classId,
          examId: studentReportCard.examId,
        },
      },
      include: { Subject: true, ReportCard: true },
    });

    const subjectComparison = studentDetails.map((detail) => {
      const classPerformances = classDetails
        .filter((cd) => cd.subjectId === detail.subjectId)
        .map((cd) => cd.percentage);

      const classAvgPercentage =
        classPerformances.length > 0
          ? classPerformances.reduce((a, b) => a + b, 0) /
            classPerformances.length
          : 0;

      return {
        subject: detail.Subject.subjectName,
        studentPercentage: detail.percentage,
        classAverage: classAvgPercentage,
        difference: detail.percentage - classAvgPercentage,
      };
    });

    // Difficulty analysis
    const subjectDifficulty = subjectComparison.map((sc) => ({
      subject: sc.subject,
      difficulty:
        sc.classAverage < 60
          ? 'Hard'
          : sc.classAverage < 75
            ? 'Medium'
            : 'Easy',
      classAverage: sc.classAverage,
    }));

    return NextResponse.json({
      studentPercentage: Math.round(studentPercentage * 100) / 100,
      classAverage: Math.round(classAverage * 100) / 100,
      percentile: Math.round(percentile * 100) / 100,
      rank,
      totalStudents: classReportCards.length,
      subjectComparison,
      subjectDifficulty,
    });
  } catch (error) {
    console.error('Comparative analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparative analytics' },
      { status: 500 }
    );
  }
}
