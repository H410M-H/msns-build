import { createTRPCRouter, publicProcedure } from "../trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

// Time slot schema for editable time slots
const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
})

// Timetable entry schema
const timetableEntrySchema = z.object({
  classId: z.string().cuid("Invalid class ID format"),
  subjectId: z.string().cuid("Invalid subject ID format"),
  employeeId: z.string().cuid("Invalid teacher ID format"),
  sessionId: z.string().cuid("Invalid session ID format"),
  dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
  lectureNumber: z.number().min(1).max(9, "Lecture number must be between 1 and 9"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
})

// Update timetable entry schema
const updateTimetableEntrySchema = timetableEntrySchema.extend({
  timetableId: z.string().cuid("Invalid timetable ID"),
})

// Default time slots for 9 lectures (35 minutes each, 25-minute break after 7th)
const generateDefaultTimeSlots = () => {
  const slots = []
  const currentTime = new Date()
  currentTime.setHours(8, 0, 0, 0) // Start at 8:00 AM
AC:7A:94:17:39:09
  for (let i = 1; i <= 9; i++) {
    const startTime = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`

    // Add 35 minutes for lecture duration
    currentTime.setMinutes(currentTime.getMinutes() + 35)
    const endTime = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`

    slots.push({
      lectureNumber: i,
      startTime,
      endTime,
    })

    // Add break time (5 minutes between lectures, 25 minutes after 7th lecture)
    if (i === 7) {
      currentTime.setMinutes(currentTime.getMinutes() + 25) // 25-minute break
    } else if (i < 9) {
      currentTime.setMinutes(currentTime.getMinutes() + 5) // 5-minute break
    }
  }

  return slots
}

export const TimetableRouter = createTRPCRouter({
  // Get timetable for a specific class and session
  getTimetableByClass: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const timetableEntries = await ctx.db.timetable.findMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
          },
          include: {
            Subject: {
              select: {
                subjectId: true,
                subjectName: true,
              },
            },
            Employees: {
              select: {
                employeeId: true,
                employeeName: true,
                designation: true,
              },
            },
            Grades: {
              select: {
                classId: true,
                grade: true,
                section: true,
              },
            },
            Sessions: {
              select: {
                sessionId: true,
                sessionName: true,
              },
            },
          },
          orderBy: [{ dayOfWeek: "asc" }, { lectureNumber: "asc" }],
        })

        // Group by day of week for easier frontend consumption
        const groupedTimetable = timetableEntries.reduce(
          (acc, entry) => {
            if (!acc[entry.dayOfWeek]) {
              acc[entry.dayOfWeek] = []
            }
            acc[entry.dayOfWeek].push(entry)
            return acc
          },
          {} as Record<string, typeof timetableEntries>,
        )

        return {
          timetable: groupedTimetable,
          defaultTimeSlots: generateDefaultTimeSlots(),
        }
      } catch (error) {
        console.error("Error fetching timetable:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch timetable",
        })
      }
    }),

  // Get all timetables for a session
  getAllTimetables: publicProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const [timetables, total] = await Promise.all([
          ctx.db.timetable.findMany({
            where: { sessionId: input.sessionId },
            include: {
              Subject: { select: { subjectName: true } },
              Employees: { select: { employeeName: true } },
              Grades: { select: { grade: true, section: true } },
            },
            orderBy: [{ Grades: { grade: "asc" } }, { dayOfWeek: "asc" }, { lectureNumber: "asc" }],
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
          }),
          ctx.db.timetable.count({
            where: { sessionId: input.sessionId },
          }),
        ])

        return {
          data: timetables,
          meta: {
            total,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil(total / input.pageSize),
          },
        }
      } catch (error) {
        console.error("Error fetching all timetables:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch timetables",
        })
      }
    }),

  // Create a new timetable entry
  createTimetableEntry: publicProcedure.input(timetableEntrySchema).mutation(async ({ ctx, input }) => {
    try {
      // Verify that all related entities exist
      const [classExists, subjectExists, teacherExists, sessionExists] = await Promise.all([
        ctx.db.grades.findUnique({ where: { classId: input.classId } }),
        ctx.db.subject.findUnique({ where: { subjectId: input.subjectId } }),
        ctx.db.employees.findUnique({ where: { employeeId: input.employeeId } }),
        ctx.db.sessions.findUnique({ where: { sessionId: input.sessionId } }),
      ])

      if (!classExists || !subjectExists || !teacherExists || !sessionExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more related entities not found",
        })
      }

      // Check for conflicts (same class, day, and lecture number)
      const existingEntry = await ctx.db.timetable.findFirst({
        where: {
          classId: input.classId,
          sessionId: input.sessionId,
          dayOfWeek: input.dayOfWeek,
          lectureNumber: input.lectureNumber,
        },
      })

      if (existingEntry) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A timetable entry already exists for this class, day, and lecture slot",
        })
      }

      // Check teacher availability (same day, session, and time slot)
      const teacherConflict = await ctx.db.timetable.findFirst({
        where: {
          employeeId: input.employeeId,
          sessionId: input.sessionId,
          dayOfWeek: input.dayOfWeek,
          lectureNumber: input.lectureNumber,
        },
      })

      if (teacherConflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Teacher is already assigned to another class at this time",
        })
      }

      const newEntry = await ctx.db.timetable.create({
        data: input,
        include: {
          Subject: { select: { subjectName: true } },
          Employees: { select: { employeeName: true } },
          Grades: { select: { grade: true, section: true } },
          Sessions: { select: { sessionName: true } },
        },
      })

      return {
        ...newEntry,
        success: true,
        message: "Timetable entry created successfully",
      }
    } catch (error) {
      if (error instanceof TRPCError) throw error
      console.error("Error creating timetable entry:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create timetable entry",
      })
    }
  }),

  // Update an existing timetable entry
  updateTimetableEntry: publicProcedure.input(updateTimetableEntrySchema).mutation(async ({ ctx, input }) => {
    try {
      const { timetableId, ...updateData } = input

      // Check if entry exists
      const existingEntry = await ctx.db.timetable.findUnique({
        where: { timetableId },
      })

      if (!existingEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Timetable entry not found",
        })
      }

      // Check for conflicts (excluding current entry)
      const conflictEntry = await ctx.db.timetable.findFirst({
        where: {
          classId: updateData.classId,
          sessionId: updateData.sessionId,
          dayOfWeek: updateData.dayOfWeek,
          lectureNumber: updateData.lectureNumber,
          NOT: { timetableId },
        },
      })

      if (conflictEntry) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A timetable entry already exists for this class, day, and lecture slot",
        })
      }

      // Check teacher availability (excluding current entry)
      const teacherConflict = await ctx.db.timetable.findFirst({
        where: {
          employeeId: updateData.employeeId,
          sessionId: updateData.sessionId,
          dayOfWeek: updateData.dayOfWeek,
          lectureNumber: updateData.lectureNumber,
          NOT: { timetableId },
        },
      })

      if (teacherConflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Teacher is already assigned to another class at this time",
        })
      }

      const updatedEntry = await ctx.db.timetable.update({
        where: { timetableId },
        data: updateData,
        include: {
          Subject: { select: { subjectName: true } },
          Employees: { select: { employeeName: true } },
          Grades: { select: { grade: true, section: true } },
          Sessions: { select: { sessionName: true } },
        },
      })

      return {
        ...updatedEntry,
        success: true,
        message: "Timetable entry updated successfully",
      }
    } catch (error) {
      if (error instanceof TRPCError) throw error
      console.error("Error updating timetable entry:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update timetable entry",
      })
    }
  }),

  // Delete timetable entries
  deleteTimetableEntries: publicProcedure
    .input(
      z.object({
        timetableIds: z.array(z.string().cuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.timetable.deleteMany({
          where: {
            timetableId: { in: input.timetableIds },
          },
        })

        return {
          success: true,
          count: result.count,
          message: `Successfully deleted ${result.count} timetable entries`,
        }
      } catch (error) {
        console.error("Error deleting timetable entries:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete timetable entries",
        })
      }
    }),

  // Get teacher's schedule
  getTeacherSchedule: publicProcedure
    .input(
      z.object({
        employeeId: z.string().cuid(),
        sessionId: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const schedule = await ctx.db.timetable.findMany({
          where: {
            employeeId: input.employeeId,
            sessionId: input.sessionId,
          },
          include: {
            Subject: { select: { subjectName: true } },
            Grades: { select: { grade: true, section: true } },
          },
          orderBy: [{ dayOfWeek: "asc" }, { lectureNumber: "asc" }],
        })

        // Group by day for easier display
        const groupedSchedule = schedule.reduce(
          (acc, entry) => {
            if (!acc[entry.dayOfWeek]) {
              acc[entry.dayOfWeek] = []
            }
            acc[entry.dayOfWeek].push(entry)
            return acc
          },
          {} as Record<string, typeof schedule>,
        )

        return {
          schedule: groupedSchedule,
          totalLectures: schedule.length,
        }
      } catch (error) {
        console.error("Error fetching teacher schedule:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch teacher schedule",
        })
      }
    }),

  // Update time slots for a session (editable time slots)
  updateTimeSlots: publicProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        timeSlots: z.array(
          timeSlotSchema.extend({
            lectureNumber: z.number().min(1).max(9),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Update all timetable entries for this session with new time slots
        const updatePromises = input.timeSlots.map((slot) =>
          ctx.db.timetable.updateMany({
            where: {
              sessionId: input.sessionId,
              lectureNumber: slot.lectureNumber,
            },
            data: {
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
          }),
        )

        await Promise.all(updatePromises)

        return {
          success: true,
          message: "Time slots updated successfully",
        }
      } catch (error) {
        console.error("Error updating time slots:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update time slots",
        })
      }
    }),

  // Create entire weekly timetable for a class and session
  createTimetable: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid("Invalid class ID format"),
        sessionId: z.string().cuid("Invalid session ID format"),
        entries: z
          .array(
            z.object({
              subjectId: z.string().cuid("Invalid subject ID format"),
              employeeId: z.string().cuid("Invalid teacher ID format"),
              dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
              lectureNumber: z.number().min(1).max(9, "Lecture number must be between 1 and 9"),
              startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
              endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            }),
          )
          .min(1, "At least one timetable entry is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify that class and session exist
        const [classExists, sessionExists] = await Promise.all([
          ctx.db.grades.findUnique({ where: { classId: input.classId } }),
          ctx.db.sessions.findUnique({ where: { sessionId: input.sessionId } }),
        ])

        if (!classExists || !sessionExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class or session not found",
          })
        }

        // Check if timetable already exists for this class and session
        const existingTimetable = await ctx.db.timetable.findFirst({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
          },
        })

        if (existingTimetable) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Timetable already exists for this class and session. Use update instead.",
          })
        }

        // Verify all subjects and teachers exist
        const subjectIds = [...new Set(input.entries.map((entry) => entry.subjectId))]
        const employeeIds = [...new Set(input.entries.map((entry) => entry.employeeId))]

        const [subjects, employees] = await Promise.all([
          ctx.db.subject.findMany({ where: { subjectId: { in: subjectIds } } }),
          ctx.db.employees.findMany({ where: { employeeId: { in: employeeIds } } }),
        ])

        if (subjects.length !== subjectIds.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or more subjects not found",
          })
        }

        if (employees.length !== employeeIds.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or more teachers not found",
          })
        }

        // Check for teacher conflicts across all entries
        const teacherConflicts = []
        for (const entry of input.entries) {
          const conflict = await ctx.db.timetable.findFirst({
            where: {
              employeeId: entry.employeeId,
              sessionId: input.sessionId,
              dayOfWeek: entry.dayOfWeek,
              lectureNumber: entry.lectureNumber,
            },
          })
          if (conflict) {
            teacherConflicts.push(`${entry.dayOfWeek} lecture ${entry.lectureNumber}`)
          }
        }

        if (teacherConflicts.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Teacher conflicts found at: ${teacherConflicts.join(", ")}`,
          })
        }

        // Create all timetable entries
        const timetableEntries = input.entries.map((entry) => ({
          ...entry,
          classId: input.classId,
          sessionId: input.sessionId,
        }))

        const createdEntries = await ctx.db.timetable.createMany({
          data: timetableEntries,
        })

        // Fetch the created entries with relations for return
        const fullEntries = await ctx.db.timetable.findMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
          },
          include: {
            Subject: { select: { subjectName: true } },
            Employees: { select: { employeeName: true } },
            Grades: { select: { grade: true, section: true } },
            Sessions: { select: { sessionName: true } },
          },
          orderBy: [{ dayOfWeek: "asc" }, { lectureNumber: "asc" }],
        })

        return {
          success: true,
          count: createdEntries.count,
          entries: fullEntries,
          message: `Successfully created timetable with ${createdEntries.count} entries`,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error("Error creating timetable:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create timetable",
        })
      }
    }),
})
