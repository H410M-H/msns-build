import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";

// Enhanced schemas with refined validation

const createSubjectSchema = z.object({
  subjectName: z.string()
    .min(2, "Subject name must be at least 2 characters")
    .max(50, "Subject name cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9 ]+$/, "Subject name contains invalid characters"),
  book: z.string().max(100, "Book name cannot exceed 100 characters").optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
});

const classAssignmentSchema = z.object({
  classId: z.string().cuid("Invalid class ID format"),
  subjectId: z.string().cuid("Invalid subject ID format"),
  employeeId: z.string().cuid("Invalid teacher ID format"),
  sessionId: z.string().cuid("Invalid session ID format"),
  schedule: z.object({
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }).optional(),
});

export const SubjectRouter = createTRPCRouter({
  getAllSubjects: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.subject.findMany({
        orderBy: { subjectName: 'asc' },
        select: {
          subjectId: true,
          subjectName: true,
          book: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch subjects. Please try again later.",
      });
    }
  }),

  assignSubjectToClass: publicProcedure
    .input(classAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify existence of related entities
        const [classExists, subjectExists, teacherExists, sessionExists] = await Promise.all([
          ctx.db.grades.findUnique({ where: { classId: input.classId } }),
          ctx.db.subject.findUnique({ where: { subjectId: input.subjectId } }),
          ctx.db.employees.findUnique({ where: { employeeId: input.employeeId } }),
          ctx.db.sessions.findUnique({ where: { sessionId: input.sessionId } }),
        ]);

        if (!classExists || !subjectExists || !teacherExists || !sessionExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or more related entities not found",
          });
        }

        return await ctx.db.classSubject.create({
          data: {
            classId: input.classId,
            subjectId: input.subjectId,
            employeeId: input.employeeId,
            sessionId: input.sessionId,
          },
          include: {
            Subject: true,
            Employees: true,
          }
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Assignment error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subject assignment",
        });
      }
    }),

  // In subject.ts, update the getSubjectsByClass procedure
getSubjectsByClass: publicProcedure
.input(z.object({ 
  classId: z.string().cuid().optional(), // Made optional to handle undefined/null from client
  sessionId: z.string().cuid().optional() // Made optional to handle undefined/null from client
}))
.query(async ({ ctx, input }) => {
  try {
    // Explicitly check if classId and sessionId are provided, as they are required for the query
    if (!input.classId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "classId is required to fetch subjects by class.",
      });
    }
    if (!input.sessionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "sessionId is required to fetch subjects by class.",
      });
    }

    const classSubjects = await ctx.db.classSubject.findMany({
      where: { 
        classId: input.classId,
        sessionId: input.sessionId,
      },
      include: {
        Subject: {
          select: {
            subjectId: true,
            subjectName: true,
            description: true,
          }
        },
        Employees: {
          select: {
            employeeId: true,
            employeeName: true,
            designation: true,
          }
        },
        Grades: {
          select: {
            classId: true,
            grade: true,
            section: true,
          }
        },
        Sessions: {
          select: {
            sessionId: true,
            sessionName: true,
          }
        },
      },
      orderBy: {
        Subject: {
          subjectName: 'asc',
        }
      }
    });

    return classSubjects; // Return empty array if no results
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    console.error("Fetch error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to retrieve class subjects",
    });
  }
}),

  createSubject: publicProcedure
    .input(createSubjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const normalizedSubjectName = input.subjectName.trim().toLowerCase();
        const existingSubject = await ctx.db.subject.findFirst({
          where: {
            subjectName: {
              equals: normalizedSubjectName,
              mode: 'insensitive',
            }
          },
        });

        if (existingSubject) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Subject with this name already exists",
          });
        }

        const newSubject = await ctx.db.subject.create({
          data: {
            subjectName: input.subjectName.trim(),
            book: input.book?.trim(),
            description: input.description?.trim(),
          },
        });

        return {
          ...newSubject,
          success: true,
          message: "Subject created successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subject",
        });
      }
    }),

  listSubjects: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.SubjectWhereInput = {};
        if (input.search) {
          where.OR = [
            { subjectName: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } },
            { book: { contains: input.search, mode: 'insensitive' } },
          ];
        }

        const [subjects, total] = await Promise.all([
          ctx.db.subject.findMany({
            where,
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
            orderBy: { subjectName: 'asc' },
          }),
          ctx.db.subject.count({ where }),
        ]);

        return {
          data: subjects,
          total,
          totalPages: Math.ceil(total / input.pageSize),
          currentPage: input.page,
        };
      } catch (error) {
        console.error("List error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve subjects list",
        });
      }
    }),

  updateClassAssignment: publicProcedure
    .input(classAssignmentSchema.extend({
      csId: z.string().cuid("Invalid assignment ID"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedAssignment = await ctx.db.classSubject.update({
          where: { csId: input.csId },
          data: {
            employeeId: input.employeeId,
          },
          include: {
            Subject: true,
            Employees: true,
          }
        });

        if (!updatedAssignment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class assignment not found",
          });
        }

        return updatedAssignment;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Update error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update class assignment",
        });
      }
    }),

    removeSubjectFromClass: publicProcedure
    .input(z.object({ 
      csId: z.string().cuid("Invalid assignment ID"),
      sessionId: z.string().cuid("Invalid session ID"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First verify existence
        const assignment = await ctx.db.classSubject.findUnique({
          where: { 
            csId: input.csId,
            sessionId: input.sessionId,
          },
        });
  
        if (!assignment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class assignment not found",
          });
        }
  
        // Then delete using the correct unique identifier
        await ctx.db.classSubject.delete({
          where: { 
            csId: input.csId 
          },
        });
  
        return { 
          success: true, 
          message: "Subject successfully removed from class" 
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Deletion error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove subject from class",
        });
      }
    }),
});
