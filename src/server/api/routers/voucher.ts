import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PaymentStatus, VoucherType, ConcessionCategory, type Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  clerkProcedure,
  managementProcedure,
} from "~/server/api/trpc";
import { getSessionEmployee } from "~/server/utils/credential-generator";

// --- Helper Functions ---

/** Computes the standard base fee from a Fees model record */
function calculateBaseFee(feeRecord: {
  type: string;
  tuitionFee: number;
  admissionFee: number;
  examFund: number;
  computerLabFund: number | null;
  studentIdCardFee: number;
  infoAndCallsFee: number;
}): number {
  if (feeRecord.type === "MonthlyFee") {
    return feeRecord.tuitionFee;
  }
  return (
    feeRecord.tuitionFee +
    feeRecord.admissionFee +
    feeRecord.examFund +
    (feeRecord.computerLabFund ?? 0) +
    feeRecord.studentIdCardFee +
    feeRecord.infoAndCallsFee
  );
}

/** Computes net payable before late fee */
function calculateNetPayable(
  baseFee: number,
  discount: number,
  adjustmentAmount: number,
  lateFee = 0,
): number {
  return Math.max(0, baseFee + lateFee + adjustmentAmount - discount);
}

// Schemas for batch generation
const generateBatchInputSchema = z.object({
  sessionId: z.string(),
  classId: z.string().optional(),
  gradeId: z.string().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  installmentNo: z.number().int().min(1).max(12).default(1).optional(),
  dueDate: z.coerce.date().optional(),
  issueDate: z.coerce.date().optional(),
  includeArrears: z.boolean().default(true).optional(),
  fineAmount: z.number().min(0).default(0).optional(),
  feeId: z.string().optional(),
});

type GenerateBatchInput = z.infer<typeof generateBatchInputSchema>;

// Schemas for splitting
const splitInputSchema = z.object({
  voucherId: z.string().optional(),
  sfcId: z.string().optional(),
  numberOfSplits: z.number().int().min(2).max(4).optional(),
  parts: z.number().int().min(2).max(4).optional(),
  customDueDates: z.array(z.coerce.date()).optional(),
  dueDates: z.array(z.coerce.date()).optional(),
});

type SplitInput = z.infer<typeof splitInputSchema>;

// Schemas for revert
const revertInputSchema = z.object({
  parentVoucherId: z.string().optional(),
  voucherId: z.string().optional(),
  sfcId: z.string().optional(),
});

type RevertInput = z.infer<typeof revertInputSchema>;

// Schemas for merge
const mergeInputSchema = z.object({
  studentClassId: z.string().optional(),
  voucherIds: z.array(z.string()).min(2),
  dueDate: z.coerce.date().optional(),
  issueDate: z.coerce.date().optional(),
});

type MergeInput = z.infer<typeof mergeInputSchema>;

// --- Core Handlers ---

