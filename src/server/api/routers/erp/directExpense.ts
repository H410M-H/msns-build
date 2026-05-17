import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const directExpenseRouter = createTRPCRouter({
  // FR-ERP-13: Record direct expense
  create: protectedProcedure
    .input(
      z.object({
        expenseDate: z.date(),
        description: z.string().min(1).max(500),
        amount: z.number().positive(),
        costCentreId: z.string().cuid(),
        expenseCategory: z.string().min(1),
        paymentChannel: z.enum(["Cash", "BankTransfer", "Cheque", "Online"]),
        paymentReference: z.string().optional(),
        receiptUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      // FR-ERP-14: Auto-approve if below threshold (PKR 5,000)
      const autoApprove = input.amount <= 5000;

      const expense = await ctx.db.directExpense.create({
        data: {
          ...input,
          createdBy: employeeRecord.employeeId,
          isApproved: autoApprove,
          ...(autoApprove && {
            approvedBy: employeeRecord.employeeId,
            approvedAt: new Date(),
          }),
        },
      });

      return { success: true, expense, autoApproved: autoApprove };
    }),

  // FR-ERP-14: Approve direct expense
  approve: protectedProcedure
    .input(z.object({ directExpenseId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const expense = await ctx.db.directExpense.findUnique({
        where: { directExpenseId: input.directExpenseId },
      });
      if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
      if (expense.isApproved) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Expense already approved" });
      }

      return ctx.db.directExpense.update({
        where: { directExpenseId: input.directExpenseId },
        data: {
          isApproved: true,
          approvedBy: employeeRecord.employeeId,
          approvedAt: new Date(),
        },
      });
    }),

  // Reject expense
  reject: protectedProcedure
    .input(z.object({ directExpenseId: z.string().cuid(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.directExpense.update({
        where: { directExpenseId: input.directExpenseId },
        data: { rejectionReason: input.reason },
      });
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        isApproved: z.boolean().optional(),
        costCentreId: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.isApproved !== undefined && { isApproved: input.isApproved }),
        ...(input.costCentreId && { costCentreId: input.costCentreId }),
        ...(input.fromDate || input.toDate
          ? {
              expenseDate: {
                ...(input.fromDate && { gte: input.fromDate }),
                ...(input.toDate && { lte: input.toDate }),
              },
            }
          : {}),
      };

      const [expenses, total] = await Promise.all([
        ctx.db.directExpense.findMany({
          where,
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          orderBy: { expenseDate: "desc" },
          include: {
            CostCentre: { select: { name: true, code: true } },
            CreatedBy: { select: { employeeName: true } },
            ApprovedBy: { select: { employeeName: true } },
          },
        }),
        ctx.db.directExpense.count({ where }),
      ]);

      return { expenses, total, page: input.page, pageSize: input.pageSize };
    }),

  // FR-ERP-16: Recurring expense templates
  createRecurringTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        amount: z.number().positive(),
        expenseCategory: z.string().min(1),
        costCentreId: z.string().cuid().optional(),
        scheduleType: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
        nextDueDate: z.date(),
      }),
    )
    .mutation(({ ctx, input }) => ctx.db.recurringExpenseTemplate.create({ data: input })),

  getRecurringTemplates: protectedProcedure
    .input(z.object({ isActive: z.boolean().default(true) }))
    .query(({ ctx, input }) =>
      ctx.db.recurringExpenseTemplate.findMany({
        where: { isActive: input.isActive },
        orderBy: { nextDueDate: "asc" },
      }),
    ),

  updateRecurringTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string().cuid(),
        amount: z.number().optional(),
        nextDueDate: z.date().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { templateId, ...data } = input;
      return ctx.db.recurringExpenseTemplate.update({ where: { templateId }, data });
    }),
});
