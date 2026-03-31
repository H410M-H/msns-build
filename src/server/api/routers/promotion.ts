import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

const promoteStudentSchema = z.object({
  studentId: z.string().cuid(),
  fromSessionId: z.string().cuid(),
  toSessionId: z.string().cuid(),
  fromClassId: z.string().cuid(),
  toClassId: z.string().cuid(),
  remarks: z.string().optional(),
});

const batchPromoteSchema = z.object({
  fromSessionId: z.string().cuid(),
  toSessionId: z.string().cuid(),
  fromClassId: z.string().cuid(),
  toClassId: z.string().cuid(),
  examIdForFinalCheck: z.string().cuid(),
});

export const promotionRouter = createTRPCRouter({
  promoteStudent: publicProcedure
    .input(promoteStudentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const promotedBy = ctx.session?.user?.id;
        if (!promotedBy) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        // Verify student exists
        const student = await ctx.db.students.findUnique({
          where: { studentId: input.studentId },
        });

        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }

        // Verify sessions exist
        const [fromSession, toSession] = await Promise.all([
          ctx.db.sessions.findUnique({
            where: { sessionId: input.fromSessionId },
          }),
          ctx.db.sessions.findUnique({
            where: { sessionId: input.toSessionId },
          }),
        ]);

        if (!fromSession || !toSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or both sessions not found",
          });
        }

        // Verify classes exist
        const [fromClass, toClass] = await Promise.all([
          ctx.db.grades.findUnique({
            where: { classId: input.fromClassId },
          }),
          ctx.db.grades.findUnique({
            where: { classId: input.toClassId },
          }),
        ]);

        if (!fromClass || !toClass) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or both classes not found",
          });
        }

        // Remove student from current class
        await ctx.db.studentClass.deleteMany({
          where: {
            studentId: input.studentId,
            classId: input.fromClassId,
          },
        });

        // Add student to new class
        await ctx.db.studentClass.create({
          data: {
            studentId: input.studentId,
            classId: input.toClassId,
            sessionId: input.toSessionId,
          },
        });

        // Create promotion history
        const promotion = await ctx.db.promotionHistory.create({
          data: {
            studentId: input.studentId,
            fromClassId: input.fromClassId,
            toClassId: input.toClassId,
            fromSessionId: input.fromSessionId,
            toSessionId: input.toSessionId,
            promotionReason: "PASSED",
            remarks: input.remarks,
            promotedBy,
          },
        });

        return {
          success: true,
          message: "Student promoted successfully",
          promotion,
        };
      } catch (error) {
        console.error("Error promoting student:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to promote student",
        });
      }
    }),

  batchPromoteStudents: publicProcedure
    .input(batchPromoteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const promotedBy = ctx.session?.user?.id;
        if (!promotedBy) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        // Get the final exam to check passing status
        const finalExam = await ctx.db.exam.findUnique({
          where: { examId: input.examIdForFinalCheck },
          include: {
            ReportCard: {
              where: {
                status: "PASSED",
              },
              select: {
                studentId: true,
              },
            },
          },
        });

        if (!finalExam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Final exam not found",
          });
        }

        // Get all students currently in the from class
        const currentStudents = await ctx.db.studentClass.findMany({
          where: {
            classId: input.fromClassId,
            sessionId: input.fromSessionId,
          },
          select: { studentId: true },
        });

        const passedStudentIds = new Set(
          finalExam.ReportCard.map((r) => r.studentId),
        );

        // Separate passed and failed students
        const studentsToPromote = currentStudents.filter((s) =>
          passedStudentIds.has(s.studentId),
        );

        const promotionRecords = [];

        // Promote passed students
        for (const student of studentsToPromote) {
          // Remove from current class
          await ctx.db.studentClass.deleteMany({
            where: {
              studentId: student.studentId,
              classId: input.fromClassId,
            },
          });

          // Add to new class
          await ctx.db.studentClass.create({
            data: {
              studentId: student.studentId,
              classId: input.toClassId,
              sessionId: input.toSessionId,
            },
          });

          // Create promotion history
          const promotion = await ctx.db.promotionHistory.create({
            data: {
              studentId: student.studentId,
              fromClassId: input.fromClassId,
              toClassId: input.toClassId,
              fromSessionId: input.fromSessionId,
              toSessionId: input.toSessionId,
              promotionReason: "PASSED",
              promotedBy,
            },
          });

          promotionRecords.push(promotion);
        }

        return {
          success: true,
          message: `${promotionRecords.length} students promoted successfully`,
          promotedCount: promotionRecords.length,
          failedCount: currentStudents.length - promotionRecords.length,
        };
      } catch (error) {
        console.error("Error in batch promotion:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to perform batch promotion",
        });
      }
    }),

  getPromotionHistory: publicProcedure
    .input(
      z.object({
        studentId: z.string().cuid().optional(),
        fromSessionId: z.string().cuid().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const promotions = await ctx.db.promotionHistory.findMany({
          where: {
            ...(input.studentId && { studentId: input.studentId }),
            ...(input.fromSessionId && { fromSessionId: input.fromSessionId }),
          },
          include: {
            Students: {
              select: {
                studentName: true,
                registrationNumber: true,
                admissionNumber: true,
              },
            },
            FromGrades: {
              select: {
                grade: true,
                section: true,
              },
            },
            ToGrades: {
              select: {
                grade: true,
                section: true,
              },
            },
            FromSessions: { select: { sessionName: true } },
            ToSessions: { select: { sessionName: true } },
            Employees: { select: { employeeName: true } },
          },
          orderBy: { promotedAt: "desc" },
          take: input.limit,
        });

        return promotions;
      } catch (error) {
        console.error("Error fetching promotion history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch promotion history",
        });
      }
    }),

  getStudentPromotionStatus: publicProcedure
    .input(z.object({ studentId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const promotions = await ctx.db.promotionHistory.findMany({
          where: { studentId: input.studentId },
          include: {
            FromGrades: {
              select: {
                grade: true,
                section: true,
              },
            },
            ToGrades: {
              select: {
                grade: true,
                section: true,
              },
            },
            FromSessions: { select: { sessionName: true } },
            ToSessions: { select: { sessionName: true } },
          },
          orderBy: { promotedAt: "desc" },
        });

        // Get current class
        const currentClass = await ctx.db.studentClass.findFirst({
          where: { studentId: input.studentId },
          include: {
            Grades: { select: { grade: true, section: true } },
            Sessions: { select: { sessionName: true } },
          },
          // orderBy: { createdAt: "desc" },
        });

        return {
          currentClass,
          promotionHistory: promotions,
        };
      } catch (error) {
        console.error("Error fetching promotion status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch promotion status",
        });
      }
    }),

  canPromoteClass: publicProcedure
    .input(
      z.object({
        fromClassId: z.string().cuid(),
        fromSessionId: z.string().cuid(),
        examIdForCheck: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const exam = await ctx.db.exam.findUnique({
          where: { examId: input.examIdForCheck },
          include: {
            ReportCard: {
              select: {
                studentId: true,
                status: true,
              },
            },
          },
        });

        if (!exam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exam not found",
          });
        }

        const currentStudents = await ctx.db.studentClass.findMany({
          where: {
            classId: input.fromClassId,
            sessionId: input.fromSessionId,
          },
          select: { studentId: true },
        });

        const passedCount = exam.ReportCard.filter(
          (r) => r.status === "PASSED",
        ).length;
        const failedCount = exam.ReportCard.filter(
          (r) => r.status === "FAILED",
        ).length;

        return {
          totalStudents: currentStudents.length,
          passedStudents: passedCount,
          failedStudents: failedCount,
          marksReceivedFor: exam.ReportCard.length,
          canPromote: passedCount > 0,
        };
      } catch (error) {
        console.error("Error checking promotion eligibility:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check promotion eligibility",
        });
      }
    }),
});
