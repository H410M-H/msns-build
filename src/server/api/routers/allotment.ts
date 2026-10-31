import { z } from "zod";
import { createTRPCRouter, protectedProcedure, managementProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { PaymentStatus, VoucherType } from "@prisma/client";
import type { StudentClass, Grades, Sessions, Students } from "@prisma/client";

// Define a relation type based on your Prisma schema. Adjust field names as needed.
type StudentClassWithRelations = StudentClass & {
  Grades: Grades;
  Sessions: Sessions;
  Students: Students;
};

export const AllotmentRouter = createTRPCRouter({
  addToClass: protectedProcedure
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

  getStudentsInClass: protectedProcedure
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

  getStudentsByClassAndSession: protectedProcedure
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

  deleteStudentsFromClass: protectedProcedure
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

          // Guard: Block deletion if any paid or partially paid vouchers exist
          const paidRecords = await tx.feeStudentClass.findFirst({
            where: {
              studentClassId: { in: studentClassIds },
              OR: [
                { paymentStatus: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] } },
                { amountPaid: { gt: 0 } },
              ],
            },
          });

          if (paidRecords) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message:
                "Cannot remove student from class: Paid or partially paid fee vouchers exist. Historical financial records cannot be deleted. Mark student as transferred or withdrawn instead.",
            });
          }

          // Delete dependent child sub-installments first to respect self-relation Restrict
          await tx.feeStudentClass.deleteMany({
            where: {
              studentClassId: { in: studentClassIds },
              parentVoucherId: { not: null },
            },
          });

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

  transferStudentWithAdjustment: managementProcedure
    .input(
      z.object({
        studentClassId: z.string().cuid().optional(),
        studentId: z.string().cuid().optional(),
        fromClassId: z.string().cuid().optional(),
        toClassId: z.string().cuid().optional(),
        newClassId: z.string().cuid().optional(),
        sessionId: z.string().cuid().optional(),
        effectiveMonth: z.number().int().min(1).max(12).optional(),
        effectiveYear: z.number().int().min(2000).max(2100).optional(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const targetClassId = input.toClassId ?? input.newClassId;
        if (!targetClassId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Target class ID (toClassId or newClassId) is required",
          });
        }

        return await ctx.db.$transaction(async (tx) => {
          // 1. Resolve student-class association
          let studentClass;
          if (input.studentClassId) {
            studentClass = await tx.studentClass.findUnique({
              where: { scId: input.studentClassId },
              include: { Grades: true, Sessions: true, Students: true },
            });
          } else if (input.studentId && input.fromClassId && input.sessionId) {
            studentClass = await tx.studentClass.findFirst({
              where: {
                studentId: input.studentId,
                classId: input.fromClassId,
                sessionId: input.sessionId,
              },
              include: { Grades: true, Sessions: true, Students: true },
            });
          } else if (input.studentId && input.sessionId) {
            studentClass = await tx.studentClass.findFirst({
              where: {
                studentId: input.studentId,
                sessionId: input.sessionId,
              },
              include: { Grades: true, Sessions: true, Students: true },
            });
          }

          if (!studentClass) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Student class association not found for transfer",
            });
          }

          if (studentClass.classId === targetClassId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Student is already assigned to the target class",
            });
          }

          // 2. Resolve target grade
          const toGrade = await tx.grades.findUnique({
            where: { classId: targetClassId },
          });
          if (!toGrade) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Target grade/class not found",
            });
          }

          // 3. Compute tuition fee differential
          const fromFeeRecord = await tx.fees.findFirst({
            where: { level: studentClass.Grades.grade, type: "MonthlyFee" },
          });
          const toFeeRecord = await tx.fees.findFirst({
            where: { level: toGrade.grade, type: "MonthlyFee" },
          });

          const oldTuition = fromFeeRecord?.tuitionFee ?? studentClass.Grades.fee;
          const newTuition = toFeeRecord?.tuitionFee ?? toGrade.fee;
          const monthlyDifferential = newTuition - oldTuition;

          // 4. Calculate proration
          const now = new Date();
          const currentMonth = input.effectiveMonth ?? (now.getMonth() + 1);
          const currentYear = input.effectiveYear ?? now.getFullYear();
          const remainingMonths = Math.max(1, 12 - currentMonth + 1);
          const totalDifferential = monthlyDifferential * remainingMonths;

          let adjustmentVoucher = null;
          const voucherNumber = `VCH-ADJ-${currentYear}-${String(currentMonth).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

          if (monthlyDifferential > 0) {
            // Higher tuition: generate FEE_ADJUSTMENT voucher
            const defaultFee = toFeeRecord ?? (await tx.fees.findFirst());
            if (defaultFee) {
              const dueDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
              adjustmentVoucher = await tx.feeStudentClass.create({
                data: {
                  studentClassId: studentClass.scId,
                  feeId: defaultFee.feeId,
                  month: currentMonth,
                  year: currentYear,
                  installmentNo: currentMonth,
                  voucherNumber,
                  voucherType: VoucherType.FEE_ADJUSTMENT,
                  issueDate: now,
                  dueDate,
                  adjustmentAmount: totalDifferential,
                  adjustmentReason:
                    input.reason ??
                    `Mid-session class transfer fee differential (${studentClass.Grades.grade} -> ${toGrade.grade}): +${monthlyDifferential}/mo for ${remainingMonths} month(s)`,
                  paymentStatus: PaymentStatus.PENDING,
                  amountPaid: 0,
                  tuitionPaid: false,
                  lateFee: 0,
                  discount: 0,
                },
              });
            }
          }

          // 5. Update student-class association to target class
          await tx.studentClass.update({
            where: { scId: studentClass.scId },
            data: { classId: targetClassId },
          });

          return {
            success: true,
            studentClassId: studentClass.scId,
            studentId: studentClass.studentId,
            oldClassId: studentClass.classId,
            newClassId: targetClassId,
            oldTuition,
            newTuition,
            monthlyDifferential,
            remainingMonths,
            totalDifferential,
            action:
              monthlyDifferential > 0
                ? "VOUCHER_GENERATED"
                : monthlyDifferential < 0
                  ? "CREDIT_RECORDED"
                  : "NO_ADJUSTMENT_NEEDED",
            adjustmentVoucherId: adjustmentVoucher?.sfcId ?? null,
            adjustmentVoucherNumber: adjustmentVoucher?.voucherNumber ?? null,
            creditAmount: monthlyDifferential < 0 ? Math.abs(totalDifferential) : 0,
            message:
              monthlyDifferential > 0
                ? `Transferred student to ${toGrade.grade} and generated fee adjustment voucher for PKR ${totalDifferential}`
                : monthlyDifferential < 0
                  ? `Transferred student to ${toGrade.grade} and recorded credit adjustment of PKR ${Math.abs(totalDifferential)}`
                  : `Transferred student to ${toGrade.grade}. Tuition fee is identical; no financial adjustment required.`,
          };
        });
      } catch (error) {
        console.error("Error transferring student with adjustment:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to transfer student with fee adjustment",
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
