import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const pettyCashRouter = createTRPCRouter({
  // FR-ERP-30: Initialize petty cash register for a session
  initRegister: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        openingBalance: z.number().positive(),
        minimumBalance: z.number().min(0).default(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.pettyCashRegister.findUnique({
        where: { sessionId: input.sessionId },
      });
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Petty cash register already exists for this session",
        });
      }
      return ctx.db.pettyCashRegister.create({
        data: {
          sessionId: input.sessionId,
          openingBalance: input.openingBalance,
          currentBalance: input.openingBalance,
          minimumBalance: input.minimumBalance,
        },
      });
    }),

  // FR-ERP-31: Record disbursement
  recordDisbursement: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        amount: z.number().positive(),
        payee: z.string().min(1),
        purpose: z.string().min(1),
        expenseCategory: z.string().min(1),
        costCentreId: z.string().cuid().optional(),
        voucherRef: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const register = await ctx.db.pettyCashRegister.findUnique({
        where: { sessionId: input.sessionId },
      });
      if (!register) throw new TRPCError({ code: "NOT_FOUND", message: "Petty cash register not found" });
      if (register.currentBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient petty cash. Available: ${register.currentBalance}, Requested: ${input.amount}`,
        });
      }

      await ctx.db.$transaction([
        ctx.db.pettyCashDisbursement.create({
          data: {
            registerId: register.registerId,
            amount: input.amount,
            payee: input.payee,
            purpose: input.purpose,
            expenseCategory: input.expenseCategory,
            costCentreId: input.costCentreId,
            voucherRef: input.voucherRef,
            recordedBy: employeeRecord.employeeId,
          },
        }),
        ctx.db.pettyCashRegister.update({
          where: { registerId: register.registerId },
          data: { currentBalance: { decrement: input.amount } },
        }),
      ]);

      return { success: true, newBalance: register.currentBalance - input.amount };
    }),

  // FR-ERP-32: Replenishment
  recordReplenishment: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        amount: z.number().positive(),
        reference: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const register = await ctx.db.pettyCashRegister.findUnique({
        where: { sessionId: input.sessionId },
      });
      if (!register) throw new TRPCError({ code: "NOT_FOUND", message: "Petty cash register not found" });

      await ctx.db.pettyCashRegister.update({
        where: { registerId: register.registerId },
        data: { currentBalance: { increment: input.amount } },
      });

      return { success: true, newBalance: register.currentBalance + input.amount };
    }),

  // FR-ERP-33: Reconciliation
  recordReconciliation: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        physicalCount: z.number().min(0),
        explanation: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const register = await ctx.db.pettyCashRegister.findUnique({
        where: { sessionId: input.sessionId },
      });
      if (!register) throw new TRPCError({ code: "NOT_FOUND", message: "Register not found" });

      const variance = input.physicalCount - register.currentBalance;

      await ctx.db.$transaction([
        ctx.db.pettyCashReconciliation.create({
          data: {
            registerId: register.registerId,
            systemBalance: register.currentBalance,
            physicalCount: input.physicalCount,
            variance,
            explanation: input.explanation,
            performedBy: employeeRecord.employeeId,
          },
        }),
        ctx.db.pettyCashRegister.update({
          where: { registerId: register.registerId },
          data: { currentBalance: input.physicalCount },
        }),
      ]);

      return { success: true, variance };
    }),

  getRegister: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const register = await ctx.db.pettyCashRegister.findUnique({
        where: { sessionId: input.sessionId },
        include: {
          Disbursements: {
            include: { RecordedBy: { select: { employeeName: true } } },
            orderBy: { date: "desc" },
          },
          Reconciliations: {
            include: { PerformedBy: { select: { employeeName: true } } },
            orderBy: { performedAt: "desc" },
          },
        },
      });

      if (!register) return null;

      const needsReplenishment = register.currentBalance <= register.minimumBalance;
      return { ...register, needsReplenishment };
    }),
});
