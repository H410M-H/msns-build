import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

interface MarkData {
  obtainedMarks: number;
  totalMarks: number;
  subjectId: string;
  Subject: { subjectName: string };
  uploadedAt: Date;
  Exam: { examTypeEnum: string };
}

interface SubjectAnalysis {
  subjectId: string;
  subjectName: string;
  scores: Array<{ percentage: number; date: Date; examType: string }>;
  attempts: number;
  average: number;
  trend: string;
}

interface ImprovementPlan {
  subjectId: string;
  subject: string;
  currentAverage: string;
  targetAverage: number;
  difficulty: string;
  timeline: string;
  actionItems: string[];
}

interface Recommendation {
  priority: string;
  type: string;
  title: string;
  description: string;
  resources: string[];
}

interface TutoringPlan {
  subjectId: string;
  subject: string;
  recommendedHours: string;
  frequency: string;
  duration: string;
  expectedImprovement: string;
  costRange: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    const marksRaw = await db.marks.findMany({
      where: { studentId },
      include: { Subject: true, Exam: true },
      orderBy: { uploadedAt: 'desc' },
      take: 50,
    });

    const typedMarks = marksRaw as unknown as MarkData[];

    if (typedMarks.length === 0) {
      return NextResponse.json({
        improvementPlans: [],
        recommendations: [],
        tutoringSuggestions: [],
        studyGroups: []
      });
    }

    const subjectAnalysis = analyzeSubjectPerformance(typedMarks);
    const improvementPlans = generateImprovementPlans(subjectAnalysis);
    const recommendations = generateStudyRecommendations(subjectAnalysis);
    const tutoringSuggestions = generateTutoringPlans(subjectAnalysis);

    return NextResponse.json({
      subjectAnalysis,
      improvementPlans,
      recommendations,
      tutoringSuggestions,
    });
  } catch (error) {
    console.error('Grade improvement API error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

function analyzeSubjectPerformance(marks: MarkData[]): SubjectAnalysis[] {
  const analysis: Record<string, SubjectAnalysis> = {};

  marks.forEach((mark) => {
    const percentage = mark.totalMarks > 0 ? (mark.obtainedMarks / mark.totalMarks) * 100 : 0;

    analysis[mark.subjectId] ??= {
      subjectId: mark.subjectId,
      subjectName: mark.Subject.subjectName,
      scores: [],
      attempts: 0,
      average: 0,
      trend: 'stable',
    };

    analysis[mark.subjectId]!.scores.push({
      percentage,
      date: mark.uploadedAt,
      examType: mark.Exam.examTypeEnum,
    });
    analysis[mark.subjectId]!.attempts += 1;
  });

  Object.values(analysis).forEach((subject) => {
    const scores = subject.scores.map((s) => s.percentage);
    if (scores.length > 0) {
      subject.average = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  });

  return Object.values(analysis);
}

function generateImprovementPlans(subjects: SubjectAnalysis[]): ImprovementPlan[] {
  return subjects
    .filter((s) => s.average < 75)
    .map((subject) => ({
      subjectId: subject.subjectId,
      subject: subject.subjectName,
      currentAverage: subject.average.toFixed(1),
      targetAverage: 85,
      difficulty: subject.average < 50 ? 'hard' : 'medium',
      timeline: subject.average < 50 ? '3 months' : '6 weeks',
      actionItems: ['Daily revision for 1 hour', 'Weekly mock tests'],
    }));
}

function generateStudyRecommendations(subjects: SubjectAnalysis[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const weakSubjects = subjects.filter((s) => s.average < 75);

  if (weakSubjects[0]) {
    recommendations.push({
      priority: 'high',
      type: 'focus_area',
      title: `Focus on ${weakSubjects[0].subjectName}`,
      description: `Your average is ${weakSubjects[0].average.toFixed(1)}%.`,
      resources: ['NCERT textbook', 'YouTube'],
    });
  }
  return recommendations;
}

function generateTutoringPlans(subjects: SubjectAnalysis[]): TutoringPlan[] {
  return subjects
    .filter((s) => s.average < 60)
    .map((subject) => ({
      subjectId: subject.subjectId,
      subject: subject.subjectName,
      recommendedHours: '4-6',
      frequency: '3 days/week',
      duration: '90 minutes per session',
      expectedImprovement: '15-25% in 3 months',
      costRange: 'Rs. 3000-5000/month',
    }));
}
