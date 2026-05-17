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

  // ================================================================
  // v2.0 PROMOTION MANAGEMENT — FR-PRM-05 through FR-PRM-16
  // ================================================================

  // FR-PRM-07: Manage promotion eligibility rules per exam type
  upsertEligibilityRule: publicProcedure
    .input(
      z.object({
        examTypeEnum: z.string().min(1),
        triggersPromotion: z.boolean().default(false),
        minAggregatePercent: z.number().min(0).max(100).default(40),
        mustPassAllSubjects: z.boolean().default(false),
        minSubjectsToPass: z.number().int().min(0).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.promotionEligibilityRule.findFirst({
        where: { examTypeEnum: input.examTypeEnum },
      });
      if (existing) {
        return ctx.db.promotionEligibilityRule.update({
          where: { ruleId: existing.ruleId },
          data: input,
        });
      }
      return ctx.db.promotionEligibilityRule.create({ data: input });
    }),

  getEligibilityRules: publicProcedure.query(({ ctx }) =>
    ctx.db.promotionEligibilityRule.findMany({ orderBy: { examTypeEnum: "asc" } }),
  ),

  // FR-PRM-05/06/08: Compute and store eligibility results for all students in an exam
  computeEligibility: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exam = await ctx.db.exam.findUnique({
        where: { examId: input.examId },
        select: { examId: true, examTypeEnum: true, totalMarks: true, passingMarks: true },
      });
      if (!exam) throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });

      // Get the eligibility rule for this exam type
      const rule = await ctx.db.promotionEligibilityRule.findFirst({
        where: { examTypeEnum: exam.examTypeEnum },
      });

      // Get all enrolled students
      const enrolled = await ctx.db.studentClass.findMany({
        where: { classId: input.classId, sessionId: input.sessionId },
        select: { studentId: true },
      });

      // Get all subjects in the exam
      const classSubjects = await ctx.db.classSubject.findMany({
        where: { classId: input.classId, sessionId: input.sessionId },
        select: { subjectId: true },
      });
      const totalSubjects = classSubjects.length;

      const results = [];
      for (const sc of enrolled) {
        const studentMarks = await ctx.db.marks.findMany({
          where: { examId: input.examId, studentId: sc.studentId },
          select: { subjectId: true, obtainedMarks: true, totalMarks: true },
        });

        const totalObtained = studentMarks.reduce((s, m) => s + m.obtainedMarks, 0);
        const totalPossible = studentMarks.reduce((s, m) => s + m.totalMarks, 0);
        const aggregatePercent =
          totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100 * 100) / 100 : 0;

        const passedSubjects = studentMarks.filter(
          (m) => m.obtainedMarks >= exam.passingMarks,
        ).length;
        const subjectBreakdown = studentMarks.map((m) => ({
          subjectId: m.subjectId,
          obtainedMarks: m.obtainedMarks,
          totalMarks: m.totalMarks,
          passed: m.obtainedMarks >= exam.passingMarks,
        }));

        // Determine eligibility status using the rule
        let eligibilityStatus: "Eligible" | "Conditional" | "Ineligible" = "Eligible";

        if (rule) {
          const meetsAggregate = aggregatePercent >= rule.minAggregatePercent;
          const meetsSubjects = rule.mustPassAllSubjects
            ? passedSubjects === totalSubjects
            : passedSubjects >= rule.minSubjectsToPass;

          if (!meetsAggregate || !meetsSubjects) {
            // Partial failure — Conditional or Ineligible
            if (meetsAggregate && !meetsSubjects) {
              eligibilityStatus = "Conditional";
            } else {
              eligibilityStatus = "Ineligible";
            }
          }
        } else {
          // Default: use report card pass/fail from existing system
          const reportCard = await ctx.db.reportCard.findFirst({
            where: { examId: input.examId, studentId: sc.studentId },
            select: { status: true, percentage: true },
          });
          if (reportCard?.status === "FAILED") eligibilityStatus = "Ineligible";
          else if (!reportCard) eligibilityStatus = "Conditional";
        }

        // Upsert the eligibility result
        const saved = await ctx.db.promotionEligibilityResult.upsert({
          where: {
            studentId_examId: {
              studentId: sc.studentId,
              examId: input.examId,
            },
          },
          update: {
            eligibilityStatus,
            aggregatePercent,
            subjectBreakdown: JSON.stringify(subjectBreakdown),
          },
          create: {
            studentId: sc.studentId,
            examId: input.examId,
            eligibilityStatus,
            aggregatePercent,
            subjectBreakdown: JSON.stringify(subjectBreakdown),
          },
        });

        results.push(saved);
      }

      return {
        success: true,
        processed: results.length,
        eligible: results.filter((r) => r.eligibilityStatus === "Eligible").length,
        conditional: results.filter((r) => r.eligibilityStatus === "Conditional").length,
        ineligible: results.filter((r) => r.eligibilityStatus === "Ineligible").length,
      };
    }),

  // FR-PRM-08: Get promotion eligibility report for a class/exam
  getEligibilityReport: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.promotionEligibilityResult.findMany({
        where: { examId: input.examId },
        include: {
          Students: {
            select: {
              studentId: true,
              studentName: true,
              admissionNumber: true,
              registrationNumber: true,
            },
          },
        },
        orderBy: [{ eligibilityStatus: "asc" }, { aggregatePercent: "desc" }],
      });

      return results.map((r) => ({
        ...r,
        subjectBreakdown: JSON.parse(r.subjectBreakdown) as Array<{
          subjectId: string;
          obtainedMarks: number;
          totalMarks: number;
          passed: boolean;
        }>,
      }));
    }),

  // FR-PRM-09/10/11/12/13: Execute bulk promotion
  executeBulkPromotion: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        fromClassId: z.string().cuid(),
        toClassId: z.string().cuid(),
        fromSessionId: z.string().cuid(),
        toSessionId: z.string().cuid(),
        students: z.array(
          z.object({
            studentId: z.string().cuid(),
            action: z.enum(["Promote", "Withhold"]),
            isOverride: z.boolean().default(false),
            justification: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const promotedBy = ctx.session?.user?.id;
      if (!promotedBy) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

      const initiatorEmployee = await ctx.db.employees.findFirst({
        where: { admissionNumber: promotedBy },
      });
      if (!initiatorEmployee) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      // Get eligibility results for override validation
      const eligibilityMap = new Map(
        (
          await ctx.db.promotionEligibilityResult.findMany({
            where: { examId: input.examId },
          })
        ).map((r) => [r.studentId, r.eligibilityStatus]),
      );

      const result = await ctx.db.$transaction(async (tx) => {
        // FR-PRM-11: Single Prisma transaction
        const batch = await tx.bulkPromotionBatch.create({
          data: {
            initiatedBy: initiatorEmployee.employeeId,
            fromClassId: input.fromClassId,
            toClassId: input.toClassId,
            fromSessionId: input.fromSessionId,
            toSessionId: input.toSessionId,
            totalProcessed: input.students.length,
          },
        });

        let promoted = 0;
        let withheld = 0;
        let overrides = 0;

        for (const s of input.students) {
          const eligibility = eligibilityMap.get(s.studentId) ?? "Ineligible";
          const isOverride =
            s.isOverride ||
            (s.action === "Promote" && eligibility !== "Eligible") ||
            (s.action === "Withhold" && eligibility === "Eligible");

          const outcome: "Promoted" | "Withheld" | "Overridden" = s.isOverride
            ? "Overridden"
            : s.action === "Promote"
              ? "Promoted"
              : "Withheld";

          await tx.bulkPromotionBatchItem.create({
            data: {
              batchId: batch.batchId,
              studentId: s.studentId,
              eligibilityStatus: eligibility as "Eligible" | "Conditional" | "Ineligible",
              isOverridden: isOverride,
              overrideJustification: s.justification,
              outcome,
            },
          });

          if (s.action === "Promote") {
            // Remove from current class (update enrollment status)
            await tx.studentClass.deleteMany({
              where: { studentId: s.studentId, classId: input.fromClassId },
            });

            // Add to new class
            await tx.studentClass.create({
              data: {
                studentId: s.studentId,
                classId: input.toClassId,
                sessionId: input.toSessionId,
              },
            });

            // Create promotion history
            await tx.promotionHistory.create({
              data: {
                studentId: s.studentId,
                fromClassId: input.fromClassId,
                toClassId: input.toClassId,
                fromSessionId: input.fromSessionId,
                toSessionId: input.toSessionId,
                promotionReason: isOverride ? "SPECIAL_CASE" : "PASSED",
                remarks: s.justification,
                promotedBy: initiatorEmployee.employeeId,
              },
            });

            promoted++;
            if (isOverride) overrides++;
          } else {
            withheld++;
            if (isOverride) overrides++;
          }
        }

        await tx.bulkPromotionBatch.update({
          where: { batchId: batch.batchId },
          data: { totalPromoted: promoted, totalWithheld: withheld, totalOverrides: overrides },
        });

        return { batchId: batch.batchId, promoted, withheld, overrides };
      });

      return {
        success: true,
        batchId: result.batchId,
        totalProcessed: input.students.length,
        promoted: result.promoted,
        withheld: result.withheld,
        overrides: result.overrides,
      };
    }),

  // FR-PRM-15: Get promotion audit trail per class or student
  getPromotionAuditTrail: publicProcedure
    .input(
      z.object({
        studentId: z.string().cuid().optional(),
        fromClassId: z.string().cuid().optional(),
        batchId: z.string().cuid().optional(),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const batches = await ctx.db.bulkPromotionBatch.findMany({
        where: {
          ...(input.fromClassId && { fromClassId: input.fromClassId }),
          ...(input.batchId && { batchId: input.batchId }),
        },
        include: {
          InitiatedBy: { select: { employeeName: true } },
          FromClass: { select: { grade: true, section: true } },
          ToClass: { select: { grade: true, section: true } },
          Items: {
            where: input.studentId ? { studentId: input.studentId } : undefined,
            include: { Student: { select: { studentName: true, admissionNumber: true } } },
          },
        },
        orderBy: { executedAt: "desc" },
        take: input.limit,
      });

      return batches;
    }),

  // FR-PRM-16: Promotion reversal (within 30-day window)
  reversePromotion: publicProcedure
    .input(
      z.object({
        studentId: z.string().cuid(),
        promotionHistoryId: z.string().cuid(),
        justification: z.string().min(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reversedBy = ctx.session?.user?.id;
      if (!reversedBy) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

      const promotionRecord = await ctx.db.promotionHistory.findUnique({
        where: { promotionHistoryId: input.promotionHistoryId },
      });
      if (!promotionRecord) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Promotion record not found" });
      }

      // Check 30-day window
      const daysSincePromotion = Math.floor(
        (Date.now() - promotionRecord.promotedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSincePromotion > 30) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Promotion reversal window has passed (${daysSincePromotion} days since promotion; limit is 30 days)`,
        });
      }

      const initiatorEmployee = await ctx.db.employees.findFirst({
        where: { admissionNumber: reversedBy },
      });

      await ctx.db.$transaction(async (tx) => {
        // Remove from current (promoted-to) class
        await tx.studentClass.deleteMany({
          where: { studentId: input.studentId, classId: promotionRecord.toClassId },
        });

        // Restore in original class
        await tx.studentClass.create({
          data: {
            studentId: input.studentId,
            classId: promotionRecord.fromClassId,
            sessionId: promotionRecord.fromSessionId,
          },
        });

        // Create reversal record in promotion history
        await tx.promotionHistory.create({
          data: {
            studentId: input.studentId,
            fromClassId: promotionRecord.toClassId,
            toClassId: promotionRecord.fromClassId,
            fromSessionId: promotionRecord.toSessionId,
            toSessionId: promotionRecord.fromSessionId,
            promotionReason: "SPECIAL_CASE",
            remarks: `REVERSAL: ${input.justification}`,
            promotedBy: initiatorEmployee?.employeeId ?? reversedBy,
          },
        });
      });

      return { success: true };
    }),
});
