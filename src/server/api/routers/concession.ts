import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ConcessionCategory, PaymentStatus } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  clerkProcedure,
  managementProcedure,
} from "~/server/api/trpc";
import { getSessionEmployee } from "~/server/utils/credential-generator";

export const concessionRouter = createTRPCRouter({
  /**
   * Evaluates attendance continuation policy (>= 80% rule).
   * For students with policy-driven concessions, calculates attendance percentage
   * for the evaluation month from StudentAttendance records.
   * If attendance rate < 80%, sets concessionCategory to SUSPENDED_LOW_ATTENDANCE
   * and resets concessionAmount to 0.
   */
  evaluateAttendanceConcessions: managementProcedure
    .input(
      z.object({
        sessionId: z.string(),
        month: z.number().int().min(1).max(12),
        year: z.number().int().min(2000).max(2100),
        classId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const monthPrefix = `${input.year}-${String(input.month).padStart(2, "0")}`;

      // 1. Query candidate vouchers in this session / class / month / year
      const candidateVouchers = await ctx.db.feeStudentClass.findMany({
        where: {
          StudentClass: {
            sessionId: input.sessionId,
            ...(input.classId ? { classId: input.classId } : {}),
          },
          month: input.month,
          year: input.year,
          paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIALLY_PAID] },
          isSplitLocked: false,
          mergedIntoVoucherId: null,
        },
        include: {
          StudentClass: {
            include: {
              Students: true,
              Grades: true,
            },
          },
        },
      });

      let evaluatedCount = 0;
      let maintainedCount = 0;
      let suspendedCount = 0;
      let restoredCount = 0;
      const details: Array<{
        sfcId: string;
        studentId: string;
        studentName: string;
        registrationNumber: string;
        attendanceRate: number | null;
        totalDays: number;
        presentDays: number;
        action: "SUSPENDED" | "MAINTAINED" | "RESTORED" | "SKIPPED_NO_DATA";
        previousCategory: string;
        currentCategory: string;
      }> = [];

      for (const voucher of candidateVouchers) {
        evaluatedCount++;
        const studentId = voucher.StudentClass.studentId;

        // Fetch attendance logs for evaluation month
        const attendanceLogs = await ctx.db.studentAttendance.findMany({
          where: {
            studentId,
            sessionId: input.sessionId,
            date: { startsWith: monthPrefix },
          },
        });

        const totalDays = attendanceLogs.length;

        // If no attendance records logged for this month, skip to avoid penalizing student without data
        if (totalDays === 0) {
          details.push({
            sfcId: voucher.sfcId,
            studentId,
            studentName: voucher.StudentClass.Students.studentName,
            registrationNumber: voucher.StudentClass.Students.registrationNumber,
            attendanceRate: null,
            totalDays: 0,
            presentDays: 0,
            action: "SKIPPED_NO_DATA",
            previousCategory: voucher.concessionCategory,
            currentCategory: voucher.concessionCategory,
          });
          continue;
        }

        const presentDays = attendanceLogs.filter(
          (log) => log.status === "P" || log.status === "L",
        ).length;
        const attendanceRate = (presentDays / totalDays) * 100;

        if (attendanceRate < 80) {
          // Attendance fell below 80% -> suspend concession
          if (
            voucher.concessionCategory !== ConcessionCategory.NONE &&
            voucher.concessionCategory !== ConcessionCategory.SUSPENDED_LOW_ATTENDANCE
          ) {
            const previousCategory = voucher.concessionCategory;
            const newDiscount = 0 + voucher.exemptionAmount;

            await ctx.db.feeStudentClass.update({
              where: { sfcId: voucher.sfcId },
              data: {
                concessionCategory: ConcessionCategory.SUSPENDED_LOW_ATTENDANCE,
                concessionAmount: 0,
                discount: newDiscount,
                discountDescription: `Concession suspended: Attendance was ${attendanceRate.toFixed(1)}% (below 80% threshold). Former category: ${previousCategory}.`,
              },
            });

            suspendedCount++;
            details.push({
              sfcId: voucher.sfcId,
              studentId,
              studentName: voucher.StudentClass.Students.studentName,
              registrationNumber: voucher.StudentClass.Students.registrationNumber,
              attendanceRate,
              totalDays,
              presentDays,
              action: "SUSPENDED",
              previousCategory,
              currentCategory: ConcessionCategory.SUSPENDED_LOW_ATTENDANCE,
            });
          } else {
            maintainedCount++;
            details.push({
              sfcId: voucher.sfcId,
              studentId,
              studentName: voucher.StudentClass.Students.studentName,
              registrationNumber: voucher.StudentClass.Students.registrationNumber,
              attendanceRate,
              totalDays,
              presentDays,
              action: "MAINTAINED",
              previousCategory: voucher.concessionCategory,
              currentCategory: voucher.concessionCategory,
            });
          }
        } else {
          // Attendance >= 80% -> maintained or restored
          if (voucher.concessionCategory === ConcessionCategory.SUSPENDED_LOW_ATTENDANCE) {
            restoredCount++;
            details.push({
              sfcId: voucher.sfcId,
              studentId,
              studentName: voucher.StudentClass.Students.studentName,
              registrationNumber: voucher.StudentClass.Students.registrationNumber,
              attendanceRate,
              totalDays,
              presentDays,
              action: "RESTORED",
              previousCategory: voucher.concessionCategory,
              currentCategory: ConcessionCategory.SUSPENDED_LOW_ATTENDANCE,
            });
          } else {
            maintainedCount++;
            details.push({
              sfcId: voucher.sfcId,
              studentId,
              studentName: voucher.StudentClass.Students.studentName,
              registrationNumber: voucher.StudentClass.Students.registrationNumber,
              attendanceRate,
              totalDays,
              presentDays,
              action: "MAINTAINED",
              previousCategory: voucher.concessionCategory,
              currentCategory: voucher.concessionCategory,
            });
          }
        }
      }

      return {
        success: true,
        evaluatedCount,
        maintainedCount,
        suspendedCount,
        restoredCount,
        details,
      };
    }),

  /**
   * Detects enrolled siblings by grouping father/guardian CNIC and mobile numbers.
   * Discards placeholder CNICs ('0000-0000000-0') and fallback to Father Name + Mobile.
   */
  detectSiblingConcessions: clerkProcedure
    .input(
      z.object({
        sessionId: z.string(),
        classId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const studentClassAssignments = await ctx.db.studentClass.findMany({
        where: {
          sessionId: input.sessionId,
          ...(input.classId ? { classId: input.classId } : {}),
        },
        include: {
          Students: true,
          Grades: true,
        },
      });

      // Group students by sanitized Father CNIC or normalized Father Name + Mobile
      const familyGroups = new Map<
        string,
        Array<{
          studentId: string;
          studentClassId: string;
          studentName: string;
          registrationNumber: string;
          admissionNumber: string;
          gradeId: string;
          gradeName: string;
          fatherName: string;
          fatherCNIC: string;
          fatherMobile: string;
          guardianName: string | null;
        }>
      >();

      for (const assignment of studentClassAssignments) {
        const student = assignment.Students;
        let groupKey: string | null = null;

        const cleanCNIC = (student.fatherCNIC ?? "").trim().replace(/[^0-9]/g, "");
        const isPlaceholderCNIC =
          !cleanCNIC ||
          cleanCNIC.replace(/0/g, "").length === 0 ||
          cleanCNIC.length < 10;

        if (!isPlaceholderCNIC) {
          groupKey = `CNIC_${cleanCNIC}`;
        } else {
          // Fallback to normalized Father Name + Mobile
          const cleanMobile = (student.fatherMobile ?? "").trim().replace(/[^0-9]/g, "");
          const cleanFatherName = (student.fatherName ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

          if (
            cleanMobile.length >= 7 &&
            cleanFatherName &&
            cleanFatherName !== "none"
          ) {
            groupKey = `FATHER_${cleanFatherName}_${cleanMobile}`;
          }
        }

        if (groupKey) {
          if (!familyGroups.has(groupKey)) {
            familyGroups.set(groupKey, []);
          }
          familyGroups.get(groupKey)!.push({
            studentId: student.studentId,
            studentClassId: assignment.scId,
            studentName: student.studentName,
            registrationNumber: student.registrationNumber,
            admissionNumber: student.admissionNumber,
            gradeId: assignment.classId,
            gradeName: `${assignment.Grades.grade} - ${assignment.Grades.section}`,
            fatherName: student.fatherName,
            fatherCNIC: student.fatherCNIC,
            fatherMobile: student.fatherMobile,
            guardianName: student.guardianName,
          });
        }
      }

      // Filter groups having 2 or more siblings
      const siblingFamilies: Array<{
        familyIdentifier: string;
        siblingCount: number;
        siblings: Array<any>;
      }> = [];

      let totalSiblingStudents = 0;
      for (const [key, members] of familyGroups.entries()) {
        if (members.length >= 2) {
          siblingFamilies.push({
            familyIdentifier: key,
            siblingCount: members.length,
            siblings: members,
          });
          totalSiblingStudents += members.length;
        }
      }

      return {
        familiesCount: siblingFamilies.length,
        siblingStudentsIdentified: totalSiblingStudents,
        siblingFamilies,
      };
    }),

  /**
   * Applies a one-off Principal discretionary fee exemption.
   * Records exemptionAmount, exemptionApprovedBy, exemptionReason, and updates discount.
   */
  applyPrincipalExemption: managementProcedure
    .input(
      z.object({
        voucherId: z.string().optional(),
        sfcId: z.string().optional(),
        exemptionAmount: z.number().positive("Exemption amount must be greater than zero"),
        reason: z.string().min(5, "Exemption reason must be at least 5 characters long").optional(),
        exemptionReason: z.string().min(5).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const targetVoucherId = input.voucherId ?? input.sfcId;
      if (!targetVoucherId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either voucherId or sfcId must be provided.",
        });
      }

      const justification = input.reason ?? input.exemptionReason;
      if (!justification) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A justification reason of at least 5 characters is mandatory.",
        });
      }

      const voucher = await ctx.db.feeStudentClass.findUnique({
        where: { sfcId: targetVoucherId },
      });

      if (!voucher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fee voucher not found.",
        });
      }

      if (voucher.paymentStatus === PaymentStatus.PAID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot apply exemption to an already settled voucher.",
        });
      }

      if (voucher.isSplitLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot apply exemption to a split-locked voucher. Concessions and exemptions must be applied before splitting.",
        });
      }

      if (voucher.paymentStatus === PaymentStatus.LOCKED_MERGED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot apply exemption to a merged voucher.",
        });
      }

      // Resolve approver employee profile
      const employee = await getSessionEmployee(ctx);
      const approverId = employee?.employeeId ?? ctx.session?.user?.id ?? "SYSTEM";

      const updatedDiscount = (voucher.concessionAmount || 0) + input.exemptionAmount;

      const updatedVoucher = await ctx.db.feeStudentClass.update({
        where: { sfcId: targetVoucherId },
        data: {
          exemptionAmount: input.exemptionAmount,
          exemptionApprovedBy: approverId,
          exemptionReason: justification,
          discount: updatedDiscount,
        },
      });

      return {
        success: true,
        sfcId: updatedVoucher.sfcId,
        exemptionAmount: updatedVoucher.exemptionAmount,
        concessionAmount: updatedVoucher.concessionAmount,
        totalDiscount: updatedVoucher.discount,
        exemptionApprovedBy: updatedVoucher.exemptionApprovedBy,
      };
    }),

  /**
   * Revokes a previously granted Principal discretionary exemption.
   * Restores base discount to concessionAmount.
   */
  revokePrincipalExemption: managementProcedure
    .input(
      z.object({
        voucherId: z.string().optional(),
        sfcId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const targetVoucherId = input.voucherId ?? input.sfcId;
      if (!targetVoucherId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either voucherId or sfcId must be provided.",
        });
      }

      const voucher = await ctx.db.feeStudentClass.findUnique({
        where: { sfcId: targetVoucherId },
      });

      if (!voucher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fee voucher not found.",
        });
      }

      if (voucher.paymentStatus === PaymentStatus.PAID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot revoke exemption on an already settled voucher.",
        });
      }

      if (voucher.isSplitLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot revoke exemption on a split-locked voucher.",
        });
      }

      const restoredDiscount = voucher.concessionAmount || 0;

      const updatedVoucher = await ctx.db.feeStudentClass.update({
        where: { sfcId: targetVoucherId },
        data: {
          exemptionAmount: 0,
          exemptionApprovedBy: null,
          exemptionReason: null,
          discount: restoredDiscount,
        },
      });

      return {
        success: true,
        sfcId: updatedVoucher.sfcId,
        exemptionAmount: 0,
        totalDiscount: restoredDiscount,
      };
    }),

  /**
   * Returns a comprehensive concession summary for a given student.
   */
  getStudentConcessionSummary: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        sessionId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const student = await ctx.db.students.findUnique({
        where: { studentId: input.studentId },
        include: {
          StudentClass: {
            where: input.sessionId ? { sessionId: input.sessionId } : undefined,
            include: {
              Grades: true,
              Sessions: true,
              FeeStudentClass: {
                orderBy: { createdAt: "desc" },
                take: 12,
              },
            },
          },
        },
      });

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found.",
        });
      }

      // Check attendance in current/latest month
      const latestAttendanceLogs = await ctx.db.studentAttendance.findMany({
        where: {
          studentId: input.studentId,
          ...(input.sessionId ? { sessionId: input.sessionId } : {}),
        },
        orderBy: { date: "desc" },
        take: 30,
      });

      const totalDays = latestAttendanceLogs.length;
      const presentDays = latestAttendanceLogs.filter(
        (l) => l.status === "P" || l.status === "L",
      ).length;
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : null;

      // Extract all fee vouchers
      const allVouchers = student.StudentClass.flatMap((sc) => sc.FeeStudentClass);
      const activeConcessions = allVouchers
        .filter((v) => v.concessionCategory !== ConcessionCategory.NONE)
        .map((v) => ({
          voucherId: v.sfcId,
          voucherNumber: v.voucherNumber,
          category: v.concessionCategory,
          amount: v.concessionAmount,
          month: v.month,
          year: v.year,
        }));

      const activeExemptions = allVouchers
        .filter((v) => v.exemptionAmount > 0)
        .map((v) => ({
          voucherId: v.sfcId,
          voucherNumber: v.voucherNumber,
          amount: v.exemptionAmount,
          reason: v.exemptionReason,
          approvedBy: v.exemptionApprovedBy,
          month: v.month,
          year: v.year,
        }));

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        registrationNumber: student.registrationNumber,
        admissionNumber: student.admissionNumber,
        attendanceRate: attendancePercentage,
        totalAttendanceRecords: totalDays,
        activeConcessions,
        activeExemptions,
      };
    }),
});
