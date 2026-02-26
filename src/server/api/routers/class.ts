import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ClassCategory, type Grades } from "@prisma/client";
import { generatePdf } from "~/lib/pdf-reports";

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
  getClasses: publicProcedure.query<ClassProps[]>(async ({ ctx }) => {
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

  getClassById: publicProcedure
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

  getGroupedClasses: publicProcedure.query<Record<ClassCategory, ClassProps[]>>(
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

  createClass: publicProcedure
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

  deleteClassesByIds: publicProcedure
    .input(z.object({ classIds: z.array(z.string().cuid()) }))
    .mutation<{ count: number }>(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.grades.deleteMany({
          where: { classId: { in: input.classIds } },
        });
        return { count: result.count };
      } catch (error) {
        console.error("Error in deleteClassesByIds:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete classes",
        });
      }
    }),

  generateClassReport: publicProcedure.query<{ pdf: string; filename: string }>(
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
});
