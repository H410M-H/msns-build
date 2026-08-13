import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const mobileRouter = createTRPCRouter({
  registerDevice: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        platform: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const accountType = ctx.session.user.accountType;
      const isParent = accountType === "PARENT";

      try {
        const registration = await ctx.db.deviceRegistration.upsert({
          where: { token: input.token },
          update: {
            platform: input.platform,
            userId: isParent ? null : userId,
            parentGuardianId: isParent ? userId : null,
          },
          create: {
            token: input.token,
            platform: input.platform,
            userId: isParent ? null : userId,
            parentGuardianId: isParent ? userId : null,
          },
        });
        return { success: true, data: registration };
      } catch (error) {
        console.error("Device registration error:", error);
        throw new Error("Failed to register device");
      }
    }),
});
