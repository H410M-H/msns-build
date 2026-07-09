import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ClassCategory, type Grades } from "@prisma/client";
import { generatePdf } from "~/lib/pdf-reports";
import dayjs from "dayjs";

export type ClassProps = Grades & {
  studentCount?: number;
  subjectsCount?: number;
};

type ClassReportData = {
  classId: string;
  grade: string;
  section: string;
  category: ClassCategory;
  fee: number;
  studentCount: number;
  subjectCount: number;
};

const classSchema = z.object({
  grade: z.string().min(1, "Grade is required"),
  section: z.string().default("ROSE"),
  category: z.nativeEnum(ClassCategory),
  fee: z.number().min(0, "Fee cannot be negative"),
});

export const ClassRouter = createTRPCRouter({
  getClassesWithStudentCount: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const classes = await ctx.db.grades.findMany({
          orderBy: { category: "asc" },
          select: {
            classId: true,
            grade: true,
            section: true,
            category: true,
            fee: true,
          },
        });

        // Get student counts for each class in the session
        const counts = await ctx.db.studentClass.groupBy({
          by: ["classId"],
          where: { sessionId: input.sessionId },
          _count: { studentId: true },
        });

        const countMap = new Map(counts.map((c) => [c.classId, c._count.studentId]));

        // Get today's attendance summary for each class
        const todayStr = dayjs().format("YYYY-MM-DD");
        const attendance = await ctx.db.studentAttendance.findMany({
          where: {
            sessionId: input.sessionId,
            date: todayStr,
          },
          select: {
            classId: true,
            status: true,
          },
        });

        const attendanceSummary = new Map<string, { present: number; absent: number; leave: number }>();
        attendance.forEach((a) => {
          const stats = attendanceSummary.get(a.classId) ?? { present: 0, absent: 0, leave: 0 };
          if (a.status === "P") stats.present++;
          else if (a.status === "A") stats.absent++;
          else if (a.status === "L") stats.leave++;
          attendanceSummary.set(a.classId, stats);
        });

        return classes.map((c) => {
          const stats = attendanceSummary.get(c.classId) ?? { present: 0, absent: 0, leave: 0 };
          return {
            ...c,
            studentCount: countMap.get(c.classId) ?? 0,
            presentCount: stats.present,
            absentCount: stats.absent,
            leaveCount: stats.leave,
          };
        });
      } catch (error) {
        console.error("Error in getClassesWithStudentCount:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve classes stats",
        });
      }
    }),

  getClasses: protectedProcedure.query<ClassProps[]>(async ({ ctx }) => {
    try {
      return await ctx.db.grades.findMany({
        orderBy: { category: "asc" },
        select: {
          classId: true,
          grade: true,
          section: true,
          category: true,
          fee: true,
        },
      });
    } catch (error) {
      console.error("Error in getClasses:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve classes",
      });
    }
  }),

  getClassById: protectedProcedure
    .input(z.object({ classId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const cls = await ctx.db.grades.findUnique({
          where: { classId: input.classId },
          select: {
            classId: true,
            grade: true,
            section: true,
            category: true,
            fee: true,
          },
        });
        if (!cls) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class not found",
          });
        }
        return cls;
      } catch (error) {
        console.error("Error in getClassById:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve class details",
        });
      }
    }),

  getGroupedClasses: protectedProcedure.query<Record<ClassCategory, ClassProps[]>>(
    async ({ ctx }) => {
      try {
        const classes = await ctx.db.grades.findMany({
          orderBy: { grade: "asc" },
          select: {
            classId: true,
            grade: true,
            section: true,
            category: true,
            fee: true,
          },
        });

        return classes.reduce(
          (acc, classData) => {
            const category = classData.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(classData);
            return acc;
          },
          {} as Record<ClassCategory, ClassProps[]>,
        );
      } catch (error) {
        console.error("Error in getGroupedClasses:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve grouped classes",
        });
      }
    },
  ),

  createClass: protectedProcedure
    .input(classSchema)
    .mutation<ClassProps>(async ({ ctx, input }) => {
      try {
        const newClass = await ctx.db.grades.create({
          data: input,
          select: {
            classId: true,
            grade: true,
            section: true,
            category: true,
            fee: true,
          },
        });
        return newClass;
      } catch (error) {
        console.error("Error in createClass:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create class",
        });
      }
    }),

  deleteClassesByIds: protectedProcedure
    .input(z.object({ classIds: z.array(z.string().cuid()) }))
    .mutation<{ count: number }>(async ({ ctx, input }) => {
      try {
        const classes = await ctx.db.grades.findMany({
          where: { classId: { in: input.classIds } },
        });

        let deletedCount = 0;

        await ctx.db.$transaction(async (tx) => {
          for (const classId of input.classIds) {
            // Delete related Timetable entries
            await tx.timetable.deleteMany({ where: { classId } });
            
            // Delete related ClassSubjects (Marks and ExamResults will fail if not deleted first)
            const classSubjects = await tx.classSubject.findMany({ where: { classId } });
            const csIds = classSubjects.map(cs => cs.csId);
            if (csIds.length > 0) {
              await tx.marks.deleteMany({ where: { classSubjectId: { in: csIds } } });
              await tx.subjectDiary.deleteMany({ where: { classSubjectId: { in: csIds } } });
              await tx.classSubject.deleteMany({ where: { classId } });
            }

            // Delete StudentClass relations
            await tx.studentClass.deleteMany({ where: { classId } });

            // Delete ReportCard
            const reportCards = await tx.reportCard.findMany({ where: { classId } });
            const rcIds = reportCards.map(rc => rc.reportCardId);
            if (rcIds.length > 0) {
              await tx.reportCardDetail.deleteMany({ where: { reportCardId: { in: rcIds } } });
              await tx.reportCard.deleteMany({ where: { classId } });
            }

            // Delete PromotionHistory (as from or to)
            await tx.promotionHistory.deleteMany({
              where: { OR: [{ fromClassId: classId }, { toClassId: classId }] }
            });
            
            // Delete BulkPromotionBatch (as from or to)
            const bulkBatches = await tx.bulkPromotionBatch.findMany({
              where: { OR: [{ fromClassId: classId }, { toClassId: classId }] }
            });
            const batchIds = bulkBatches.map(b => b.batchId);
            if (batchIds.length > 0) {
              await tx.bulkPromotionBatchItem.deleteMany({ where: { batchId: { in: batchIds } } });
              await tx.bulkPromotionBatch.deleteMany({ where: { batchId: { in: batchIds } } });
            }
          }

          const result = await tx.grades.deleteMany({
            where: { classId: { in: input.classIds } },
          });
          deletedCount = result.count;

          for (const cls of classes) {
            await tx.broadcast.create({
              data: {
                router: "class.deleteClassesByIds",
                action: "DELETE",
                message: `Deleted class: ${cls.grade} ${cls.section}`,
              },
            });
          }
        });

        return { count: deletedCount };
      } catch (error) {
        console.error("Error in deleteClassesByIds:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete classes",
        });
      }
    }),

  generateClassReport: protectedProcedure.query<{ pdf: string; filename: string }>(
    async ({ ctx }) => {
      try {
        const classesWithStats = await ctx.db.grades.findMany({
          select: {
            classId: true,
            grade: true,
            section: true,
            category: true,
            fee: true,
            _count: {
              select: {
                StudentClass: true,
                ClassSubject: true,
              },
            },
          },
        });

        const reportData: ClassReportData[] = classesWithStats.map((cls) => ({
          classId: cls.classId,
          grade: cls.grade,
          section: cls.section,
          category: cls.category,
          fee: cls.fee,
          studentCount: cls._count.StudentClass,
          subjectCount: cls._count.ClassSubject,
        }));

        const headers = [
          { key: "classId", label: "Class ID" },
          { key: "grade", label: "Grade" },
          { key: "section", label: "Section" },
          { key: "category", label: "Category" },
          { key: "fee", label: "Fee" },
          { key: "studentCount", label: "Students" },
          { key: "subjectCount", label: "Subjects" },
        ];

        const pdfBuffer = await generatePdf(
          reportData,
          headers,
          "Class Structure Report",
        );

        return {
          pdf: Buffer.from(pdfBuffer).toString("base64"),
          filename: `class-report-${Date.now()}.pdf`,
        };
      } catch (error) {
        console.error("Error generating class report:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate class report",
        });
      }
    },
  ),

  // ================= ClassSubject Operations =================
  getAssignedSubjects: protectedProcedure
    .input(z.object({ classId: z.string(), sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.classSubject.findMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
          },
          include: {
            Subject: true,
            Employees: {
              select: {
                employeeId: true,
                employeeName: true,
                designation: true,
              }
            }
          },
          orderBy: {
            Subject: { subjectName: "asc" }
          }
        });
      } catch (error) {
        console.error("Error fetching class subjects:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load assigned subjects",
        });
      }
    }),

  assignSubject: protectedProcedure
    .input(z.object({
      classId: z.string(),
      sessionId: z.string(),
      subjectId: z.string(),
      employeeId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = await ctx.db.classSubject.findFirst({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
            subjectId: input.subjectId,
          }
        });

        if (existing) {
          // If already assigned to another teacher, update it, or throw error depending on rules. Let's update.
          return await ctx.db.classSubject.update({
            where: { csId: existing.csId },
            data: { employeeId: input.employeeId }
          });
        }

        return await ctx.db.classSubject.create({
          data: {
            classId: input.classId,
            sessionId: input.sessionId,
            subjectId: input.subjectId,
            employeeId: input.employeeId,
          }
        });
      } catch (error) {
        console.error("Error assigning subject:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign subject",
        });
      }
    }),

  removeAssignedSubject: protectedProcedure
    .input(z.object({ csId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = await ctx.db.classSubject.findUnique({
          where: { csId: input.csId },
          include: { Subject: true, Grades: true },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assigned subject not found",
          });
        }

        await ctx.db.$transaction(async (tx) => {
          // 1. Delete associated Marks
          await tx.marks.deleteMany({
            where: { classSubjectId: input.csId },
          });

          // 2. Delete SubjectDiaries
          await tx.subjectDiary.deleteMany({
            where: { classSubjectId: input.csId },
          });

          // 4. Delete Timetables
          await tx.timetable.deleteMany({
            where: {
              classId: existing.classId,
              subjectId: existing.subjectId,
              sessionId: existing.sessionId,
            },
          });

          // 5. Delete the ClassSubject assignment
          await tx.classSubject.delete({
            where: { csId: input.csId },
          });

          // 6. Log the action in Broadcast
          await tx.broadcast.create({
            data: {
              router: "class.removeAssignedSubject",
              action: "DELETE",
              message: `Unassigned subject ${existing.Subject.subjectName} from class ${existing.Grades.grade} ${existing.Grades.section}`,
            },
          });
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error removing assigned subject:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove subject assignment",
        });
      }
    }),
});
