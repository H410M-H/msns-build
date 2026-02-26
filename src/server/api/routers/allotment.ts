import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { StudentClass, Grades, Sessions, Students } from "@prisma/client";

// Define a relation type based on your Prisma schema. Adjust field names as needed.
type StudentClassWithRelations = StudentClass & {
  Grades: Grades;
  Sessions: Sessions;
  Students: Students;
};

export const AllotmentRouter = createTRPCRouter({
  addToClass: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        studentId: z.string().cuid(),
        sessionId: z.string().cuid(),
      }),
    )
    .mutation<StudentClassWithRelations>(async ({ ctx, input }) => {
      try {
        return await ctx.db.$transaction(async (tx) => {
          // Check existing assignment
          const existingAssignment = await tx.studentClass.findFirst({
            where: {
              studentId: input.studentId,
              sessionId: input.sessionId,
            },
          });

          if (existingAssignment) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Student already assigned to a class in this session",
            });
          }

          // Update student assignment status
          await tx.students.update({
            where: { studentId: input.studentId },
            data: { isAssign: true },
          });

          // Create new student-class association
          const newAssignment = await tx.studentClass.create({
            data: {
              classId: input.classId,
              studentId: input.studentId,
              sessionId: input.sessionId,
            },
            include: {
              Grades: true,
              Students: true, // Use the correct relation name
              Sessions: true,
            },
          });

          return newAssignment;
        });
      } catch (error) {
        console.error("Error adding to class:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add student to class",
        });
      }
    }),

  getStudentsInClass: publicProcedure
    .input(z.object({ classId: z.string().cuid() }))
    .query<StudentClassWithRelations[]>(async ({ ctx, input }) => {
      try {
        return await ctx.db.studentClass.findMany({
          where: { classId: input.classId },
          include: {
            Grades: true,
            Students: true, // Corrected relation name
            Sessions: true,
          },
          // Ensure a comma follows the include block
          orderBy: { Students: { studentName: "asc" } },
        });
      } catch (error) {
        console.error("Error fetching students in class:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve class students",
        });
      }
    }),

  getStudentsByClassAndSession: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid().optional(), // Made optional to handle undefined/null from client
        sessionId: z.string().cuid().optional(), // Made optional to handle undefined/null from client
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      }),
    )
    .query<{
      [x: string]: unknown;
      data: StudentClassWithRelations[];
      meta: PaginationMeta;
    }>(async ({ ctx, input }) => {
      try {
        // Explicitly check if classId and sessionId are provided, as they are required for the query
        if (!input.classId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "classId is required to fetch students by class and session.",
          });
        }
        if (!input.sessionId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "sessionId is required to fetch students by class and session.",
          });
        }

        const [data, total] = await Promise.all([
          ctx.db.studentClass.findMany({
            where: {
              classId: input.classId,
              sessionId: input.sessionId,
            },
            include: {
              Grades: true,
              Students: true, // Corrected relation name
              Sessions: true,
            },
            orderBy: { Students: { studentName: "asc" } },
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
          }),
          ctx.db.studentClass.count({
            where: {
              classId: input.classId,
              sessionId: input.sessionId,
            },
          }),
        ]);

        return {
          data,
          meta: {
            total,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil(total / input.pageSize),
          },
        };
      } catch (error) {
        console.error("Error fetching students:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve students",
        });
      }
    }),

  deleteStudentsFromClass: publicProcedure
    .input(
      z.object({
        studentIds: z.array(z.string().cuid()),
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
      }),
    )
    .mutation<{ success: boolean; message: string }>(async ({ ctx, input }) => {
      try {
        return await ctx.db.$transaction(async (tx) => {
          // Find student-class associations
          const studentClasses = await tx.studentClass.findMany({
            where: {
              studentId: { in: input.studentIds },
              classId: input.classId,
              sessionId: input.sessionId,
            },
            select: { scId: true, studentId: true },
          });

          if (studentClasses.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "No matching student-class associations found",
            });
          }

          const studentClassIds = studentClasses.map((sc) => sc.scId);
          const uniqueStudentIds = [
            ...new Set(studentClasses.map((sc) => sc.studentId)),
          ];

          // Delete dependent fee records
          await tx.feeStudentClass.deleteMany({
            where: { studentClassId: { in: studentClassIds } },
          });

          // Delete student-class associations
          await tx.studentClass.deleteMany({
            where: { scId: { in: studentClassIds } },
          });

          // Update student assignment status if no other classes
          await tx.students.updateMany({
            where: {
              studentId: { in: uniqueStudentIds },
              NOT: { StudentClass: { some: {} } },
            },
            data: { isAssign: false },
          });

          return {
            success: true,
            message: `Removed ${studentClasses.length} student(s) from class`,
          };
        });
      } catch (error) {
        console.error("Error removing students:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove students from class",
        });
      }
    }),
});

// Type definitions
type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
