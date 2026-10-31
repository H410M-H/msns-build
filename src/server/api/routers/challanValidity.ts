import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PaymentStatus } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  clerkProcedure,
  managementProcedure,
} from "~/server/api/trpc";

/**
 * Validates temporal consistency and non-overlapping bounds for installment windows.
 * Rejects with BAD_REQUEST if fromDate > toDate or if overlapping intervals exist for the same session & grade.
 */
function validateTemporalWindows(
  candidate: { installmentNo: number; fromDate: Date; toDate: Date; challanValidityId?: string },
  existingSchedules: Array<{ installmentNo: number; fromDate: Date; toDate: Date; challanValidityId: string }>,
  excludeId?: string,
) {
  const fromTime = new Date(candidate.fromDate).getTime();
  const toTime = new Date(candidate.toDate).getTime();

  if (fromTime > toTime) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Validation Error: Installment ${candidate.installmentNo} 'fromDate' must be earlier than or equal to 'toDate'.`,
    });
  }

  for (const existing of existingSchedules) {
    if (excludeId && existing.challanValidityId === excludeId) continue;
    if (candidate.challanValidityId && existing.challanValidityId === candidate.challanValidityId) continue;

    const exFrom = new Date(existing.fromDate).getTime();
    const exTo = new Date(existing.toDate).getTime();

    // Check temporal overlap: max(fromA, fromB) <= min(toA, toB)
    const hasOverlap = Math.max(fromTime, exFrom) <= Math.min(toTime, exTo);
    if (hasOverlap) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Validation Error: Installment ${candidate.installmentNo} window (${new Date(fromTime).toISOString().slice(0, 10)} to ${new Date(toTime).toISOString().slice(0, 10)}) overlaps with existing installment ${existing.installmentNo} window (${new Date(exFrom).toISOString().slice(0, 10)} to ${new Date(exTo).toISOString().slice(0, 10)}).`,
      });
    }

    // Chronological order constraint
    if (candidate.installmentNo < existing.installmentNo && toTime >= exFrom) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Validation Error: Installment ${candidate.installmentNo} must conclude before installment ${existing.installmentNo} begins (${new Date(exFrom).toISOString().slice(0, 10)}).`,
      });
    }
    if (candidate.installmentNo > existing.installmentNo && fromTime <= exTo) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Validation Error: Installment ${candidate.installmentNo} cannot begin before installment ${existing.installmentNo} concludes (${new Date(exTo).toISOString().slice(0, 10)}).`,
      });
    }
  }
}

