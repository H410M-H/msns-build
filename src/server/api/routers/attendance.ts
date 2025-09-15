import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import dayjs from "dayjs";

export const attendanceRouter = createTRPCRouter({
  addEmployeeAttendance: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        timeSlot: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.employeeAttendance.upsert({
          where: {
            employeeId_date: {
              date: dayjs().format("YYYY-MM-DD"),
              employeeId: input.employeeId,
            },
          },
          create: {
            employeeId: input.employeeId,
            date: dayjs().format("YYYY-MM-DD"),
            morning: input.timeSlot === "first" ? "P" : "A",
            afternoon: input.timeSlot === "second" ? "P" : "A",
          },
          update: {
            ...(input.timeSlot === "first" && { morning: "P" }),
            ...(input.timeSlot === "second" && { afternoon: "P" }),
          },
        });
      } catch (error) {
        console.error(error);
        throw new Error("Something went wrong");
      }
    }),
  getAllEmployeeAttendance: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.employeeAttendance.findMany();
    } catch (error) {
      console.error(error);
      throw new Error("Something went wrong");
    }
  }),
});
