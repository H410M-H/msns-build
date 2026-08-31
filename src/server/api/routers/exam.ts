import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const createExamSchema = z.object({
  sessionId: z.string().cuid(),
  classId: z.string().cuid().optional(),
  classIds: z.array(z.string().cuid()).optional(),
  examTypeEnum: z.enum([
    "FIRST_TIME",
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
  createExam: protectedProcedure
    .input(createExamSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const targetClassIds = input.classIds?.length
          ? input.classIds
          : input.classId
          ? [input.classId]
          : [];

        if (targetClassIds.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "At least one class must be selected",
          });
        }

        // Verify session exists
        const session = await ctx.db.sessions.findUnique({
          where: { sessionId: input.sessionId },
        });

        if (!session) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Session not found",
          });
        }

        const createdExams = [];
        const isPhaseTest = input.examTypeEnum.startsWith("PHASE_");

        for (const classId of targetClassIds) {
          const grades = await ctx.db.grades.findUnique({
            where: { classId },
          });

          if (!grades) continue;

          // Determine exam category based on grade and exam type
          const isMatriculation =
            grades.category === ("MATRICULATION" as typeof grades.category);

          if (isMatriculation && !isPhaseTest) {
            // Skip or throw if only 1 class selected
            if (targetClassIds.length === 1) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "Matriculation students should have phase tests, not midterm/final",
              });
            }
            continue;
          }

          if (!isMatriculation && isPhaseTest) {
            if (targetClassIds.length === 1) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "Non-matriculation students should have midterm/final, not phase tests",
              });
            }
            continue;
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

          // Find class subjects for this class to ensure datesheet entries are valid
          const classSubjects = await ctx.db.classSubject.findMany({
            where: { classId, sessionId: input.sessionId },
            select: { subjectId: true },
          });
          const validSubjectIds = new Set(classSubjects.map((cs) => cs.subjectId));

          const datesheetForClass = input.datesheet
            ? input.datesheet.filter((ds) => validSubjectIds.has(ds.subjectId))
            : [];

          // Create exam for this class
          const exam = await ctx.db.exam.create({
            data: {
              examTypeId: examType.examTypeId,
              examTypeEnum: input.examTypeEnum,
              sessionId: input.sessionId,
              classId,
              startDate: input.startDate,
              endDate: input.endDate,
              totalMarks: input.totalMarks,
              passingMarks: input.passingMarks,
              status: "SCHEDULED",
              ...(datesheetForClass.length > 0 && {
                ExamDatesheet: {
                  create: datesheetForClass.map((ds) => ({
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

          createdExams.push(exam);
        }

        if (createdExams.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "No valid exams could be created for the selected classes (check matriculation vs phase test rules).",
          });
        }

        return {
          success: true,
          message: `Created ${createdExams.length} exam(s) successfully`,
          count: createdExams.length,
          exams: createdExams,
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

  updateExam: protectedProcedure
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

  getExamsForSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        classIds: z.array(z.string().cuid()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.ExamWhereInput = {
          sessionId: input.sessionId,
          ...(input.classIds &&
            input.classIds.length > 0 && {
              classId: { in: input.classIds },
            }),
        };

        const exams = await ctx.db.exam.findMany({
          where,
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

  getExamsForClass: protectedProcedure
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

  getExamDetails: protectedProcedure
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

  deleteExam: protectedProcedure
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

  getExamWithSubjects: protectedProcedure
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

  getAllDatesheets: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        classId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        if (!input.sessionId) return [];
        return await ctx.db.exam.findMany({
          where: {
            sessionId: input.sessionId,
            ...(input.classId ? { classId: input.classId } : {}),
          },
          include: {
            Grades: true,
            ExamType: true,
            ExamDatesheet: {
              include: { Subject: true },
              orderBy: { date: "asc" },
            },
          },
          orderBy: [{ startDate: "asc" }, { Grades: { grade: "asc" } }],
        });
      } catch (error) {
        console.error("Error fetching datesheets:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch datesheets",
        });
      }
    }),

  getResultsAnalytics: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        classId: z.string().optional(),
        examId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        if (!input.sessionId) {
          return {
            totalExams: 0,
            totalStudents: 0,
            totalMarksCount: 0,
            averageScorePct: 0,
            subjectStats: [],
            topStudents: [],
            gradeDistribution: [],
          };
        }

        const exams = await ctx.db.exam.findMany({
          where: {
            sessionId: input.sessionId,
            ...(input.classId ? { classId: input.classId } : {}),
            ...(input.examId ? { examId: input.examId } : {}),
          },
          include: {
            Grades: true,
            ExamType: true,
            Marks: {
              include: {
                Subject: true,
                Students: true,
              },
            },
          },
        });

        let totalMarksCount = 0;
        let totalObtainedMarks = 0;
        let totalPossibleMarks = 0;
        const studentScores: Record<
          string,
          { studentName: string; totalObtained: number; totalMax: number; rollNumber?: string }
        > = {};
        const subjectScores: Record<
          string,
          {
            subjectName: string;
            totalObtained: number;
            totalMax: number;
            count: number;
            passed: number;
          }
        > = {};

        const gradeDistribution = {
          "A+ (90-100%)": 0,
          "A (80-89%)": 0,
          "B (70-79%)": 0,
          "C (60-69%)": 0,
          "D (50-59%)": 0,
          "F (<50%)": 0,
        };

        for (const exam of exams) {
          for (const mark of exam.Marks) {
            totalMarksCount++;
            totalObtainedMarks += mark.obtainedMarks;
            totalPossibleMarks += mark.totalMarks;

            const sId = mark.studentId;
            const sName =
              `${mark.Students.firstName} ${mark.Students.lastName}`.trim() ||
              "Student";

            if (!studentScores[sId]) {
              studentScores[sId] = {
                studentName: sName,
                totalObtained: 0,
                totalMax: 0,
              };
            }
            studentScores[sId]!.totalObtained += mark.obtainedMarks;
            studentScores[sId]!.totalMax += mark.totalMarks;

            const subId = mark.subjectId;
            const subName = mark.Subject.subjectName;
            if (!subjectScores[subId]) {
              subjectScores[subId] = {
                subjectName: subName,
                totalObtained: 0,
                totalMax: 0,
                count: 0,
                passed: 0,
              };
            }
            subjectScores[subId]!.totalObtained += mark.obtainedMarks;
            subjectScores[subId]!.totalMax += mark.totalMarks;
            subjectScores[subId]!.count++;
            if (mark.obtainedMarks >= mark.totalMarks * 0.4) {
              subjectScores[subId]!.passed++;
            }
          }
        }

        Object.values(studentScores).forEach((s) => {
          if (s.totalMax > 0) {
            const pct = (s.totalObtained / s.totalMax) * 100;
            if (pct >= 90) gradeDistribution["A+ (90-100%)"]++;
            else if (pct >= 80) gradeDistribution["A (80-89%)"]++;
            else if (pct >= 70) gradeDistribution["B (70-79%)"]++;
            else if (pct >= 60) gradeDistribution["C (60-69%)"]++;
            else if (pct >= 50) gradeDistribution["D (50-59%)"]++;
            else gradeDistribution["F (<50%)"]++;
          }
        });

        const averageScorePct =
          totalPossibleMarks > 0
            ? Math.round((totalObtainedMarks / totalPossibleMarks) * 100)
            : 0;
        const totalStudents = Object.keys(studentScores).length;

        const subjectStats = Object.values(subjectScores).map((sub) => ({
          subjectName: sub.subjectName,
          averagePct:
            sub.totalMax > 0
              ? Math.round((sub.totalObtained / sub.totalMax) * 100)
              : 0,
          passRate:
            sub.count > 0 ? Math.round((sub.passed / sub.count) * 100) : 0,
          totalEntries: sub.count,
        }));

        const topStudents = Object.values(studentScores)
          .map((s) => ({
            studentName: s.studentName,
            percentage:
              s.totalMax > 0
                ? Math.round((s.totalObtained / s.totalMax) * 100)
                : 0,
            totalObtained: s.totalObtained,
            totalMax: s.totalMax,
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5);

        return {
          totalExams: exams.length,
          totalStudents,
          totalMarksCount,
          averageScorePct,
          subjectStats,
          topStudents,
          gradeDistribution: Object.entries(gradeDistribution).map(
            ([name, count]) => ({ name, count }),
          ),
        };
      } catch (error) {
        console.error("Error fetching results analytics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate results analytics",
        });
      }
    }),
});

