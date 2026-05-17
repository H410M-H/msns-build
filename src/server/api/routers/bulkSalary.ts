/**
 * Bulk Salary Creation Router — v2.0
 * Implements FR-SAL-01 through FR-SAL-10
 * Extends existing salary.ts (preserved unchanged)
 */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const bulkSalaryItemSchema = z.object({
  employeeId: z.string().cuid(),
  newSalary: z.number().positive("Salary must be positive"),
  isOverridden: z.boolean().default(false),
});

export const bulkSalaryRouter = createTRPCRouter({
  // FR-SAL-01/FR-SAL-02: Preview bulk salary creation grid
  previewBulkCreation: protectedProcedure
    .input(
      z.object({
        toSessionId: z.string().cuid(),
        fromSessionId: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get all active employees
      const employees = await ctx.db.employees.findMany({
        where: {
          designation: { notIn: ["NONE", "STUDENT", "ALL"] },
        },
        select: {
          employeeId: true,
          employeeName: true,
          designation: true,
          admissionNumber: true,
        },
        orderBy: { employeeName: "asc" },
      });

      // Check existing assignments for the target session
      const existingAssignments = await ctx.db.salaryAssignment.findMany({
        where: { sessionId: input.toSessionId },
        select: { employeeId: true, baseSalary: true, totalSalary: true },
      });
      const existingMap = new Map(
        existingAssignments.map((a) => [a.employeeId, a]),
      );

      // If copyFromSession, get previous session assignments
      let prevAssignmentMap = new Map<string, { baseSalary: number; totalSalary: number }>();
      if (input.fromSessionId) {
        const prevAssignments = await ctx.db.salaryAssignment.findMany({
          where: { sessionId: input.fromSessionId },
          select: { employeeId: true, baseSalary: true, totalSalary: true },
        });
        prevAssignmentMap = new Map(
          prevAssignments.map((a) => [a.employeeId, a]),
        );
      }

      const rows = employees.map((emp) => {
        const hasExisting = existingMap.has(emp.employeeId);
        const prevAssignment = prevAssignmentMap.get(emp.employeeId);

        return {
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          designation: emp.designation,
          previousSalary: prevAssignment?.totalSalary ?? 0,
          suggestedNewSalary: prevAssignment?.totalSalary ?? 0,
          hasExistingAssignment: hasExisting,
          existingSalary: existingMap.get(emp.employeeId)?.totalSalary ?? null,
          needsManualEntry: !prevAssignment && !hasExisting,
        };
      });

      return {
        rows,
        totalEmployees: employees.length,
        withPreviousSalary: rows.filter((r) => r.previousSalary > 0).length,
        needingManualEntry: rows.filter((r) => r.needsManualEntry).length,
      };
    }),

  // FR-SAL-03/FR-SAL-04: Apply global increment and preview
  applyGlobalIncrement: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({ employeeId: z.string(), currentSalary: z.number() }),
        ),
        incrementType: z.enum(["PERCENT", "FIXED"]),
        incrementValue: z.number().min(0),
      }),
    )
    .query(({ input }) => {
      // Pure computation — no DB write
      return input.items.map((item) => {
        let increment = 0;
        if (input.incrementType === "PERCENT") {
          increment = (item.currentSalary * input.incrementValue) / 100;
        } else {
          increment = input.incrementValue;
        }
        return {
          employeeId: item.employeeId,
          previousSalary: item.currentSalary,
          increment,
          newSalary: item.currentSalary + increment,
        };
      });
    }),

  // FR-SAL-06: Execute bulk salary creation (single Prisma transaction)
  executeBulkCreation: protectedProcedure
    .input(
      z.object({
        toSessionId: z.string().cuid(),
        fromSessionId: z.string().cuid().optional(),
        globalIncrementType: z.enum(["PERCENT", "FIXED"]).optional(),
        globalIncrementValue: z.number().min(0).default(0),
        items: z.array(bulkSalaryItemSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const initiatorEmployee = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!initiatorEmployee) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee record not found" });
      }

      // FR-SAL-07: Validate all items before transaction
      const validationErrors: string[] = [];
      for (const item of input.items) {
        if (item.newSalary <= 0) {
          const emp = await ctx.db.employees.findUnique({
            where: { employeeId: item.employeeId },
            select: { employeeName: true },
          });
          validationErrors.push(
            `${emp?.employeeName ?? item.employeeId}: Salary must be positive`,
          );
        }
      }

      if (validationErrors.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Validation failed:\n${validationErrors.join("\n")}`,
        });
      }

      // FR-SAL-06: Execute in a single Prisma transaction
      const result = await ctx.db.$transaction(async (tx) => {
        // Create the batch record
        const batch = await tx.bulkSalaryCreationBatch.create({
          data: {
            initiatedBy: initiatorEmployee.employeeId,
            fromSessionId: input.fromSessionId,
            toSessionId: input.toSessionId,
            globalIncrementType: input.globalIncrementType,
            globalIncrementValue: input.globalIncrementValue,
            totalEmployees: input.items.length,
          },
        });

        // Get previous salary amounts for the batch items
        const prevAssignments =
          input.fromSessionId
            ? await tx.salaryAssignment.findMany({
                where: { sessionId: input.fromSessionId },
                select: { employeeId: true, totalSalary: true },
              })
            : [];
        const prevMap = new Map(prevAssignments.map((a) => [a.employeeId, a.totalSalary]));

        let createdCount = 0;
        for (const item of input.items) {
          // Skip if assignment already exists for this session
          const existing = await tx.salaryAssignment.findFirst({
            where: { employeeId: item.employeeId, sessionId: input.toSessionId },
          });
          if (existing) continue;

          await tx.salaryAssignment.create({
            data: {
              employeeId: item.employeeId,
              baseSalary: item.newSalary,
              increment: 0,
              totalSalary: item.newSalary,
              sessionId: input.toSessionId,
            },
          });

          await tx.bulkSalaryCreationItem.create({
            data: {
              batchId: batch.batchId,
              employeeId: item.employeeId,
              previousSalary: prevMap.get(item.employeeId) ?? 0,
              newSalary: item.newSalary,
              isOverridden: item.isOverridden,
            },
          });

          createdCount++;
        }

        await tx.bulkSalaryCreationBatch.update({
          where: { batchId: batch.batchId },
          data: { totalCreated: createdCount },
        });

        return { batchId: batch.batchId, createdCount };
      });

      return {
        success: true,
        batchId: result.batchId,
        createdCount: result.createdCount,
        totalRequested: input.items.length,
      };
    }),

  // FR-SAL-08: Get batch summary report
  getBatchReport: protectedProcedure
    .input(z.object({ batchId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.bulkSalaryCreationBatch.findUnique({
        where: { batchId: input.batchId },
        include: {
          InitiatedBy: { select: { employeeName: true } },
          ToSession: { select: { sessionName: true } },
          Items: {
            include: {
              Employee: { select: { employeeName: true, designation: true } },
            },
          },
        },
      });
    }),

  // FR-SAL-09/FR-SAL-10: Batch increment for a group of employees
  batchIncrement: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        employeeIds: z.array(z.string().cuid()).min(1),
        incrementType: z.enum(["PERCENT", "FIXED"]),
        incrementValue: z.number().positive(),
        effectiveDate: z.date(),
        rationale: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const assignments = await ctx.db.salaryAssignment.findMany({
        where: {
          sessionId: input.sessionId,
          employeeId: { in: input.employeeIds },
        },
      });

      if (assignments.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No salary assignments found for the selected employees in this session",
        });
      }

      await ctx.db.$transaction(
        assignments.flatMap((assignment) => {
          let incrementAmount = 0;
          if (input.incrementType === "PERCENT") {
            incrementAmount = (assignment.totalSalary * input.incrementValue) / 100;
          } else {
            incrementAmount = input.incrementValue;
          }

          const newTotal = assignment.totalSalary + incrementAmount;

          return [
            ctx.db.salaryIncrement.create({
              data: {
                employeeId: assignment.employeeId,
                incrementAmount,
                reason: input.rationale,
                effectiveDate: input.effectiveDate,
              },
            }),
            ctx.db.salaryAssignment.update({
              where: { id: assignment.id },
              data: {
                increment: assignment.increment + incrementAmount,
                totalSalary: newTotal,
              },
            }),
          ];
        }),
      );

      return {
        success: true,
        updatedCount: assignments.length,
        message: `Applied ${input.incrementType === "PERCENT" ? `${input.incrementValue}%` : `PKR ${input.incrementValue}`} increment to ${assignments.length} employees`,
      };
    }),
});