async function executeGenerateBatch(ctx: any, input: GenerateBatchInput) {
  const targetClassId = input.classId ?? input.gradeId;
  if (!targetClassId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "classId or gradeId is required for batch voucher generation.",
    });
  }

  const installmentNo = input.installmentNo ?? 1;

  // 1. Resolve validity schedule
  const validity = await ctx.db.challanValidity.findUnique({
    where: {
      sessionId_gradeId_installmentNo: {
        sessionId: input.sessionId,
        gradeId: targetClassId,
        installmentNo,
      },
    },
  });

  const effectiveIssueDate = input.issueDate ?? validity?.fromDate ?? new Date();
  const effectiveDueDate =
    input.dueDate ??
    validity?.toDate ??
    new Date(input.year, input.month - 1, 10);

  // 2. Resolve fee structure
  const grade = await ctx.db.grades.findUnique({
    where: { classId: targetClassId },
  });

  let feeRecord = input.feeId
    ? await ctx.db.fees.findUnique({ where: { feeId: input.feeId } })
    : null;

  if (!feeRecord && grade) {
    feeRecord =
      (await ctx.db.fees.findFirst({
        where: { level: { equals: grade.grade, mode: "insensitive" } },
      })) ??
      (await ctx.db.fees.findFirst({
        where: { level: grade.category },
      })) ??
      (await ctx.db.fees.findFirst());
  }

  if (!feeRecord) {
    feeRecord = await ctx.db.fees.create({
      data: {
        level: grade?.grade ?? "Standard",
        tuitionFee: grade?.fee && grade.fee > 0 ? grade.fee : 4500,
        examFund: 500,
        studentIdCardFee: 500,
        infoAndCallsFee: 500,
        admissionFee: 5000,
      },
    });
  }

  // 3. Query all students enrolled in target class & session
  const studentClasses = await ctx.db.studentClass.findMany({
    where: {
      classId: targetClassId,
      sessionId: input.sessionId,
    },
    include: {
      Students: true,
    },
  });

  if (studentClasses.length === 0) {
    return {
      success: true,
      generatedCount: 0,
      skippedCount: 0,
      vouchers: [],
      message: "No students enrolled in the specified class and session.",
    };
  }

  let generatedCount = 0;
  let skippedCount = 0;
  const generatedVouchers: object[] = [];

  // 4. Batch generate vouchers for each student
  for (const sc of studentClasses) {
    // Check for existing regular voucher (parentVoucherId is null)
    const existing = await ctx.db.feeStudentClass.findFirst({
      where: {
        studentClassId: sc.scId,
        month: input.month,
        year: input.year,
        parentVoucherId: null,
      },
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    // Evaluate Arrears
    let arrears = 0;
    if (input.includeArrears !== false) {
      const priorUnpaidVouchers = await ctx.db.feeStudentClass.findMany({
        where: {
          StudentClass: {
            studentId: sc.studentId,
            sessionId: input.sessionId,
          },
          paymentStatus: {
            in: [PaymentStatus.PENDING, PaymentStatus.PARTIALLY_PAID, PaymentStatus.OVERDUE],
          },
          parentVoucherId: null,
          OR: [
            { year: { lt: input.year } },
            { year: input.year, month: { lt: input.month } },
          ],
        },
        include: { fees: true },
      });

      for (const pv of priorUnpaidVouchers) {
        const pvBase = calculateBaseFee(pv.fees);
        const pvDue = calculateNetPayable(pvBase, pv.discount, pv.adjustmentAmount, pv.lateFee);
        arrears += Math.max(0, pvDue - pv.amountPaid);
      }
    }

    // Attendance Concession Continuation Check
    let concessionCategory: ConcessionCategory = ConcessionCategory.NONE;
    let concessionAmount = 0;

    // Auto-detect sibling concession eligibility
    if (sc.Students.fatherCNIC && sc.Students.fatherCNIC !== "0000-0000000-0") {
      const siblingCount = await ctx.db.students.count({
        where: {
          fatherCNIC: sc.Students.fatherCNIC,
          StudentClass: { some: { sessionId: input.sessionId } },
        },
      });
      if (siblingCount > 1) {
        concessionCategory = ConcessionCategory.SIBLING_CONCESSION;
        concessionAmount = Math.round(feeRecord.tuitionFee * 0.2); // 20% standard sibling discount
      }
    }

    // Evaluate attendance if concession active
    if (concessionCategory !== ConcessionCategory.NONE) {
      const priorMonth = input.month === 1 ? 12 : input.month - 1;
      const priorMonthYear = input.month === 1 ? input.year - 1 : input.year;
      const monthPrefix = `${priorMonthYear}-${String(priorMonth).padStart(2, "0")}`;

      const attendanceRecords = await ctx.db.studentAttendance.findMany({
        where: {
          studentId: sc.studentId,
          sessionId: input.sessionId,
          date: { startsWith: monthPrefix },
        },
      });

      if (attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter((r: any) => r.status === "P" || r.status === "L").length;
        const rate = (presentCount / attendanceRecords.length) * 100;
        if (rate < 80) {
          concessionCategory = ConcessionCategory.SUSPENDED_LOW_ATTENDANCE;
          concessionAmount = 0;
        }
      }
    }

    const totalDiscount = concessionAmount;
    const voucherNumber = `VCH-${input.year}${String(input.month).padStart(2, "0")}-${sc.scId.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const createdVoucher = await ctx.db.feeStudentClass.create({
      data: {
        studentClassId: sc.scId,
        feeId: feeRecord.feeId,
        month: input.month,
        year: input.year,
        installmentNo,
        voucherNumber,
        voucherType: VoucherType.REGULAR_INSTALLMENT,
        issueDate: effectiveIssueDate,
        dueDate: effectiveDueDate,
        concessionCategory,
        concessionAmount,
        discount: totalDiscount,
        discountDescription:
          concessionCategory !== ConcessionCategory.NONE ? `Concession: ${concessionCategory}` : null,
        lateFee: input.fineAmount ?? 0,
        adjustmentAmount: arrears,
        adjustmentReason: arrears > 0 ? "Prior unpaid arrears carried forward" : null,
        paymentStatus: PaymentStatus.PENDING,
        amountPaid: 0,
        subInstallmentIndex: 1,
        totalSubInstallments: 1,
        isSplitLocked: false,
      },
    });

    generatedVouchers.push(createdVoucher);
    generatedCount++;
  }

  return {
    success: true,
    generatedCount,
    skippedCount,
    vouchers: generatedVouchers,
  };
}

async function executeSplitInstallment(ctx: any, input: SplitInput) {
  const targetSfcId = input.voucherId ?? input.sfcId;
  if (!targetSfcId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "voucherId or sfcId is required to split an installment.",
    });
  }

  const K = input.numberOfSplits ?? input.parts ?? 2;
  const dates = input.customDueDates ?? input.dueDates;

  return await ctx.db.$transaction(async (tx: any) => {
    const parent = await tx.feeStudentClass.findUnique({
      where: { sfcId: targetSfcId },
      include: { fees: true },
    });

    if (!parent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Target voucher for splitting was not found.",
      });
    }

    // Validation Guards
    if (parent.isSplitLocked) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Voucher is already split.",
      });
    }

    if (parent.amountPaid > 0 || parent.paymentStatus !== PaymentStatus.PENDING) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot split voucher that has already received partial or full payments.",
      });
    }

    if (parent.parentVoucherId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot split a sub-installment child voucher.",
      });
    }

    if (parent.paymentStatus === PaymentStatus.LOCKED_MERGED || parent.mergedIntoVoucherId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot split a voucher that has been consolidated into a merged challan.",
      });
    }

    // Calculate Net Payable P
    const baseFee = calculateBaseFee(parent.fees);
    const P = calculateNetPayable(baseFee, parent.discount, parent.adjustmentAmount, parent.lateFee);

    if (P <= 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot split a voucher with zero payable balance.",
      });
    }

    // Deterministic integer partitioning: floor(P / K) for 1..K-1, remainder on K
    const floorAmount = Math.floor(P / K);
    const childAmounts: number[] = [];
    let accumulated = 0;

    for (let i = 0; i < K - 1; i++) {
      childAmounts.push(floorAmount);
      accumulated += floorAmount;
    }
    childAmounts.push(P - accumulated);

    // Step 1: Update Parent voucher: isSplitLocked = true, subInstallmentIndex = 0
    // (Index 0 prevents unique constraint conflict on @@unique([studentClassId, feeId, month, year, subInstallmentIndex]))
    await tx.feeStudentClass.update({
      where: { sfcId: parent.sfcId },
      data: {
        isSplitLocked: true,
        subInstallmentIndex: 0,
        totalSubInstallments: K,
      },
    });

    // Step 2: Create K child vouchers with subInstallmentIndex = 1..K
    const subVouchers = [];
    for (let i = 0; i < K; i++) {
      const subIndex = i + 1;
      const childAmount = childAmounts[i]!;

      // Stagger due dates 15 days apart if custom dates not provided
      const childDueDate =
        dates && dates[i]
          ? dates[i]
          : new Date(parent.dueDate.getTime() + i * 15 * 24 * 60 * 60 * 1000);

      const childVoucherNumber = `${parent.voucherNumber}-S${subIndex}`;

      const childVoucher = await tx.feeStudentClass.create({
        data: {
          studentClassId: parent.studentClassId,
          feeId: parent.feeId,
          month: parent.month,
          year: parent.year,
          installmentNo: parent.installmentNo,
          voucherNumber: childVoucherNumber,
          voucherType: VoucherType.SUB_INSTALLMENT,
          parentVoucherId: parent.sfcId,
          subInstallmentIndex: subIndex,
          totalSubInstallments: K,
          isSplitLocked: false,
          issueDate: parent.issueDate,
          dueDate: childDueDate,
          concessionAmount: 0,
          exemptionAmount: 0,
          discount: 0,
          lateFee: 0,
          adjustmentAmount: childAmount - baseFee,
          adjustmentReason: `Sub-installment ${subIndex} of ${K} for voucher ${parent.voucherNumber}`,
          paymentStatus: PaymentStatus.PENDING,
          amountPaid: 0,
        },
      });

      subVouchers.push(childVoucher);
    }

    return {
      success: true,
      parentVoucherId: parent.sfcId,
      totalPayable: P,
      splitsCount: K,
      subVouchers,
    };
  });
}

async function executeRevertSplit(ctx: any, input: RevertInput) {
  const targetParentId = input.parentVoucherId ?? input.voucherId ?? input.sfcId;
  if (!targetParentId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "parentVoucherId or voucherId is required to revert a split.",
    });
  }

  return await ctx.db.$transaction(async (tx: any) => {
    const parent = await tx.feeStudentClass.findUnique({
      where: { sfcId: targetParentId },
      include: { subInstallments: true },
    });

    if (!parent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Parent voucher not found.",
      });
    }

    const children =
      parent.subInstallments.length > 0
        ? parent.subInstallments
        : await tx.feeStudentClass.findMany({
            where: { parentVoucherId: targetParentId },
          });

    if (children.length === 0 && !parent.isSplitLocked) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Voucher is not currently split.",
      });
    }

    // CRITICAL INVARIANT: Revert is ONLY permitted if all child vouchers have amountPaid == 0 and status PENDING
    const hasRecordedPayments = children.some(
      (c: any) => c.amountPaid > 0 || c.paymentStatus !== PaymentStatus.PENDING,
    );

    if (hasRecordedPayments) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot revert split: One or more sub-installments have already received payments.",
      });
    }

    // Delete all child sub-installment vouchers
    await tx.feeStudentClass.deleteMany({
      where: { parentVoucherId: targetParentId },
    });

    // Unlock parent voucher and restore default subInstallmentIndex = 1
    const restoredParent = await tx.feeStudentClass.update({
      where: { sfcId: targetParentId },
      data: {
        isSplitLocked: false,
        subInstallmentIndex: 1,
        totalSubInstallments: 1,
      },
    });

    return {
      success: true,
      message: "Sub-installment split successfully reverted.",
      parentVoucherId: restoredParent.sfcId,
      parentVoucher: restoredParent,
    };
  });
}

async function executeMergeVouchers(ctx: any, input: MergeInput) {
  return await ctx.db.$transaction(async (tx: any) => {
    const vouchers = await tx.feeStudentClass.findMany({
      where: { sfcId: { in: input.voucherIds } },
      include: { fees: true, StudentClass: true },
    });

    if (vouchers.length !== input.voucherIds.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "One or more vouchers selected for merging were not found.",
      });
    }

    // Validate all vouchers belong to the same student class
    const primaryStudentClassId = input.studentClassId ?? vouchers[0]?.studentClassId;
    const mismatchedStudent = vouchers.some(
      (v: any) => v.studentClassId !== primaryStudentClassId,
    );
    if (mismatchedStudent) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "All vouchers to merge must belong to the same student.",
      });
    }

    // Validate no voucher is settled, split, or already merged
    for (const v of vouchers) {
      if (v.paymentStatus === PaymentStatus.PAID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot merge already settled voucher: ${v.voucherNumber}.`,
        });
      }
      if (v.amountPaid > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot merge voucher ${v.voucherNumber} with partial payments.`,
        });
      }
      if (v.isSplitLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot merge split-locked voucher ${v.voucherNumber}.`,
        });
      }
      if (v.paymentStatus === PaymentStatus.LOCKED_MERGED || v.mergedIntoVoucherId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Voucher ${v.voucherNumber} is already merged into another challan.`,
        });
      }
    }

    // Aggregate amounts
    let totalBaseFee = 0;
    let totalLateFee = 0;
    let totalAdjustment = 0;
    let totalConcession = 0;
    let totalExemption = 0;
    let totalDiscount = 0;

    const months = vouchers.map((v: any) => v.month).sort((a: number, b: number) => a - b);
    let latestDueDate = vouchers[0]!.dueDate;

    for (const v of vouchers) {
      totalBaseFee += calculateBaseFee(v.fees);
      totalLateFee += v.lateFee;
      totalAdjustment += v.adjustmentAmount;
      totalConcession += v.concessionAmount;
      totalExemption += v.exemptionAmount;
      totalDiscount += v.discount;
      if (v.dueDate.getTime() > latestDueDate.getTime()) {
        latestDueDate = v.dueDate;
      }
    }

    const masterDueDate = input.dueDate ?? latestDueDate;
    const masterIssueDate = input.issueDate ?? new Date();
    const primaryVoucher = vouchers[0]!;
    const primaryBaseFee = calculateBaseFee(primaryVoucher.fees);
    const baseFeeDifferential = totalBaseFee - primaryBaseFee;

    const masterVoucherNumber = `MRG-${primaryVoucher.year}-${months.join("-")}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Master FULL_YEAR_MERGED voucher
    // subInstallmentIndex = 0 avoids unique constraint collision with constituent voucher 1
    const masterVoucher = await tx.feeStudentClass.create({
      data: {
        studentClassId: primaryStudentClassId!,
        feeId: primaryVoucher.feeId,
        month: primaryVoucher.month,
        year: primaryVoucher.year,
        installmentNo: primaryVoucher.installmentNo,
        voucherNumber: masterVoucherNumber,
        voucherType: VoucherType.FULL_YEAR_MERGED,
        issueDate: masterIssueDate,
        dueDate: masterDueDate,
        concessionAmount: totalConcession,
        exemptionAmount: totalExemption,
        discount: totalDiscount,
        discountDescription: `Consolidated merge of ${vouchers.length} vouchers (Months: ${months.join(", ")})`,
        lateFee: totalLateFee,
        adjustmentAmount: totalAdjustment + baseFeeDifferential,
        adjustmentReason: `Consolidation of vouchers: ${vouchers.map((v: any) => v.voucherNumber).join(", ")}`,
        paymentStatus: PaymentStatus.PENDING,
        amountPaid: 0,
        subInstallmentIndex: 0,
        totalSubInstallments: 1,
        isSplitLocked: false,
      },
    });

    // Lock constituent vouchers and link to master
    await tx.feeStudentClass.updateMany({
      where: { sfcId: { in: input.voucherIds } },
      data: {
        paymentStatus: PaymentStatus.LOCKED_MERGED,
        mergedIntoVoucherId: masterVoucher.sfcId,
      },
    });

    return {
      success: true,
      masterVoucherId: masterVoucher.sfcId,
      masterVoucher,
      mergedVoucherCount: vouchers.length,
    };
  });
}

