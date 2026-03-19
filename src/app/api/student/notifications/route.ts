import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { ExamStatus } from '@prisma/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, string | number>;
  timestamp: Date;
  read: boolean;
  actionUrl: string;
}

interface ReportData {
  reportCardId: string;
  percentage: number;
  generatedAt: Date;
  Exam: { ExamType: { name: string } };
}

interface ExamData {
  examId: string;
  startDate: Date;
  ExamType: { name: string };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    const studentExists = await db.students.findUnique({ where: { studentId } });
    if (!studentExists) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const recentReportsRaw = await db.reportCard.findMany({
      where: { studentId },
      orderBy: { generatedAt: 'desc' },
      take: 3,
      include: { Exam: { include: { ExamType: true } } },
    });

    const student_classes = await db.studentClass.findFirst({ where: { studentId } });

    const upcomingExamsRaw = student_classes
      ? await db.exam.findMany({
          where: {
            classId: student_classes.classId,
            startDate: { gte: new Date() },
            status: ExamStatus.SCHEDULED,
          },
          include: { ExamType: true },
          orderBy: { startDate: 'asc' },
          take: 3,
        })
      : [];

    const typedReports = recentReportsRaw as unknown as ReportData[];
    const typedExams = upcomingExamsRaw as unknown as ExamData[];

    const notifications = generateNotifications(typedReports, typedExams);

    return NextResponse.json({
      notifications,
      totalUnread: notifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

function generateNotifications(reports: ReportData[], exams: ExamData[]): Notification[] {
  const notifications: Notification[] = [];

  if (reports[0]) {
    const latest = reports[0];
    notifications.push({
      id: `grade-${latest.reportCardId}`,
      type: 'grade_released',
      title: 'Grade Released',
      message: `Your ${latest.Exam.ExamType.name} results are available`,
      data: { percentage: latest.percentage },
      timestamp: latest.generatedAt,
      read: false,
      actionUrl: '/grades',
    });

    if (latest.percentage >= 90) {
      notifications.push({
        id: `milestone-${latest.reportCardId}`,
        type: 'milestone',
        title: 'Excellent Score!',
        message: `You scored ${latest.percentage}% in ${latest.Exam.ExamType.name}`,
        data: { percentage: latest.percentage },
        timestamp: new Date(),
        read: false,
        actionUrl: '/grades?tab=achievements',
      });
    }
  }

  if (reports[0] && reports[1]) {
    const latest = reports[0];
    const previous = reports[1];
    if (latest.percentage < previous.percentage - 10) {
      notifications.push({
        id: `alert-${latest.reportCardId}`,
        type: 'alert',
        title: 'Performance Dip Detected',
        message: `Your score dropped from ${previous.percentage}% to ${latest.percentage}%`,
        data: { current: latest.percentage, previous: previous.percentage },
        timestamp: new Date(),
        read: false,
        actionUrl: '/grades?tab=feedback',
      });
    }
  }

  exams.forEach((exam) => {
    const daysUntil = Math.max(0, Math.ceil((new Date(exam.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    if (daysUntil <= 7 && daysUntil > 0) {
      notifications.push({
        id: `exam-${exam.examId}`,
        type: 'exam_reminder',
        title: 'Upcoming Exam',
        message: `${exam.ExamType.name} starts in ${daysUntil} days`,
        data: { daysRemaining: daysUntil },
        timestamp: new Date(),
        read: false,
        actionUrl: '/grades?tab=schedule',
      });
    }
  });

  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
