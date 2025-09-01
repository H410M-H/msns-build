import { z } from "zod"
import { router, publicProcedure } from "../server"
import { TRPCError } from "@trpc/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(["UTILITIES", "SUPPLIES", "MAINTENANCE", "SALARIES", "TRANSPORT", "FOOD", "EQUIPMENT", "OTHER"]),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
})

export const expensesRouter = router({
  // Create expense
  create: publicProcedure.input(expenseSchema).mutation(async ({ input }) => {
    try {
      const expense = await prisma.expenses.create({
        data: input,
      })
      return expense
    } catch (error) {
      console.error("Error creating expense:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create expense",
      })
    }
  }),

  // Get all expenses with optional filtering
  getAll: publicProcedure
    .input(
      z
        .object({
          month: z.number().optional(),
          year: z.number().optional(),
          category: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      try {
        const where: any = {}

        if (input?.month) where.month = input.month
        if (input?.year) where.year = input.year
        if (input?.category) where.category = input.category

        const expenses = await prisma.expenses.findMany({
          where,
          orderBy: { createdAt: "desc" },
        })

        return expenses
      } catch (error) {
        console.error("Error fetching expenses:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch expenses",
        })
      }
    }),

  // Get expense by ID
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const expense = await prisma.expenses.findUnique({
        where: { expenseId: input.id },
      })

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        })
      }

      return expense
    } catch (error) {
      console.error("Error fetching expense:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch expense",
      })
    }
  }),

  // Update expense
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: expenseSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const expense = await prisma.expenses.update({
          where: { expenseId: input.id },
          data: input.data,
        })
        return expense
      } catch (error) {
        console.error("Error updating expense:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update expense",
        })
      }
    }),

  // Delete expense
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      await prisma.expenses.delete({
        where: { expenseId: input.id },
      })
      return { success: true }
    } catch (error) {
      console.error("Error deleting expense:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete expense",
      })
    }
  }),

  // Get expenses by month with totals
  getByMonth: publicProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const expenses = await prisma.expenses.findMany({
          where: {
            month: input.month,
            year: input.year,
          },
          orderBy: { createdAt: "desc" },
        })

        const totalByCategory = expenses.reduce(
          (acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount
            return acc
          },
          {} as Record<string, number>,
        )

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

        return {
          expenses,
          totalByCategory,
          totalAmount,
        }
      } catch (error) {
        console.error("Error fetching monthly expenses:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch monthly expenses",
        })
      }
    }),
})
