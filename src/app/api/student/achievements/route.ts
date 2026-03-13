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

    // Get all report cards to analyze achievements
    const reportCards = await db.reportCard.findMany({
      where: { studentId },
      include: {
        Exam: { include: { ExamType: true } },
        ReportCardDetail: { include: { Subject: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    if (reportCards.length === 0) {
      return NextResponse.json({
        badges: [],
        milestones: [],
        certificates: [],
        totalPoints: 0,
      });
    }

    // Analyze achievements
    const badges = generateBadges(reportCards);
    const milestones = generateMilestones(reportCards);
    const certificates = generateCertificates(reportCards);
    const totalPoints = calculatePoints(badges, milestones);

    return NextResponse.json({
      badges,
      milestones,
      certificates,
      totalPoints,
    });
  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  points: number;
}

function generateBadges(reportCards: Array<{ status: string; percentage: number; generatedAt: Date; ReportCardDetail: Array<{ Subject: { subjectName: string }; percentage: number }> }>): Badge[] {
  const badges: Badge[] = [];

  // Consistency Badge
  const passCount = reportCards.filter((rc) => rc.status === 'PASS').length;
  if (passCount >= 3) {
    badges.push({
      id: 'consistency',
      name: 'Consistent Performer',
      description: 'Passed 3 or more consecutive exams',
      icon: '⭐',
      earnedDate: reportCards[0].generatedAt,
      points: 50,
    });
  }

  // Excellence Badge
  const excellentCount = reportCards.filter((rc) => rc.percentage >= 90).length;
  if (excellentCount > 0) {
    badges.push({
      id: 'excellence',
      name: 'Excellence',
      description: 'Scored 90% or more in an exam',
      icon: '🏆',
      earnedDate: reportCards.find((rc) => rc.percentage >= 90)?.generatedAt,
      points: 75,
    });
  }

  // Perfect Score Badge
  const perfectCount = reportCards.filter((rc) => rc.percentage === 100).length;
  if (perfectCount > 0) {
    badges.push({
      id: 'perfect',
      name: 'Perfect Score',
      description: 'Achieved 100% in an exam',
      icon: '👑',
      earnedDate: reportCards.find((rc) => rc.percentage === 100)?.generatedAt,
      points: 100,
    });
  }

  // Improvement Badge
  if (reportCards.length >= 2) {
    const recent = reportCards[0].percentage;
    const previous = reportCards[1].percentage;
    if (recent > previous + 10) {
      badges.push({
        id: 'improvement',
        name: 'Rising Star',
        description: 'Improved score by 10% or more',
        icon: '📈',
        earnedDate: reportCards[0].generatedAt,
        points: 60,
      });
    }
  }

  // Subject Expert Badge
  const subjectAverages = reportCards[0].ReportCardDetail.map((detail) => ({
    subject: detail.Subject.subjectName,
    percentage: detail.percentage,
  }));

  subjectAverages.forEach((subject) => {
    if (subject.percentage >= 85) {
      badges.push({
        id: `expert_${subject.subject}`,
        name: `${subject.subject} Master`,
        description: `Mastered ${subject.subject} with 85%+ average`,
        icon: '📚',
        earnedDate: reportCards[0].generatedAt,
        points: 40,
      });
    }
  });

  return badges;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  completedDate: Date;
}

function generateMilestones(reportCards: Array<{ generatedAt: Date; percentage: number }>): Milestone[] {
  const milestones: Milestone[] = [];

  if (reportCards.length >= 1) {
    milestones.push({
      id: 'first_exam',
      title: 'First Exam Completed',
      description: 'You completed your first exam',
      progress: 100,
      completedDate: reportCards[reportCards.length - 1].generatedAt,
    });
  }

  if (reportCards.length >= 3) {
    milestones.push({
      id: 'three_exams',
      title: 'Three Exams Complete',
      description: 'You have completed 3 exams',
      progress: 100,
      completedDate: reportCards[2].generatedAt,
    });
  }

  if (reportCards.length >= 5) {
    milestones.push({
      id: 'five_exams',
      title: 'Five Exams Complete',
      description: 'You have completed 5 exams',
      progress: 100,
      completedDate: reportCards[4].generatedAt,
    });
  }

  const avgPercentage =
    reportCards.reduce((sum, rc) => sum + rc.percentage, 0) / reportCards.length;
  if (avgPercentage >= 75) {
    milestones.push({
      id: 'high_average',
      title: 'High Average Achiever',
      description: `Maintained 75%+ average across exams`,
      progress: 100,
      completedDate: reportCards[0].generatedAt,
    });
  }

  return milestones;
}

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuedDate: Date;
  certificateNumber: string;
  downloadable: boolean;
}

function generateCertificates(reportCards: Array<{ generatedAt: Date; percentage: number; ReportCardDetail: Array<{ subjectId: string; percentage: number; Subject: { subjectName: string } }> }>): Certificate[] {
  const certificates: Certificate[] = [];

  // Merit Certificate
  const avgPercentage =
    reportCards.reduce((sum, rc) => sum + rc.percentage, 0) / reportCards.length;
  if (avgPercentage >= 80) {
    certificates.push({
      id: 'merit',
      title: 'Merit Certificate',
      description: `For maintaining an average of ${avgPercentage.toFixed(1)}%`,
      issuedDate: new Date(),
      certificateNumber: `CERT-${Date.now()}`,
      downloadable: true,
    });
  }

  // Subject Excellence Certificate
  const latestReport = reportCards[0];
  latestReport.ReportCardDetail.forEach((detail) => {
    if (detail.percentage >= 90) {
      certificates.push({
        id: `subject_${detail.subjectId}`,
        title: `Excellence in ${detail.Subject.subjectName}`,
        description: `For scoring ${detail.percentage}% in ${detail.Subject.subjectName}`,
        issuedDate: latestReport.generatedAt,
        certificateNumber: `CERT-${detail.subjectId}-${Date.now()}`,
        downloadable: true,
      });
    }
  });

  return certificates;
}

function calculatePoints(badges: Badge[], milestones: Milestone[]): number {
  const badgePoints = badges.reduce((sum, badge) => sum + badge.points, 0);
  const milestonePoints = milestones.length * 25;
  return badgePoints + milestonePoints;
}
