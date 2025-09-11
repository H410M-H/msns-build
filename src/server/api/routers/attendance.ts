import { TRPCError } from "@trpc/server"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { z } from "zod"
import dayjs from "dayjs"
import { generatePdf } from "~/lib/pdf-reports"

const studentAttendanceSchema = z.object({
  studentId: z.string().cuid(),
  classId: z.string().cuid(),
  sessionId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"]),
  notes: z.string().max(500).optional(),
  temperature: z.number().min(90).max(110).optional(),
})

const employeeAttendanceSchema = z.object({
  employeeId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"]),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)").optional(),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)").optional(),
  notes: z.string().max(500).optional(),
  workingHours: z.number().min(0).max(24).optional(),
})

const bulkStudentAttendanceSchema = z.object({
  attendanceRecords: z.array(studentAttendanceSchema),
  classId: z.string().cuid(),
  sessionId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
})

const bulkEmployeeAttendanceSchema = z.object({
  attendanceRecords: z.array(employeeAttendanceSchema),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
})

const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine(data => dayjs(data.endDate).isAfter(dayjs(data.startDate)), {
  message: "endDate must be after startDate",
  path: ["endDate"],
})

type StudentClass = {
  students: {
    studentId: string
    studentName: string
    registrationNumber: string
    admissionNumber: string
    profilePic: string | null
  }
  classes: {
    grade: string
    section: string
    category: string
  }
}

type StudentAttendance = {
  studentId: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "HALF_DAY"
}

type Employee = {
  employeeId: string
  employeeName: string
  registrationNumber: string
  designation: string
  profilePic: string | null
}

type EmployeeAttendance = {
  employeeId: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "HALF_DAY"
}

