import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { DayOfWeek } from "@prisma/client";

const dayEnum = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const);

export const timetableRouter = createTRPCRouter({
  // Get all timetable entries with relations
  getTimetable: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.timetable.findMany({
        include: {
          Grades: true,
          Subject: true,
          Employees: true,
          Sessions: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { lectureNumber: "asc" }],
      });
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch timetable",
      });
    }
  }),

  // Get timetable for a specific class
  getTimetableByClass: protectedProcedure
    .input(z.object({ classId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
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
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch class timetable",
        });
      }
    }),

  // Get timetable for a specific teacher
  getTimetableByTeacher: protectedProcedure
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
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch teacher timetable",
        });
      }
    }),

  // Assign teacher to a time slot
  assignTeacher: protectedProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        employeeId: z.string().cuid(),
        subjectId: z.string().cuid(),
        dayOfWeek: dayEnum,
        lectureNumber: z.number().min(1).max(9),
        sessionId: z.string().cuid(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure ClassSubject allotment exists
        const existingCS = await ctx.db.classSubject.findFirst({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            subjectId: input.subjectId,
          },
        });

        if (!existingCS) {
          await ctx.db.classSubject.create({
            data: {
              classId: input.classId,
              sessionId: input.sessionId,
              subjectId: input.subjectId,
              employeeId: input.employeeId,
            },
          });
        } else if (existingCS.employeeId !== input.employeeId) {
          await ctx.db.classSubject.update({
            where: { csId: existingCS.csId },
            data: { employeeId: input.employeeId },
          });
        }

        // Upsert entry for slot
        return await ctx.db.timetable.upsert({
          where: {
            classId_sessionId_dayOfWeek_lectureNumber: {
              classId: input.classId,
              sessionId: input.sessionId,
              dayOfWeek: input.dayOfWeek as DayOfWeek,
              lectureNumber: input.lectureNumber,
            },
          },
          update: {
            employeeId: input.employeeId,
            subjectId: input.subjectId,
            startTime: input.startTime,
            endTime: input.endTime,
          },
          create: {
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
        });
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign teacher",
        });
      }
    }),

  // Assign teacher to multiple days in one call (e.g. all working days)
  assignTeacherBulk: protectedProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        employeeId: z.string().cuid(),
        subjectId: z.string().cuid(),
        sessionId: z.string().cuid(),
        lectureNumber: z.number().min(1).max(9),
        startTime: z.string(),
        endTime: z.string(),
        days: z.array(dayEnum),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.days.length === 0) return [];

        // Ensure ClassSubject allotment exists
        const existingCS = await ctx.db.classSubject.findFirst({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            subjectId: input.subjectId,
          },
        });

        if (!existingCS) {
          await ctx.db.classSubject.create({
            data: {
              classId: input.classId,
              sessionId: input.sessionId,
              subjectId: input.subjectId,
              employeeId: input.employeeId,
            },
          });
        } else if (existingCS.employeeId !== input.employeeId) {
          await ctx.db.classSubject.update({
            where: { csId: existingCS.csId },
            data: { employeeId: input.employeeId },
          });
        }

        const results = await ctx.db.$transaction(
          input.days.map((day) =>
            ctx.db.timetable.upsert({
              where: {
                classId_sessionId_dayOfWeek_lectureNumber: {
                  classId: input.classId,
                  sessionId: input.sessionId,
                  dayOfWeek: day as DayOfWeek,
                  lectureNumber: input.lectureNumber,
                },
              },
              update: {
                employeeId: input.employeeId,
                subjectId: input.subjectId,
                startTime: input.startTime,
                endTime: input.endTime,
              },
              create: {
                classId: input.classId,
                employeeId: input.employeeId,
                subjectId: input.subjectId,
                sessionId: input.sessionId,
                dayOfWeek: day as DayOfWeek,
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
            }),
          ),
        );

        return results;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign teacher across days",
        });
      }
    }),

  // Remove teacher from a single slot
  removeTeacher: protectedProcedure
    .input(z.object({ timetableId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.timetable.delete({
          where: { timetableId: input.timetableId },
        });
        return { success: true };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove teacher",
        });
      }
    }),

  // Remove lecture across multiple days
  removeTeacherBulk: protectedProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
        lectureNumber: z.number().min(1).max(9),
        days: z.array(dayEnum).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.timetable.deleteMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            lectureNumber: input.lectureNumber,
            ...(input.days && input.days.length > 0
              ? { dayOfWeek: { in: input.days as DayOfWeek[] } }
              : {}),
          },
        });
        return { success: true };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove lecture across days",
        });
      }
    }),

  // Copy schedule from one source day to multiple target days
  copyDayToDays: protectedProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
        sourceDay: dayEnum,
        targetDays: z.array(dayEnum),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const sourceEntries = await ctx.db.timetable.findMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            dayOfWeek: input.sourceDay as DayOfWeek,
          },
        });

        if (sourceEntries.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No timetable entries found on ${input.sourceDay} to copy.`,
          });
        }

        await ctx.db.$transaction(async (tx) => {
          // Remove existing entries on target days for this class
          await tx.timetable.deleteMany({
            where: {
              classId: input.classId,
              sessionId: input.sessionId,
              dayOfWeek: { in: input.targetDays as DayOfWeek[] },
            },
          });

          // Insert copied entries for each target day
          const toCreate: Array<{
            classId: string;
            employeeId: string;
            subjectId: string;
            sessionId: string;
            dayOfWeek: DayOfWeek;
            lectureNumber: number;
            startTime: string;
            endTime: string;
          }> = [];

          for (const targetDay of input.targetDays) {
            for (const entry of sourceEntries) {
              toCreate.push({
                classId: input.classId,
                employeeId: entry.employeeId,
                subjectId: entry.subjectId,
                sessionId: input.sessionId,
                dayOfWeek: targetDay as DayOfWeek,
                lectureNumber: entry.lectureNumber,
                startTime: entry.startTime,
                endTime: entry.endTime,
              });
            }
          }

          if (toCreate.length > 0) {
            await tx.timetable.createMany({
              data: toCreate,
            });
          }
        });

        return {
          success: true,
          count: sourceEntries.length * input.targetDays.length,
        };
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to copy day schedule",
        });
      }
    }),

  // Copy full timetable from one class to another
  copyClassTimetable: protectedProcedure
    .input(
      z.object({
        sourceClassId: z.string().cuid(),
        targetClassId: z.string().cuid(),
        sessionId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const sourceEntries = await ctx.db.timetable.findMany({
          where: {
            classId: input.sourceClassId,
            sessionId: input.sessionId,
          },
        });

        if (sourceEntries.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Source class has no timetable entries to copy.",
          });
        }

        await ctx.db.$transaction(async (tx) => {
          // Delete existing timetable for target class
          await tx.timetable.deleteMany({
            where: {
              classId: input.targetClassId,
              sessionId: input.sessionId,
            },
          });

          // Ensure classSubject allotments exist for targetClass
          for (const entry of sourceEntries) {
            const exists = await tx.classSubject.findFirst({
              where: {
                classId: input.targetClassId,
                sessionId: input.sessionId,
                subjectId: entry.subjectId,
              },
            });
            if (!exists) {
              await tx.classSubject.create({
                data: {
                  classId: input.targetClassId,
                  sessionId: input.sessionId,
                  subjectId: entry.subjectId,
                  employeeId: entry.employeeId,
                },
              });
            }
          }

          await tx.timetable.createMany({
            data: sourceEntries.map((e) => ({
              classId: input.targetClassId,
              employeeId: e.employeeId,
              subjectId: e.subjectId,
              sessionId: input.sessionId,
              dayOfWeek: e.dayOfWeek,
              lectureNumber: e.lectureNumber,
              startTime: e.startTime,
              endTime: e.endTime,
            })),
          });
        });

        return { success: true, count: sourceEntries.length };
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to clone class timetable",
        });
      }
    }),

  // Clear specific day for a class
  clearDay: protectedProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
        dayOfWeek: dayEnum,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.timetable.deleteMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            dayOfWeek: input.dayOfWeek as DayOfWeek,
          },
        });
        return { success: true };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to clear day timetable",
        });
      }
    }),

  // Clear entire timetable for a class
  clearClassTimetable: protectedProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.timetable.deleteMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
          },
        });
        return { success: true };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to clear class timetable",
        });
      }
    }),

  // Get subjects for a class
  getSubjectsByClass: protectedProcedure
    .input(z.object({ classId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.classSubject.findMany({
          where: { classId: input.classId },
          include: { Subject: true, Employees: true },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch class subjects",
        });
      }
    }),

  // Get subjects available for a class with teachers
  getSubjectsByClassWithTeachers: protectedProcedure
    .input(z.object({ classId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.classSubject.findMany({
          where: { classId: input.classId },
          include: {
            Subject: true,
            Employees: true,
          },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch class subjects with teachers",
        });
      }
    }),

  // Get active session
  getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.sessions.findMany({
        where: { isActive: true },
      });
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch sessions",
      });
    }
  }),
});
