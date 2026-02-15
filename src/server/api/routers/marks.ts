import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const uploadMarksSchema = z.object({
  examId: z.string().cuid(),
  classSubjectId: z.string().cuid(),
  marks: z.array(
    z.object({
      studentId: z.string().cuid(),
      obtainedMarks: z.number().min(0),
    })
  ),
});

const updateMarksSchema = z.object({
  marksId: z.string().cuid(),
  obtainedMarks: z.number().min(0),
});

export const marksRouter = createTRPCRouter({
  uploadMarks: publicProcedure
    .input(uploadMarksSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify teacher is assigned to this class subject
        const classSubject = await ctx.db.classSubject.findUnique({
          where: { csId: input.classSubjectId },
          include: {
            Employees: { select: { employeeId: true } },
            Subject: { select: { subjectId: true } },
          },
        });

        if (!classSubject) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class subject not found",
          });
        }

        // Get exam details
        const exam = await ctx.db.exam.findUnique({
          where: { examId: input.examId },
        });

        if (!exam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exam not found",
          });
        }

        const uploadedBy = ctx.session?.user?.id;
        if (!uploadedBy) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        // Batch create marks
        const marksData = input.marks.map((mark) => ({
          examId: input.examId,
          studentId: mark.studentId,
          subjectId: classSubject.Subject.subjectId,
          classSubjectId: input.classSubjectId,
          obtainedMarks: mark.obtainedMarks,
          totalMarks: exam.totalMarks,
          uploadedBy,
        }));

        const createdMarks = await ctx.db.marks.createMany({
          data: marksData,
          skipDuplicates: true,
        });

        return {
          success: true,
          message: `${createdMarks.count} marks uploaded successfully`,
          count: createdMarks.count,
        };
      } catch (error) {
        console.error("Error uploading marks:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload marks",
        });
      }
    }),

  updateMarks: publicProcedure
    .input(updateMarksSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const marks = await ctx.db.marks.findUnique({
          where: { marksId: input.marksId },
        });

        if (!marks) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Marks record not found",
          });
        }

        const updated = await ctx.db.marks.update({
          where: { marksId: input.marksId },
          data: { obtainedMarks: input.obtainedMarks },
        });

        return {
          success: true,
          message: "Marks updated successfully",
          data: updated,
        };
      } catch (error) {
        console.error("Error updating marks:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update marks",
        });
      }
    }),

  getMarksForExam: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        classSubjectId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.MarksWhereInput = {
          examId: input.examId,
          ...(input.classSubjectId && { classSubjectId: input.classSubjectId }),
        };

        const marks = await ctx.db.marks.findMany({
          where,
          include: {
            Students: { select: { studentName: true, admissionNumber: true } },
            Subject: { select: { subjectName: true } },
            Employees: { select: { employeeName: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        return marks;
      } catch (error) {
        console.error("Error fetching marks:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch marks",
        });
      }
    }),

  getStudentMarksForExam: publicProcedure
    .input(
      z.object({
        studentId: z.string().cuid(),
        examId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const marks = await ctx.db.marks.findMany({
          where: {
            studentId: input.studentId,
            examId: input.examId,
          },
          include: {
            Subject: { select: { subjectId: true, subjectName: true } },
            Exam: { select: { passingMarks: true } },
          },
        });

        return marks;
      } catch (error) {
        console.error("Error fetching student marks:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch student marks",
        });
      }
    }),

  checkMarksCoverage: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        classId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const exam = await ctx.db.exam.findUnique({
          where: { examId: input.examId },
          include: {
            Marks: {
              select: {
                studentId: true,
                subjectId: true,
              },
              distinct: ["studentId"],
            },
          },
        });

        if (!exam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exam not found",
          });
        }

        // Get all class subjects for the exam's class
        const classSubjects = await ctx.db.classSubject.findMany({
          where: { classId: input.classId },
          select: { subjectId: true },
        });

        // Get all students in the class
        const students = await ctx.db.studentClass.findMany({
          where: { classId: input.classId },
          select: { studentId: true },
        });

        const requiredCombinations = classSubjects.length * students.length;
        const uploadedCombinations = exam.Marks.length;
        const percentage = Math.round(
          (uploadedCombinations / requiredCombinations) * 100
        );

        return {
          required: requiredCombinations,
          uploaded: uploadedCombinations,
          percentage,
          isComplete: percentage === 100,
        };
      } catch (error) {
        console.error("Error checking marks coverage:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check marks coverage",
        });
      }
    }),
});
