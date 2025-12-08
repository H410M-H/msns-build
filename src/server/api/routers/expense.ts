import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Prisma } from "@prisma/client";

// Helper for safe error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "An unknown error occurred";
};

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum([
    "UTILITIES",
    "BISE",
    "SUPPLIES",
    "MAINTENANCE",
    "SALARIES",
    "TRANSPORT",
    "FOOD",
    "EQUIPMENT",
    "OTHER",
  ]),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
});

export const expensesRouter = createTRPCRouter({
  // Create expense
  createExpense: protectedProcedure
    .input(expenseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const expense = await ctx.db.expenses.create({
          data: input,
        });
        return expense;
      } catch (error) {
        console.error("Error creating expense:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create expense: ${getErrorMessage(error)}`,
        });
      }
    }),

  // Get all expenses with filtering, searching, and pagination
  getAllExpenses: protectedProcedure
    .input(
      z.object({
        month: z.number().optional(),
        year: z.number().optional(),
        category: z.string().optional(),
        searchTerm: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.ExpensesWhereInput = {
          month: input.month,
          year: input.year,
          category: input.category
            ? (input.category as Prisma.EnumExpenseCategoryFilter)
            : undefined,
        };

        if (input.searchTerm) {
          where.OR = [
            { title: { contains: input.searchTerm, mode: "insensitive" } },
            { description: { contains: input.searchTerm, mode: "insensitive" } },
          ];
        }

        const [expenses, total] = await Promise.all([
          ctx.db.expenses.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
          }),
          ctx.db.expenses.count({ where }),
        ]);

        return {
          data: expenses,
          meta: {
            total,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil(total / input.pageSize),
          },
        };
      } catch (error) {
        console.error("Error fetching expenses:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch expenses",
        });
      }
    }),

  // Get expense by ID
  getExpenseById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
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
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching expense:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch expense",
        });
      }
    }),

  // Update expense
  updateExpense: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: expenseSchema.partial(),
      })
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

  // Delete single expense
  deleteExpense: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

  // Bulk Delete
  deleteExpensesByIds: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.expenses.deleteMany({
          where: { expenseId: { in: input.ids } },
        });
        return { success: true, count: result.count };
      } catch (error) {
        console.error("Error deleting expenses:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete expenses",
        });
      }
    }),

  // Get available years for filtering
  getExpenseYears: protectedProcedure.query(async ({ ctx }) => {
    try {
      const years = await ctx.db.expenses.findMany({
        select: { year: true },
        distinct: ["year"],
        orderBy: { year: "desc" },
      });
      return years.map((y) => y.year);
    } catch (error) {
      console.error("Error fetching expense years:", error);
      return [];
    }
  }),

  // Get expenses by month with totals (Dashboard/Charts)
  getExpensesByMonth: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      })
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

        const totalByCategory = expenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
          return acc;
        }, {} as Record<string, number>);

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

  // Get expense summary for a period (Analytics)
  getExpensesSummary: protectedProcedure
    .input(
      z.object({
        startMonth: z.number().min(1).max(12),
        startYear: z.number(),
        endMonth: z.number().min(1).max(12).optional(),
        endYear: z.number().optional(),
      })
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
                // Logic to handle cross-year queries or simply filter by date construction if easier
                // For simplicity assuming standard filtering where year > start || (year == start && month >= start)
                // BUT the previous implementation logic was slightly flawed for cross-year logic if months wrap
                // Using a constructed date or simple inclusive filter for now as per previous logic structure
                OR: [
                  {
                    year: input.startYear,
                    month: { gte: input.startMonth },
                  },
                  {
                    year: input.endYear ?? input.startYear,
                    month: { lte: input.endMonth ?? input.startMonth },
                  },
                  {
                    year: {
                      gt: input.startYear,
                      lt: input.endYear ?? input.startYear,
                    },
                  },
                ],
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

        const summary = expenses.reduce((acc, expense) => {
          const monthKey = `${expense.year}-${expense.month}`;

          acc[monthKey] ??= {
              month: expense.month,
              year: expense.year,
              total: 0,
              byCategory: {},
            };

          const entry = acc[monthKey]; // non-null assertion safe due to check above
          entry.total += expense.amount;
          entry.byCategory[expense.category] =
            (entry.byCategory[expense.category] ?? 0) + expense.amount;

          return acc;
        }, {} as Record<string, MonthSummary>);

        return {
          period: {
            start: { month: input.startMonth, year: input.startYear },
            end: {
              month: input.endMonth ?? input.startMonth,
              year: input.endYear ?? input.startYear,
            },
          },
          summary: Object.values(summary).sort((a, b) => {
            // Sort by year then month to ensure order
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
          }),
          total: Object.values(summary).reduce(
            (sum, month) => sum + month.total,
            0
          ),
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