import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

interface ExamInfo {
  examId: string;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  subjects: Array<{ subject: string; date: Date; startTime: string; endTime: string }>;
  totalMarks: number;
  passingMarks: number;
  daysUntilStart: number;
}

interface TimelineItem {
  examName: string;
  studyStartDate: Date;
  weeklySchedule: Array<{ week: number; focus: string; hoursPerDay: number }>;
  milestones: Array<{ week: number; goal: string }>;
}

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

    // Get upcoming exams for the student's class
    const exams = await db.exam.findMany({
      where: {
        classId,
        startDate: { gte: new Date() },
        status: 'SCHEDULED',
      },
      include: {
        ExamType: true,
        ExamDatesheet: {
          include: { Subject: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // Get past exams for study materials
    const pastExams = await db.exam.findMany({
      where: {
        classId,
        endDate: { lt: new Date() },
      },
      include: {
        ExamType: true,
        ExamDatesheet: {
          include: { Subject: true },
        },
      },
      orderBy: { startDate: 'desc' },
      take: 5,
    });

    const upcomingExams: ExamInfo[] = exams.map((exam) => ({
      examId: exam.examId,
      name: exam.ExamType.name,
      type: exam.examTypeEnum,
      startDate: exam.startDate,
      endDate: exam.endDate,
      duration: getDuration(exam.startDate, exam.endDate),
      subjects: exam.ExamDatesheet.map((ed) => ({
        subject: ed.Subject.subjectName,
        date: ed.date,
        startTime: ed.startTime,
        endTime: ed.endTime,
      })),
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      daysUntilStart: daysUntil(exam.startDate),
    }));

    const studyResources = pastExams.map((exam) => ({
      examId: exam.examId,
      name: exam.ExamType.name,
      type: exam.examTypeEnum,
      completedDate: exam.endDate,
      subjects: exam.ExamDatesheet.map((ed) => ed.Subject.subjectName),
    }));

    // Suggested study timeline
    const timeline = generateStudyTimeline(upcomingExams);

    return NextResponse.json({
      upcomingExams,
      studyResources,
      suggestedTimeline: timeline,
    });
  } catch (error) {
    console.error('Exam schedule API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam schedule' },
      { status: 500 }
    );
  }
}

function daysUntil(date: Date): number {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDuration(start: Date, end: Date): string {
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return `${days} days`;
}

function generateStudyTimeline(exams: ExamInfo[]): TimelineItem[] {
  if (exams.length === 0) return [];

  return exams.map((exam) => {
    const daysAvailable = exam.daysUntilStart;
    const subjects = exam.subjects.length;

    return {
      examName: exam.name,
      studyStartDate: new Date(
        new Date(exam.startDate).getTime() - daysAvailable * 24 * 60 * 60 * 1000
      ),
      weeklySchedule: generateWeeklySchedule(subjects, daysAvailable),
      milestones: [
        {
          week: 1,
          goal: 'Complete chapter reviews',
        },
        {
          week: 2,
          goal: 'Practice problem sets',
        },
        {
          week: 3,
          goal: 'Take mock tests',
        },
        {
          week: Math.ceil(daysAvailable / 7),
          goal: 'Final revision and doubt clearing',
        },
      ],
    };
  });
}

function generateWeeklySchedule(numSubjects: number, daysAvailable: number) {
  const weeksAvailable = Math.ceil(daysAvailable / 7);
  const subjectsPerWeek = Math.max(1, Math.floor(numSubjects / weeksAvailable));

  return Array.from({ length: weeksAvailable }, (_, i) => ({
    week: i + 1,
    focus: `Focus on ${subjectsPerWeek} subject(s)`,
    hoursPerDay: 2 + i * 0.5, // Increasing intensity as exam approaches
  }));
}
