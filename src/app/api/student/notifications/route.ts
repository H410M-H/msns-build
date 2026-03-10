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

    // Get student info and recent activity
    const student = await db.students.findUnique({
      where: { studentId },
    });

    // Get latest report cards to determine notifications
    const recentReports = await prisma.reportCard.findMany({
      where: { studentId },
      orderBy: { generatedAt: 'desc' },
      take: 3,
      include: {
        Exam: { include: { ExamType: true } },
      },
    });

    // Get upcoming exams
    const student_classes = await prisma.studentClass.findFirst({
      where: { studentId },
    });

    const upcomingExams = student_classes
      ? await prisma.exam.findMany({
          where: {
            classId: student_classes.classId,
            startDate: { gte: new Date() },
            status: 'SCHEDULED',
          },
          include: { ExamType: true },
          orderBy: { startDate: 'asc' },
          take: 3,
        })
      : [];

    const notifications = generateNotifications(
      student,
      recentReports,
      upcomingExams
    );

    return NextResponse.json({
      notifications,
      totalUnread: notifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

function generateNotifications(student: any, reports: any[], exams: any[]) {
  const notifications = [];

  // Grade release notification
  if (reports.length > 0) {
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
  }

  // Performance milestone
  if (reports.length > 0) {
    const latest = reports[0];
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

  // Performance drop alert
  if (reports.length >= 2) {
    const latest = reports[0];
    const previous = reports[1];
    if (latest.percentage < previous.percentage - 10) {
      notifications.push({
        id: `alert-${latest.reportCardId}`,
        type: 'alert',
        title: 'Performance Dip Detected',
        message: `Your score dropped from ${previous.percentage}% to ${latest.percentage}%`,
        data: {
          current: latest.percentage,
          previous: previous.percentage,
        },
        timestamp: new Date(),
        read: false,
        actionUrl: '/grades?tab=feedback',
      });
    }
  }

  // Upcoming exam reminder
  exams.forEach((exam) => {
    const daysUntil = Math.ceil(
      (new Date(exam.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

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

  return notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
