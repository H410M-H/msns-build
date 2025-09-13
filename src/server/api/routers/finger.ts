import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const fingerRouter = createTRPCRouter({
  addFinger: publicProcedure
    .input(
      z.object({
        employeeId: z.string(),
        indexFinger: z.string(),
        thumb: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.bioMetric.upsert({
          where: { employeeId: input.employeeId },
          create: {
            employeeId: input.employeeId,
            thumb: input.thumb,
            indexFinger: input.indexFinger,
          },
          update: {
            thumb: input.indexFinger,
            indexFinger: input.indexFinger,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }),
  getFinger: publicProcedure
    .input(
      z.object({
        employeeId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const finger = await ctx.db.bioMetric.findUnique({
          where: {
            employeeId: input.employeeId,
          },
        });

        if (!finger) return null;
        return finger;
      } catch (error) {
        console.error(error);
      }
    }),
});
