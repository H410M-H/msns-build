import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  scores: number[];
  average: number;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const employeeId = searchParams.get('employeeId');

    if (!studentId && !employeeId) {
      return NextResponse.json(
        { error: 'studentId or employeeId is required' },
        { status: 400 }
      );
    }

    // Get subject diaries that might contain feedback
    const diaries = await db.subjectDiary.findMany({
      where: {
        ...(employeeId && { teacherId: employeeId }),
      },
      include: {
        ClassSubject: {
          include: { Subject: true },
        },
        Teacher: true,
      },
      orderBy: { date: 'desc' },
    });

    // Get marks history for strength/weakness analysis
    // Only fetch if studentId exists, otherwise pass an empty array
    const marks = studentId 
      ? await db.marks.findMany({
          where: { studentId },
          include: {
            Subject: true,
            Exam: { include: { ExamType: true } },
          },
          orderBy: { uploadedAt: 'desc' },
        })
      : [];

    // Analyze strengths and weaknesses using a Map for type safety and performance
    const subjectAnalysisMap = new Map<string, SubjectPerformance>();

    marks.forEach((mark) => {
      const percentage = mark.totalMarks > 0 ? (mark.obtainedMarks / mark.totalMarks) * 100 : 0;
      
      const existing = subjectAnalysisMap.get(mark.subjectId);
      if (existing) {
        existing.scores.push(percentage);
      } else {
        subjectAnalysisMap.set(mark.subjectId, {
          subjectId: mark.subjectId,
          subjectName: mark.Subject.subjectName,
          scores: [percentage],
          average: 0,
        });
      }
    });

    // Calculate averages and convert Map back to an array
    const subjectAnalysis = Array.from(subjectAnalysisMap.values());
    subjectAnalysis.forEach((subject) => {
      if (subject.scores.length > 0) {
        subject.average =
          subject.scores.reduce((a, b) => a + b, 0) / subject.scores.length;
      }
    });

    const sortedByPerformance = [...subjectAnalysis].sort(
      (a, b) => b.average - a.average
    );
    const strengths = sortedByPerformance.slice(0, 3);
    const weaknesses = sortedByPerformance.slice(-3).reverse();

    // Get improvement recommendations
    const recommendations = generateRecommendations(weaknesses, strengths);

    return NextResponse.json({
      strengths,
      weaknesses,
      recommendations,
      diaries: diaries.map((d) => ({
        date: d.date,
        subject: d.ClassSubject.Subject.subjectName,
        teacher: d.Teacher.employeeName,
        content: d.content.substring(0, 200), // Preview
      })),
    });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  weaknesses: SubjectPerformance[],
  strengths: SubjectPerformance[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (weaknesses[0]) {
    recommendations.push({
      type: 'focus',
      title: `Focus on ${weaknesses[0].subjectName}`,
      description: `Your current average in ${weaknesses[0].subjectName} is ${weaknesses[0].average.toFixed(1)}%. Consider dedicating extra study time to this subject.`,
      priority: 'high',
    });
  }

  if (strengths[0]) {
    recommendations.push({
      type: 'leverage',
      title: `Leverage strength in ${strengths[0].subjectName}`,
      description: `You excel in ${strengths[0].subjectName} with an average of ${strengths[0].average.toFixed(1)}%. Use this as a foundation for overall improvement.`,
      priority: 'medium',
    });
  }

  recommendations.push({
    type: 'practice',
    title: 'Regular Practice and Testing',
    description: 'Solve practice papers and take mock tests to improve problem-solving speed and accuracy.',
    priority: 'high',
  });

  recommendations.push({
    type: 'schedule',
    title: 'Create a Study Schedule',
    description: 'Allocate specific time slots for different subjects based on your weaknesses.',
    priority: 'medium',
  });

  return recommendations;
}
