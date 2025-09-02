import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(["UTILITIES", "SUPPLIES", "MAINTENANCE", "SALARIES", "TRANSPORT", "FOOD", "EQUIPMENT", "OTHER"]),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
});

export const expensesRouter = createTRPCRouter({
  // Create expense
  create: protectedProcedure.input(expenseSchema).mutation(async ({ ctx, input }) => {
    try {
      const expense = await ctx.db.expenses.create({
        data: input,
      });
      return expense;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create expense",
      });
    }
  }),

  // Get all expenses with optional filtering
  getAll: protectedProcedure
    .input(
      z
        .object({
          month: z.number().optional(),
          year: z.number().optional(),
          category: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Record<string, unknown> = {};

        if (input?.month) where.month = input.month;
        if (input?.year) where.year = input.year;
        if (input?.category) where.category = input.category;

        const expenses = await ctx.db.expenses.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });

        return expenses;
      } catch (error) {
        console.error("Error fetching expenses:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch expenses",
        });
      }
    }),

  // Get expense by ID
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    try {
      const expense = await ctx.db.expenses.findUnique({
        where: { expenseId: input.id },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      return expense;
    } catch (error) {
      console.error("Error fetching expense:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch expense",
      });
    }
  }),

  // Update expense
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: expenseSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const expense = await ctx.db.expenses.update({
          where: { expenseId: input.id },
          data: input.data,
        });
        return expense;
      } catch (error) {
        console.error("Error updating expense:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update expense",
        });
      }
    }),

  // Delete expense
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      await ctx.db.expenses.delete({
        where: { expenseId: input.id },
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete expense",
      });
    }
  }),

  // Get expenses by month with totals
  getByMonth: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const expenses = await ctx.db.expenses.findMany({
          where: {
            month: input.month,
            year: input.year,
          },
          orderBy: { createdAt: "desc" },
        });

        const totalByCategory = expenses.reduce(
          (acc, expense) => {
            acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
            return acc;
          },
          {} as Record<string, number>,
        );

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        return {
          expenses,
          totalByCategory,
          totalAmount,
        };
      } catch (error) {
        console.error("Error fetching monthly expenses:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch monthly expenses",
        });
      }
    }),

  // Get expense summary for a period
  getSummary: protectedProcedure
    .input(
      z.object({
        startMonth: z.number().min(1).max(12),
        startYear: z.number(),
        endMonth: z.number().min(1).max(12).optional(),
        endYear: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {

        const expenses = await ctx.db.expenses.findMany({
          where: {
            AND: [
              {
                year: {
                  gte: input.startYear,
                  lte: input.endYear ?? input.startYear,
                },
              },
              {
                month: {
                  gte: input.startMonth,
                  lte: input.endMonth ?? input.startMonth,
                },
              },
            ],
          },
          orderBy: [{ year: "asc" }, { month: "asc" }],
        });

        // Group by category and month
        type MonthSummary = {
          month: number;
          year: number;
          total: number;
          byCategory: Record<string, number>;
        };

        const summary = expenses.reduce(
          (acc, expense) => {
            const monthKey = `${expense.year}-${expense.month}`;
            
            if (!acc[monthKey]) {
              acc[monthKey] = {
                month: expense.month,
                year: expense.year,
                total: 0,
                byCategory: {},
              } as MonthSummary;
            }
            
            acc[monthKey].total += expense.amount;
            acc[monthKey].byCategory[expense.category] = 
              (acc[monthKey].byCategory[expense.category] ?? 0) + expense.amount;
            
            return acc;
          },
          {} as Record<string, MonthSummary>,
        );

        return {
          period: {
            start: { month: input.startMonth, year: input.startYear },
            end: { month: input.endMonth ?? input.startMonth, year: input.endYear ?? input.startYear },
          },
          summary: Object.values(summary),
          total: Object.values(summary).reduce((sum, month) => sum + month.total, 0),
        };
      } catch (error) {
        console.error("Error fetching expense summary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch expense summary",
        });
      }
    }),
});