import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { ExamStatus } from '@prisma/client';

interface RawExam {
  examId: string;
  startDate: Date;
  endDate: Date;
  totalMarks: number;
  passingMarks: number;
  examTypeEnum: string;
  ExamType: { name: string };
  ExamDatesheet: Array<{ Subject: { subjectName: string }; date: Date; startTime: string | null; endTime: string | null }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    if (!studentId || !classId) {
      return NextResponse.json({ error: 'studentId and classId are required' }, { status: 400 });
    }

    const examsRaw = await db.exam.findMany({
      where: { classId, startDate: { gte: new Date() }, status: ExamStatus.SCHEDULED },
      include: { ExamType: true, ExamDatesheet: { include: { Subject: true } } },
      orderBy: { startDate: 'asc' },
    });

    const pastExamsRaw = await db.exam.findMany({
      where: { classId, endDate: { lt: new Date() } },
      include: { ExamType: true, ExamDatesheet: { include: { Subject: true } } },
      orderBy: { startDate: 'desc' },
      take: 5,
    });

    const typedUpcoming = examsRaw as unknown as RawExam[];
    const typedPast = pastExamsRaw as unknown as RawExam[];

    const upcomingExams = typedUpcoming.map((exam) => ({
      examId: exam.examId,
      name: exam.ExamType.name,
      type: exam.examTypeEnum,
      startDate: exam.startDate,
      endDate: exam.endDate,
      subjects: exam.ExamDatesheet.map((ed) => ({
        subject: ed.Subject.subjectName,
        date: ed.date,
        startTime: ed.startTime,
        endTime: ed.endTime,
      })),
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
    }));

    const studyResources = typedPast.map((exam) => ({
      examId: exam.examId,
      name: exam.ExamType.name,
      type: exam.examTypeEnum,
      completedDate: exam.endDate,
      subjects: exam.ExamDatesheet.map((ed) => ed.Subject.subjectName),
    }));

    return NextResponse.json({ upcomingExams, studyResources });
  } catch (error) {
    console.error('Exam schedule API error:', error);
    return NextResponse.json({ error: 'Failed to fetch exam schedule' }, { status: 500 });
  }
}
