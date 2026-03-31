import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const createExamSchema = z.object({
  sessionId: z.string().cuid(),
  classId: z.string().cuid(),
  examTypeEnum: z.enum([
    "MIDTERM",
    "FINAL",
    "PHASE_1",
    "PHASE_2",
    "PHASE_3",
    "PHASE_4",
    "PHASE_5",
    "PHASE_6",
  ]),
  startDate: z.date(),
  endDate: z.date(),
  totalMarks: z.number().min(1),
  passingMarks: z.number().min(1),
  datesheet: z
    .array(
      z.object({
        subjectId: z.string().cuid(),
        date: z.date(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      }),
    )
    .optional(),
});

const updateExamSchema = z.object({
  examId: z.string().cuid(),
  status: z.enum(["SCHEDULED", "ONGOING", "COMPLETED"]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const examRouter = createTRPCRouter({
  createExam: publicProcedure
    .input(createExamSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify session and class exist
        const [session, grades] = await Promise.all([
          ctx.db.sessions.findUnique({ where: { sessionId: input.sessionId } }),
          ctx.db.grades.findUnique({ where: { classId: input.classId } }),
        ]);

        if (!session || !grades) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Session or class not found",
          });
        }

        // Determine exam category based on grade and exam type
        const isMatriculation =
          grades.category === ("MATRICULATION" as typeof grades.category);
        const isPhaseTest = input.examTypeEnum.startsWith("PHASE_");

        if (isMatriculation && !isPhaseTest) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Matriculation students should have phase tests, not midterm/final",
          });
        }

        if (!isMatriculation && isPhaseTest) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Non-matriculation students should have midterm/final, not phase tests",
          });
        }

        // Get or create exam type
        let examType = await ctx.db.examType.findFirst({
          where: { name: input.examTypeEnum },
        });

        examType ??= await ctx.db.examType.create({
          data: {
            name: input.examTypeEnum,
            category: isPhaseTest ? "PHASE_TEST" : "STANDARD",
          },
        });

        // Create exam
        const exam = await ctx.db.exam.create({
          data: {
            examTypeId: examType.examTypeId,
            examTypeEnum: input.examTypeEnum,
            sessionId: input.sessionId,
            classId: input.classId,
            startDate: input.startDate,
            endDate: input.endDate,
            totalMarks: input.totalMarks,
            passingMarks: input.passingMarks,
            status: "SCHEDULED",
            ...(input.datesheet &&
              input.datesheet.length > 0 && {
                ExamDatesheet: {
                  create: input.datesheet.map((ds) => ({
                    subjectId: ds.subjectId,
                    date: ds.date,
                    startTime: ds.startTime,
                    endTime: ds.endTime,
                  })),
                },
              }),
          },
          include: {
            ExamDatesheet: true,
          },
        });

        return {
          success: true,
          message: "Exam created successfully",
          exam,
        };
      } catch (error) {
        console.error("Error creating exam:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create exam",
        });
      }
    }),

  updateExam: publicProcedure
    .input(updateExamSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const exam = await ctx.db.exam.update({
          where: { examId: input.examId },
          data: {
            ...(input.status && { status: input.status }),
            ...(input.startDate && { startDate: input.startDate }),
            ...(input.endDate && { endDate: input.endDate }),
          },
        });

        return {
          success: true,
          message: "Exam updated successfully",
          exam,
        };
      } catch (error) {
        console.error("Error updating exam:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update exam",
        });
      }
    }),

  getExamsForSession: publicProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const exams = await ctx.db.exam.findMany({
          where: { sessionId: input.sessionId },
          include: {
            Grades: { select: { grade: true, section: true } },
            ExamType: { select: { name: true } },
          },
          orderBy: { startDate: "asc" },
        });

        return exams;
      } catch (error) {
        console.error("Error fetching exams:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch exams",
        });
      }
    }),

  getExamsForClass: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.ExamWhereInput = {
          classId: input.classId,
          ...(input.sessionId && { sessionId: input.sessionId }),
        };

        const exams = await ctx.db.exam.findMany({
          where,
          include: {
            ExamType: true,
            Marks: { select: { studentId: true } },
          },
          orderBy: { startDate: "asc" },
        });

        // Calculate marks coverage for each exam
        const examsWithCoverage = exams.map((exam) => {
          const uniqueStudents = new Set(exam.Marks.map((m) => m.studentId))
            .size;
          return {
            ...exam,
            marksUploaded: exam.Marks.length,
            uniqueStudents,
          };
        });

        return examsWithCoverage;
      } catch (error) {
        console.error("Error fetching class exams:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch exams",
        });
      }
    }),

  getExamDetails: publicProcedure
    .input(z.object({ examId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const exam = await ctx.db.exam.findUnique({
          where: { examId: input.examId },
          include: {
            ExamType: true,
            Sessions: {
              select: {
                sessionId: true,
                sessionName: true,
              },
            },
            Grades: {
              select: {
                classId: true,
                grade: true,
                section: true,
              },
            },
            Marks: {
              select: {
                marksId: true,
                studentId: true,
                subjectId: true,
                obtainedMarks: true,
              },
            },
            ReportCard: {
              select: {
                reportCardId: true,
                studentId: true,
                status: true,
              },
            },
            ExamDatesheet: {
              include: {
                Subject: { select: { subjectName: true } },
              },
            },
          },
        });

        return exam;
      } catch (error) {
        console.error("Error fetching exam details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch exam details",
        });
      }
    }),

  deleteExam: publicProcedure
    .input(z.object({ examId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.marks.deleteMany({ where: { examId: input.examId } });

        const reportCards = await ctx.db.reportCard.findMany({
          where: { examId: input.examId },
          select: { reportCardId: true },
        });

        for (const report of reportCards) {
          await ctx.db.reportCardDetail.deleteMany({
            where: { reportCardId: report.reportCardId },
          });
        }

        await ctx.db.reportCard.deleteMany({ where: { examId: input.examId } });
        await ctx.db.exam.delete({ where: { examId: input.examId } });

        return { success: true, message: "Exam deleted successfully" };
      } catch (error) {
        console.error("Error deleting exam:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete exam" });
      }
    }),

  getExamWithSubjects: publicProcedure
    .input(z.object({ examId: z.string().cuid(), classId: z.string().cuid(), sessionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        // Fetch the exam
        const exam = await ctx.db.exam.findUnique({
          where: { examId: input.examId },
          include: {
            ExamType: true,
            ExamDatesheet: {
              include: { Subject: { select: { subjectId: true, subjectName: true } } },
            },
          },
        });

        if (!exam) throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });

        // Fetch all subjects assigned to this class/session
        const classSubjects = await ctx.db.classSubject.findMany({
          where: { classId: input.classId, sessionId: input.sessionId },
          include: {
            Subject: { select: { subjectId: true, subjectName: true } },
            Employees: { select: { employeeName: true } },
          },
          orderBy: { Subject: { subjectName: "asc" } },
        });

        // Fetch all marks for this exam
        const marks = await ctx.db.marks.findMany({
          where: { examId: input.examId },
          select: { subjectId: true, obtainedMarks: true, studentId: true, totalMarks: true },
        });

        // Build per-subject summary
        const subjectSummary = classSubjects.map((cs) => {
          const subjectMarks = marks.filter((m) => m.subjectId === cs.Subject.subjectId);
          const studentsEvaluated = new Set(subjectMarks.map((m) => m.studentId)).size;
          const totalObtained = subjectMarks.reduce((sum, m) => sum + m.obtainedMarks, 0);
          const datesheetEntry = exam.ExamDatesheet.find(
            (d) => d.subjectId === cs.Subject.subjectId,
          );
          return {
            csId: cs.csId,
            subjectId: cs.Subject.subjectId,
            subjectName: cs.Subject.subjectName,
            teacherName: cs.Employees.employeeName,
            totalMarks: exam.totalMarks,
            studentsEvaluated,
            totalObtained,
            averageObtained: studentsEvaluated > 0 ? Math.round(totalObtained / studentsEvaluated) : null,
            examDate: datesheetEntry?.date ?? null,
            startTime: datesheetEntry?.startTime ?? null,
            endTime: datesheetEntry?.endTime ?? null,
          };
        });

        return { exam, subjectSummary };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch exam subjects" });
      }
    }),
});

