import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Designation, NotificationCategory } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const notificationRouter = createTRPCRouter({
  /**
   * Fetch recent notifications for the authenticated user, including
   * direct personal notifications, role-specific broadcasts, and global broadcasts.
   */
  getAll: protectedProcedure
    .input(
      z
        .object({
          category: z.nativeEnum(NotificationCategory).optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const categoryFilter = input?.category;
      const limit = input?.limit ?? 50;

      const whereClause: Record<string, unknown> = {
        OR: [
          { userId: user.id },
          { targetRole: user.accountType as Designation },
          { AND: [{ userId: null }, { targetRole: null }] },
        ],
      };

      if (categoryFilter) {
        whereClause.category = categoryFilter;
      }

      return await ctx.db.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          userId: true,
          targetRole: true,
          title: true,
          body: true,
          category: true,
          actionUrl: true,
          read: true,
          data: true,
          createdAt: true,
        },
      });
    }),

  /**
   * Fast unread notification counter for the navbar/bell badge.
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    return await ctx.db.notification.count({
      where: {
        read: false,
        OR: [
          { userId: user.id },
          { targetRole: user.accountType as Designation },
          { AND: [{ userId: null }, { targetRole: null }] },
        ],
      },
    });
  }),

  /**
   * Mark an individual notification as read.
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notification.update({
        where: { id: input.id },
        data: { read: true },
        select: {
          id: true,
          read: true,
        },
      });
    }),

  /**
   * Mark all unread notifications visible to the user as read.
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.user;

    return await ctx.db.notification.updateMany({
      where: {
        read: false,
        OR: [
          { userId: user.id },
          { targetRole: user.accountType as Designation },
          { AND: [{ userId: null }, { targetRole: null }] },
        ],
      },
      data: { read: true },
    });
  }),

  /**
   * Delete a single notification.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notification.delete({
        where: { id: input.id },
        select: { id: true },
      });
    }),

  /**
   * Clear all notifications for the current user.
   */
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.user;

    return await ctx.db.notification.deleteMany({
      where: {
        OR: [
          { userId: user.id },
          { targetRole: user.accountType as Designation },
          { AND: [{ userId: null }, { targetRole: null }] },
        ],
      },
    });
  }),

  /**
   * Dispatch a notification (restricted to ADMIN, HEAD, PRINCIPAL).
   */
  send: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        category: z.nativeEnum(NotificationCategory).default(NotificationCategory.SYSTEM),
        actionUrl: z.string().optional(),
        userId: z.string().optional(),
        targetRole: z.nativeEnum(Designation).optional(),
        data: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allowedRoles = ["ADMIN", "HEAD", "PRINCIPAL"];
      if (!allowedRoles.includes(ctx.session.user.accountType)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators and school leadership can dispatch system notifications.",
        });
      }

      return await ctx.db.notification.create({
        data: {
          title: input.title,
          body: input.body,
          category: input.category,
          actionUrl: input.actionUrl,
          userId: input.userId,
          targetRole: input.targetRole,
          data: (input.data ?? undefined) as any,
        },
        select: {
          id: true,
          title: true,
          category: true,
          createdAt: true,
        },
      });
    }),
});
