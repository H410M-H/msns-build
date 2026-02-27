import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { Prisma } from "@prisma/client";

export const subjectDiaryRouter = createTRPCRouter({
  createDiary: protectedProcedure
    .input(
      z.object({
        classSubjectId: z.string(),
        teacherId: z.string(),
        date: z.date(),
        content: z.string(),
        attachments: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.subjectDiary.create({
          data: {
            classSubjectId: input.classSubjectId,
            teacherId: input.teacherId,
            date: input.date,
            content: input.content,
            attachments: input.attachments ?? [],
          },
        });
      } catch (error) {
        console.error("Error creating subject diary:", error);
        throw new Error("Failed to create subject diary");
      }
    }),

  updateDiary: protectedProcedure
    .input(
      z.object({
        subjectDiaryId: z.string(),
        content: z.string(),
        attachments: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.subjectDiary.update({
          where: { subjectDiaryId: input.subjectDiaryId },
          data: {
            content: input.content,
            attachments: input.attachments,
          },
        });
      } catch (error) {
        console.error("Error updating subject diary:", error);
        throw new Error("Failed to update subject diary");
      }
    }),

  deleteDiary: protectedProcedure
    .input(z.object({ subjectDiaryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.subjectDiary.delete({
          where: { subjectDiaryId: input.subjectDiaryId },
        });
        return { success: true };
      } catch (error) {
        console.error("Error deleting subject diary:", error);
        throw new Error("Failed to delete subject diary");
      }
    }),

  getTeacherDiaries: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        date: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = input.date ? new Date(input.date) : undefined;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      const endDate = input.date ? new Date(input.date) : undefined;
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const whereClause: Prisma.SubjectDiaryWhereInput = {
        teacherId: input.teacherId,
        ...(input.date && startDate && endDate
          ? {
              date: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {}),
      };

      return await ctx.db.subjectDiary.findMany({
        where: whereClause,
        include: {
          ClassSubject: {
            include: {
              Subject: { select: { subjectName: true } },
              Grades: { select: { grade: true, section: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      });
    }),

  getClassDiaries: protectedProcedure
    .input(
      z.object({
        classId: z.string(),
        sessionId: z.string(),
        date: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = input.date ? new Date(input.date) : undefined;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      const endDate = input.date ? new Date(input.date) : undefined;
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const whereClause: Prisma.SubjectDiaryWhereInput = {
        ClassSubject: {
          classId: input.classId,
          sessionId: input.sessionId,
        },
        ...(input.date && startDate && endDate
          ? {
              date: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {}),
      };

      return await ctx.db.subjectDiary.findMany({
        where: whereClause,
        include: {
          Teacher: { select: { employeeName: true } },
          ClassSubject: {
            include: {
              Subject: { select: { subjectName: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      });
    }),
});
