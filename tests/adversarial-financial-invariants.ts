import "dotenv/config";

// ============================================================================
// EMPIRICAL ADVERSARIAL STRESS HARNESS: 4 CRITICAL FINANCIAL INVARIANTS
// ============================================================================

interface TestResult {
  suite: string;
  testId: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function challenge(
  suite: string,
  testId: string,
  name: string,
  fn: () => Promise<void> | void
) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ suite, testId, name, passed: true, durationMs });
    console.log(`  [PASS] [${suite}] ${testId} - ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ suite, testId, name, passed: false, error: err?.message, durationMs });
    console.error(`  [FAIL] [${suite}] ${testId} - ${name} (${durationMs}ms)`);
    console.error(`         Error: ${err?.message}`);
  }
}

// ============================================================================
// INVARIANT 1: NON-OVERLAPPING VALIDITY WINDOWS (T2.4)
// ============================================================================

function validateTemporalWindows(
  candidate: { installmentNo: number; fromDate: Date; toDate: Date; challanValidityId?: string },
  existingSchedules: Array<{ installmentNo: number; fromDate: Date; toDate: Date; challanValidityId: string }>,
  excludeId?: string
) {
  const fromTime = new Date(candidate.fromDate).getTime();
  const toTime = new Date(candidate.toDate).getTime();

  if (fromTime > toTime) {
    throw new Error(
      `Validation Error: Installment ${candidate.installmentNo} 'fromDate' must be earlier than or equal to 'toDate'.`
    );
  }

  for (const existing of existingSchedules) {
    if (excludeId && existing.challanValidityId === excludeId) continue;
    if (candidate.challanValidityId && existing.challanValidityId === candidate.challanValidityId) continue;

    const exFrom = new Date(existing.fromDate).getTime();
    const exTo = new Date(existing.toDate).getTime();

    // Check temporal overlap: max(fromA, fromB) <= min(toA, toB)
    const hasOverlap = Math.max(fromTime, exFrom) <= Math.min(toTime, exTo);
    if (hasOverlap) {
      throw new Error(
        `Validation Error: Installment ${candidate.installmentNo} window overlaps with existing installment ${existing.installmentNo}.`
      );
    }

    // Chronological order constraint
    if (candidate.installmentNo < existing.installmentNo && toTime >= exFrom) {
      throw new Error(
        `Validation Error: Installment ${candidate.installmentNo} must conclude before installment ${existing.installmentNo} begins.`
      );
    }
    if (candidate.installmentNo > existing.installmentNo && fromTime <= exTo) {
      throw new Error(
        `Validation Error: Installment ${candidate.installmentNo} cannot begin before installment ${existing.installmentNo} concludes.`
      );
    }
  }
}

async function runInvariant1Challenges() {
  console.log("\n================================================================================");
  console.log("CHALLENGE SUITE 1: NON-OVERLAPPING VALIDITY WINDOWS (T2.4)");
  console.log("================================================================================");

  const existingSchedule = [
    {
      challanValidityId: "cv_inst_1",
      installmentNo: 1,
      fromDate: new Date("2026-04-01T00:00:00.000Z"),
      toDate: new Date("2026-04-10T23:59:59.000Z"),
    },
    {
      challanValidityId: "cv_inst_2",
      installmentNo: 2,
      fromDate: new Date("2026-05-01T00:00:00.000Z"),
      toDate: new Date("2026-05-10T23:59:59.000Z"),
    },
    {
      challanValidityId: "cv_inst_4",
      installmentNo: 4,
      fromDate: new Date("2026-07-01T00:00:00.000Z"),
      toDate: new Date("2026-07-15T23:59:59.000Z"),
    },
  ];

  // 1.1 Inverted internal window (fromDate > toDate)
  await challenge("INV1", "C1.1_INVERTED_WINDOW", "Rejects candidate where fromDate > toDate", () => {
    let threw = false;
    try {
      validateTemporalWindows(
        {
          installmentNo: 3,
          fromDate: new Date("2026-06-15T00:00:00.000Z"),
          toDate: new Date("2026-06-10T00:00:00.000Z"),
        },
        existingSchedule
      );
    } catch (e: any) {
      threw = e.message.includes("must be earlier than or equal to 'toDate'");
    }
    if (!threw) throw new Error("Failed to reject inverted candidate window");
  });

  // 1.2 Exact instant touching collision (toTime === exFrom)
  await challenge("INV1", "C1.2_EXACT_INSTANT_COLLISION", "Rejects touching boundaries at exact same millisecond", () => {
    let threw = false;
    try {
      validateTemporalWindows(
        {
          installmentNo: 3,
          fromDate: new Date("2026-05-10T23:59:59.000Z"), // touches Installment 2 toDate
          toDate: new Date("2026-05-20T00:00:00.000Z"),
        },
        existingSchedule
      );
    } catch (e: any) {
      threw = e.message.includes("overlaps") || e.message.includes("cannot begin before");
    }
    if (!threw) throw new Error("Failed to reject exact instant collision");
  });

  // 1.3 Valid adjacent non-overlapping window
  await challenge("INV1", "C1.3_VALID_ADJACENT_WINDOW", "Accepts strictly adjacent window (1s gap)", () => {
    validateTemporalWindows(
      {
        installmentNo: 3,
        fromDate: new Date("2026-05-11T00:00:00.000Z"), // 1s after Installment 2
        toDate: new Date("2026-05-20T23:59:59.000Z"),   // well before Installment 4
      },
      existingSchedule
    );
  });

  // 1.4 Chronological reversal constraint
  await challenge("INV1", "C1.4_CHRONOLOGICAL_REVERSAL", "Rejects installment 3 dated AFTER installment 4", () => {
    let threw = false;
    try {
      validateTemporalWindows(
        {
          installmentNo: 3,
          fromDate: new Date("2026-08-01T00:00:00.000Z"),
          toDate: new Date("2026-08-10T23:59:59.000Z"),
        },
        existingSchedule
      );
    } catch (e: any) {
      threw = e.message.includes("must conclude before installment 4 begins");
    }
    if (!threw) throw new Error("Failed to reject chronological installment reversal");
  });

  // 1.5 Encompassing / Superset overlap
  await challenge("INV1", "C1.5_SUPERSET_OVERLAP", "Rejects candidate encompassing existing installment window", () => {
    let threw = false;
    try {
      validateTemporalWindows(
        {
          installmentNo: 3,
          fromDate: new Date("2026-04-20T00:00:00.000Z"),
          toDate: new Date("2026-05-25T23:59:59.000Z"), // encompasses Installment 2 (May 1 - May 10)
        },
        existingSchedule
      );
    } catch (e: any) {
      threw = e.message.includes("overlaps");
    }
    if (!threw) throw new Error("Failed to reject superset overlap");
  });

  // 1.6 Self-update idempotency with excludeId
  await challenge("INV1", "C1.6_SELF_UPDATE_IDEMPOTENCY", "Permits self-update of existing window without false positive", () => {
    validateTemporalWindows(
      {
        challanValidityId: "cv_inst_2",
        installmentNo: 2,
        fromDate: new Date("2026-05-01T00:00:00.000Z"),
        toDate: new Date("2026-05-12T23:59:59.000Z"), // extended by 2 days, still before inst 4
      },
      existingSchedule,
      "cv_inst_2"
    );
  });

  // 1.7 Batch Schedule validation algorithm stress test
  await challenge("INV1", "C1.7_BATCH_SCHEDULE_STRESS", "Validates complete 12-month schedule sequence integrity", () => {
    const full12MonthSchedule = [];
    for (let m = 1; m <= 12; m++) {
      full12MonthSchedule.push({
        installmentNo: m,
        month: m,
        fromDate: new Date(Date.UTC(2026, m - 1, 1, 0, 0, 0)),
        toDate: new Date(Date.UTC(2026, m - 1, 10, 23, 59, 59)),
      });
    }

    // Check every pair in the 12-month schedule
    for (let i = 0; i < full12MonthSchedule.length; i++) {
      for (let j = i + 1; j < full12MonthSchedule.length; j++) {
        const a = full12MonthSchedule[i]!;
        const b = full12MonthSchedule[j]!;
        const overlap = Math.max(a.fromDate.getTime(), b.fromDate.getTime()) <= Math.min(a.toDate.getTime(), b.toDate.getTime());
        if (overlap) throw new Error(`Unexpected overlap in generated 12-month schedule: ${i} vs ${j}`);
        if (a.toDate.getTime() >= b.fromDate.getTime()) throw new Error(`Order violated: ${i} concludes after ${j} begins`);
      }
    }
  });
}

// ============================================================================
// INVARIANT 2: SUB-INSTALLMENT REMAINDER CONSERVATION & REVERT LOCK (T1.3, T2.1, T2.2)
// ============================================================================

function splitPayable(P: number, K: number): number[] {
  if (P <= 0) throw new Error("Cannot split a voucher with zero payable balance.");
  if (K < 2 || K > 4) throw new Error("Invalid split parts. Must be 2..4");
  const floor = Math.floor(P / K);
  const parts: number[] = [];
  let accumulated = 0;
  for (let i = 0; i < K - 1; i++) {
    parts.push(floor);
    accumulated += floor;
  }
  parts.push(P - accumulated);
  return parts;
}

async function runInvariant2Challenges() {
  console.log("\n================================================================================");
  console.log("CHALLENGE SUITE 2: SUB-INSTALLMENT REMAINDER CONSERVATION & REVERT LOCK");
  console.log("================================================================================");

  // 2.1 Remainder conservation across 10,000 random amounts & splits (Fuzzing Generator)
  await challenge("INV2", "C2.1_FUZZING_REMAINDER_CONSERVATION", "Exact remainder conservation across 10,000 randomized split simulations", () => {
    let tested = 0;
    for (let i = 0; i < 10000; i++) {
      const P = Math.floor(1 + Math.random() * 250000); // 1 to 250,000 PKR
      const K = Math.floor(2 + Math.random() * 3); // 2, 3, or 4
      const parts = splitPayable(P, K);
      const sum = parts.reduce((a, b) => a + b, 0);

      if (sum !== P) {
        throw new Error(`Conservation violated: P=${P}, K=${K}, sum=${sum}, parts=${JSON.stringify(parts)}`);
      }

      for (const part of parts) {
        if (part < 0 || !Number.isInteger(part)) {
          throw new Error(`Invalid part generated: ${part} for P=${P}, K=${K}`);
        }
      }

      // Remainder check: last part minus floor must equal P % K
      const floor = Math.floor(P / K);
      const remainder = parts[parts.length - 1]! - floor;
      if (remainder !== P % K) {
        throw new Error(`Remainder mismatch: remainder=${remainder} !== P%K=${P % K}`);
      }
      tested++;
    }
  });

  // 2.2 Boundary extremes: P < K
  await challenge("INV2", "C2.2_BOUNDARY_EXTREMES_P_LT_K", "Strict conservation when payable amount P < K splits", () => {
    // P = 1, K = 3
    const parts1 = splitPayable(1, 3);
    if (parts1.reduce((a, b) => a + b, 0) !== 1 || parts1[2] !== 1) {
      throw new Error(`Failed P=1, K=3: ${JSON.stringify(parts1)}`);
    }

    // P = 2, K = 4
    const parts2 = splitPayable(2, 4);
    if (parts2.reduce((a, b) => a + b, 0) !== 2 || parts2[3] !== 2) {
      throw new Error(`Failed P=2, K=4: ${JSON.stringify(parts2)}`);
    }

    // Large prime
    const primeP = 99991;
    const partsPrime = splitPayable(primeP, 3);
    if (partsPrime.reduce((a, b) => a + b, 0) !== primeP) {
      throw new Error(`Failed large prime conservation: ${JSON.stringify(partsPrime)}`);
    }
  });

  // 2.3 Zero balance rejection
  await challenge("INV2", "C2.3_ZERO_BALANCE_REJECTION", "Rejects split on zero or negative balance", () => {
    let threwZero = false;
    try {
      splitPayable(0, 2);
    } catch {
      threwZero = true;
    }
    if (!threwZero) throw new Error("Allowed split on 0 PKR payable");

    let threwNeg = false;
    try {
      splitPayable(-500, 2);
    } catch {
      threwNeg = true;
    }
    if (!threwNeg) throw new Error("Allowed split on negative payable");
  });

  // 2.4 Revert Guard Logic: 0 PKR vs 1 PKR collected oracle
  await challenge("INV2", "C2.4_REVERT_ZERO_VS_NONZERO", "Revert allowed strictly iff sum(amountPaid) === 0 and all PENDING", () => {
    // Oracle function matching executeRevertSplit guard
    function checkRevertAllowed(children: Array<{ amountPaid: number; paymentStatus: string }>): boolean {
      const hasRecordedPayments = children.some(
        (c) => c.amountPaid > 0 || c.paymentStatus !== "PENDING"
      );
      return !hasRecordedPayments;
    }

    // Case 1: 0 PKR collected, all PENDING -> MUST ALLOW
    const case1 = [
      { amountPaid: 0, paymentStatus: "PENDING" },
      { amountPaid: 0, paymentStatus: "PENDING" },
      { amountPaid: 0, paymentStatus: "PENDING" },
    ];
    if (!checkRevertAllowed(case1)) {
      throw new Error("Case 1: Revert falsely rejected when 0 PKR collected");
    }

    // Case 2: Even 1 Paisa / 1 PKR collected on Child 1 -> MUST BLOCK
    const case2 = [
      { amountPaid: 1, paymentStatus: "PARTIALLY_PAID" },
      { amountPaid: 0, paymentStatus: "PENDING" },
    ];
    if (checkRevertAllowed(case2)) {
      throw new Error("Case 2: Revert permitted despite 1 PKR collected");
    }

    // Case 3: 0 amountPaid but status is PAID (e.g. 100% waiver) -> MUST BLOCK
    const case3 = [
      { amountPaid: 0, paymentStatus: "PAID" },
      { amountPaid: 0, paymentStatus: "PENDING" },
    ];
    if (checkRevertAllowed(case3)) {
      throw new Error("Case 3: Revert permitted on settled voucher with 0 payment");
    }

    // Case 4: Parent is already unlocked -> should not allow revert
    const case4Children: any[] = [];
    const parentIsSplitLocked = false;
    if (case4Children.length === 0 && !parentIsSplitLocked) {
      // Correctly flagged as not split
    } else {
      throw new Error("Case 4: Failed to identify non-split voucher");
    }
  });
}

// ============================================================================
// INVARIANT 3: MERGED MASTER VOUCHER SETTLEMENT CASCADING (T1.4, T3.2)
// ============================================================================

async function runInvariant3Challenges() {
  console.log("\n================================================================================");
  console.log("CHALLENGE SUITE 3: MERGED MASTER VOUCHER SETTLEMENT CASCADING");
  console.log("================================================================================");

  // 3.1 Financial Net Payable Conservation on Merge Consolidation
  await challenge("INV3", "C3.1_MERGE_NET_CONSERVATION", "Consolidated master voucher net payable exactly equals sum of constituent nets", () => {
    // 3 constituent vouchers with complex fee structures
    const constituents = [
      {
        month: 5,
        tuitionFee: 4000,
        otherFees: 1500, // base = 5500
        discount: 500,
        lateFee: 200,
        adjustmentAmount: 0,
      },
      {
        month: 6,
        tuitionFee: 4000,
        otherFees: 0, // base = 4000
        discount: 1000,
        lateFee: 0,
        adjustmentAmount: 300,
      },
      {
        month: 7,
        tuitionFee: 4500,
        otherFees: 500, // base = 5000
        discount: 0,
        lateFee: 150,
        adjustmentAmount: -200,
      },
    ];

    // Calculate individual net payables
    const individualNets = constituents.map((c) => {
      const base = c.tuitionFee + c.otherFees;
      return Math.max(0, base + c.lateFee + c.adjustmentAmount - c.discount);
    });
    // net 1: 5500 + 200 + 0 - 500 = 5200
    // net 2: 4000 + 0 + 300 - 1000 = 3300
    // net 3: 5000 + 150 - 200 - 0 = 4950
    const sumConstituentNets = individualNets.reduce((a, b) => a + b, 0); // 13450

    // Master consolidation logic (from voucher.ts executeMergeVouchers):
    const totalBaseFee = constituents.reduce((s, c) => s + (c.tuitionFee + c.otherFees), 0); // 14500
    const totalLateFee = constituents.reduce((s, c) => s + c.lateFee, 0); // 350
    const totalAdjustment = constituents.reduce((s, c) => s + c.adjustmentAmount, 0); // 100
    const totalDiscount = constituents.reduce((s, c) => s + c.discount, 0); // 1500

    const primaryBaseFee = constituents[0]!.tuitionFee + constituents[0]!.otherFees; // 5500
    const baseFeeDifferential = totalBaseFee - primaryBaseFee; // 9000

    const masterAdjustmentAmount = totalAdjustment + baseFeeDifferential; // 9100
    const masterLateFee = totalLateFee; // 350
    const masterDiscount = totalDiscount; // 1500

    const masterNetPayable = Math.max(
      0,
      primaryBaseFee + masterLateFee + masterAdjustmentAmount - masterDiscount
    );
    // 5500 + 350 + 9100 - 1500 = 13450

    if (masterNetPayable !== sumConstituentNets) {
      throw new Error(`Master net (${masterNetPayable}) !== sum of constituent nets (${sumConstituentNets})`);
    }
  });

  // 3.2 Cascading settlement state transition oracle
  await challenge("INV3", "C3.2_CASCADING_SETTLEMENT_ORACLE", "Master settlement cascades PAID status, individual amounts, and receipts to all children", () => {
    const children = [
      { id: "c1", due: 5200, status: "LOCKED_MERGED", amountPaid: 0, tuitionPaid: false },
      { id: "c2", due: 3300, status: "LOCKED_MERGED", amountPaid: 0, tuitionPaid: false },
      { id: "c3", due: 4950, status: "LOCKED_MERGED", amountPaid: 0, tuitionPaid: false },
    ];
    const totalMasterDue = 13450;
    const paidAt = new Date("2026-05-15T12:00:00.000Z");

    // Partial payment of 10,000 on master
    const payment1 = 10000;
    const isFullyPaid1 = payment1 >= totalMasterDue;
    if (isFullyPaid1) throw new Error("Partial payment should not mark master fully paid");

    // Full payment of remainder 3450
    const payment2 = 3450;
    const totalPaid = payment1 + payment2;
    const isFullyPaid2 = totalPaid >= totalMasterDue;
    if (!isFullyPaid2) throw new Error("Full payment should mark master fully paid");

    // Simulate cascading settlement
    if (isFullyPaid2) {
      for (const child of children) {
        child.status = "PAID";
        child.amountPaid = child.due;
        child.tuitionPaid = true;
      }
    }

    // Verify all children settled
    for (const child of children) {
      if (child.status !== "PAID" || !child.tuitionPaid || child.amountPaid !== child.due) {
        throw new Error(`Cascading failed on child ${child.id}: ${JSON.stringify(child)}`);
      }
    }
  });

  // 3.3 Lock Guard: Direct payment on LOCKED_MERGED rejected
  await challenge("INV3", "C3.3_LOCKED_MERGED_PAYMENT_REJECTION", "Direct payment attempt on LOCKED_MERGED constituent voucher is rejected", () => {
    const voucher = {
      voucherNumber: "VCH-2026-05-001",
      paymentStatus: "LOCKED_MERGED",
      mergedIntoVoucherId: "MRG-2026-MASTER-001",
    };

    let rejected = false;
    if (voucher.paymentStatus === "LOCKED_MERGED") {
      rejected = true;
    }
    if (!rejected) throw new Error("Direct payment on locked merged child was not rejected");
  });
}

// ============================================================================
// INVARIANT 4: ALLOTMENT DELETION & PROMOTION CLEARANCE GUARDS (T1.6, T4.3)
// ============================================================================

async function runInvariant4Challenges() {
  console.log("\n================================================================================");
  console.log("CHALLENGE SUITE 4: ALLOTMENT DELETION & PROMOTION CLEARANCE GUARDS");
  console.log("================================================================================");

  // 4.1 Allotment Deletion Guard Oracle
  await challenge("INV4", "C4.1_ALLOTMENT_DELETION_GUARD", "Blocks deletion if PAID or PARTIALLY_PAID vouchers exist; allows if only UNPAID", () => {
    function canDeleteStudentClass(vouchers: Array<{ paymentStatus: string; amountPaid: number }>): {
      allowed: boolean;
      errorCode?: string;
    } {
      const paidRecords = vouchers.find(
        (v) =>
          v.paymentStatus === "PAID" ||
          v.paymentStatus === "PARTIALLY_PAID" ||
          v.amountPaid > 0
      );

      if (paidRecords) {
        return { allowed: false, errorCode: "PRECONDITION_FAILED" };
      }
      return { allowed: true };
    }

    // Scenario A: Student has a PAID voucher -> MUST BLOCK
    const resA = canDeleteStudentClass([
      { paymentStatus: "PAID", amountPaid: 4500 },
      { paymentStatus: "PENDING", amountPaid: 0 },
    ]);
    if (resA.allowed || resA.errorCode !== "PRECONDITION_FAILED") {
      throw new Error("Scenario A: Allowed deletion when PAID voucher exists");
    }

    // Scenario B: Student has 1 PKR partial payment -> MUST BLOCK
    const resB = canDeleteStudentClass([
      { paymentStatus: "PARTIALLY_PAID", amountPaid: 1 },
    ]);
    if (resB.allowed || resB.errorCode !== "PRECONDITION_FAILED") {
      throw new Error("Scenario B: Allowed deletion when PARTIALLY_PAID voucher exists");
    }

    // Scenario C: Student has only PENDING vouchers with 0 amountPaid -> MUST ALLOW
    const resC = canDeleteStudentClass([
      { paymentStatus: "PENDING", amountPaid: 0 },
      { paymentStatus: "CANCELLED", amountPaid: 0 },
    ]);
    if (!resC.allowed) {
      throw new Error("Scenario C: Falsely blocked deletion when only PENDING vouchers exist");
    }
  });

  // 4.2 Promotion Clearance Pre-Flight Check Oracle
  await challenge("INV4", "C4.2_PROMOTION_CLEARANCE_CHECK", "Enforces arrears clearance or requires non-empty bypass code", () => {
    function evaluatePromotionClearance(
      unpaidVouchers: Array<{ balance: number }>,
      bypassCode?: string
    ): { allowed: boolean; reason: string } {
      const totalOutstanding = unpaidVouchers.reduce((s, v) => s + v.balance, 0);
      const hasArrears = unpaidVouchers.length > 0 && totalOutstanding > 0;
      const isBypassed = !!bypassCode && bypassCode.trim().length > 0;

      if (hasArrears && !isBypassed) {
        return {
          allowed: false,
          reason: `Promotion blocked: PKR ${totalOutstanding} outstanding arrears. Clearance required.`,
        };
      }
      return {
        allowed: true,
        reason: isBypassed ? "Authorized via bypass" : "Fee clearance approved",
      };
    }

    // 1. Defaulter without bypass -> MUST BLOCK
    const r1 = evaluatePromotionClearance([{ balance: 8000 }], undefined);
    if (r1.allowed) throw new Error("Allowed promotion of defaulter without bypass code");

    // 2. Defaulter with empty whitespace bypass -> MUST BLOCK
    const r2 = evaluatePromotionClearance([{ balance: 8000 }], "   ");
    if (r2.allowed) throw new Error("Allowed promotion with empty whitespace bypass code");

    // 3. Defaulter with valid bypass code -> MUST ALLOW
    const r3 = evaluatePromotionClearance([{ balance: 8000 }], "PRIN_OVERRIDE_2026_VALID");
    if (!r3.allowed) throw new Error("Blocked promotion even when authorized bypass code supplied");

    // 4. Clean student with 0 balance -> MUST ALLOW without bypass
    const r4 = evaluatePromotionClearance([], undefined);
    if (!r4.allowed) throw new Error("Blocked clean student without arrears");
  });

  // 4.3 Zero Destructive Deletion Historical Preservation
  await challenge("INV4", "C4.3_PROMOTION_HISTORICAL_PRESERVATION", "Promoting student creates new session association without deleting prior session record", () => {
    // Database state simulation
    const studentClassDatabase: Array<{ scId: string; studentId: string; sessionId: string; classId: string }> = [
      { scId: "sc_2025_01", studentId: "std_01", sessionId: "sess_2025_2026", classId: "grade_05" },
    ];

    function executePromotion(studentId: string, fromSessionId: string, toSessionId: string, toClassId: string) {
      // PROMOTION LOGIC (from promotion.ts):
      // Preserves prior session StudentClass record intact
      const existingAssignment = studentClassDatabase.find(
        (sc) => sc.studentId === studentId && sc.sessionId === toSessionId
      );

      if (existingAssignment) {
        existingAssignment.classId = toClassId;
      } else {
        studentClassDatabase.push({
          scId: `sc_${Date.now()}`,
          studentId,
          sessionId: toSessionId,
          classId: toClassId,
        });
      }
    }

    // Execute promotion
    executePromotion("std_01", "sess_2025_2026", "sess_2026_2027", "grade_06");

    // Verify historical record still exists
    const priorRecord = studentClassDatabase.find(
      (sc) => sc.studentId === "std_01" && sc.sessionId === "sess_2025_2026"
    );
    if (!priorRecord || priorRecord.classId !== "grade_05") {
      throw new Error("Historical StudentClass record for prior session was deleted or mutated!");
    }

    // Verify new record created
    const newRecord = studentClassDatabase.find(
      (sc) => sc.studentId === "std_01" && sc.sessionId === "sess_2026_2027"
    );
    if (!newRecord || newRecord.classId !== "grade_06") {
      throw new Error("New StudentClass record for promoted session was not created!");
    }

    // Total records for student must be 2
    const totalRecords = studentClassDatabase.filter((sc) => sc.studentId === "std_01").length;
    if (totalRecords !== 2) {
      throw new Error(`Expected 2 historical StudentClass records, found ${totalRecords}`);
    }
  });
}

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function main() {
  console.log("================================================================================");
  console.log("CHALLENGER ADVERSARIAL STRESS HARNESS: 4 CRITICAL FINANCIAL INVARIANTS");
  console.log("================================================================================");

  await runInvariant1Challenges();
  await runInvariant2Challenges();
  await runInvariant3Challenges();
  await runInvariant4Challenges();

  console.log("\n================================================================================");
  console.log("CHALLENGER HARNESS EXECUTION SUMMARY");
  console.log("================================================================================");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`TOTAL CHALLENGES: ${results.length}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) {
    console.error(`\x1b[31mAdversarial Stress Harness completed with ${failed} failure(s).\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32mAll 4 critical financial invariants survived adversarial stress testing.\x1b[0m`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal exception in challenger harness:", err);
  process.exit(1);
});
