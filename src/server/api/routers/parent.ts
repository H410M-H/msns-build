import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const parentRouter = createTRPCRouter({
  getLinkedStudents: protectedProcedure.query(async ({ ctx }) => {
    const parentId = ctx.session.user.id;
    const parent = await ctx.db.parentGuardian.findUnique({
      where: { guardentId: parentId },
    });
    if (!parent) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Parent profile not found" });
    }

    return await ctx.db.students.findMany({
      where: {
        studentId: { in: parent.linkedStudentIds },
      },
      select: {
        studentId: true,
        studentName: true,
        registrationNumber: true,
        bloodGroup: true,
      },
    });
  }),

  getStudentDashboardData: protectedProcedure
    .input(z.object({ studentId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const student = await ctx.db.students.findUnique({
        where: { studentId: input.studentId },
      });
      if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });

      const attendance = await ctx.db.studentAttendance.findMany({
        where: { studentId: input.studentId },
        orderBy: { date: "desc" },
        take: 30,
      });

      const totalPresent = attendance.filter((a) => a.status === "P").length;
      const totalAbsent = attendance.filter((a) => a.status === "A").length;
      const totalLeaves = attendance.filter((a) => a.status === "L").length;
      const attendanceRate = attendance.length > 0 
        ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) 
        : 100;

      const reportCards = await ctx.db.reportCard.findMany({
        where: { studentId: input.studentId },
        include: {
          Exam: { select: { examTypeEnum: true } },
          ReportCardDetail: {
            include: { Subject: { select: { subjectName: true } } },
          },
        },
      });

      const studentClass = await ctx.db.studentClass.findFirst({
        where: { studentId: input.studentId },
        select: { scId: true, classId: true, sessionId: true },
      });

      let fees: unknown[] = [];
      let diaries: unknown[] = [];

      if (studentClass) {
        fees = await ctx.db.feeStudentClass.findMany({
          where: { studentClassId: studentClass.scId },
          include: {
            fees: true,
          },
        });

        diaries = await ctx.db.subjectDiary.findMany({
          where: {
            ClassSubject: {
              classId: studentClass.classId,
              sessionId: studentClass.sessionId,
            },
          },
          include: {
            Teacher: { select: { employeeName: true } },
            ClassSubject: {
              include: { Subject: { select: { subjectName: true } } },
            },
          },
          orderBy: { date: "desc" },
          take: 5,
        });
      }

      return {
        student,
        attendance: {
          present: totalPresent,
          absent: totalAbsent,
          leaves: totalLeaves,
          rate: attendanceRate,
        },
        reportCards,
        fees,
        diaries,
      };
    }),
});