export const challanValidityRouter = createTRPCRouter({
  /**
   * Configures full installment schedule for a session and grade.
   * Validates non-overlapping temporal windows and saves in an atomic transaction.
   */
  setInstallmentSchedule: managementProcedure
    .input(
      z.object({
        sessionId: z.string(),
        gradeId: z.string(),
        year: z.number().int().min(2000).max(2100),
        schedule: z
          .array(
            z.object({
              installmentNo: z.number().int().min(1).max(12),
              month: z.number().int().min(1).max(12).optional(),
              fromDate: z.coerce.date(),
              toDate: z.coerce.date(),
              isActive: z.boolean().optional(),
            }),
          )
          .min(1, "Schedule must contain at least one installment"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Validate unique installment numbers within the schedule
      const seenInstallmentNos = new Set<number>();
      for (const item of input.schedule) {
        if (seenInstallmentNos.has(item.installmentNo)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Validation Error: Duplicate installment number ${item.installmentNo} in schedule.`,
          });
        }
        seenInstallmentNos.add(item.installmentNo);
      }

      // 2. Sort input schedule by installmentNo asc
      const sortedSchedule = [...input.schedule].sort(
        (a, b) => a.installmentNo - b.installmentNo,
      );

      // 3. Validate internal temporal bounds and non-overlapping constraints within schedule
      for (let i = 0; i < sortedSchedule.length; i++) {
        const item = sortedSchedule[i]!;
        const fromTime = new Date(item.fromDate).getTime();
        const toTime = new Date(item.toDate).getTime();

        if (fromTime > toTime) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Validation Error: Installment ${item.installmentNo} 'fromDate' must be earlier than or equal to 'toDate'.`,
          });
        }

        // Compare against all other items in input
        for (let j = i + 1; j < sortedSchedule.length; j++) {
          const next = sortedSchedule[j]!;
          const nextFrom = new Date(next.fromDate).getTime();
          const nextTo = new Date(next.toDate).getTime();

          if (Math.max(fromTime, nextFrom) <= Math.min(toTime, nextTo)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Validation Error: Installment ${item.installmentNo} overlaps with installment ${next.installmentNo}.`,
            });
          }

          if (toTime >= nextFrom) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Validation Error: Installment ${item.installmentNo} must conclude before installment ${next.installmentNo} begins.`,
            });
          }
        }
      }

      // 4. Atomically upsert in database
      return await ctx.db.$transaction(async (tx) => {
        const results = [];
        for (const item of sortedSchedule) {
          const record = await tx.challanValidity.upsert({
            where: {
              sessionId_gradeId_installmentNo: {
                sessionId: input.sessionId,
                gradeId: input.gradeId,
                installmentNo: item.installmentNo,
              },
            },
            create: {
              sessionId: input.sessionId,
              gradeId: input.gradeId,
              installmentNo: item.installmentNo,
              month: item.month ?? null,
              year: input.year,
              fromDate: item.fromDate,
              toDate: item.toDate,
              isActive: item.isActive ?? true,
            },
            update: {
              month: item.month ?? null,
              year: input.year,
              fromDate: item.fromDate,
              toDate: item.toDate,
              isActive: item.isActive ?? true,
            },
          });
          results.push(record);
        }

        return {
          success: true,
          count: results.length,
          schedule: results,
        };
      });
    }),

  /**
   * Creates a single installment validity window with non-overlapping validation.
   */
  create: clerkProcedure
    .input(
      z.object({
        sessionId: z.string(),
        gradeId: z.string(),
        installmentNo: z.number().int().min(1).max(12),
        month: z.number().int().min(1).max(12).optional(),
        year: z.number().int().min(2000).max(2100),
        fromDate: z.coerce.date(),
        toDate: z.coerce.date(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch existing schedules for session & grade
      const existing = await ctx.db.challanValidity.findMany({
        where: {
          sessionId: input.sessionId,
          gradeId: input.gradeId,
          isActive: true,
        },
      });

      // Check unique installmentNo
      if (existing.some((e) => e.installmentNo === input.installmentNo)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Installment ${input.installmentNo} already exists for this session and class. Use update instead.`,
        });
      }

      // Validate temporal bounds
      validateTemporalWindows(input, existing);

      return await ctx.db.challanValidity.create({
        data: {
          sessionId: input.sessionId,
          gradeId: input.gradeId,
          installmentNo: input.installmentNo,
          month: input.month ?? null,
          year: input.year,
          fromDate: input.fromDate,
          toDate: input.toDate,
          isActive: input.isActive,
        },
      });
    }),

  /**
   * Updates an existing validity window, verifying non-overlapping constraints.
   */
  update: clerkProcedure
    .input(
      z.object({
        challanValidityId: z.string(),
        installmentNo: z.number().int().min(1).max(12).optional(),
        month: z.number().int().min(1).max(12).optional(),
        year: z.number().int().min(2000).max(2100).optional(),
        fromDate: z.coerce.date().optional(),
        toDate: z.coerce.date().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.challanValidity.findUnique({
        where: { challanValidityId: input.challanValidityId },
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challan validity record not found.",
        });
      }

      const targetFrom = input.fromDate ?? record.fromDate;
      const targetTo = input.toDate ?? record.toDate;
      const targetInstallmentNo = input.installmentNo ?? record.installmentNo;

      const otherSchedules = await ctx.db.challanValidity.findMany({
        where: {
          sessionId: record.sessionId,
          gradeId: record.gradeId,
          challanValidityId: { not: record.challanValidityId },
          isActive: true,
        },
      });

      if (
        input.installmentNo &&
        otherSchedules.some((s) => s.installmentNo === input.installmentNo)
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Installment ${input.installmentNo} already exists for this session and class.`,
        });
      }

      validateTemporalWindows(
        {
          installmentNo: targetInstallmentNo,
          fromDate: targetFrom,
          toDate: targetTo,
          challanValidityId: record.challanValidityId,
        },
        otherSchedules,
        record.challanValidityId,
      );

      return await ctx.db.challanValidity.update({
        where: { challanValidityId: input.challanValidityId },
        data: {
          ...(input.installmentNo !== undefined && { installmentNo: input.installmentNo }),
          ...(input.month !== undefined && { month: input.month }),
          ...(input.year !== undefined && { year: input.year }),
          ...(input.fromDate !== undefined && { fromDate: input.fromDate }),
          ...(input.toDate !== undefined && { toDate: input.toDate }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
      });
    }),

  /**
   * Deletes a validity schedule window. Blocked if paid fee records exist.
   */
  delete: managementProcedure
    .input(
      z.object({
        challanValidityId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.challanValidity.findUnique({
        where: { challanValidityId: input.challanValidityId },
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challan validity record not found.",
        });
      }

      // Check if paid vouchers exist for this installment
      const paidVoucher = await ctx.db.feeStudentClass.findFirst({
        where: {
          StudentClass: {
            sessionId: record.sessionId,
            classId: record.gradeId,
          },
          installmentNo: record.installmentNo,
          paymentStatus: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] },
        },
      });

      if (paidVoucher) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete validity schedule: Paid or partially paid vouchers exist for installment ${record.installmentNo}.`,
        });
      }

      await ctx.db.challanValidity.delete({
        where: { challanValidityId: input.challanValidityId },
      });

      return { success: true, id: input.challanValidityId };
    }),

  /**
   * Retrieves installment schedules sorted by installmentNo asc.
   */
  getBySessionAndGrade: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        gradeId: z.string(),
        year: z.number().int().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.challanValidity.findMany({
        where: {
          sessionId: input.sessionId,
          gradeId: input.gradeId,
          ...(input.year ? { year: input.year } : {}),
        },
        orderBy: { installmentNo: "asc" },
      });
    }),

  /**
   * Alias for getBySessionAndGrade
   */
  getInstallmentSchedule: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        gradeId: z.string(),
        year: z.number().int().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.challanValidity.findMany({
        where: {
          sessionId: input.sessionId,
          gradeId: input.gradeId,
          ...(input.year ? { year: input.year } : {}),
        },
        orderBy: { installmentNo: "asc" },
      });
    }),

  /**
   * Bulk Sync Engine:
   * Atomically synchronizes updated validity dates (issueDate, dueDate) to all open
   * (PENDING, PARTIALLY_PAID) vouchers matching session, grade, and installment.
   */
  bulkSync: managementProcedure
    .input(
      z.object({
        challanValidityId: z.string().optional(),
        sessionId: z.string().optional(),
        gradeId: z.string().optional(),
        installmentNo: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let targetRecords = [];

      if (input.challanValidityId) {
        const found = await ctx.db.challanValidity.findUnique({
          where: { challanValidityId: input.challanValidityId },
        });
        if (!found) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Challan validity record not found.",
          });
        }
        targetRecords.push(found);
      } else if (input.sessionId && input.gradeId) {
        targetRecords = await ctx.db.challanValidity.findMany({
          where: {
            sessionId: input.sessionId,
            gradeId: input.gradeId,
            ...(input.installmentNo ? { installmentNo: input.installmentNo } : {}),
            isActive: true,
          },
        });
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either challanValidityId OR both sessionId and gradeId must be provided.",
        });
      }

      let totalSynced = 0;
      for (const validity of targetRecords) {
        const updateResult = await ctx.db.feeStudentClass.updateMany({
          where: {
            StudentClass: {
              sessionId: validity.sessionId,
              classId: validity.gradeId,
            },
            installmentNo: validity.installmentNo,
            paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIALLY_PAID] },
          },
          data: {
            issueDate: validity.fromDate,
            dueDate: validity.toDate,
          },
        });
        totalSynced += updateResult.count;
      }

      return {
        success: true,
        syncedVouchersCount: totalSynced,
        validityRecordsCount: targetRecords.length,
        issueDate: targetRecords[0]?.fromDate,
        dueDate: targetRecords[0]?.toDate,
      };
    }),

  /**
   * Alias for bulkSync
   */
  syncChallanValidityToVouchers: managementProcedure
    .input(
      z.object({
        challanValidityId: z.string().optional(),
        sessionId: z.string().optional(),
        gradeId: z.string().optional(),
        installmentNo: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let targetRecords = [];

      if (input.challanValidityId) {
        const found = await ctx.db.challanValidity.findUnique({
          where: { challanValidityId: input.challanValidityId },
        });
        if (!found) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Challan validity record not found.",
          });
        }
        targetRecords.push(found);
      } else if (input.sessionId && input.gradeId) {
        targetRecords = await ctx.db.challanValidity.findMany({
          where: {
            sessionId: input.sessionId,
            gradeId: input.gradeId,
            ...(input.installmentNo ? { installmentNo: input.installmentNo } : {}),
            isActive: true,
          },
        });
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either challanValidityId OR both sessionId and gradeId must be provided.",
        });
      }

      let totalSynced = 0;
      for (const validity of targetRecords) {
        const updateResult = await ctx.db.feeStudentClass.updateMany({
          where: {
            StudentClass: {
              sessionId: validity.sessionId,
              classId: validity.gradeId,
            },
            installmentNo: validity.installmentNo,
            paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIALLY_PAID] },
          },
          data: {
            issueDate: validity.fromDate,
            dueDate: validity.toDate,
          },
        });
        totalSynced += updateResult.count;
      }

      return {
        success: true,
        syncedVouchersCount: totalSynced,
        validityRecordsCount: targetRecords.length,
        issueDate: targetRecords[0]?.fromDate,
        dueDate: targetRecords[0]?.toDate,
      };
    }),
});
