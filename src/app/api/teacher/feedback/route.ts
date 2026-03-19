import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

interface MarkData {
  subjectId: string;
  obtainedMarks: number;
  totalMarks: number;
  Subject: { subjectName: string };
}

interface DiaryData {
  date: Date;
  content: string;
  ClassSubject: { Subject: { subjectName: string } };
  Teacher: { employeeName: string };
}

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
      return NextResponse.json({ error: 'studentId or employeeId is required' }, { status: 400 });
    }

    const diariesRaw = await db.subjectDiary.findMany({
      where: { ...(employeeId && { teacherId: employeeId }) },
      include: {
        ClassSubject: { include: { Subject: true } },
        Teacher: true,
      },
      orderBy: { date: 'desc' },
    });

    const marksRaw = studentId
      ? await db.marks.findMany({
          where: { studentId },
          include: {
            Subject: true,
            Exam: { include: { ExamType: true } },
          },
          orderBy: { uploadedAt: 'desc' },
        })
      : [];

    // Explicitly cast to prevent 'any' inference
    const typedMarks = marksRaw as unknown as MarkData[];
    const typedDiaries = diariesRaw as unknown as DiaryData[];
    
    const subjectAnalysisMap = new Map<string, SubjectPerformance>();

    typedMarks.forEach((mark) => {
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

    const subjectAnalysis = Array.from(subjectAnalysisMap.values());
    subjectAnalysis.forEach((subject) => {
      if (subject.scores.length > 0) {
        subject.average = subject.scores.reduce((a, b) => a + b, 0) / subject.scores.length;
      }
    });

    const sortedByPerformance = [...subjectAnalysis].sort((a, b) => b.average - a.average);
    const strengths = sortedByPerformance.slice(0, 3);
    const weaknesses = sortedByPerformance.slice(-3).reverse();

    const recommendations = generateRecommendations(weaknesses, strengths);

    return NextResponse.json({
      strengths,
      weaknesses,
      recommendations,
      diaries: typedDiaries.map((d) => ({
        date: d.date,
        subject: d.ClassSubject.Subject.subjectName,
        teacher: d.Teacher.employeeName,
        content: d.content.substring(0, 200),
      })),
    });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

function generateRecommendations(weaknesses: SubjectPerformance[], strengths: SubjectPerformance[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (weaknesses[0]) {
    recommendations.push({
      type: 'focus',
      title: `Focus on ${weaknesses[0].subjectName}`,
      description: `Your average in ${weaknesses[0].subjectName} is ${weaknesses[0].average.toFixed(1)}%. Dedicate extra time here.`,
      priority: 'high',
    });
  }

  if (strengths[0]) {
    recommendations.push({
      type: 'leverage',
      title: `Leverage strength in ${strengths[0].subjectName}`,
      description: `You excel in ${strengths[0].subjectName} with an average of ${strengths[0].average.toFixed(1)}%. Use this as a foundation.`,
      priority: 'medium',
    });
  }

  recommendations.push(
    { type: 'practice', title: 'Regular Practice and Testing', description: 'Solve practice papers and take mock tests.', priority: 'high' },
    { type: 'schedule', title: 'Create a Study Schedule', description: 'Allocate specific time slots for weaknesses.', priority: 'medium' }
  );

  return recommendations;
}
