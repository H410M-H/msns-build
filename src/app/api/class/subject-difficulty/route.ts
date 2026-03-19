import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sessionId = searchParams.get('sessionId');

    if (!classId || !sessionId) {
      return NextResponse.json(
        { error: 'classId and sessionId are required' },
        { status: 400 }
      );
    }

    // Get all subject assignments for this class/session, including teachers and subject info
    const assignments = await db.classSubject.findMany({
      where: { classId, sessionId },
      include: {
        Subject: true,
        Employees: true,
        Sessions: true,
      },
      orderBy: { subjectId: 'asc' },
    });

    // Format response
    const result = assignments.map((asgn) => ({
      csId: asgn.csId,
      subjectId: asgn.subjectId,
      subjectName: asgn.Subject.subjectName,
      book: asgn.Subject.book,
      description: asgn.Subject.description,
      teacherId: asgn.employeeId,
      teacherName: asgn.Employees.employeeName,
      teacherDesignation: asgn.Employees.designation,
      sessionId: asgn.sessionId,
      sessionName: asgn.Sessions.sessionName,
    }));

    return NextResponse.json({
      classId,
      sessionId,
      subjects: result,
      count: result.length,
    });
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class subjects' },
      { status: 500 }
    );
  }
}
