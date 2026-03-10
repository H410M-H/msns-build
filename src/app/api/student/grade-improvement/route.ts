import { NextRequest, NextResponse } from 'next/server';
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

    // Get marks and performance data
    const marks = await db.marks.findMany({
      where: { studentId },
      include: { Subject: true, Exam: { include: { ExamType: true } } },
      orderBy: { uploadedAt: 'desc' },
      take: 50,
    });

    if (marks.length === 0) {
      return NextResponse.json({
        improvementPlans: [],
        recommendations: [],
        tutoringSuggestions: [],
      });
    }

    // Analyze subject performance
    const subjectAnalysis = analyzeSubjectPerformance(marks);

    // Generate improvement plans
    const improvementPlans = generateImprovementPlans(subjectAnalysis);

    // Generate study recommendations
    const recommendations = generateStudyRecommendations(subjectAnalysis, marks);

    // Suggest tutoring
    const tutoringSuggestions = generateTutoringPlans(subjectAnalysis);

    // Suggest peer study groups
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

function analyzeSubjectPerformance(marks: any[]) {
  const analysis: Record<string, any> = {};

  marks.forEach((mark) => {
    const percentage = (mark.obtainedMarks / mark.totalMarks) * 100;

    if (!analysis[mark.subjectId]) {
      analysis[mark.subjectId] = {
        subjectId: mark.subjectId,
        subjectName: mark.Subject.subjectName,
        scores: [],
        attempts: 0,
        average: 0,
        trend: 'stable',
      };
    }

    analysis[mark.subjectId].scores.push({
      percentage,
      date: mark.uploadedAt,
      examType: mark.Exam.examTypeEnum,
    });
    analysis[mark.subjectId].attempts += 1;
  });

  // Calculate averages and trends
  Object.keys(analysis).forEach((key) => {
    const subject = analysis[key];
    const scores = subject.scores.map((s: any) => s.percentage);
    subject.average =
      scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

    // Calculate trend
    if (scores.length >= 2) {
      const recent = scores.slice(-3);
      const older = scores.slice(0, 3);
      const recentAvg =
        recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

      if (recentAvg > olderAvg + 5) subject.trend = 'improving';
      else if (recentAvg < olderAvg - 5) subject.trend = 'declining';
    }
  });

  return Object.values(analysis);
}

function generateImprovementPlans(subjects: any[]) {
  return subjects
    .filter((s) => s.average < 75)
    .map((subject) => ({
      subjectId: subject.subjectId,
      subject: subject.subjectName,
      currentAverage: subject.average.toFixed(1),
      targetAverage: 85,
      difficulty: subject.average < 50 ? 'hard' : 'medium',
      timeline: subject.average < 50 ? '3 months' : '6 weeks',
      actionItems: generateActionItems(subject),
    }));
}

function generateActionItems(subject: any) {
  const items = [];

  if (subject.average < 50) {
    items.push('Attend remedial classes');
    items.push('Get personal tutoring');
    items.push('Focus on fundamental concepts');
  } else if (subject.average < 75) {
    items.push('Practice more problems');
    items.push('Review previous exam papers');
    items.push('Join study group');
  }

  items.push('Daily revision for 1 hour');
  items.push('Weekly mock tests');

  return items;
}

function generateStudyRecommendations(subjects: any[], marks: any[]) {
  const recommendations = [];

  const weakSubjects = subjects.filter((s) => s.average < 75);
  const strongSubjects = subjects.filter((s) => s.average >= 85);

  if (weakSubjects.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'focus_area',
      title: `Focus on ${weakSubjects[0].subjectName}`,
      description: `Your average in ${weakSubjects[0].subjectName} is ${weakSubjects[0].average.toFixed(1)}%. Dedicate 2 hours daily to improve.`,
      resources: [
        'NCERT textbook and solutions',
        'YouTube educational channels',
        'Practice question banks',
      ],
    });
  }

  if (strongSubjects.length > 0) {
    recommendations.push({
      priority: 'medium',
      type: 'maintain_strength',
      title: `Maintain excellence in ${strongSubjects[0].subjectName}`,
      description: `You're doing well in ${strongSubjects[0].subjectName}. Keep practicing to maintain the high standard.`,
      resources: ['Advanced problem sets', 'Competitive exam papers'],
    });
  }

  recommendations.push({
    priority: 'high',
    type: 'time_management',
    title: 'Optimize Study Schedule',
    description: 'Study weak subjects in the morning when you are fresh, and stronger subjects in the evening.',
    resources: ['Study planner', 'Timetable builder'],
  });

  recommendations.push({
    priority: 'medium',
    type: 'revision',
    title: 'Regular Revision Strategy',
    description:
      'Review concepts every week and practice previous papers monthly.',
    resources: ['Revision notes', 'Exam papers from last 5 years'],
  });

  return recommendations;
}

function generateTutoringPlans(subjects: any[]) {
  const weakSubjects = subjects.filter((s) => s.average < 60);

  return weakSubjects.map((subject) => ({
    subjectId: subject.subjectId,
    subject: subject.subjectName,
    recommendedHours: subject.average < 40 ? '8-10' : '4-6',
    frequency: subject.average < 40 ? '5 days/week' : '3 days/week',
    duration: '90 minutes per session',
    expectedImprovement: '15-25% in 3 months',
    costRange: subject.average < 40 ? 'Rs. 5000-8000/month' : 'Rs. 3000-5000/month',
  }));
}

function generateStudyGroupSuggestions(subjects: any[]) {
  return subjects.map((subject) => ({
    subjectId: subject.subjectId,
    subject: subject.subjectName,
    suggested: subject.average < 80,
    benefit: 'Peer learning and doubt clarification',
    frequency: '2-3 hours per week',
    focusAreas: subject.scores
      .filter((s: any) => s.percentage < 70)
      .map((s: any) => `Exam: ${s.examType}`),
  }));
}
