import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const budgetRouter = createTRPCRouter({
  // FR-ERP-01: Create Cost Centre
  createCostCentre: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        managerId: z.string().cuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.db.costCentre.count();
      const code = `CC-${input.name.substring(0, 3).toUpperCase()}-${String(count + 1).padStart(3, "0")}`;
      return ctx.db.costCentre.create({ data: { ...input, code } });
    }),

  updateCostCentre: protectedProcedure
    .input(
      z.object({
        costCentreId: z.string().cuid(),
        name: z.string().optional(),
        managerId: z.string().optional(),
        status: z.enum(["Active", "Inactive"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { costCentreId, ...data } = input;
      return ctx.db.costCentre.update({ where: { costCentreId }, data });
    }),

  getAllCostCentres: protectedProcedure.query(({ ctx }) =>
    ctx.db.costCentre.findMany({
      include: { Manager: { select: { employeeName: true } } },
      orderBy: { code: "asc" },
    }),
  ),

  // FR-ERP-02: Create Budget Plan for a session
  createBudgetPlan: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        name: z.string().min(1),
        allocations: z.array(
          z.object({
            costCentreId: z.string().cuid(),
            expenseCategory: z.string().min(1),
            allocatedAmount: z.number().positive(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const totalAmount = input.allocations.reduce((s, a) => s + a.allocatedAmount, 0);

      return ctx.db.budgetPlan.create({
        data: {
          sessionId: input.sessionId,
          name: input.name,
          totalAmount,
          Allocations: {
            create: input.allocations,
          },
        },
        include: { Allocations: true },
      });
    }),

  // FR-ERP-03: Get budget utilisation per cost centre
  getBudgetUtilisation: protectedProcedure
    .input(z.object({ budgetPlanId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.budgetPlan.findUnique({
        where: { budgetPlanId: input.budgetPlanId },
        include: {
          Allocations: {
            include: { CostCentre: { select: { name: true, code: true } } },
          },
          Session: { select: { sessionName: true } },
        },
      });

      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Budget plan not found" });

      // Fetch approved direct expenses and committed POs per cost centre
      const utilisation = await Promise.all(
        plan.Allocations.map(async (alloc) => {
          const [approvedExpenses, committedPOs] = await Promise.all([
            ctx.db.directExpense.aggregate({
              where: { costCentreId: alloc.costCentreId, isApproved: true },
              _sum: { amount: true },
            }),
            ctx.db.purchaseOrder.aggregate({
              where: {
                costCentreId: alloc.costCentreId,
                status: { in: ["Approved", "Ordered"] },
              },
              _sum: { estimatedTotal: true },
            }),
          ]);

          const approvedSpend = approvedExpenses._sum.amount ?? 0;
          const committed = committedPOs._sum.estimatedTotal ?? 0;
          const remaining = alloc.allocatedAmount - approvedSpend - committed;
          const percentUsed =
            alloc.allocatedAmount > 0
              ? Math.round(((approvedSpend + committed) / alloc.allocatedAmount) * 100)
              : 0;

          return {
            allocationId: alloc.allocationId,
            costCentreId: alloc.costCentreId,
            costCentreName: alloc.CostCentre.name,
            costCentreCode: alloc.CostCentre.code,
            expenseCategory: alloc.expenseCategory,
            allocatedAmount: alloc.allocatedAmount,
            approvedSpend,
            committed,
            remaining,
            percentUsed,
            alert75: percentUsed >= 75,
            alert90: percentUsed >= 90,
          };
        }),
      );

      return { plan, utilisation };
    }),

  // FR-ERP-05: Budget reallocation
  reallocateBudget: protectedProcedure
    .input(
      z.object({
        budgetPlanId: z.string().cuid(),
        fromAllocationId: z.string().cuid(),
        toAllocationId: z.string().cuid(),
        amount: z.number().positive(),
        justification: z.string().min(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const [fromAlloc, toAlloc] = await Promise.all([
        ctx.db.budgetAllocation.findUnique({ where: { allocationId: input.fromAllocationId } }),
        ctx.db.budgetAllocation.findUnique({ where: { allocationId: input.toAllocationId } }),
      ]);

      if (!fromAlloc || !toAlloc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Allocation not found" });
      }
      if (fromAlloc.allocatedAmount < input.amount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient budget to reallocate" });
      }

      await ctx.db.$transaction([
        ctx.db.budgetAllocation.update({
          where: { allocationId: input.fromAllocationId },
          data: { allocatedAmount: { decrement: input.amount } },
        }),
        ctx.db.budgetAllocation.update({
          where: { allocationId: input.toAllocationId },
          data: { allocatedAmount: { increment: input.amount } },
        }),
        ctx.db.budgetReallocation.create({
          data: {
            budgetPlanId: input.budgetPlanId,
            fromCategory: fromAlloc.expenseCategory,
            toCategory: toAlloc.expenseCategory,
            amount: input.amount,
            justification: input.justification,
            authorisedBy: employeeRecord.employeeId,
          },
        }),
      ]);

      return { success: true };
    }),

  getBudgetPlansForSession: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(({ ctx, input }) =>
      ctx.db.budgetPlan.findMany({
        where: { sessionId: input.sessionId },
        include: {
          Allocations: { include: { CostCentre: { select: { name: true, code: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ),
});