// --- Router Definition ---

export const voucherRouter = createTRPCRouter({
  // =========================================================================
  // 1. GENERATE BATCH (AND ALIAS generateMonthlyVouchers)
  // =========================================================================
  generateBatch: clerkProcedure
    .input(generateBatchInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await executeGenerateBatch(ctx, input);
    }),

  generateMonthlyVouchers: clerkProcedure
    .input(generateBatchInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await executeGenerateBatch(ctx, input);
    }),

  // =========================================================================
  // 2. SPLIT INSTALLMENT (AND ALIAS splitVoucher)
  // =========================================================================
  splitInstallment: clerkProcedure
    .input(splitInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await executeSplitInstallment(ctx, input);
    }),

  splitVoucher: clerkProcedure
    .input(splitInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await executeSplitInstallment(ctx, input);
    }),

  // =========================================================================
  // 3. REVERT SPLIT (AND ALIAS revertVoucherSplit)
  // =========================================================================
  revertSplit: clerkProcedure
    .input(revertInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await executeRevertSplit(ctx, input);
    }),

  revertVoucherSplit: clerkProcedure
    .input(revertInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await executeRevertSplit(ctx, input);
    }),

  // =========================================================================
  // 4. MERGE VOUCHERS (AND ALIAS generateMergedChallan)
  // =========================================================================
  mergeVouchers: clerkProcedure
    .input(mergeInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await executeMergeVouchers(ctx, input);
    }),

  generateMergedChallan: clerkProcedure
    .input(mergeInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await executeMergeVouchers(ctx, input);
    }),

  // =========================================================================
  // 5. RECORD PAYMENT (IDEMPOTENT & CASCADING SETTLEMENT)
  // =========================================================================
  recordPayment: clerkProcedure
    .input(
      z.object({
        sfcId: z.string().optional(),
        voucherId: z.string().optional(),
        amount: z.number().positive(),
        paymentMode: z.string().optional(),
        paymentMethod: z.string().optional(),
        collectingBank: z.string().optional().default("CASH_COUNTER"),
        collectorName: z.string().optional(),
        receiptNumber: z.string().optional(),
        transactionId: z.string().optional(),
        transactionReference: z.string().optional(),
        paidAt: z.coerce.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const targetSfcId = input.sfcId ?? input.voucherId;
      if (!targetSfcId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "sfcId or voucherId is required to record a payment.",
        });
      }

      return await ctx.db.$transaction(async (tx: any) => {
        const voucher = await tx.feeStudentClass.findUnique({
          where: { sfcId: targetSfcId },
          include: { fees: true, StudentClass: true },
        });

        if (!voucher) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Target voucher not found.",
          });
        }

        // 1. Idempotency Guard: Rejection if already PAID
        if (voucher.paymentStatus === PaymentStatus.PAID) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Voucher has already been settled in full.",
          });
        }

        // 2. Lock Guards
        if (voucher.isSplitLocked) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent voucher is split-locked. Payments must be recorded on sub-installment child vouchers.",
          });
        }

        if (voucher.paymentStatus === PaymentStatus.LOCKED_MERGED) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Voucher is locked as part of a merged challan. Please record payment on the consolidated master voucher.",
          });
        }

        // 3. Compute payable and payment allocation
        const baseFee = calculateBaseFee(voucher.fees);
        const totalDue = calculateNetPayable(baseFee, voucher.discount, voucher.adjustmentAmount, voucher.lateFee);
        const newAmountPaid = voucher.amountPaid + input.amount;
        const isFullyPaid = newAmountPaid >= totalDue;
        const newPaymentStatus = isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID;
        const paymentTimestamp = input.paidAt ?? new Date();

        // 4. Resolve active session employee for audit
        const sessionEmployee = await getSessionEmployee(ctx);
        const collectorUserId = sessionEmployee?.employeeId ?? ctx.session?.user?.id ?? "SYSTEM";

        // 5. Append paymentHistory entry
        const historyEntry = {
          transactionId:
            input.transactionId ??
            input.transactionReference ??
            `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: input.amount,
          paymentMode: input.paymentMode ?? input.paymentMethod ?? "CASH",
          collectingBank: input.collectingBank ?? "CASH_COUNTER",
          collectorName: input.collectorName ?? sessionEmployee?.employeeName ?? "Cashier",
          confirmedByUserId: collectorUserId,
          receiptNumber: input.receiptNumber ?? `REC-${Date.now().toString().slice(-6)}`,
          timestamp: paymentTimestamp.toISOString(),
        };

        const existingHistory = Array.isArray(voucher.paymentHistory)
          ? (voucher.paymentHistory as object[])
          : [];
        const updatedHistory = [...existingHistory, historyEntry];

        // 6. Update target voucher
        const updatedVoucher = await tx.feeStudentClass.update({
          where: { sfcId: targetSfcId },
          data: {
            amountPaid: newAmountPaid,
            paymentStatus: newPaymentStatus,
            paidAt: isFullyPaid ? paymentTimestamp : voucher.paidAt,
            tuitionPaid: isFullyPaid ? true : voucher.tuitionPaid,
            examFundPaid: isFullyPaid ? true : voucher.examFundPaid,
            computerLabPaid: isFullyPaid ? true : voucher.computerLabPaid,
            studentIdCardPaid: isFullyPaid ? true : voucher.studentIdCardPaid,
            infoAndCallsPaid: isFullyPaid ? true : voucher.infoAndCallsPaid,
            admissionFeePaid: isFullyPaid ? true : voucher.admissionFeePaid,
            confirmedByUserId: collectorUserId,
            collectingBank: input.collectingBank ?? voucher.collectingBank,
            collectorName: input.collectorName ?? voucher.collectorName,
            paymentHistory: updatedHistory,
          },
        });

        // 7. Cascading settlement for consolidated merged vouchers (FULL_YEAR_MERGED)
        let cascadedVouchersCount = 0;
        if (voucher.voucherType === VoucherType.FULL_YEAR_MERGED && isFullyPaid) {
          const constituents = await tx.feeStudentClass.findMany({
            where: { mergedIntoVoucherId: voucher.sfcId },
            include: { fees: true },
          });

          for (const child of constituents) {
            const childBase = calculateBaseFee(child.fees);
            const childDue = calculateNetPayable(childBase, child.discount, child.adjustmentAmount, child.lateFee);

            const childHistory = Array.isArray(child.paymentHistory)
              ? (child.paymentHistory as object[])
              : [];
            childHistory.push({
              ...historyEntry,
              notes: `Cascaded settlement via consolidated merged voucher ${voucher.voucherNumber}`,
              amount: childDue,
            });

            await tx.feeStudentClass.update({
              where: { sfcId: child.sfcId },
              data: {
                paymentStatus: PaymentStatus.PAID,
                amountPaid: childDue,
                paidAt: paymentTimestamp,
                tuitionPaid: true,
                examFundPaid: true,
                computerLabPaid: true,
                studentIdCardPaid: true,
                infoAndCallsPaid: true,
                admissionFeePaid: true,
                confirmedByUserId: collectorUserId,
                collectingBank: input.collectingBank ?? voucher.collectingBank,
                collectorName: input.collectorName ?? voucher.collectorName,
                paymentHistory: childHistory,
              },
            });
            cascadedVouchersCount++;
          }
        }

        // 8. Automated FinancialLedgerEntry Double-Entry Posting
        let ledgerAuthor = sessionEmployee?.employeeId;
        if (!ledgerAuthor) {
          const fallback = await tx.employees.findFirst({ select: { employeeId: true } });
          ledgerAuthor = fallback?.employeeId;
        }

        if (ledgerAuthor) {
          const bankAccount = input.collectingBank === "CASH_COUNTER" ? "1010-CASH" : "1020-BANK";
          // DEBIT: Asset (Cash / Bank)
          await tx.financialLedgerEntry.create({
            data: {
              entryType: "DEBIT",
              accountType: "Asset",
              accountCode: bankAccount,
              amount: input.amount,
              description: `Fee collection for voucher ${voucher.voucherNumber} (${input.collectingBank ?? "CASH_COUNTER"})`,
              sourceType: "FEE",
              sourceId: voucher.sfcId,
              createdBy: ledgerAuthor,
            },
          });

          // CREDIT: Revenue (Tuition Fee Revenue)
          await tx.financialLedgerEntry.create({
            data: {
              entryType: "CREDIT",
              accountType: "Income",
              accountCode: "4010-TUITION-FEE",
              amount: input.amount,
              description: `Fee revenue recognized for voucher ${voucher.voucherNumber}`,
              sourceType: "FEE",
              sourceId: voucher.sfcId,
              createdBy: ledgerAuthor,
            },
          });
        }

        return {
          success: true,
          sfcId: updatedVoucher.sfcId,
          amountPaid: updatedVoucher.amountPaid,
          paymentStatus: updatedVoucher.paymentStatus,
          isFullyPaid,
          cascadedVouchersCount,
          voucher: updatedVoucher,
        };
      });
    }),

  // =========================================================================
  // 6. CANCEL VOUCHER (SOFT REVOCATION)
  // =========================================================================
  cancelVoucher: managementProcedure
    .input(
      z.object({
        voucherId: z.string().optional(),
        sfcId: z.string().optional(),
        cancellationReason: z.string().min(3).optional(),
        reason: z.string().min(3).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const targetSfcId = input.voucherId ?? input.sfcId;
      const reason = input.cancellationReason ?? input.reason ?? "Administrative cancellation";

      if (!targetSfcId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "voucherId or sfcId is required to cancel a voucher.",
        });
      }

      const voucher = await ctx.db.feeStudentClass.findUnique({
        where: { sfcId: targetSfcId },
      });

      if (!voucher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voucher not found.",
        });
      }

      if (voucher.paymentStatus === PaymentStatus.PAID || voucher.amountPaid > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot cancel voucher with recorded payments.",
        });
      }

      if (voucher.isSplitLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot cancel a split-locked parent voucher. Revert the split first.",
        });
      }

      const updated = await ctx.db.feeStudentClass.update({
        where: { sfcId: targetSfcId },
        data: {
          paymentStatus: PaymentStatus.CANCELLED,
          adjustmentReason: `Cancelled: ${reason}`,
        },
      });

      return {
        success: true,
        sfcId: updated.sfcId,
        paymentStatus: updated.paymentStatus,
        message: "Voucher successfully cancelled.",
      };
    }),

  // =========================================================================
  // 7. QUERY PROCEDURES
  // =========================================================================
  getVouchers: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        classId: z.string().optional(),
        gradeId: z.string().optional(),
        month: z.number().int().min(1).max(12).optional(),
        year: z.number().int().optional(),
        installmentNo: z.number().int().optional(),
        paymentStatus: z.nativeEnum(PaymentStatus).optional(),
        voucherType: z.nativeEnum(VoucherType).optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1).optional(),
        pageSize: z.number().int().min(1).max(100).default(20).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const take = input.limit ?? input.pageSize ?? 20;
      const skip = ((input.page ?? 1) - 1) * take;
      const targetClassId = input.classId ?? input.gradeId;

      const where: Prisma.FeeStudentClassWhereInput = {};

      if (input.month) where.month = input.month;
      if (input.year) where.year = input.year;
      if (input.installmentNo) where.installmentNo = input.installmentNo;
      if (input.paymentStatus) where.paymentStatus = input.paymentStatus;
      if (input.voucherType) where.voucherType = input.voucherType;

      if (input.sessionId || targetClassId || input.search) {
        where.StudentClass = {};
        if (input.sessionId) where.StudentClass.sessionId = input.sessionId;
        if (targetClassId) where.StudentClass.classId = targetClassId;

        if (input.search) {
          where.OR = [
            { voucherNumber: { contains: input.search, mode: "insensitive" } },
            {
              StudentClass: {
                Students: {
                  OR: [
                    { studentName: { contains: input.search, mode: "insensitive" } },
                    { registrationNumber: { contains: input.search, mode: "insensitive" } },
                    { admissionNumber: { contains: input.search, mode: "insensitive" } },
                  ],
                },
              },
            },
          ];
        }
      }

      const [items, total] = await Promise.all([
        ctx.db.feeStudentClass.findMany({
          where,
          include: {
            fees: true,
            StudentClass: {
              include: {
                Students: true,
                Grades: true,
                Sessions: true,
              },
            },
            subInstallments: true,
            parentVoucher: true,
          },
          orderBy: { createdAt: "desc" },
          take,
          skip,
        }),
        ctx.db.feeStudentClass.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page ?? 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      };
    }),

  getVoucherById: protectedProcedure
    .input(
      z.object({
        voucherId: z.string().optional(),
        sfcId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const targetId = input.voucherId ?? input.sfcId;
      if (!targetId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "voucherId or sfcId is required.",
        });
      }

      const voucher = await ctx.db.feeStudentClass.findUnique({
        where: { sfcId: targetId },
        include: {
          fees: true,
          StudentClass: {
            include: {
              Students: true,
              Grades: true,
              Sessions: true,
            },
          },
          subInstallments: {
            orderBy: { subInstallmentIndex: "asc" },
          },
          parentVoucher: true,
        },
      });

      if (!voucher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voucher not found.",
        });
      }

      return voucher;
    }),

  getVoucherPrintData: protectedProcedure
    .input(
      z.object({
        voucherId: z.string().optional(),
        sfcId: z.string().optional(),
        voucherIds: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ids: string[] = [];
      if (input.voucherIds && input.voucherIds.length > 0) {
        ids.push(...input.voucherIds);
      } else if (input.voucherId ?? input.sfcId) {
        ids.push((input.voucherId ?? input.sfcId)!);
      }

      if (ids.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "voucherId, sfcId, or voucherIds must be supplied.",
        });
      }

      const [vouchers, bankDetails] = await Promise.all([
        ctx.db.feeStudentClass.findMany({
          where: { sfcId: { in: ids } },
          include: {
            fees: true,
            StudentClass: {
              include: {
                Students: true,
                Grades: true,
                Sessions: true,
              },
            },
          },
        }),
        ctx.db.schoolBankDetails.findMany({
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        }),
      ]);

      const effectiveBankDetails =
        bankDetails.length > 0
          ? bankDetails
          : [
              {
                bankId: "default-bank",
                bankName: "Meezan Bank Limited",
                accountTitle: "M. S. Naz High School",
                accountNumber: "02130104859682",
                iban: "PK45MEZN0002130104859682",
                branchCode: "0213",
                branchName: "Ghakhar Mandi Branch",
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];

      const printItems = vouchers.map((v: any) => {
        const student = v.StudentClass.Students;
        const grade = v.StudentClass.Grades;
        const session = v.StudentClass.Sessions;
        const fee = v.fees;

        const baseFee = calculateBaseFee(fee);
        const netPayableBeforeDue = calculateNetPayable(
          baseFee,
          v.discount,
          v.adjustmentAmount,
          0,
        );
        const netPayableAfterDue = netPayableBeforeDue + (v.lateFee > 0 ? v.lateFee : 300);

        const qrPayload = JSON.stringify({
          v: v.voucherNumber,
          reg: student.registrationNumber,
          amt: netPayableBeforeDue,
          due: v.dueDate.toISOString().slice(0, 10),
          type: v.voucherType,
        });

        return {
          sfcId: v.sfcId,
          voucherNumber: v.voucherNumber,
          voucherType: v.voucherType,
          installmentNo: v.installmentNo,
          month: v.month,
          year: v.year,
          issueDate: v.issueDate,
          dueDate: v.dueDate,
          student: {
            studentId: student.studentId,
            studentName: student.studentName,
            registrationNumber: student.registrationNumber,
            admissionNumber: student.admissionNumber,
            fatherName: student.fatherName,
            rollNumber: student.admissionNumber,
          },
          grade: {
            grade: grade.grade,
            section: grade.section,
            category: grade.category,
          },
          session: {
            sessionName: session.sessionName,
          },
          breakdown: {
            tuitionFee: fee.tuitionFee,
            examFund: fee.examFund,
            computerLabFund: fee.computerLabFund ?? 0,
            studentIdCardFee: fee.studentIdCardFee,
            infoAndCallsFee: fee.infoAndCallsFee,
            admissionFee: fee.type === "MonthlyFee" ? 0 : fee.admissionFee,
            arrears: v.adjustmentAmount > 0 ? v.adjustmentAmount : 0,
            concessionCategory: v.concessionCategory,
            concessionAmount: v.concessionAmount,
            exemptionAmount: v.exemptionAmount,
            totalDiscount: v.discount,
            lateFee: v.lateFee,
            netPayableBeforeDue,
            netPayableAfterDue,
            amountPaid: v.amountPaid,
            outstandingBalance: Math.max(0, netPayableBeforeDue - v.amountPaid),
            paymentStatus: v.paymentStatus,
          },
          qrPayload,
          bankDetails: effectiveBankDetails,
        };
      });

      if (input.voucherIds && input.voucherIds.length > 0) {
        return {
          vouchers: printItems,
          bankDetails: effectiveBankDetails,
        };
      }

      return printItems[0]!;
    }),
});
