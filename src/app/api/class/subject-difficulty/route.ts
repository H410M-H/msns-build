import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required' },
        { status: 400 }
      );
    }

    // Get all report cards for the class
    const reportCards = await db.reportCard.findMany({
      where: { classId },
      include: {
        ReportCardDetail: {
          include: { Subject: true },
        },
      },
    });

    if (reportCards.length === 0) {
      return NextResponse.json({
        subjectDifficulty: [],
        classAverages: {},
      });
    }

    // Calculate subject statistics
    interface SubjectStat {
      subjectId: string;
      subjectName: string;
      scores: number[];
      totalAttempts: number;
    }
    const subjectStats: Record<string, SubjectStat> = {};

    reportCards.forEach((rc) => {
      rc.ReportCardDetail.forEach((detail) => {
        if (!subjectStats[detail.subjectId]) {
          subjectStats[detail.subjectId] = {
            subjectId: detail.subjectId,
            subjectName: detail.Subject.subjectName,
            scores: [],
            totalAttempts: 0,
          };
        }

        subjectStats[detail.subjectId]!.scores.push(detail.percentage);
        subjectStats[detail.subjectId]!.totalAttempts ??= 0;
        subjectStats[detail.subjectId]!.totalAttempts += 1;
      });
    });

    // Calculate difficulty levels
    const subjectDifficulty = Object.values(subjectStats).map((subject: SubjectStat) => {
      const avgScore =
        subject.scores.reduce((a: number, b: number) => a + b, 0) /
        subject.scores.length;
      const stdDev = calculateStandardDeviation(subject.scores);

      let difficulty: string;
      if (avgScore >= 80) {
        difficulty = 'Easy';
      } else if (avgScore >= 65) {
        difficulty = 'Medium';
      } else {
        difficulty = 'Hard';
      }

      return {
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        averageScore: Math.round(avgScore * 100) / 100,
        difficulty,
        standardDeviation: Math.round(stdDev * 100) / 100,
        studentsAttempted: subject.totalAttempts,
        passingPercentage: Math.round(
          (subject.scores.filter((s: number) => s >= 40).length /
            subject.scores.length) *
            100
        ),
      };
    });

    const sortedByDifficulty = subjectDifficulty.sort(
      (a, b) => a.averageScore - b.averageScore
    );

    return NextResponse.json({
      subjectDifficulty: sortedByDifficulty,
      classAnalysis: {
        easySubjects: sortedByDifficulty.filter((s) => s.difficulty === 'Easy').length,
        mediumSubjects: sortedByDifficulty.filter((s) => s.difficulty === 'Medium').length,
        hardSubjects: sortedByDifficulty.filter((s) => s.difficulty === 'Hard').length,
        overallAverage:
          sortedByDifficulty.reduce((sum, s) => sum + s.averageScore, 0) /
          sortedByDifficulty.length,
      },
    });
  } catch (error) {
    console.error('Subject difficulty API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subject difficulty' },
      { status: 500 }
    );
  }
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff =
    squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}
