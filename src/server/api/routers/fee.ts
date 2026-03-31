import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// --- Input Schemas ---

const feeInputSchema = z.object({
  level: z.string(),
  admissionFee: z.number(),
  tuitionFee: z.number(),
  examFund: z.number(),
  computerLabFund: z.number().optional(),
  studentIdCardFee: z.number(),
  infoAndCallsFee: z.number(),
  type: z.enum(["MonthlyFee", "AnnualFee"]),
});

const feeUpdateSchema = feeInputSchema.partial().extend({
  feeId: z.string(),
});

const paymentUpdateSchema = z.object({
  feeStudentClassId: z.string(),
  tuitionPaid: z.boolean().optional(),
  examFundPaid: z.boolean().optional(),
  computerLabPaid: z.boolean().optional(),
  studentIdCardPaid: z.boolean().optional(),
  infoAndCallsPaid: z.boolean().optional(),
  paidAt: z.date().optional(),
  discount: z.number().optional(),
  discountbypercent: z.number().optional(),
  discountDescription: z.string().optional(),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "An unknown error occurred.";
};

// --- Helper Types for Aggregation ---
interface MonthlyFeeStats {
  month: string;
  monthNumber: number;
  totalExpected: number;
  totalCollected: number;
  outstanding: number;
  paidCount: number;
  unpaidCount: number;
  collectionRate: number;
}

interface ClassFeeGroup {
  className: string;
  studentCount: number;
  totalExpected: number;
  totalPaid: number;
  payments: {
    isPaid: boolean;
    studentId: string;
    amount: number;
  }[];
}

// --- Helper Logic for Fee Calculation ---
const calculateFeeAmounts = (fee: {
  type: string;
  tuitionFee: number;
  examFund: number;
  computerLabFund: number | null;
  studentIdCardFee: number;
  infoAndCallsFee: number;
  admissionFee: number;
}) => {
  const isMonthly = fee.type === "MonthlyFee";

  // Calculate Base Amount based on Type
  let base = 0;
  if (isMonthly) {
    base = fee.tuitionFee;
  } else {
    // Annual Fee includes everything else
    base =
      fee.examFund +
      (fee.computerLabFund ?? 0) +
      fee.studentIdCardFee +
      fee.infoAndCallsFee +
      fee.admissionFee;
  }
  return base;
};

const calculatePaidAmount = (
  fee: {
    type: string;
    tuitionFee: number;
    examFund: number;
    computerLabFund: number | null;
    studentIdCardFee: number;
    infoAndCallsFee: number;
    admissionFee: number;
  },
  status: {
    tuitionPaid: boolean;
    examFundPaid: boolean;
    computerLabPaid: boolean;
    studentIdCardPaid: boolean;
    infoAndCallsPaid: boolean;
  },
) => {
  const isMonthly = fee.type === "MonthlyFee";
  let paid = 0;

  if (isMonthly) {
    if (status.tuitionPaid) paid += fee.tuitionFee;
  } else {
    // For Annual, we sum up the annual components that are paid
    // Note: Admission fee doesn't have a specific paid flag in the schema provided
    // so we assume if tuitionPaid (or primary flag) is true, it might cover it,
    // or we strictly follow the available flags.
    // Assuming standard flags cover the annual funds:
    if (status.examFundPaid) paid += fee.examFund;
    if (status.computerLabPaid) paid += fee.computerLabFund ?? 0;
    if (status.studentIdCardPaid) paid += fee.studentIdCardFee;
    if (status.infoAndCallsPaid) paid += fee.infoAndCallsFee;
    // If admission fee tracking is required, schema needs an update.
    // For now, we assume it's part of the annual bundle.
  }
  return paid;
};

export const feeRouter = createTRPCRouter({
  // --- CRUD Operations ---

  createFee: protectedProcedure
    .input(feeInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.fees.create({ data: input });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create fee: ${getErrorMessage(error)}`,
        });
      }
    }),

  updateFee: protectedProcedure
    .input(feeUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { feeId, ...updateData } = input;
        return await ctx.db.fees.update({
          where: { feeId },
          data: updateData,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update fee: ${getErrorMessage(error)}`,
        });
      }
    }),

  deleteFeesByIds: protectedProcedure
    .input(z.object({ feeIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.fees.deleteMany({
          where: { feeId: { in: input.feeIds } },
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete fees: ${getErrorMessage(error)}`,
        });
      }
    }),

  getAllFees: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.fees.findMany({ orderBy: { level: "asc" } });
  }),
  assignFeeToClass: protectedProcedure
    .input(
      z.object({
        feeId: z.string(),
        classId: z.string(),
        sessionId: z.string(),
        month: z.number(),
        year: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const studentClasses = await ctx.db.studentClass.findMany({
          where: {
            classId: input.classId,
            sessionId: input.sessionId,
          },
        });

        let assignedCount = 0;
        let skippedCount = 0;

        for (const sc of studentClasses) {
          const existing = await ctx.db.feeStudentClass.findFirst({
            where: {
              studentClassId: sc.scId,
              feeId: input.feeId,
              month: input.month,
              year: input.year,
            },
          });

          if (existing) {
            skippedCount++;
            continue;
          }

          await ctx.db.feeStudentClass.create({
            data: {
              studentClassId: sc.scId,
              feeId: input.feeId,
              month: input.month,
              year: input.year,
              discount: 0,
              discountByPercent: 0,
              discountDescription: "",
              lateFee: 0,
            },
          });
          assignedCount++;
        }

        return { assignedCount, skippedCount };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to bulk assign fees: ${getErrorMessage(error)}`,
        });
      }
    }),

  updateFeePayment: protectedProcedure
    .input(paymentUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { feeStudentClassId, discountbypercent, ...rest } = input;

        const currentRecord = await ctx.db.feeStudentClass.findUnique({
          where: { sfcId: feeStudentClassId },
        });

        if (!currentRecord) throw new TRPCError({ code: "NOT_FOUND" });

        const updateData = {
          ...rest,
          ...(discountbypercent !== undefined
            ? { discountByPercent: discountbypercent }
            : {}),
        };

        // logic: update current month
        const updated = await ctx.db.feeStudentClass.update({
          where: { sfcId: feeStudentClassId },
          data: updateData,
        });

        // logic: propagate annual fees to all months of the same year
        const annualFields = [
          "examFundPaid",
          "computerLabPaid",
          "studentIdCardPaid",
          "infoAndCallsPaid",
        ];
        const annualUpdates: Record<string, boolean> = {};

        annualFields.forEach((field) => {
          if (rest[field as keyof typeof rest] !== undefined) {
            annualUpdates[field] = rest[field as keyof typeof rest] as boolean;
          }
        });

        if (Object.keys(annualUpdates).length > 0) {
          await ctx.db.feeStudentClass.updateMany({
            where: {
              studentClassId: currentRecord.studentClassId,
              year: currentRecord.year,
            },
            data: annualUpdates,
          });
        }

        return updated;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed update",
        });
      }
    }),

  removeFeeAssignment: protectedProcedure
    .input(z.object({ feeStudentClassId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.feeStudentClass.delete({
          where: { sfcId: input.feeStudentClassId },
        });
      } catch (error) {
        console.error("Error removing fee assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed delete",
        });
      }
    }),

  applyLateFee: protectedProcedure
    .input(z.object({ sfcId: z.string(), lateFeeAmount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.feeStudentClass.update({
          where: { sfcId: input.sfcId },
          data: { lateFee: input.lateFeeAmount },
        });
      } catch (error) {
        console.error("Error applying late fee:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to apply late fee",
        });
      }
    }),

  // --- Queries for Dashboard ---

  getClassFeeSummary: protectedProcedure
    .input(z.object({ sessionId: z.string(), year: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const classes = await ctx.db.grades.findMany({
          orderBy: { category: "asc" },
          include: {
            _count: {
              select: {
                StudentClass: { where: { sessionId: input.sessionId } },
              },
            },
          },
        });

        const feeAssignments = await ctx.db.feeStudentClass.findMany({
          where: {
            year: input.year,
            StudentClass: { sessionId: input.sessionId },
          },
          include: {
            fees: true,
            StudentClass: { include: { Grades: true } },
          },
        });

        const classData = classes.map((cls) => {
          const classFees = feeAssignments.filter(
            (f) => f.StudentClass.classId === cls.classId,
          );
          let totalExpected = 0;
          let totalCollected = 0;

          const monthlyStats: MonthlyFeeStats[] = Array.from(
            { length: 12 },
            (_, i) => ({
              month: new Date(0, i).toLocaleString("default", {
                month: "long",
              }),
              monthNumber: i + 1,
              totalExpected: 0,
              totalCollected: 0,
              outstanding: 0,
              paidCount: 0,
              unpaidCount: 0,
              collectionRate: 0,
            }),
          );

          classFees.forEach((f) => {
            const base = calculateFeeAmounts(f.fees);
            const discount = base * (f.discountByPercent / 100) + f.discount;
            const due = base - discount + f.lateFee;

            let paid = calculatePaidAmount(f.fees, f);
            paid = Math.min(paid, due);

            totalExpected += due;
            totalCollected += paid;

            const mIndex = f.month - 1;
            if (monthlyStats[mIndex]) {
              monthlyStats[mIndex].totalExpected += due;
              monthlyStats[mIndex].totalCollected += paid;
              if (paid >= due && due > 0) monthlyStats[mIndex].paidCount++;
              else if (due > 0) monthlyStats[mIndex].unpaidCount++;
            }
          });

          monthlyStats.forEach((m) => {
            m.outstanding = m.totalExpected - m.totalCollected;
            m.collectionRate =
              m.totalExpected > 0
                ? (m.totalCollected / m.totalExpected) * 100
                : 0;
          });

          return {
            classId: cls.classId,
            className: `${cls.grade} - ${cls.section}`,
            category: cls.category,
            studentCount: cls._count.StudentClass,
            collectionRate:
              totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
            yearlyTotals: {
              totalExpected,
              totalCollected,
              outstanding: totalExpected - totalCollected,
            },
            monthlyData: monthlyStats,
          };
        });

        const grandTotals = classData.reduce(
          (acc, curr) => ({
            totalExpected: acc.totalExpected + curr.yearlyTotals.totalExpected,
            totalCollected:
              acc.totalCollected + curr.yearlyTotals.totalCollected,
            outstanding: acc.outstanding + curr.yearlyTotals.outstanding,
            totalStudents: acc.totalStudents + curr.studentCount,
            collectionRate: 0,
          }),
          {
            totalExpected: 0,
            totalCollected: 0,
            outstanding: 0,
            totalStudents: 0,
            collectionRate: 0,
          },
        );

        grandTotals.collectionRate =
          grandTotals.totalExpected > 0
            ? (grandTotals.totalCollected / grandTotals.totalExpected) * 100
            : 0;

        return { classes: classData, grandTotals };
      } catch (error) {
        console.error("Error fetching class fee summary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch summary",
        });
      }
    }),

  getDefaultersList: protectedProcedure
    .input(
      z.object({ sessionId: z.string(), month: z.number(), year: z.number() }),
    )
    .query(async ({ ctx, input }) => {
      const defaulters = await ctx.db.feeStudentClass.findMany({
        where: {
          month: input.month,
          year: input.year,
          StudentClass: { sessionId: input.sessionId },
          // Basic filter: anything not fully paid might be a default
          // Strict logic handled below
        },
        include: {
          fees: true,
          StudentClass: { include: { Students: true, Grades: true } },
        },
      });

      return defaulters
        .map((f) => {
          const base = calculateFeeAmounts(f.fees);
          const discount = base * (f.discountByPercent / 100) + f.discount;
          const due = base - discount + f.lateFee;

          const paid = calculatePaidAmount(f.fees, f);

          if (paid >= due) return null; // Fully paid

          return {
            sfcId: f.sfcId,
            student: {
              studentName: f.StudentClass.Students.studentName,
              registrationNumber: f.StudentClass.Students.registrationNumber,
              fatherName: f.StudentClass.Students.fatherName,
              fatherMobile: f.StudentClass.Students.fatherMobile,
            },
            class: {
              grade: f.StudentClass.Grades.grade,
              section: f.StudentClass.Grades.section,
            },
            dueAmount: due - paid,
            unpaidItems: {
              // For display, we show which parts are technically unpaid based on flags
              // This might be redundant if we only care about total amount, but helpful for UI
              tuition: f.fees.type === "MonthlyFee" && !f.tuitionPaid,
              examFund: f.fees.type === "AnnualFee" && !f.examFundPaid,
              computerLab: f.fees.type === "AnnualFee" && !f.computerLabPaid,
              studentIdCard:
                f.fees.type === "AnnualFee" && !f.studentIdCardPaid,
              infoAndCalls: f.fees.type === "AnnualFee" && !f.infoAndCallsPaid,
            },
          };
        })
        .filter((d): d is NonNullable<typeof d> => d !== null);
    }),

  getFeeByEachMonth: protectedProcedure
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(async ({ ctx, input }) => {
      const assignments = await ctx.db.feeStudentClass.findMany({
        where: { month: input.month, year: input.year },
        include: { fees: true, StudentClass: { include: { Grades: true } } },
      });

      const classMap = new Map<string, ClassFeeGroup>();
      let grandExpected = 0;
      let grandCollected = 0;

      assignments.forEach((f) => {
        const className = `${f.StudentClass.Grades.grade} - ${f.StudentClass.Grades.section}`;
        if (!classMap.has(className)) {
          classMap.set(className, {
            className,
            studentCount: 0,
            totalExpected: 0,
            totalPaid: 0,
            payments: [],
          });
        }

        const entry = classMap.get(className);
        if (!entry) return;

        const base = calculateFeeAmounts(f.fees);
        const discount = base * (f.discountByPercent / 100) + f.discount;
        const due = base - discount + f.lateFee;

        const paid = calculatePaidAmount(f.fees, f);

        entry.totalExpected += due;
        entry.totalPaid += paid;
        entry.studentCount++;
        entry.payments.push({
          isPaid: paid >= due,
          studentId: f.StudentClass.studentId,
          amount: paid,
        });

        grandExpected += due;
        grandCollected += paid;
      });

      return {
        grandExpected,
        grandTotal: grandCollected,
        outstanding: grandExpected - grandCollected,
        feesByClass: Array.from(classMap.values()),
      };
    }),

  getFeeAnalytics: protectedProcedure
    .input(z.object({ sessionId: z.string(), year: z.number() }))
    .query(async ({ ctx, input }) => {
      const assignments = await ctx.db.feeStudentClass.findMany({
        where: {
          year: input.year,
          StudentClass: { sessionId: input.sessionId },
        },
        include: { fees: true, StudentClass: { include: { Grades: true } } },
      });

      let totalCollected = 0;
      let totalExpected = 0;
      let totalDiscounts = 0;
      let totalLateFees = 0;

      const monthlyData = new Map<
        number,
        { collected: number; expected: number }
      >();
      const categoryData = new Map<string, number>();

      assignments.forEach((f) => {
        const base = calculateFeeAmounts(f.fees);
        const discount = base * (f.discountByPercent / 100) + f.discount;
        const due = base - discount + f.lateFee;
        const paid = calculatePaidAmount(f.fees, f);

        totalExpected += due;
        totalCollected += paid;
        totalDiscounts += discount;
        totalLateFees += f.lateFee;

        const mStats = monthlyData.get(f.month) ?? {
          collected: 0,
          expected: 0,
        };
        mStats.collected += paid;
        mStats.expected += due;
        monthlyData.set(f.month, mStats);

        const cat = f.StudentClass.Grades.category;
        categoryData.set(cat, (categoryData.get(cat) ?? 0) + paid);
      });

      const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const stats = monthlyData.get(m) ?? { collected: 0, expected: 0 };
        return {
          month: new Date(0, i).toLocaleString("default", { month: "short" }),
          collected: stats.collected,
          outstanding: stats.expected - stats.collected,
        };
      });

      const categoryCollection = Array.from(categoryData.entries()).map(
        ([k, v]) => ({
          category: k,
          collected: v,
        }),
      );

      return {
        summary: {
          collectionRate:
            totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
          totalDiscounts,
          totalLateFees,
          totalOutstanding: totalExpected - totalCollected,
        },
        monthlyTrend,
        categoryCollection,
      };
    }),

  getYearComparison: protectedProcedure
    .input(z.object({ sessionId: z.string(), years: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const result = [];
      for (const year of input.years) {
        const assignments = await ctx.db.feeStudentClass.findMany({
          where: { year, StudentClass: { sessionId: input.sessionId } },
          include: { fees: true },
        });

        let totalExpected = 0;
        let totalCollected = 0;

        assignments.forEach((f) => {
          const base = calculateFeeAmounts(f.fees);
          const due = base - f.discount + f.lateFee;
          const paid = calculatePaidAmount(f.fees, f);
          totalExpected += due;
          totalCollected += paid;
        });

        result.push({ year, totalExpected, totalCollected });
      }
      return result;
    }),

  getClassFees: publicProcedure
    .input(
      z.object({
        classId: z.string(),
        sessionId: z.string().optional(),
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.StudentClassWhereInput = { classId: input.classId };
      if (input.sessionId) where.sessionId = input.sessionId;

      const studentClasses = await ctx.db.studentClass.findMany({
        where,
        include: {
          Students: true,
          FeeStudentClass: {
            where: input.year ? { year: input.year } : undefined,
            include: { fees: true },
          },
        },
      });

      // Post-processing: Apply Annual Fee Persistence
      const processedClasses = studentClasses.map((sc) => {
        // Find if any annual fees were paid in any month of this year
        const paidAnnuals = {
          exam: sc.FeeStudentClass.some((f) => f.examFundPaid),
          lab: sc.FeeStudentClass.some((f) => f.computerLabPaid),
          idCard: sc.FeeStudentClass.some((f) => f.studentIdCardPaid),
          info: sc.FeeStudentClass.some((f) => f.infoAndCallsPaid),
        };

        const updatedFees = sc.FeeStudentClass.map((f) => ({
          ...f,
          // Override status: If paid once in the year, it's paid for every month
          examFundPaid: paidAnnuals.exam || f.examFundPaid,
          computerLabPaid: paidAnnuals.lab || f.computerLabPaid,
          studentIdCardPaid: paidAnnuals.idCard || f.studentIdCardPaid,
          infoAndCallsPaid: paidAnnuals.info || f.infoAndCallsPaid,
        }));

        return { ...sc, FeeStudentClass: updatedFees };
      });

      return { studentClasses: processedClasses };
    }),

  getStudentFees: publicProcedure
    .input(z.object({ studentId: z.string(), year: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const student = await ctx.db.students.findUnique({
        where: { studentId: input.studentId },
      });

      const studentClasses = await ctx.db.studentClass.findFirst({
        where: { studentId: input.studentId },
        include: {
          Grades: true,
          Sessions: true,
          FeeStudentClass: {
            where: input.year ? { year: input.year } : undefined,
            include: { fees: true },
            orderBy: [{ year: "desc" }, { month: "desc" }],
          },
        },
      });

      if (!studentClasses) return null;

      const ledger = studentClasses.FeeStudentClass.map((f) => {
        const fee = f.fees;
        const base = calculateFeeAmounts(fee);
        const discount = base * (f.discountByPercent / 100) + f.discount;
        const due = base - discount + f.lateFee;
        const paid = calculatePaidAmount(fee, f);

        return {
          sfcId: f.sfcId,
          month: f.month,
          year: f.year,
          baseFee: base,
          discountAmount: discount,
          totalDue: due,
          paidAmount: paid,
          outstanding: due - paid,
          isPaid: paid >= due,
          lateFee: f.lateFee,
          fees: fee,
          StudentClass: {
            Grades: studentClasses.Grades,
          },
        };
      });

      return { student, ledger };
    }),
});
