import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";

const salaryAssignmentSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  baseSalary: z.number().min(10000, "Base salary must be at least 10,000 PKR"),
  increment: z.number().min(0, "Increment cannot be negative"),
  sessionId: z.string().min(1, "Session ID is required"),
});

const salaryIncrementSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  incrementAmount: z.number().positive("Increment amount must be positive"),
  reason: z.string().min(1, "Reason is required"),
  effectiveDate: z.string().transform((str) => new Date(str)),
});

const getSalariesInputSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  searchTerm: z.string(),
  sortField: z.enum([
    "employeeName",
    "baseSalary",
    "totalSalary",
    "assignedDate",
  ]),
  sortOrder: z.enum(["asc", "desc"]),
});

export const SalaryRouter = createTRPCRouter({
  assignSalary: publicProcedure
    .input(salaryAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { employeeId, baseSalary, increment, sessionId } = input;
        const totalSalary = baseSalary + increment;

        const result = await ctx.db.salaryAssignment.create({
          data: {
            employeeId,
            baseSalary,
            increment,
            totalSalary,
            sessionId,
          },
        });

        return {
          success: true,
          message: "Salary assigned successfully",
          data: result,
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign salary",
        });
      }
    }),

  getSalaryHistory: publicProcedure
    .input(
      z.object({ employeeId: z.string().min(1, "Employee ID is required") }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const salaryHistory = await ctx.db.salaryAssignment.findMany({
          where: { employeeId: input.employeeId },
          orderBy: { assignedDate: "desc" },
          include: {
            Sessions: true,
            Employees: true,
          },
        });
        return salaryHistory;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch salary history",
        });
      }
    }),

  addSalaryIncrement: publicProcedure
    .input(salaryIncrementSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { employeeId, incrementAmount, reason, effectiveDate } = input;

        // Get the latest salary assignment for the employee
        const latestSalary = await ctx.db.salaryAssignment.findFirst({
          where: { employeeId },
          orderBy: { assignedDate: "desc" },
        });

        if (!latestSalary) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No salary assignment found for this employee",
          });
        }

        // Create a new salary assignment with the increment
        const newSalaryAssignment = await ctx.db.salaryAssignment.create({
          data: {
            employeeId,
            baseSalary: latestSalary.baseSalary,
            increment: latestSalary.increment + incrementAmount,
            totalSalary: latestSalary.totalSalary + incrementAmount,
            sessionId: latestSalary.sessionId,
          },
        });

        // Create a salary increment record
        const salaryIncrement = await ctx.db.salaryIncrement.create({
          data: {
            employeeId,
            incrementAmount,
            reason,
            effectiveDate,
          },
        });

        return {
          success: true,
          message: "Salary increment added successfully",
          data: { newSalaryAssignment, salaryIncrement },
        };
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add salary increment",
        });
      }
    }),

  getCurrentSalary: publicProcedure
    .input(
      z.object({ employeeId: z.string().min(1, "Employee ID is required") }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const currentSalary = await ctx.db.salaryAssignment.findFirst({
          where: { employeeId: input.employeeId },
          orderBy: { assignedDate: "desc" },
          include: {
            Sessions: true,
            Employees: true,
          },        });

        if (!currentSalary) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No salary assignment found for this employee",
          });
        }

        return currentSalary;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch current salary",
        });
      }
    }),

  getSalaries: publicProcedure
    .input(getSalariesInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { page, pageSize, searchTerm, sortField, sortOrder } = input;
        const skip = (page - 1) * pageSize;

        let where: Prisma.SalaryAssignmentWhereInput = {};
        if (searchTerm) {
          where = {
            Employees: {
              employeeName: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          };
        }

        const orderBy: Prisma.SalaryAssignmentOrderByWithRelationInput =
          sortField === "employeeName"
            ? { Employees: { employeeName: sortOrder } }
            : { [sortField]: sortOrder };

        const [salaries, totalCount] = await Promise.all([
          ctx.db.salaryAssignment.findMany({
            skip,
            take: pageSize,
            where,
            orderBy,
            include: {
              Employees: {
                select: {
                  employeeName: true,
                },
              },
              Sessions: {
                select: {
                  sessionName: true,
                },
              },
            },
          }),
          ctx.db.salaryAssignment.count({ where }),
        ]);

        return {
          salaries,
          totalCount,
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch salaries",
        });
      }
    }),
});
