import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { hash, compare } from "bcryptjs";

const updateProfileSchema = z.object({
  username: z.string().min(2).max(100),
  email: z.string().email(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(100).optional(),
});

const updateBioSchema = z.object({
  bio: z.string().max(500).optional(),
});

const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  profileVisibility: z.boolean().optional(),
  twoFactorAuth: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export const ProfileRouter = createTRPCRouter({
  // Get current user profile (added bio to select)
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          email: true,
          username: true,
          accountId: true,
          accountType: true,
          createdAt: true,
          bio: true, // Added bio
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  // Update profile information
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { username, email, currentPassword, newPassword } = input;

        const updateData: {
          username: string;
          email: string;
          password?: string;
        } = {
          username,
          email: email.toLowerCase(),
        };

        // If changing password, validate current password and hash new one
        if (newPassword) {
          if (!currentPassword) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Current password is required",
            });
          }

          const user = await ctx.db.user.findUnique({
            where: { id: ctx.session.user.id },
            select: { password: true },
          });

          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          const isValidPassword = await compare(currentPassword, user.password);
          if (!isValidPassword) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid current password",
            });
          }

          updateData.password = await hash(newPassword, 10);
        }

        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: updateData,
          select: {
            id: true,
            email: true,
            username: true,
            accountId: true,
            accountType: true,
          },
        });

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  // Update bio
  updateBio: protectedProcedure
    .input(updateBioSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { bio: input.bio },
          select: { bio: true },
        });
        return { success: true, bio: updatedUser.bio };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  // Update settings (placeholder - add settings fields to Prisma User if needed)
  updateSettings: protectedProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Assuming settings fields exist or are stored elsewhere; update accordingly
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: input,
        });
        return { success: true, settings: input };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  // Delete account
  deleteAccount: protectedProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { password: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const isValidPassword = await compare(input.password, user.password);
        if (!isValidPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid password",
          });
        }

        await ctx.db.user.delete({
          where: { id: ctx.session.user.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
