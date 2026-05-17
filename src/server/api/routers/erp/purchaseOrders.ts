import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

const poLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  estimatedUnitPrice: z.number().positive(),
  inventoryItemId: z.string().optional(),
});

const createPOSchema = z.object({
  supplierName: z.string().min(1),
  supplierContact: z.string().optional(),
  costCentreId: z.string().cuid(),
  expenseCategory: z.string().min(1),
  requiredByDate: z.date().optional(),
  justification: z.string().min(1),
  attachmentUrls: z.array(z.string()).default([]),
  lineItems: z.array(poLineItemSchema).min(1),
});

const grnLineItemSchema = z.object({
  poLineItemId: z.string().cuid(),
  quantityOrdered: z.number(),
  quantityReceived: z.number().min(0),
  condition: z.string().min(1),
  discrepancyNote: z.string().optional(),
});

export const purchaseOrdersRouter = createTRPCRouter({
  // FR-ERP-06: Create Purchase Order Request
  create: protectedProcedure
    .input(createPOSchema)
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee record not found" });
      }

      // Generate sequential PO number
      const count = await ctx.db.purchaseOrder.count();
      const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      const estimatedTotal = input.lineItems.reduce(
        (sum, li) => sum + li.quantity * li.estimatedUnitPrice,
        0,
      );

      const po = await ctx.db.purchaseOrder.create({
        data: {
          poNumber,
          supplierName: input.supplierName,
          supplierContact: input.supplierContact,
          costCentreId: input.costCentreId,
          expenseCategory: input.expenseCategory,
          requiredByDate: input.requiredByDate,
          justification: input.justification,
          attachmentUrls: input.attachmentUrls,
          estimatedTotal,
          status: "Draft",
          createdBy: employeeRecord.employeeId,
          LineItems: {
            create: input.lineItems.map((li) => ({
              description: li.description,
              quantity: li.quantity,
              unit: li.unit,
              estimatedUnitPrice: li.estimatedUnitPrice,
              totalEstimatedCost: li.quantity * li.estimatedUnitPrice,
              inventoryItemId: li.inventoryItemId,
            })),
          },
        },
        include: { LineItems: true, CostCentre: true },
      });

      return { success: true, po };
    }),

  // FR-ERP-07: Submit for approval (Draft → PendingApprovalL1)
  submitForApproval: protectedProcedure
    .input(z.object({ poId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const po = await ctx.db.purchaseOrder.findUnique({ where: { poId: input.poId } });
      if (!po) throw new TRPCError({ code: "NOT_FOUND", message: "Purchase order not found" });
      if (po.status !== "Draft") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only Draft POs can be submitted" });
      }
      return ctx.db.purchaseOrder.update({
        where: { poId: input.poId },
        data: { status: "PendingApprovalL1" },
      });
    }),

  // FR-ERP-07: L1 Approval
  approveL1: protectedProcedure
    .input(z.object({ poId: z.string().cuid(), comments: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const po = await ctx.db.purchaseOrder.findUnique({ where: { poId: input.poId } });
      if (!po) throw new TRPCError({ code: "NOT_FOUND", message: "PO not found" });
      if (po.status !== "PendingApprovalL1") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "PO is not pending L1 approval" });
      }

      // Determine if L2 is needed (above PKR 10,000 threshold)
      const nextStatus = po.estimatedTotal > 10000 ? "PendingApprovalL2" : "Approved";

      const [updatedPO] = await ctx.db.$transaction([
        ctx.db.purchaseOrder.update({
          where: { poId: input.poId },
          data: {
            status: nextStatus,
            approvalL1By: employeeRecord.employeeId,
            approvalL1At: new Date(),
          },
        }),
        ctx.db.approvalRecord.create({
          data: {
            transactionType: "PO",
            transactionId: input.poId,
            approvalLevel: 1,
            approverId: employeeRecord.employeeId,
            decision: "Approved",
            comments: input.comments,
          },
        }),
      ]);

      return { success: true, po: updatedPO };
    }),

  // FR-ERP-07: L2 Approval
  approveL2: protectedProcedure
    .input(z.object({ poId: z.string().cuid(), comments: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const po = await ctx.db.purchaseOrder.findUnique({ where: { poId: input.poId } });
      if (!po) throw new TRPCError({ code: "NOT_FOUND", message: "PO not found" });
      if (po.status !== "PendingApprovalL2") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "PO is not pending L2 approval" });
      }

      const [updatedPO] = await ctx.db.$transaction([
        ctx.db.purchaseOrder.update({
          where: { poId: input.poId },
          data: {
            status: "Approved",
            approvalL2By: employeeRecord.employeeId,
            approvalL2At: new Date(),
          },
        }),
        ctx.db.approvalRecord.create({
          data: {
            transactionType: "PO",
            transactionId: input.poId,
            approvalLevel: 2,
            approverId: employeeRecord.employeeId,
            decision: "Approved",
            comments: input.comments,
          },
        }),
      ]);

      return { success: true, po: updatedPO };
    }),

  // FR-ERP-07: Reject PO
  reject: protectedProcedure
    .input(z.object({ poId: z.string().cuid(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const po = await ctx.db.purchaseOrder.findUnique({ where: { poId: input.poId } });
      if (!po) throw new TRPCError({ code: "NOT_FOUND", message: "PO not found" });

      await ctx.db.$transaction([
        ctx.db.purchaseOrder.update({
          where: { poId: input.poId },
          data: { status: "Cancelled" },
        }),
        ctx.db.approvalRecord.create({
          data: {
            transactionType: "PO",
            transactionId: input.poId,
            approvalLevel: po.status === "PendingApprovalL2" ? 2 : 1,
            approverId: employeeRecord.employeeId,
            decision: "Rejected",
            comments: input.reason,
          },
        }),
      ]);

      return { success: true };
    }),

  // FR-ERP-09: Update PO status (Approved → Ordered, Ordered → Received, etc.)
  updateStatus: protectedProcedure
    .input(
      z.object({
        poId: z.string().cuid(),
        status: z.enum(["Ordered", "Received", "Invoiced", "Paid"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.purchaseOrder.update({
        where: { poId: input.poId },
        data: { status: input.status },
      });
    }),

  // FR-ERP-10: Record Goods Receipt Note
  recordGRN: protectedProcedure
    .input(
      z.object({
        poId: z.string().cuid(),
        notes: z.string().optional(),
        lineItems: z.array(grnLineItemSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const po = await ctx.db.purchaseOrder.findUnique({
        where: { poId: input.poId },
        include: { LineItems: { include: { InventoryItem: true } } },
      });
      if (!po) throw new TRPCError({ code: "NOT_FOUND", message: "PO not found" });

      const grn = await ctx.db.$transaction(async (tx) => {
        const grnRecord = await tx.goodsReceiptNote.create({
          data: {
            poId: input.poId,
            receivedBy: employeeRecord.employeeId,
            notes: input.notes,
            LineItems: {
              create: input.lineItems.map((li) => ({
                poLineItemId: li.poLineItemId,
                quantityOrdered: li.quantityOrdered,
                quantityReceived: li.quantityReceived,
                condition: li.condition,
                discrepancyNote: li.discrepancyNote,
              })),
            },
          },
        });

        // FR-ERP-19: Update inventory quantities for tagged items
        for (const li of input.lineItems) {
          const poLine = po.LineItems.find((p) => p.lineItemId === li.poLineItemId);
          if (poLine?.inventoryItemId) {
            await tx.inventoryItem.update({
              where: { inventoryItemId: poLine.inventoryItemId },
              data: { quantityOnHand: { increment: li.quantityReceived } },
            });
            await tx.stockTransaction.create({
              data: {
                inventoryItemId: poLine.inventoryItemId,
                transactionType: "StockIn",
                quantity: li.quantityReceived,
                reference: `GRN-${grnRecord.grnId}`,
              },
            });
          }
        }

        await tx.purchaseOrder.update({
          where: { poId: input.poId },
          data: { status: "Received" },
        });

        return grnRecord;
      });

      return { success: true, grn };
    }),

  // Get all POs with filters
  getAll: protectedProcedure
    .input(
      z.object({
        status: z
          .enum([
            "Draft",
            "PendingApprovalL1",
            "PendingApprovalL2",
            "Approved",
            "Ordered",
            "Received",
            "Invoiced",
            "Paid",
            "Cancelled",
          ])
          .optional(),
        costCentreId: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.status && { status: input.status }),
        ...(input.costCentreId && { costCentreId: input.costCentreId }),
      };

      const [pos, total] = await Promise.all([
        ctx.db.purchaseOrder.findMany({
          where,
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            CostCentre: { select: { name: true, code: true } },
            CreatedBy: { select: { employeeName: true } },
            LineItems: true,
          },
        }),
        ctx.db.purchaseOrder.count({ where }),
      ]);

      return { pos, total, page: input.page, pageSize: input.pageSize };
    }),

  // Get PO by ID with full details
  getById: protectedProcedure
    .input(z.object({ poId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const po = await ctx.db.purchaseOrder.findUnique({
        where: { poId: input.poId },
        include: {
          CostCentre: true,
          CreatedBy: { select: { employeeName: true, designation: true } },
          ApprovalL1: { select: { employeeName: true } },
          ApprovalL2: { select: { employeeName: true } },
          LineItems: { include: { InventoryItem: { select: { itemName: true } } } },
          GRN: { include: { LineItems: true, ReceivedBy: { select: { employeeName: true } } } },
        },
      });
      if (!po) throw new TRPCError({ code: "NOT_FOUND", message: "PO not found" });
      return po;
    }),
});
