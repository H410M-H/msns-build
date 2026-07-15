import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const assetsRouter = createTRPCRouter({
  // Asset Category management
  createCategory: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100), description: z.string().optional() }))
    .mutation(({ ctx, input }) => ctx.db.assetCategory.create({ data: input })),

  getAllCategories: protectedProcedure.query(({ ctx }) =>
    ctx.db.assetCategory.findMany({ orderBy: { name: "asc" } }),
  ),

  // FR-ERP-24: Create Asset
  createAsset: protectedProcedure
    .input(
      z.object({
        serialNumber: z.string().optional(),
        assetName: z.string().min(1).max(200),
        assetCategoryId: z.string().cuid(),
        purchaseDate: z.date().optional(),
        purchaseCost: z.number().min(0).default(0),
        supplier: z.string().optional(),
        condition: z.enum(["New", "Good", "Fair", "Poor", "UnderMaintenance"]).default("New"),
        location: z.string().optional(),
        assignedToId: z.string().cuid().optional(),
        warrantyExpiry: z.date().optional(),
        photoUrl: z.string().optional(),
        depreciationMethod: z.enum(["StraightLine", "DecliningBalance"]).default("StraightLine"),
        usefulLifeYears: z.number().int().min(1).default(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.db.asset.count();
      const assetTag = `AST-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
      return ctx.db.asset.create({ data: { ...input, assetTag } });
    }),

  updateAsset: protectedProcedure
    .input(
      z.object({
        assetId: z.string().cuid(),
        assetName: z.string().min(1).max(200).optional(),
        assetCategoryId: z.string().cuid().optional(),
        purchaseCost: z.number().min(0).optional(),
        condition: z.enum(["New", "Good", "Fair", "Poor", "UnderMaintenance"]).optional(),
        location: z.string().optional(),
        assignedToId: z.string().optional(),
        photoUrl: z.string().optional(),
        depreciationMethod: z.enum(["StraightLine", "DecliningBalance"]).optional(),
        usefulLifeYears: z.number().int().min(1).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { assetId, ...data } = input;
      return ctx.db.asset.update({ where: { assetId }, data });
    }),

  // FR-ERP-25: Compute depreciation
  computeDepreciation: protectedProcedure
    .input(z.object({ assetId: z.string().cuid(), period: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUnique({ where: { assetId: input.assetId } });
      if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      if (asset.isDisposed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot depreciate a disposed asset" });
      }

      const totalDepreciation = await ctx.db.assetDepreciation.aggregate({
        where: { assetId: input.assetId },
        _sum: { depreciationAmount: true },
      });

      const cumulativeDepreciation = totalDepreciation._sum.depreciationAmount ?? 0;
      const currentBookValue = asset.purchaseCost - cumulativeDepreciation;

      let depreciationAmount = 0;
      if (asset.depreciationMethod === "StraightLine") {
        depreciationAmount = asset.purchaseCost / asset.usefulLifeYears;
      } else {
        // Declining Balance: 2 / usefulLife * currentBookValue
        const rate = 2 / asset.usefulLifeYears;
        depreciationAmount = currentBookValue * rate;
      }

      // Cap depreciation at remaining book value
      depreciationAmount = Math.min(depreciationAmount, currentBookValue);
      const netBookValue = currentBookValue - depreciationAmount;

      return ctx.db.assetDepreciation.create({
        data: {
          assetId: input.assetId,
          period: input.period,
          depreciationAmount,
          netBookValue,
        },
      });
    }),

  // FR-ERP-26: Schedule/record maintenance
  recordMaintenance: protectedProcedure
    .input(
      z.object({
        assetId: z.string().cuid(),
        maintenanceType: z.enum(["Preventive", "Corrective", "Emergency"]),
        scheduledDate: z.date(),
        completedDate: z.date().optional(),
        vendorName: z.string().optional(),
        cost: z.number().min(0).default(0),
        outcome: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUnique({ where: { assetId: input.assetId } });
      if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      // DR-08: Cannot record maintenance on disposed asset
      if (asset.isDisposed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot maintain a disposed asset" });
      }
      return ctx.db.assetMaintenance.create({ data: input });
    }),

  // FR-ERP-27: Asset transfer
  recordTransfer: protectedProcedure
    .input(
      z.object({
        assetId: z.string().cuid(),
        fromLocation: z.string().optional(),
        toLocation: z.string().optional(),
        fromEmployeeId: z.string().optional(),
        toEmployeeId: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: ctx.session.user.id },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const asset = await ctx.db.asset.findUnique({ where: { assetId: input.assetId } });
      if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      // DR-08: Cannot transfer disposed asset
      if (asset.isDisposed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot transfer a disposed asset" });
      }

      await ctx.db.$transaction([
        ctx.db.assetTransfer.create({
          data: { ...input, authorisedBy: employeeRecord.employeeId },
        }),
        ctx.db.asset.update({
          where: { assetId: input.assetId },
          data: {
            ...(input.toLocation && { location: input.toLocation }),
            ...(input.toEmployeeId && { assignedToId: input.toEmployeeId }),
          },
        }),
      ]);

      return { success: true };
    }),

  // FR-ERP-28: Dispose asset
  disposeAsset: protectedProcedure
    .input(
      z.object({
        assetId: z.string().cuid(),
        disposalDate: z.date(),
        disposalMethod: z.enum(["Sale", "Scrap", "Donation", "Loss"]),
        proceedsReceived: z.number().min(0).default(0),
        authorisationRef: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUnique({ where: { assetId: input.assetId } });
      if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      if (asset.isDisposed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Asset already disposed" });
      }

      await ctx.db.$transaction([
        ctx.db.assetDisposal.create({ data: input }),
        ctx.db.asset.update({
          where: { assetId: input.assetId },
          // DR-08: Lock condition to Disposed
          data: { isDisposed: true, condition: "Disposed" },
        }),
      ]);

      return { success: true };
    }),

  // FR-ERP-29: Asset utilisation report
  getAssetRegister: protectedProcedure
    .input(
      z.object({
        assetCategoryId: z.string().optional(),
        condition: z.enum(["New", "Good", "Fair", "Poor", "UnderMaintenance", "Disposed"]).optional(),
        includeDisposed: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const assets = await ctx.db.asset.findMany({
        where: {
          ...(input.assetCategoryId && { assetCategoryId: input.assetCategoryId }),
          ...(input.condition && { condition: input.condition }),
          ...(!input.includeDisposed && { isDisposed: false }),
        },
        include: {
          AssetCategory: { select: { name: true } },
          AssignedTo: { select: { employeeName: true } },
          Depreciations: { orderBy: { computedAt: "desc" }, take: 1 },
          Disposal: true,
        },
        orderBy: { assetName: "asc" },
      });

      const summary = assets.reduce(
        (acc, asset) => {
          const cat = asset.AssetCategory.name;
          acc[cat] = (acc[cat] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return { assets, categoryDistribution: summary, totalAssets: assets.length };
    }),

  getOverdueMaintenance: protectedProcedure.query(({ ctx }) =>
    ctx.db.assetMaintenance.findMany({
      where: {
        scheduledDate: { lt: new Date() },
        completedDate: null,
        Asset: { isDisposed: false },
      },
      include: { Asset: { select: { assetName: true, assetTag: true, location: true } } },
      orderBy: { scheduledDate: "asc" },
    }),
  ),
});
