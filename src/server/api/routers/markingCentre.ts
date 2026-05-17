/**
 * Enhanced Marks Router — v2.0 Examination Marking Centre
 * Implements FR-EXM-26 through FR-EXM-37 (Teacher & Clerk unified grid)
 * Extends existing marks.ts capabilities
 */
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

const markingGridCellSchema = z.object({
  studentId: z.string().cuid(),
  subjectId: z.string().cuid(),
  classSubjectId: z.string().cuid(),
  obtainedMarks: z.number().min(0),
});

export const markingCentreRouter = createTRPCRouter({
  // FR-EXM-27: Get the full marking grid for an exam (students × subjects)
  getMarkingGrid: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
        subjectFilter: z.string().cuid().optional(), // FR-EXM-32 subject filter
        statusFilter: z
          .enum(["Pending", "Partial", "Complete"])
          .optional(), // FR-EXM-32 status filter
        studentSearch: z.string().optional(), // FR-EXM-32 student search
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get exam details
      const exam = await ctx.db.exam.findUnique({
        where: { examId: input.examId },
        include: {
          ExamDatesheet: {
            include: {
              Subject: { select: { subjectId: true, subjectName: true } },
            },
          },
        },
      });
      if (!exam) throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });

      // Get all class subjects for this class/session
      const classSubjects = await ctx.db.classSubject.findMany({
        where: {
          classId: input.classId,
          sessionId: input.sessionId,
          ...(input.subjectFilter && { subjectId: input.subjectFilter }),
        },
        include: {
          Subject: { select: { subjectId: true, subjectName: true } },
          Employees: { select: { employeeName: true } },
        },
        orderBy: { Subject: { subjectName: "asc" } },
      });

      // Get all enrolled students (optionally filtered by name)
      const students = await ctx.db.studentClass.findMany({
        where: {
          classId: input.classId,
          sessionId: input.sessionId,
          ...(input.studentSearch && {
            Students: {
              studentName: { contains: input.studentSearch, mode: "insensitive" },
            },
          }),
        },
        include: {
          Students: {
            select: {
              studentId: true,
              studentName: true,
              admissionNumber: true,
              registrationNumber: true,
            },
          },
        },
        orderBy: { Students: { studentName: "asc" } },
      });

      // Get all existing marks for this exam
      const existingMarks = await ctx.db.marks.findMany({
        where: { examId: input.examId },
        select: {
          marksId: true,
          studentId: true,
          subjectId: true,
          obtainedMarks: true,
          totalMarks: true,
          uploadedBy: true,
          updatedAt: true,
          Employees: { select: { employeeName: true } },
        },
      });

      // Build grid: rows = students, columns = subjects
      const marksMap = new Map(
        existingMarks.map((m) => [`${m.studentId}:${m.subjectId}`, m]),
      );

      const gridRows = students.map((sc) => {
        const student = sc.Students;
        const cells = classSubjects.map((cs) => {
          const key = `${student.studentId}:${cs.Subject.subjectId}`;
          const existing = marksMap.get(key);
          return {
            subjectId: cs.Subject.subjectId,
            subjectName: cs.Subject.subjectName,
            classSubjectId: cs.csId,
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
            marksId: existing?.marksId ?? null,
            obtainedMarks: existing?.obtainedMarks ?? null,
            lastModifiedBy: existing?.Employees?.employeeName ?? null,
            lastModifiedAt: existing?.updatedAt ?? null,
          };
        });

        const markedCount = cells.filter((c) => c.obtainedMarks !== null).length;
        const totalSubjects = cells.length;
        const completionStatus: "Pending" | "Partial" | "Complete" =
          markedCount === 0
            ? "Pending"
            : markedCount === totalSubjects
              ? "Complete"
              : "Partial";

        return {
          studentId: student.studentId,
          studentName: student.studentName,
          admissionNumber: student.admissionNumber,
          registrationNumber: student.registrationNumber,
          cells,
          markedCount,
          totalSubjects,
          completionStatus,
        };
      });

      // Apply FR-EXM-32 status filter
      const filteredRows =
        input.statusFilter
          ? gridRows.filter((r) => r.completionStatus === input.statusFilter)
          : gridRows;

      // Column-level completion (per subject)
      const columnStats = classSubjects.map((cs) => {
        const markedStudents = existingMarks.filter(
          (m) => m.subjectId === cs.Subject.subjectId,
        ).length;
        return {
          subjectId: cs.Subject.subjectId,
          subjectName: cs.Subject.subjectName,
          classSubjectId: cs.csId,
          teacherName: cs.Employees.employeeName,
          markedStudents,
          totalStudents: students.length,
          percentComplete:
            students.length > 0
              ? Math.round((markedStudents / students.length) * 100)
              : 0,
        };
      });

      return {
        exam: {
          examId: exam.examId,
          examTypeEnum: exam.examTypeEnum,
          status: exam.status,
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
        },
        rows: filteredRows,
        columnStats,
        totalStudents: students.length,
        totalSubjects: classSubjects.length,
      };
    }),

  // FR-EXM-30: Save a single row (all marks for one student)
  saveStudentRow: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        studentId: z.string().cuid(),
        marks: z.array(markingGridCellSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

      // Resolve to employeeId for the Marks relation
      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: userId },
        select: { employeeId: true },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const exam = await ctx.db.exam.findUnique({ where: { examId: input.examId } });
      if (!exam) throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });

      // FR-EXM-31: Validate marks don't exceed total
      for (const cell of input.marks) {
        if (cell.obtainedMarks > exam.totalMarks) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Marks for subject ${cell.subjectId} exceed maximum (${exam.totalMarks})`,
          });
        }
      }

      const results = await ctx.db.$transaction(
        input.marks.map((cell) =>
          ctx.db.marks.upsert({
            where: {
              examId_studentId_subjectId: {
                examId: input.examId,
                studentId: cell.studentId,
                subjectId: cell.subjectId,
              },
            },
            update: {
              obtainedMarks: cell.obtainedMarks,
              uploadedBy: employeeRecord.employeeId,
            },
            create: {
              examId: input.examId,
              studentId: cell.studentId,
              subjectId: cell.subjectId,
              classSubjectId: cell.classSubjectId,
              obtainedMarks: cell.obtainedMarks,
              totalMarks: exam.totalMarks,
              uploadedBy: employeeRecord.employeeId,
            },
          }),
        ),
      );

      return { success: true, count: results.length };
    }),

  // FR-EXM-30: Save all (bulk grid save)
  saveAll: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        cells: z.array(markingGridCellSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

      const employeeRecord = await ctx.db.employees.findFirst({
        where: { admissionNumber: userId },
        select: { employeeId: true },
      });
      if (!employeeRecord) throw new TRPCError({ code: "UNAUTHORIZED", message: "Employee not found" });

      const exam = await ctx.db.exam.findUnique({ where: { examId: input.examId } });
      if (!exam) throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });

      // FR-EXM-31: Validate all cells
      const invalid = input.cells.filter((c) => c.obtainedMarks > exam.totalMarks);
      if (invalid.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${invalid.length} cells have marks exceeding the maximum of ${exam.totalMarks}`,
        });
      }

      const results = await ctx.db.$transaction(
        input.cells.map((cell) =>
          ctx.db.marks.upsert({
            where: {
              examId_studentId_subjectId: {
                examId: input.examId,
                studentId: cell.studentId,
                subjectId: cell.subjectId,
              },
            },
            update: {
              obtainedMarks: cell.obtainedMarks,
              uploadedBy: employeeRecord.employeeId,
            },
            create: {
              examId: input.examId,
              studentId: cell.studentId,
              subjectId: cell.subjectId,
              classSubjectId: cell.classSubjectId,
              obtainedMarks: cell.obtainedMarks,
              totalMarks: exam.totalMarks,
              uploadedBy: employeeRecord.employeeId,
            },
          }),
        ),
      );

      return { success: true, savedCount: results.length };
    }),

  // FR-EXM-33: CSV import validation (parse and return diff preview)
  previewCSVImport: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        // Each row: { registrationNumber, subjectCode, obtainedMarks }
        csvRows: z.array(
          z.object({
            registrationNumber: z.string(),
            subjectCode: z.string(),
            obtainedMarks: z.number().min(0),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exam = await ctx.db.exam.findUnique({
        where: { examId: input.examId },
        include: { ExamDatesheet: { include: { Subject: true } } },
      });
      if (!exam) throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });

      const validRows: {
        studentId: string;
        studentName: string;
        subjectId: string;
        subjectName: string;
        classSubjectId: string;
        obtainedMarks: number;
        existingMarks: number | null;
        isNew: boolean;
        isExceedingMax: boolean;
      }[] = [];
      const errors: string[] = [];

      for (const row of input.csvRows) {
        const student = await ctx.db.students.findFirst({
          where: { registrationNumber: row.registrationNumber },
          select: { studentId: true, studentName: true },
        });

        if (!student) {
          errors.push(`Student not found: ${row.registrationNumber}`);
          continue;
        }

        const subject = exam.ExamDatesheet.find(
          (ds) => ds.Subject.subjectName.toLowerCase() === row.subjectCode.toLowerCase(),
        );

        if (!subject) {
          errors.push(`Subject not found in datesheet: ${row.subjectCode}`);
          continue;
        }

        const classSubject = await ctx.db.classSubject.findFirst({
          where: { subjectId: subject.subjectId },
          select: { csId: true },
        });

        const existing = await ctx.db.marks.findUnique({
          where: {
            examId_studentId_subjectId: {
              examId: input.examId,
              studentId: student.studentId,
              subjectId: subject.subjectId,
            },
          },
          select: { obtainedMarks: true },
        });

        validRows.push({
          studentId: student.studentId,
          studentName: student.studentName,
          subjectId: subject.subjectId,
          subjectName: subject.Subject.subjectName,
          classSubjectId: classSubject?.csId ?? "",
          obtainedMarks: row.obtainedMarks,
          existingMarks: existing?.obtainedMarks ?? null,
          isNew: !existing,
          isExceedingMax: row.obtainedMarks > exam.totalMarks,
        });
      }

      return { validRows, errors, hasErrors: errors.length > 0 };
    }),

  // FR-EXM-36: Log marking session for audit
  logMarkingSession: publicProcedure
    .input(z.object({ examId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) return null;

      // Use findFirst + upsert-like logic (no unique on markingSessionId)
      const existing = await ctx.db.examinationMarkingSession.findFirst({
        where: { examId: input.examId, userId },
      });

      if (existing) {
        return ctx.db.examinationMarkingSession.update({
          where: { markingSessionId: existing.markingSessionId },
          data: { lastActivityAt: new Date() },
        });
      }

      return ctx.db.examinationMarkingSession.create({
        data: { examId: input.examId, userId },
      });
    }),
});
