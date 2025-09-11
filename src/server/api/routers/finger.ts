import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const fingerRouter = createTRPCRouter({
  addFinger: publicProcedure
    .input(
      z.object({
        template: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.fingerprint.create({
          data: {
            template: input.template,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }),
  getFinger: publicProcedure.query(async ({ ctx, input }) => {
    try {
      return await ctx.db.fingerprint.findFirstOrThrow();
    } catch (error) {
      console.error(error);
    }
  }),
});
