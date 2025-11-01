import { createTRPCRouter, publicProcedure } from "../trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import type { DayOfWeek } from "@prisma/client"

export const timetableRouter = createTRPCRouter({
  // Get all timetable entries with relations
  getTimetable: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.timetable.findMany({
        include: {
          Grades: true,
          Subject: true,
          Employees: true,
          Sessions: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { lectureNumber: "asc" }],
      })
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch timetable",
      })
    }
  }),

  // Get timetable for a specific class
  getTimetableByClass: publicProcedure.input(z.object({ classId: z.string().cuid() })).query(async ({ ctx, input }) => {
    try {
      return await ctx.db.timetable.findMany({
        where: { classId: input.classId },
        include: {
          Grades: true,
          Subject: true,
          Employees: true,
          Sessions: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { lectureNumber: "asc" }],
      })
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch class timetable",
      })
    }
  }),

  // Get timetable for a specific teacher
  getTimetableByTeacher: publicProcedure
    .input(z.object({ employeeId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.timetable.findMany({
          where: { employeeId: input.employeeId },
          include: {
            Grades: true,
            Subject: true,
            Employees: true,
            Sessions: true,
          },
          orderBy: [{ dayOfWeek: "asc" }, { lectureNumber: "asc" }],
        })
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch teacher timetable",
        })
      }
    }),

  // Assign teacher to a time slot
  assignTeacher: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        employeeId: z.string().cuid(),
        subjectId: z.string().cuid(),
        dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const),
        lectureNumber: z.number().min(1).max(9),
        sessionId: z.string().cuid(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if slot is already occupied
        const existing = await ctx.db.timetable.findFirst({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            dayOfWeek: input.dayOfWeek as DayOfWeek,
            lectureNumber: input.lectureNumber,
          },
        })

        if (existing) {
          // Update existing entry
          return await ctx.db.timetable.update({
            where: { timetableId: existing.timetableId },
            data: {
              employeeId: input.employeeId,
              subjectId: input.subjectId,
              startTime: input.startTime,
              endTime: input.endTime,
            },
            include: {
              Grades: true,
              Subject: true,
              Employees: true,
              Sessions: true,
            },
          })
        }

        // Create new entry
        return await ctx.db.timetable.create({
          data: {
            classId: input.classId,
            employeeId: input.employeeId,
            subjectId: input.subjectId,
            sessionId: input.sessionId,
            dayOfWeek: input.dayOfWeek as DayOfWeek,
            lectureNumber: input.lectureNumber,
            startTime: input.startTime,
            endTime: input.endTime,
          },
          include: {
            Grades: true,
            Subject: true,
            Employees: true,
            Sessions: true,
          },
        })
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign teacher",
        })
      }
    }),

  // Remove teacher from slot
  removeTeacher: publicProcedure
    .input(z.object({ timetableId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.timetable.delete({
          where: { timetableId: input.timetableId },
        })
        return { success: true }
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove teacher",
        })
      }
    }),

  // Get subjects for a class
  getSubjectsByClass: publicProcedure.input(z.object({ classId: z.string().cuid() })).query(async ({ ctx, input }) => {
    try {
      return await ctx.db.classSubject.findMany({
        where: { classId: input.classId },
        include: { Subject: true, Employees: true },
      })
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch class subjects",
      })
    }
  }),

  // Get active session
  getActiveSessions: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.sessions.findMany({
        where: { isActive: true },
      })
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch sessions",
      })
    }
  }),
})
