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

  // --- Student Attendance ---
  markStudentAttendance: protectedProcedure
    .input(
      z.object({
        classId: z.string(),
        sessionId: z.string(),
        date: z.string(), // YYYY-MM-DD
        records: z.array(
          z.object({
            studentId: z.string(),
            status: z.enum(["P", "A", "L"]),
            remarks: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const upsertPromises = input.records.map((record) =>
          ctx.db.studentAttendance.upsert({
            where: {
              studentId_classId_sessionId_date: {
                studentId: record.studentId,
                classId: input.classId,
                sessionId: input.sessionId,
                date: input.date,
              },
            },
            update: {
              status: record.status,
              remarks: record.remarks,
            },
            create: {
              studentId: record.studentId,
              classId: input.classId,
              sessionId: input.sessionId,
              date: input.date,
              status: record.status,
              remarks: record.remarks,
            },
          }),
        );
        await Promise.all(upsertPromises);
        return { success: true };
      } catch (error) {
        console.error("Error marking student attendance:", error);
        throw new Error("Failed to mark student attendance");
      }
    }),

  getStudentAttendanceByClass: protectedProcedure
    .input(
      z.object({
        classId: z.string(),
        sessionId: z.string(),
        date: z.string(), // YYYY-MM-DD
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.studentAttendance.findMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            date: input.date,
          },
        });
      } catch (error) {
        console.error("Error fetching class attendance:", error);
        throw new Error("Failed to fetch class attendance");
      }
    }),
});
