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

interface StudyGroupSuggestion {
  subjectId: string;
  subject: string;
  suggested: boolean;
  benefit: string;
  frequency: string;
  focusAreas: string[];
}

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

    const marks = await db.marks.findMany({
      where: { studentId },
      include: { Subject: true, Exam: true },
      orderBy: { uploadedAt: 'desc' },
      take: 50,
    });

    if (marks.length === 0) {
      return NextResponse.json({
        improvementPlans: [],
        recommendations: [],
        tutoringSuggestions: [],
        studyGroups: []
      });
    }

    const subjectAnalysis = analyzeSubjectPerformance(marks);
    const improvementPlans = generateImprovementPlans(subjectAnalysis);
    const recommendations = generateStudyRecommendations(subjectAnalysis);
    const tutoringSuggestions = generateTutoringPlans(subjectAnalysis);
    const studyGroups = generateStudyGroupSuggestions(subjectAnalysis);

    return NextResponse.json({
      subjectAnalysis,
      improvementPlans,
      recommendations,
      tutoringSuggestions,
      studyGroups,
    });
  } catch (error) {
    console.error('Grade improvement API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grade improvement data' },
      { status: 500 }
    );
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

    if (scores.length >= 2) {
      const recent = scores.slice(-3);
      const older = scores.slice(0, 3);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

      if (recentAvg > olderAvg + 5) subject.trend = 'improving';
      else if (recentAvg < olderAvg - 5) subject.trend = 'declining';
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
      actionItems: generateActionItems(subject.average),
    }));
}

function generateActionItems(average: number): string[] {
  const items = [];
  if (average < 50) {
    items.push('Attend remedial classes', 'Get personal tutoring', 'Focus on fundamental concepts');
  } else if (average < 75) {
    items.push('Practice more problems', 'Review previous exam papers', 'Join study group');
  }
  items.push('Daily revision for 1 hour', 'Weekly mock tests');
  return items;
}

function generateStudyRecommendations(subjects: SubjectAnalysis[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const weakSubjects = subjects.filter((s) => s.average < 75);
  const strongSubjects = subjects.filter((s) => s.average >= 85);

  if (weakSubjects[0]) {
    recommendations.push({
      priority: 'high',
      type: 'focus_area',
      title: `Focus on ${weakSubjects[0].subjectName}`,
      description: `Your average in ${weakSubjects[0].subjectName} is ${weakSubjects[0].average.toFixed(1)}%. Dedicate 2 hours daily to improve.`,
      resources: ['NCERT textbook and solutions', 'YouTube educational channels', 'Practice question banks'],
    });
  }

  if (strongSubjects[0]) {
    recommendations.push({
      priority: 'medium',
      type: 'maintain_strength',
      title: `Maintain excellence in ${strongSubjects[0].subjectName}`,
      description: `You're doing well in ${strongSubjects[0].subjectName}. Keep practicing to maintain the high standard.`,
      resources: ['Advanced problem sets', 'Competitive exam papers'],
    });
  }

  recommendations.push(
    {
      priority: 'high',
      type: 'time_management',
      title: 'Optimize Study Schedule',
      description: 'Study weak subjects in the morning when you are fresh, and stronger subjects in the evening.',
      resources: ['Study planner', 'Timetable builder'],
    },
    {
      priority: 'medium',
      type: 'revision',
      title: 'Regular Revision Strategy',
      description: 'Review concepts every week and practice previous papers monthly.',
      resources: ['Revision notes', 'Exam papers from last 5 years'],
    }
  );

  return recommendations;
}

function generateTutoringPlans(subjects: SubjectAnalysis[]): TutoringPlan[] {
  return subjects
    .filter((s) => s.average < 60)
    .map((subject) => ({
      subjectId: subject.subjectId,
      subject: subject.subjectName,
      recommendedHours: subject.average < 40 ? '8-10' : '4-6',
      frequency: subject.average < 40 ? '5 days/week' : '3 days/week',
      duration: '90 minutes per session',
      expectedImprovement: '15-25% in 3 months',
      costRange: subject.average < 40 ? 'Rs. 5000-8000/month' : 'Rs. 3000-5000/month',
    }));
}

function generateStudyGroupSuggestions(subjects: SubjectAnalysis[]): StudyGroupSuggestion[] {
  return subjects.map((subject) => ({
    subjectId: subject.subjectId,
    subject: subject.subjectName,
    suggested: subject.average < 80,
    benefit: 'Peer learning and doubt clarification',
    frequency: '2-3 hours per week',
    focusAreas: subject.scores.filter((s) => s.percentage < 70).map((s) => `Exam: ${s.examType}`),
  }));
}