export const AttendanceRouter = createTRPCRouter({
  getStudentAttendanceByClass: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }).refine(data => dayjs(data.endDate).isAfter(dayjs(data.startDate)), {
        message: "endDate must be after startDate",
        path: ["endDate"],
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.studentsAttendance.findMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            date: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
          include: {
            students: {
              select: {
                studentId: true,
                studentName: true,
                registrationNumber: true,
                admissionNumber: true,
                profilePic: true,
              },
            },
            classes: {
              select: {
                grade: true,
                section: true,
                category: true,
              },
            },
            sessions: {
              select: {
                sessionName: true,
                isActive: true,
              },
            },
          },
          orderBy: [{ students: { studentName: "asc" } }, { date: "asc" }],
        })
      } catch (error) {
        console.error("Error fetching student attendance:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve student attendance",
        })
      }
    }),

  getMonthlyStudentAttendance: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
        month: z.number().min(1).max(12),
        year: z.number().min(2020).max(2030),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startDate = dayjs()
          .year(input.year)
          .month(input.month - 1)
          .startOf("month")
          .toDate()
        const endDate = dayjs()
          .year(input.year)
          .month(input.month - 1)
          .endOf("month")
          .toDate()

        const [studentsInClass, attendance] = await Promise.all([
          ctx.db.studentClass.findMany({
            where: {
              classId: input.classId,
              sessionId: input.sessionId,
            },
            include: {
              students: {
                select: {
                  studentId: true,
                  studentName: true,
                  registrationNumber: true,
                  admissionNumber: true,
                  profilePic: true,
                },
              },
              classes: {
                select: {
                  grade: true,
                  section: true,
                  category: true,
                },
              },
            },
          }),
          ctx.db.studentsAttendance.findMany({
            where: {
              classId: input.classId,
              sessionId: input.sessionId,
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              students: {
                select: {
                  studentId: true,
                  studentName: true,
                  registrationNumber: true,
                },
              },
            },
            orderBy: [{ students: { studentName: "asc" } }, { date: "asc" }],
          }),
        ])

        const totalDays = dayjs()
          .year(input.year)
          .month(input.month - 1)
          .daysInMonth()
        
        const attendanceStats = studentsInClass.map((sc: StudentClass) => {
          const studentAttendance: StudentAttendance[] = attendance.filter((a: StudentAttendance) => a.studentId === sc.students.studentId)
          const present = studentAttendance.filter((a) => a.status === "PRESENT").length
          const absent = studentAttendance.filter((a) => a.status === "ABSENT").length
          const late = studentAttendance.filter((a) => a.status === "LATE").length
          const excused = studentAttendance.filter((a) => a.status === "EXCUSED").length
          const halfDay = studentAttendance.filter((a) => a.status === "HALF_DAY").length

          return {
            student: sc.students,
            stats: {
              present,
              absent,
              late,
              excused,
              halfDay,
              total: studentAttendance.length,
              percentage: studentAttendance.length > 0 ? (present / totalDays) * 100 : 0,
            },
          }
        })

        return {
          attendance,
          students: studentsInClass.map((sc: StudentClass) => sc.students),
          classInfo: studentsInClass[0]?.classes,
          attendanceStats,
          daysInMonth: totalDays,
          monthName: dayjs().month(input.month - 1).format("MMMM"),
          year: input.year,
        }
      } catch (error) {
        console.error("Error fetching monthly student attendance:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve monthly student attendance",
        })
      }
    }),

  getMonthlyEmployeeAttendance: publicProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020).max(2030),
        designation: z.enum(["ADMIN", "PRINCIPAL", "HEAD", "CLERK", "TEACHER", "WORKER"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startDate = dayjs()
          .year(input.year)
          .month(input.month - 1)
          .startOf("month")
          .toDate()
        const endDate = dayjs()
          .year(input.year)
          .month(input.month - 1)
          .endOf("month")
          .toDate()

        const whereClause: any = {
          date: {
            gte: startDate,
            lte: endDate,
          },
        }

        if (input.designation) {
          whereClause.employees = {
            designation: input.designation,
          }
        }

        const [attendance, employees] = await Promise.all([
          ctx.db.employeesAttendance.findMany({
            where: whereClause,
            include: {
              employees: {
                select: {
                  employeeId: true,
                  employeeName: true,
                  registrationNumber: true,
                  designation: true,
                  profilePic: true,
                },
              },
            },
            orderBy: [{ employees: { employeeName: "asc" } }, { date: "asc" }],
          }),
          ctx.db.employees.findMany({
            where: input.designation ? { designation: input.designation } : {},
            select: {
              employeeId: true,
              employeeName: true,
              registrationNumber: true,
              designation: true,
              profilePic: true,
            },
          }),
        ])

        const totalDays = dayjs()
          .year(input.year)
          .month(input.month - 1)
          .daysInMonth()
        
        const attendanceStats = employees.map((emp: Employee) => {
          const empAttendance: EmployeeAttendance[] = attendance.filter((a: EmployeeAttendance) => a.employeeId === emp.employeeId)
          const present = empAttendance.filter((a) => a.status === "PRESENT").length
          const absent = empAttendance.filter((a) => a.status === "ABSENT").length
          const late = empAttendance.filter((a) => a.status === "LATE").length
          const excused = empAttendance.filter((a) => a.status === "EXCUSED").length
          const halfDay = empAttendance.filter((a) => a.status === "HALF_DAY").length

          return {
            employee: emp,
            stats: {
              present,
              absent,
              late,
              excused,
              halfDay,
              total: empAttendance.length,
              percentage: empAttendance.length > 0 ? (present / totalDays) * 100 : 0,
            },
          }
        })

        return {
          attendance,
          employees,
          attendanceStats,
          daysInMonth: totalDays,
          monthName: dayjs().month(input.month - 1).format("MMMM"),
          year: input.year,
        }
      } catch (error) {
        console.error("Error fetching monthly employee attendance:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve monthly employee attendance",
        })
      }
    }),

  markStudentAttendance: publicProcedure
    .input(studentAttendanceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found",
          })
        }

        const existingAttendance = await ctx.db.studentsAttendance.findFirst({
          where: {
            studentId: input.studentId,
            classId: input.classId,
            sessionId: input.sessionId,
            date: new Date(input.date),
          },
        })

        if (existingAttendance) {
          await ctx.db.studentsAttendance.update({
            where: { id: existingAttendance.id },
            data: {
              status: input.status,
              notes: input.notes,
              temperature: input.temperature,
              markedBy: ctx.session.user.id,
              updatedAt: new Date(),
            },
          })
        } else {
          await ctx.db.studentsAttendance.create({
            data: {
              studentId: input.studentId,
              classId: input.classId,
              sessionId: input.sessionId,
              date: new Date(input.date),
              status: input.status,
              notes: input.notes,
              temperature: input.temperature,
              markedBy: ctx.session.user.id,
            },
          })
        }

        return { success: true }
      } catch (error) {
        console.error("Error marking student attendance:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark student attendance",
        })
      }
    }),

  markEmployeeAttendance: publicProcedure
    .input(employeeAttendanceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found",
          })
        }

        const existingAttendance = await ctx.db.employeesAttendance.findFirst({
          where: {
            employeeId: input.employeeId,
            date: new Date(input.date),
          },
        })

        if (existingAttendance) {
          await ctx.db.employeesAttendance.update({
            where: { id: existingAttendance.id },
            data: {
              status: input.status,
              checkInTime: input.checkInTime ? new Date(`${input.date}T${input.checkInTime}:00`) : null,
              checkOutTime: input.checkOutTime ? new Date(`${input.date}T${input.checkOutTime}:00`) : null,
              workingHours: input.workingHours,
              notes: input.notes,
              markedBy: ctx.session.user.id,
              updatedAt: new Date(),
            },
          })
        } else {
          await ctx.db.employeesAttendance.create({
            data: {
              employeeId: input.employeeId,
              date: new Date(input.date),
              status: input.status,
              checkInTime: input.checkInTime ? new Date(`${input.date}T${input.checkInTime}:00`) : null,
              checkOutTime: input.checkOutTime ? new Date(`${input.date}T${input.checkOutTime}:00`) : null,
              workingHours: input.workingHours,
              notes: input.notes,
              markedBy: ctx.session.user.id,
            },
          })
        }

        return { success: true }
      } catch (error) {
        console.error("Error marking employee attendance:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark employee attendance",
        })
      }
    }),

  markBulkStudentAttendance: publicProcedure
    .input(bulkStudentAttendanceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found",
          })
        }

        return await ctx.db.$transaction(async (tx) => {
          const results = []
          const date = new Date(input.date)

          const existingRecords = await tx.studentsAttendance.findMany({
            where: {
              studentId: { in: input.attendanceRecords.map(r => r.studentId) },
              classId: input.classId,
              sessionId: input.sessionId,
              date,
            },
            select: {
              id: true,
              studentId: true,
            },
          })

          const existingMap = new Map(existingRecords.map(r => [r.studentId, r.id]))

          for (const record of input.attendanceRecords) {
            const existingId = existingMap.get(record.studentId)

            if (existingId) {
              const updated = await tx.studentsAttendance.update({
                where: { id: existingId },
                data: {
                  status: record.status,
                  notes: record.notes,
                  temperature: record.temperature,
                  markedBy: ctx.session.user.id,
                  updatedAt: new Date(),
                },
              })
              results.push({ action: "updated", record: updated })
            } else {
              const created = await tx.studentsAttendance.create({
                data: {
                  studentId: record.studentId,
                  classId: input.classId,
                  sessionId: input.sessionId,
                  date,
                  status: record.status,
                  notes: record.notes,
                  temperature: record.temperature,
                  markedBy: ctx.session.user.id,
                },
              })
              results.push({ action: "created", record: created })
            }
          }

          return {
            success: true,
            processed: results.length,
            created: results.filter((r: { action: string }) => r.action === "created").length,
            updated: results.filter((r: { action: string }) => r.action === "updated").length,
          }
        })
      } catch (error) {
        console.error("Error marking bulk student attendance:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark bulk student attendance",
        })
      }
    }),

  markBulkEmployeeAttendance: publicProcedure
    .input(bulkEmployeeAttendanceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found",
          })
        }

        return await ctx.db.$transaction(async (tx) => {
          const results = []
          const date = new Date(input.date)

          const existingRecords = await tx.employeesAttendance.findMany({
            where: {
              employeeId: { in: input.attendanceRecords.map(r => r.employeeId) },
              date,
            },
            select: {
              id: true,
              employeeId: true,
            },
          })

          const existingMap = new Map(existingRecords.map(r => [r.employeeId, r.id]))

          for (const record of input.attendanceRecords) {
            const existingId = existingMap.get(record.employeeId)

            if (existingId) {
              const updated = await tx.employeesAttendance.update({
                where: { id: existingId },
                data: {
                  status: record.status,
                  checkInTime: record.checkInTime ? new Date(`${input.date}T${record.checkInTime}:00`) : null,
                  checkOutTime: record.checkOutTime ? new Date(`${input.date}T${record.checkOutTime}:00`) : null,
                  workingHours: record.workingHours,
                  notes: record.notes,
                  markedBy: ctx.session.user.id,
                  updatedAt: new Date(),
                },
              })
              results.push({ action: "updated", record: updated })
            } else {
              const created = await tx.employeesAttendance.create({
                data: {
                  employeeId: record.employeeId,
                  date,
                  status: record.status,
                  checkInTime: record.checkInTime ? new Date(`${input.date}T${record.checkInTime}:00`) : null,
                  checkOutTime: record.checkOutTime ? new Date(`${input.date}T${record.checkOutTime}:00`) : null,
                  workingHours: record.workingHours,
                  notes: record.notes,
                  markedBy: ctx.session.user.id,
                },
              })
              results.push({ action: "created", record: created })
            }
          }

          return {
            success: true,
            processed: results.length,
            created: results.filter((r: { action: string }) => r.action === "created").length,
            updated: results.filter((r: { action: string }) => r.action === "updated").length,
          }
        })
      } catch (error) {
        console.error("Error marking bulk employee attendance:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark bulk employee attendance",
        })
      }
    }),

  getClasses: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.classes.findMany({
        select: {
          classId: true,
          grade: true,
          section: true,
          category: true,
        },
        orderBy: [{ grade: "asc" }, { section: "asc" }],
      })
    } catch (error) {
      console.error("Error fetching classes:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve classes",
      })
    }
  }),

  getSessions: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.sessions.findMany({
        select: {
          sessionId: true,
          sessionName: true,
          sessionFrom: true,
          sessionTo: true,
          isActive: true,
        },
        orderBy: { sessionName: "desc" },
      })
    } catch (error) {
      console.error("Error fetching sessions:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve sessions",
      })
    }
  }),

  getAttendanceStats: publicProcedure
    .input(
      z.object({
        type: z.enum(["student", "employee"]),
        id: z.string().cuid().optional(),
        classId: z.string().cuid().optional(),
        sessionId: z.string().cuid().optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }).refine(data => dayjs(data.endDate).isAfter(dayjs(data.startDate)), {
        message: "endDate must be after startDate",
        path: ["endDate"],
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let attendance: any[] = []

        if (input.type === "student") {
          const whereClause: any = {
            date: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          }

          if (input.id) whereClause.studentId = input.id
          if (input.classId) whereClause.classId = input.classId
          if (input.sessionId) whereClause.sessionId = input.sessionId

          attendance = await ctx.db.studentsAttendance.findMany({
            where: whereClause,
            include: {
              students: {
                select: {
                  studentName: true,
                  registrationNumber: true,
                },
              },
            },
          })
        } else {
          const whereClause: any = {
            date: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          }

          if (input.id) whereClause.employeeId = input.id

          attendance = await ctx.db.employeesAttendance.findMany({
            where: whereClause,
            include: {
              employees: {
                select: {
                  employeeName: true,
                  registrationNumber: true,
                  designation: true,
                },
              },
            },
          })
        }

        const stats = {
          total: attendance.length,
          present: attendance.filter((a) => a.status === "PRESENT").length,
          absent: attendance.filter((a) => a.status === "ABSENT").length,
          late: attendance.filter((a) => a.status === "LATE").length,
          excused: attendance.filter((a) => a.status === "EXCUSED").length,
          halfDay: attendance.filter((a) => a.status === "HALF_DAY").length,
        }

        const totalDays = dayjs(input.endDate).diff(dayjs(input.startDate), "day") + 1
        const presentPercentage = stats.total > 0 ? (stats.present / totalDays) * 100 : 0
        const absentPercentage = stats.total > 0 ? (stats.absent / totalDays) * 100 : 0
        const latePercentage = stats.total > 0 ? (stats.late / totalDays) * 100 : 0

        const dailyStats = attendance.reduce(
          (acc, record: { date: Date, status: string }) => {
            const dateKey = dayjs(record.date).format("YYYY-MM-DD")
            if (!acc[dateKey]) {
              acc[dateKey] = { present: 0, absent: 0, late: 0, excused: 0, halfDay: 0, total: 0 }
            }
            acc[dateKey][record.status.toLowerCase()]++
            acc[dateKey].total++
            return acc
          },
          {} as Record<string, any>,
        )

        return {
          ...stats,
          presentPercentage,
          absentPercentage,
          latePercentage,
          dailyStats,
          period: {
            startDate: input.startDate,
            endDate: input.endDate,
            totalDays,
          },
        }
      } catch (error) {
        console.error("Error fetching attendance statistics:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve attendance statistics",
        })
      }
    }),

  generateAttendanceReport: publicProcedure
    .input(
      z.object({
        type: z.enum(["student", "employee"]),
        classId: z.string().cuid().optional(),
        sessionId: z.string().cuid().optional(),
        designation: z.enum(["ADMIN", "PRINCIPAL", "HEAD", "CLERK", "TEACHER", "WORKER"]).optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }).refine(data => dayjs(data.endDate).isAfter(dayjs(data.startDate)), {
        message: "endDate must be after startDate",
        path: ["endDate"],
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let reportData: any[] = []
        let headers: any[] = []

        if (input.type === "student") {
          const whereClause: any = {
            date: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          }

          if (input.classId) whereClause.classId = input.classId
          if (input.sessionId) whereClause.sessionId = input.sessionId

          const attendance = await ctx.db.studentsAttendance.findMany({
            where: whereClause,
            include: {
              students: {
                select: {
                  studentName: true,
                  registrationNumber: true,
                  admissionNumber: true,
                },
              },
              classes: {
                select: {
                  grade: true,
                  section: true,
                },
              },
            },
          })

          reportData = attendance.map((record) => ({
            studentName: record.students.studentName,
            registrationNumber: record.students.registrationNumber,
            admissionNumber: record.students.admissionNumber,
            class: `${record.classes.grade} - ${record.classes.section}`,
            date: dayjs(record.date).format("YYYY-MM-DD"),
            status: record.status,
            notes: record.notes || "",
            temperature: record.temperature?.toString() || "",
          }))

          headers = [
            { key: "studentName", label: "Student Name" },
            { key: "registrationNumber", label: "Registration #" },
            { key: "admissionNumber", label: "Admission #" },
            { key: "class", label: "Class" },
            { key: "date", label: "Date" },
            { key: "status", label: "Status" },
            { key: "temperature", label: "Temperature" },
            { key: "notes", label: "Notes" },
          ]
        } else {
          const whereClause: any = {
            date: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          }

          if (input.designation) {
            whereClause.employees = {
              designation: input.designation,
            }
          }

          const attendance = await ctx.db.employeesAttendance.findMany({
            where: whereClause,
            include: {
              employees: {
                select: {
                  employeeName: true,
                  registrationNumber: true,
                  designation: true,
                },
              },
            },
          })

          reportData = attendance.map((record) => ({
            employeeName: record.employees.employeeName,
            registrationNumber: record.employees.registrationNumber,
            designation: record.employees.designation,
            date: dayjs(record.date).format("YYYY-MM-DD"),
            status: record.status,
            checkInTime: record.checkInTime ? dayjs(record.checkInTime).format("HH:mm") : "",
            checkOutTime: record.checkOutTime ? dayjs(record.checkOutTime).format("HH:mm") : "",
            workingHours: record.workingHours?.toString() || "0",
            notes: record.notes || "",
          }))

          headers = [
            { key: "employeeName", label: "Employee Name" },
            { key: "registrationNumber", label: "Registration #" },
            { key: "designation", label: "Designation" },
            { key: "date", label: "Date" },
            { key: "status", label: "Status" },
            { key: "checkInTime", label: "Check In" },
            { key: "checkOutTime", label: "Check Out" },
            { key: "workingHours", label: "Hours" },
            { key: "notes", label: "Notes" },
          ]
        }

        const pdfBuffer = await generatePdf(
          reportData,
          headers,
          `${input.type === "student" ? "Student" : "Employee"} Attendance Report (${input.startDate} to ${input.endDate})`,
        )

        return {
          pdf: Buffer.from(pdfBuffer).toString("base64"),
          filename: `${input.type}-attendance-report-${input.startDate}-to-${input.endDate}.pdf`,
        }
      } catch (error) {
        console.error("Error generating attendance report:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate attendance report",
        })
      }
    }),
})