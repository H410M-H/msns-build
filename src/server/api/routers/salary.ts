import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";

// ====================== Schemas ======================

const salaryAssignmentSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  baseSalary: z.number().min(10000, "Base salary must be at least 10,000 PKR"),
  increment: z.number().min(0, "Increment cannot be negative"),
  sessionId: z.string().min(1, "Session ID is required"),
});

const salaryAssignmentUpdateSchema = z.object({
  id: z.string(),
  baseSalary: z.number().min(10000).optional(),
  increment: z.number().min(0).optional(),
  sessionId: z.string().min(1).optional(),
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
  searchTerm: z.string().optional(),
  sortField: z
    .enum(["employeeName", "baseSalary", "totalSalary", "assignedDate"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const bulkPaySchema = z.object({
  salaryIds: z.array(z.string()).min(1, "At least one salary ID required"),
  paymentDate: z.date().optional(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID required"),
});

const generateMonthlySalariesSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number(),
  sessionId: z.string().min(1),
});

const salaryCreateSchema = z.object({
  employeeId: z.string().min(1),
  amount: z.number().min(0),
  month: z.number().min(1).max(12),
  year: z.number(),
  status: z.enum(["PAID", "PENDING", "PARTIAL"]),
  paymentDate: z.date().optional(),
  deductions: z.number().default(0),
  allowances: z.number().default(0),
  bonus: z.number().default(0),
  sessionId: z.string().min(1),
});

const salaryUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(["PAID", "PENDING", "PARTIAL"]).optional(),
  amount: z.number().optional(),
  deductions: z.number().optional(),
  allowances: z.number().optional(),
  bonus: z.number().optional(),
  paymentDate: z.date().optional(),
});

// ====================== Router ======================

export const salaryRouter = createTRPCRouter({
  // ----------------------------------------------------------------
  // Monthly Salary Records (The "Salary" Model) - PAYROLL
  // ----------------------------------------------------------------

  create: protectedProcedure
    .input(salaryCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.salary.findFirst({
        where: {
          employeeId: input.employeeId,
          month: input.month,
          year: input.year,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Salary record already exists for this month",
        });
      }

      // --- AUTO-FILL LOGIC START ---
      let finalAmount = input.amount;

      // If amount is 0, try to find the assigned salary for this employee
      if (finalAmount === 0) {
        const assignment = await ctx.db.salaryAssignment.findFirst({
          where: {
            employeeId: input.employeeId,
            sessionId: input.sessionId,
          },
          orderBy: { assignedDate: "desc" },
        });

        if (assignment) {
          finalAmount = assignment.totalSalary;
        }
      }
      // --- AUTO-FILL LOGIC END ---

      return ctx.db.salary.create({
        data: {
          employeeId: input.employeeId,
          amount: finalAmount,
          month: input.month,
          year: input.year,
          status: input.status,
          paymentDate: input.paymentDate ?? new Date(),
          deductions: input.deductions,
          allowances: input.allowances,
          bonus: input.bonus,
          sessionId: input.sessionId,
        },
      });
    }),

  update: protectedProcedure
    .input(salaryUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salary.update({
        where: { id: input.id },
        data: {
          status: input.status,
          amount: input.amount,
          deductions: input.deductions,
          allowances: input.allowances,
          bonus: input.bonus,
          paymentDate: input.paymentDate,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salary.delete({ where: { id: input.id } });
    }),

  // Used for Payroll Table Bulk Delete
  bulkDelete: protectedProcedure
    .input(bulkDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salary.deleteMany({
        where: {
          id: { in: input.ids },
        },
      });
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        month: z.number().optional(),
        year: z.number().optional(),
        employeeId: z.string().optional(),
        status: z.enum(["PAID", "PENDING", "PARTIAL"]).optional(),
        limit: z.number().default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.SalaryWhereInput = {};
      if (input.sessionId) where.sessionId = input.sessionId;
      if (input.month) where.month = input.month;
      if (input.year) where.year = input.year;
      if (input.employeeId) where.employeeId = input.employeeId;
      if (input.status) where.status = input.status;

      const salaries = await ctx.db.salary.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { paymentDate: "desc" },
        include: { Employees: true },
      });

      let nextCursor: string | undefined = undefined;
      if (salaries.length > input.limit) {
        const nextItem = salaries.pop();
        nextCursor = nextItem?.id;
      }

      return { salaries, nextCursor };
    }),

  getPendingSalaries: protectedProcedure
    .input(
      z.object({ month: z.number(), year: z.number(), sessionId: z.string() }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.salary.findMany({
        where: {
          month: input.month,
          year: input.year,
          sessionId: input.sessionId,
          status: { in: ["PENDING", "PARTIAL"] },
        },
        include: { Employees: true },
      });
    }),

  bulkPaySalaries: protectedProcedure
    .input(bulkPaySchema)
    .mutation(async ({ ctx, input }) => {
      const paymentDate = input.paymentDate ?? new Date();

      const updated = await ctx.db.salary.updateMany({
        where: { id: { in: input.salaryIds } },
        data: { status: "PAID", paymentDate },
      });

      return { updatedCount: updated.count };
    }),

  generateMonthlySalaries: protectedProcedure
    .input(generateMonthlySalariesSchema)
    .mutation(async ({ ctx, input }) => {
      const { month, year, sessionId } = input;

      const assignments = await ctx.db.salaryAssignment.findMany({
        where: { sessionId },
        include: { Employees: true },
      });

      let createdCount = 0;

      for (const assignment of assignments) {
        const existing = await ctx.db.salary.findFirst({
          where: {
            employeeId: assignment.employeeId,
            month,
            year,
          },
        });

        if (!existing) {
          await ctx.db.salary.create({
            data: {
              employeeId: assignment.employeeId,
              amount: assignment.totalSalary || 0,
              month,
              year,
              status: "PENDING",
              sessionId,
              deductions: 0,
              allowances: 0,
              bonus: 0,
            },
          });
          createdCount++;
        }
      }

      return { generatedCount: createdCount };
    }),

  getMonthlyPayouts: protectedProcedure
    .input(z.object({ year: z.number(), sessionId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const where: Prisma.SalaryWhereInput = {
        year: input.year,
        status: "PAID",
      };
      if (input.sessionId) where.sessionId = input.sessionId;

      const salaries = await ctx.db.salary.findMany({
        where,
        select: { amount: true, month: true, allowances: true, bonus: true },
      });

      const monthlyData: number[] = new Array(12).fill(0) as number[];

      salaries.forEach((s) => {
        const idx = s.month - 1;
        if (idx >= 0 && idx < 12) {
          const currentTotal = monthlyData[idx] ?? 0;
          monthlyData[idx] =
            currentTotal + s.amount + (s.allowances ?? 0) + (s.bonus ?? 0);
        }
      });

      return monthlyData.map((amount, index) => ({
        month: new Date(2000, index).toLocaleString("default", {
          month: "short",
        }),
        amount,
      }));
    }),

  getTotalPayrollCost: protectedProcedure
    .input(
      z.object({
        month: z.number().optional(),
        year: z.number(),
        sessionId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.SalaryWhereInput = {
        year: input.year,
        status: "PAID",
      };
      if (input.month) where.month = input.month;
      if (input.sessionId) where.sessionId = input.sessionId;

      const result = await ctx.db.salary.aggregate({
        where,
        _sum: { amount: true, allowances: true, bonus: true },
      });

      const total =
        (result._sum?.amount ?? 0) +
        (result._sum?.allowances ?? 0) +
        (result._sum?.bonus ?? 0);
      return { totalPayroll: total };
    }),

  getUnpaidEmployees: protectedProcedure
    .input(
      z.object({ month: z.number(), year: z.number(), sessionId: z.string() }),
    )
    .query(async ({ ctx, input }) => {
      const allEmployees = await ctx.db.employees.findMany({
        where: { designation: { not: "NONE" } },
      });

      const paidSalaries = await ctx.db.salary.findMany({
        where: {
          month: input.month,
          year: input.year,
          sessionId: input.sessionId,
        },
      });

      const paidIds = new Set(paidSalaries.map((s) => s.employeeId));
      return allEmployees.filter((emp) => !paidIds.has(emp.employeeId));
    }),

  getEmployeeSalarySummary: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.SalaryWhereInput = {
        employeeId: input.employeeId,
      };
      if (input.year) where.year = input.year;

      const salaries = await ctx.db.salary.findMany({
        where,
        orderBy: { year: "desc" },
      });

      const totalPaid = salaries
        .filter((s) => s.status === "PAID")
        .reduce(
          (sum, s) =>
            sum +
            s.amount +
            (s.allowances ?? 0) +
            (s.bonus ?? 0) -
            (s.deductions ?? 0),
          0,
        );

      return { records: salaries, totalPaid };
    }),

  getSalarySlipData: protectedProcedure
    .input(
      z.object({
        salaryId: z.string().optional(),
        employeeId: z.string().optional(),
        month: z.number().optional(),
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.SalaryWhereInput = {};
      if (input.salaryId) {
        where.id = input.salaryId;
      } else if (input.employeeId && input.month && input.year) {
        where.employeeId = input.employeeId;
        where.month = input.month;
        where.year = input.year;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient data",
        });
      }

      const salary = await ctx.db.salary.findFirst({
        where,
        include: { Employees: true },
      });

      if (!salary)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salary record not found",
        });

      const netPay =
        salary.amount +
        (salary.allowances ?? 0) +
        (salary.bonus ?? 0) -
        (salary.deductions ?? 0);

      return { ...salary, netPay };
    }),

  // ----------------------------------------------------------------
  // Salary Assignments & Increments (The "SalaryAssignment" Model) - STRUCTURES
  // ----------------------------------------------------------------

  // NEW: This fixes the client error in SalaryTable
  deleteSalariesByIds: protectedProcedure
    .input(z.object({ ids: z.string().array() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salaryAssignment.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),

  assignSalary: protectedProcedure
    .input(salaryAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salaryAssignment.create({
        data: {
          employeeId: input.employeeId,
          baseSalary: input.baseSalary,
          increment: input.increment,
          sessionId: input.sessionId,
          totalSalary: input.baseSalary + input.increment,
          assignedDate: new Date(),
        },
      });
    }),

  updateSalaryAssignment: protectedProcedure
    .input(salaryAssignmentUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.db.salaryAssignment.findUnique({
        where: { id: input.id },
      });
      if (!current)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        });

      const baseSalary = input.baseSalary ?? current.baseSalary;
      const increment = input.increment ?? current.increment;
      const totalSalary = baseSalary + increment;

      return ctx.db.salaryAssignment.update({
        where: { id: input.id },
        data: {
          baseSalary,
          increment,
          totalSalary,
          sessionId: input.sessionId ?? current.sessionId,
        },
      });
    }),

  deleteSalaryAssignment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salaryAssignment.delete({ where: { id: input.id } });
    }),

  deleteBulkSalaryAssignments: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salaryAssignment.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),

  getSalaryHistory: protectedProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.salaryAssignment.findMany({
        where: { employeeId: input.employeeId },
        orderBy: { assignedDate: "desc" },
      });
    }),

  addSalaryIncrement: protectedProcedure
    .input(salaryIncrementSchema)
    .mutation(async ({ ctx, input }) => {
      const currentAssignment = await ctx.db.salaryAssignment.findFirst({
        where: { employeeId: input.employeeId },
        orderBy: { assignedDate: "desc" },
      });

      if (!currentAssignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No salary assignment found for this employee",
        });
      }

      await ctx.db.salaryIncrement.create({
        data: {
          employeeId: input.employeeId,
          incrementAmount: input.incrementAmount,
          reason: input.reason,
          effectiveDate: input.effectiveDate,
        },
      });

      return ctx.db.salaryAssignment.update({
        where: { id: currentAssignment.id },
        data: {
          increment: currentAssignment.increment + input.incrementAmount,
          totalSalary: currentAssignment.totalSalary + input.incrementAmount,
        },
      });
    }),

  getCurrentSalary: protectedProcedure
    .input(z.object({ employeeId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const salary = await ctx.db.salaryAssignment.findFirst({
        where: { employeeId: input.employeeId },
        orderBy: { assignedDate: "desc" },
        include: { Sessions: true, Employees: true },
      });

      if (!salary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No salary assigned",
        });
      }
      return salary;
    }),

  getSalaries: protectedProcedure
    .input(getSalariesInputSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, searchTerm, sortField, sortOrder } = input;

      const where: Prisma.SalaryAssignmentWhereInput = {};

      if (searchTerm) {
        where.Employees = {
          employeeName: { contains: searchTerm, mode: "insensitive" },
        };
      }

      let orderBy: Prisma.SalaryAssignmentOrderByWithRelationInput = {
        assignedDate: "desc",
      };
      if (sortField && sortOrder) {
        if (sortField === "employeeName") {
          orderBy = { Employees: { employeeName: sortOrder } };
        } else {
          orderBy = { [sortField]: sortOrder };
        }
      }

      const [salaries, totalCount] = await Promise.all([
        ctx.db.salaryAssignment.findMany({
          where,
          take: pageSize,
          skip: (page - 1) * pageSize,
          orderBy,
          include: { Employees: true, Sessions: true },
        }),
        ctx.db.salaryAssignment.count({ where }),
      ]);

      return { salaries, totalCount };
    }),
});
