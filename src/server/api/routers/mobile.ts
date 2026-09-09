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
        const db = ctx.db as unknown as {
          deviceRegistration: {
            upsert: (args: {
              where: { token: string };
              update: { platform: string; userId: string | null; parentGuardianId: string | null };
              create: { token: string; platform: string; userId: string | null; parentGuardianId: string | null };
            }) => Promise<{ id: string; token: string; platform: string }>;
          };
        };
        const registration = await db.deviceRegistration.upsert({
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
