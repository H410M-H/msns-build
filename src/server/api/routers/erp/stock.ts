import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const stockRouter = createTRPCRouter({
  // FR-ERP-18: Inventory item management
  createItem: protectedProcedure
    .input(
      z.object({
        itemName: z.string().min(1).max(200),
        category: z.string().min(1).max(100),
        unit: z.string().min(1).max(50),
        reorderLevel: z.number().min(0).default(0),
        supplierRef: z.string().optional(),
        costPerUnit: z.number().min(0).default(0),
        storageLocation: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => ctx.db.inventoryItem.create({ data: input })),

  updateItem: protectedProcedure
    .input(
      z.object({
        inventoryItemId: z.string().cuid(),
        itemName: z.string().optional(),
        reorderLevel: z.number().optional(),
        costPerUnit: z.number().optional(),
        storageLocation: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { inventoryItemId, ...data } = input;
      return ctx.db.inventoryItem.update({ where: { inventoryItemId }, data });
    }),

  // FR-ERP-20: Record stock-out
  recordStockOut: protectedProcedure
    .input(
      z.object({
        inventoryItemId: z.string().cuid(),
        quantity: z.number().positive(),
        recipientId: z.string().cuid().optional(),
        purpose: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.inventoryItem.findUnique({
        where: { inventoryItemId: input.inventoryItemId },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Inventory item not found" });

      // DR-07: Never allow negative quantity
      if (item.quantityOnHand < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock. Available: ${item.quantityOnHand}, Requested: ${input.quantity}`,
        });
      }

      await ctx.db.$transaction([
        ctx.db.inventoryItem.update({
          where: { inventoryItemId: input.inventoryItemId },
          data: { quantityOnHand: { decrement: input.quantity } },
        }),
        ctx.db.stockTransaction.create({
          data: {
            inventoryItemId: input.inventoryItemId,
            transactionType: "StockOut",
            quantity: input.quantity,
            recipientId: input.recipientId,
            purpose: input.purpose,
          },
        }),
      ]);

      return { success: true };
    }),

  // FR-ERP-22: Stock reconciliation
  recordReconciliation: protectedProcedure
    .input(
      z.object({
        inventoryItemId: z.string().cuid(),
        physicalCount: z.number().min(0),
        explanation: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const item = await ctx.db.inventoryItem.findUnique({
        where: { inventoryItemId: input.inventoryItemId },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });

      const variance = input.physicalCount - item.quantityOnHand;

      await ctx.db.$transaction([
        ctx.db.stockReconciliation.create({
          data: {
            inventoryItemId: input.inventoryItemId,
            systemQuantity: item.quantityOnHand,
            physicalCount: input.physicalCount,
            variance,
            explanation: input.explanation,
            performedBy: employeeRecord.employeeId,
          },
        }),
        ctx.db.inventoryItem.update({
          where: { inventoryItemId: input.inventoryItemId },
          data: { quantityOnHand: input.physicalCount },
        }),
        ctx.db.stockTransaction.create({
          data: {
            inventoryItemId: input.inventoryItemId,
            transactionType: "ReconciliationVariance",
            quantity: Math.abs(variance),
            purpose: `Reconciliation variance: ${input.explanation}`,
          },
        }),
      ]);

      return { success: true, variance };
    }),

  // FR-ERP-21: Get all items with low-stock alerts
  getAll: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        lowStockOnly: z.boolean().default(false),
        isActive: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.inventoryItem.findMany({
        where: {
          ...(input.category && { category: input.category }),
          isActive: input.isActive,
        },
        orderBy: { itemName: "asc" },
      });

      const result = items.map((item) => ({
        ...item,
        isLowStock: item.quantityOnHand <= item.reorderLevel,
        stockValue: item.quantityOnHand * item.costPerUnit,
      }));

      return input.lowStockOnly ? result.filter((i) => i.isLowStock) : result;
    }),

  // FR-ERP-23: Inventory valuation report
  getValuationReport: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.inventoryItem.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    });

    const byCategory = items.reduce(
      (acc, item) => {
        const val = item.quantityOnHand * item.costPerUnit;
        acc[item.category] = (acc[item.category] ?? 0) + val;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalValue = items.reduce((sum, item) => sum + item.quantityOnHand * item.costPerUnit, 0);

    return {
      items: items.map((i) => ({ ...i, stockValue: i.quantityOnHand * i.costPerUnit })),
      byCategory,
      totalValue,
    };
  }),

  getTransactionHistory: protectedProcedure
    .input(
      z.object({
        inventoryItemId: z.string().cuid(),
        limit: z.number().default(50),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.stockTransaction.findMany({
        where: { inventoryItemId: input.inventoryItemId },
        include: { Recipient: { select: { employeeName: true } } },
        orderBy: { date: "desc" },
        take: input.limit,
      }),
    ),
});
