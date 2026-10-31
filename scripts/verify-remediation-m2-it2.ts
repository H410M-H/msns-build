import { concessionRouter } from "../src/server/api/routers/concession";
import { challanValidityRouter } from "../src/server/api/routers/challanValidity";
import { voucherRouter } from "../src/server/api/routers/voucher";
import { TRPCError } from "@trpc/server";
import { PaymentStatus, VoucherType, ConcessionCategory } from "@prisma/client";

// =========================================================================
// MOCK DATABASE HARNESS FOR EMPIRICAL CHALLENGE
// =========================================================================

class MockHarnessDB {
  studentClasses: any[] = [];
  feeStudentClasses: any[] = [];
  challanValidities: any[] = [];
  studentAttendances: any[] = [];
  students: any[] = [];

  reset() {
    this.studentClasses = [];
    this.feeStudentClasses = [];
    this.challanValidities = [];
    this.studentAttendances = [];
    this.students = [];
  }

  get db() {
    return {
      $transaction: async (fn: any) => fn(this.db),
      studentClass: {
        findMany: async ({ where }: any = {}) => {
          return this.studentClasses.filter((sc) => {
            if (where?.sessionId && sc.sessionId !== where.sessionId) return false;
            if (where?.classId && sc.classId !== where.classId) return false;
            return true;
          });
        },
      },
      students: {
        findUnique: async ({ where }: any) => {
          return this.students.find((s) => s.studentId === where.studentId) || null;
        },
      },
      employees: {
        findFirst: async () => ({
          employeeId: "EMP_PRINCIPAL_01",
          name: "Principal Jane Doe",
        }),
      },
      challanValidity: {
        upsert: async ({ where, create, update }: any) => {
          const idx = this.challanValidities.findIndex(
            (r) =>
              r.sessionId === where.sessionId_gradeId_installmentNo.sessionId &&
              r.gradeId === where.sessionId_gradeId_installmentNo.gradeId &&
              r.installmentNo === where.sessionId_gradeId_installmentNo.installmentNo
          );
          if (idx >= 0) {
            this.challanValidities[idx] = { ...this.challanValidities[idx], ...update };
            return this.challanValidities[idx];
          } else {
            const rec = {
              challanValidityId: "cv_" + Math.random().toString(36).slice(2),
              ...create,
            };
            this.challanValidities.push(rec);
            return rec;
          }
        },
        findMany: async ({ where }: any = {}) => {
          return this.challanValidities.filter((cv) => {
            if (where?.sessionId && cv.sessionId !== where.sessionId) return false;
            if (where?.gradeId && cv.gradeId !== where.gradeId) return false;
            return true;
          });
        },
        findFirst: async ({ where }: any = {}) => {
          return this.challanValidities.find((cv) => {
            if (where?.sessionId && cv.sessionId !== where.sessionId) return false;
            if (where?.gradeId && cv.gradeId !== where.gradeId) return false;
            if (where?.installmentNo && cv.installmentNo !== where.installmentNo) return false;
            return true;
          }) || null;
        },
      },
      feeStudentClass: {
        findMany: async ({ where }: any = {}) => {
          return this.feeStudentClasses.filter((v) => {
            if (where?.sfcId?.in && !where.sfcId.in.includes(v.sfcId)) return false;
            if (where?.month !== undefined && v.month !== where.month) return false;
            if (where?.year !== undefined && v.year !== where.year) return false;
            if (where?.paymentStatus?.in && !where.paymentStatus.in.includes(v.paymentStatus)) return false;
            return true;
          });
        },
        findUnique: async ({ where }: any) => {
          return this.feeStudentClasses.find((v) => v.sfcId === where.sfcId) || null;
        },
        create: async ({ data }: any) => {
          const created = { sfcId: "sfc_" + Math.random().toString(36).slice(2), ...data };
          this.feeStudentClasses.push(created);
          return created;
        },
        updateMany: async ({ where, data }: any) => {
          let count = 0;
          for (const v of this.feeStudentClasses) {
            if (where?.sfcId?.in && where.sfcId.in.includes(v.sfcId)) {
              Object.assign(v, data);
              count++;
            }
          }
          return { count };
        },
        update: async ({ where, data }: any) => {
          const v = this.feeStudentClasses.find((item) => item.sfcId === where.sfcId);
          if (!v) throw new Error("FeeStudentClass not found");
          Object.assign(v, data);
          return v;
        },
      },
    };
  }
}

// =========================================================================
// RUNNER & ASSERTION UTILS
// =========================================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function assertTest(description: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${description}`);
  } catch (err: any) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message || err}`);
  }
}

// =========================================================================
// TEST SUITE EXECUTION
// =========================================================================

async function main() {
  console.log("=================================================================");
  console.log("MILIESTONE 2 ITERATION 2 (REMEDIATION) ADVERSARIAL STRESS SUITE");
  console.log("=================================================================\n");

  const harness = new MockHarnessDB();

  const callerContext = {
    db: harness.db as any,
    session: {
      user: {
        id: "usr_admin_001",
        accountType: "ADMIN",
        role: "ADMIN",
        email: "admin@msns.edu.pk",
      },
    } as any,
  };

  const concessionCaller = concessionRouter.createCaller(callerContext);
  const challanValidityCaller = challanValidityRouter.createCaller(callerContext);
  const voucherCaller = voucherRouter.createCaller(callerContext);

  // -----------------------------------------------------------------------
  // SECTION 1: CONCESSION SIBLING PLACEHOLDER CNIC ADVERSARIAL CHALLENGES
  // -----------------------------------------------------------------------
  console.log("--- SECTION 1: Concession Sibling Placeholder CNIC Tests ---");

  function makeStudent(opts: {
    studentId: string;
    studentName: string;
    fatherName: string;
    fatherCNIC: string | null;
    fatherMobile: string | null;
    classId?: string;
  }) {
    return {
      scId: `sc_${opts.studentId}`,
      sessionId: "sess_2026",
      classId: opts.classId ?? "cls_1",
      Students: {
        studentId: opts.studentId,
        studentName: opts.studentName,
        registrationNumber: `REG_${opts.studentId}`,
        admissionNumber: `ADM_${opts.studentId}`,
        fatherName: opts.fatherName,
        fatherCNIC: opts.fatherCNIC,
        fatherMobile: opts.fatherMobile,
        guardianName: null,
      },
      Grades: {
        grade: "Class 1",
        section: "A",
      },
    };
  }

  // 1.1 "0000-0000000-0" (12 zeros with dashes)
  await assertTest(
    'Placeholder "0000-0000000-0" (12 zeros) never groups unrelated students',
    async () => {
      harness.reset();
      harness.studentClasses = [
        makeStudent({
          studentId: "s1",
          studentName: "Student Alpha",
          fatherName: "Father Alpha",
          fatherCNIC: "0000-0000000-0",
          fatherMobile: "03001111111",
        }),
        makeStudent({
          studentId: "s2",
          studentName: "Student Beta",
          fatherName: "Father Beta",
          fatherCNIC: "0000-0000000-0",
          fatherMobile: "03002222222",
        }),
      ];

      const res = await concessionCaller.detectSiblingConcessions({ sessionId: "sess_2026" });
      if (res.familiesCount !== 0) {
        throw new Error(
          `Expected 0 sibling families, got ${res.familiesCount}. Sibling groups falsely created on 12-zero placeholder!`
        );
      }
    }
  );

  // 1.2 "0000000000000" (13 zeros without dashes)
  await assertTest(
    'Placeholder "0000000000000" (13 zeros) never groups unrelated students',
    async () => {
      harness.reset();
      harness.studentClasses = [
        makeStudent({
          studentId: "s1",
          studentName: "Student Alpha",
          fatherName: "Father Alpha",
          fatherCNIC: "0000000000000",
          fatherMobile: "03001111111",
        }),
        makeStudent({
          studentId: "s2",
          studentName: "Student Beta",
          fatherName: "Father Beta",
          fatherCNIC: "0000000000000",
          fatherMobile: "03002222222",
        }),
      ];

      const res = await concessionCaller.detectSiblingConcessions({ sessionId: "sess_2026" });
      if (res.familiesCount !== 0) {
        throw new Error(
          `Expected 0 sibling families, got ${res.familiesCount}. Sibling groups falsely created on 13-zero placeholder!`
        );
      }
    }
  );

  // 1.3 "0" (single zero)
  await assertTest(
    'Placeholder "0" (single zero) never groups unrelated students',
    async () => {
      harness.reset();
      harness.studentClasses = [
        makeStudent({
          studentId: "s1",
          studentName: "Student Alpha",
          fatherName: "Father Alpha",
          fatherCNIC: "0",
          fatherMobile: "03001111111",
        }),
        makeStudent({
          studentId: "s2",
          studentName: "Student Beta",
          fatherName: "Father Beta",
          fatherCNIC: "0",
          fatherMobile: "03002222222",
        }),
      ];

      const res = await concessionCaller.detectSiblingConcessions({ sessionId: "sess_2026" });
      if (res.familiesCount !== 0) {
        throw new Error(
          `Expected 0 sibling families, got ${res.familiesCount}. Sibling groups falsely created on single zero "0"!`
        );
      }
    }
  );

  // 1.4 "000-000-000" (9 zeros with dashes)
  await assertTest(
    'Placeholder "000-000-000" (9 zeros with dashes) never groups unrelated students',
    async () => {
      harness.reset();
      harness.studentClasses = [
        makeStudent({
          studentId: "s1",
          studentName: "Student Alpha",
          fatherName: "Father Alpha",
          fatherCNIC: "000-000-000",
          fatherMobile: "03001111111",
        }),
        makeStudent({
          studentId: "s2",
          studentName: "Student Beta",
          fatherName: "Father Beta",
          fatherCNIC: "000-000-000",
          fatherMobile: "03002222222",
        }),
      ];

      const res = await concessionCaller.detectSiblingConcessions({ sessionId: "sess_2026" });
      if (res.familiesCount !== 0) {
        throw new Error(
          `Expected 0 sibling families, got ${res.familiesCount}. Sibling groups falsely created on "000-000-000"!`
        );
      }
    }
  );

  // 1.5 Mixed placeholders across 5 unrelated students
  await assertTest(
    "Mixed placeholder strings ('0000-0000000-0', '0000000000000', '0', '000-000-000', '0000000000') all rejected from grouping",
    async () => {
      harness.reset();
      harness.studentClasses = [
        makeStudent({
          studentId: "s1",
          studentName: "Student 1",
          fatherName: "Father 1",
          fatherCNIC: "0000-0000000-0",
          fatherMobile: "03001111111",
        }),
        makeStudent({
          studentId: "s2",
          studentName: "Student 2",
          fatherName: "Father 2",
          fatherCNIC: "0000000000000",
          fatherMobile: "03002222222",
        }),
        makeStudent({
          studentId: "s3",
          studentName: "Student 3",
          fatherName: "Father 3",
          fatherCNIC: "0",
          fatherMobile: "03003333333",
        }),
        makeStudent({
          studentId: "s4",
          studentName: "Student 4",
          fatherName: "Father 4",
          fatherCNIC: "000-000-000",
          fatherMobile: "03004444444",
        }),
        makeStudent({
          studentId: "s5",
          studentName: "Student 5",
          fatherName: "Father 5",
          fatherCNIC: "0000000000",
          fatherMobile: "03005555555",
        }),
      ];

      const res = await concessionCaller.detectSiblingConcessions({ sessionId: "sess_2026" });
      if (res.familiesCount !== 0) {
        throw new Error(
          `Expected 0 sibling families among 5 placeholder students, got ${res.familiesCount}!`
        );
      }
    }
  );

  // 1.6 Authentic Valid CNIC groups true siblings
  await assertTest(
    "Authentic valid CNIC ('35201-1234567-1') correctly groups genuine siblings",
    async () => {
      harness.reset();
      harness.studentClasses = [
        makeStudent({
          studentId: "sib1",
          studentName: "Sibling One",
          fatherName: "Tariq Mahmood",
          fatherCNIC: "35201-1234567-1",
          fatherMobile: "03007654321",
          classId: "cls_1",
        }),
        makeStudent({
          studentId: "sib2",
          studentName: "Sibling Two",
          fatherName: "Tariq Mahmood",
          fatherCNIC: "35201-1234567-1",
          fatherMobile: "03007654321",
          classId: "cls_2",
        }),
      ];

      const res = await concessionCaller.detectSiblingConcessions({ sessionId: "sess_2026" });
      if (res.familiesCount !== 1) {
        throw new Error(`Expected 1 sibling family, got ${res.familiesCount}`);
      }
      const family = res.siblingFamilies[0]!;
      if (family.siblingCount !== 2 || family.siblings.length !== 2) {
        throw new Error(`Expected 2 siblings in family, got ${family.siblingCount}`);
      }
      if (family.familyIdentifier !== "CNIC_3520112345671") {
        throw new Error(`Expected familyIdentifier 'CNIC_3520112345671', got '${family.familyIdentifier}'`);
      }
    }
  );

  // 1.7 Two different valid authentic CNICs are not grouped together
  await assertTest(
    "Two different authentic CNICs are segregated into distinct families",
    async () => {
      harness.reset();
      harness.studentClasses = [
        makeStudent({
          studentId: "sib1",
          studentName: "Student A",
          fatherName: "Tariq Mahmood",
          fatherCNIC: "35201-1234567-1",
          fatherMobile: "03007654321",
        }),
        makeStudent({
          studentId: "sib2",
          studentName: "Student B",
          fatherName: "Rashid Minhas",
          fatherCNIC: "35201-7654321-2",
          fatherMobile: "03001234567",
        }),
      ];

      const res = await concessionCaller.detectSiblingConcessions({ sessionId: "sess_2026" });
      if (res.familiesCount !== 0) {
        throw new Error(
          `Expected 0 sibling families for distinct single-child CNICs, got ${res.familiesCount}`
        );
      }
    }
  );

  // 1.8 Genuine siblings with placeholder CNIC correctly grouped via Father Name + Mobile fallback
  await assertTest(
    "Genuine siblings sharing placeholder CNIC are correctly grouped via Father Name + Mobile fallback",
    async () => {
      harness.reset();
      harness.studentClasses = [
        makeStudent({
          studentId: "sib1",
          studentName: "Ahmad Tariq",
          fatherName: "Muhammad Tariq",
          fatherCNIC: "0000-0000000-0", // Placeholder!
          fatherMobile: "03001234567",
          classId: "cls_1",
        }),
        makeStudent({
          studentId: "sib2",
          studentName: "Fatima Tariq",
          fatherName: "  muhammad   TARIQ  ", // Same father with messy spacing/casing
          fatherCNIC: "0000-0000000-0", // Placeholder!
          fatherMobile: "0300-1234567", // Same phone with dash
          classId: "cls_2",
        }),
        makeStudent({
          studentId: "unrelated",
          studentName: "Zainab Ali",
          fatherName: "Ali Raza",
          fatherCNIC: "0000-0000000-0", // Same placeholder!
          fatherMobile: "03219999999", // Different phone/father
          classId: "cls_3",
        }),
      ];

      const res = await concessionCaller.detectSiblingConcessions({ sessionId: "sess_2026" });
      if (res.familiesCount !== 1) {
        throw new Error(
          `Expected exactly 1 sibling family via fallback, got ${res.familiesCount}`
        );
      }
      const family = res.siblingFamilies[0]!;
      if (family.siblingCount !== 2) {
        throw new Error(`Expected 2 siblings in family, got ${family.siblingCount}`);
      }
      const studentIds = family.siblings.map((s: any) => s.studentId);
      if (!studentIds.includes("sib1") || !studentIds.includes("sib2")) {
        throw new Error(`Expected sib1 and sib2 in family, got: ${studentIds.join(", ")}`);
      }
      if (studentIds.includes("unrelated")) {
        throw new Error("Unrelated student was erroneously included in fallback family!");
      }
    }
  );

  // -----------------------------------------------------------------------
  // SECTION 2: DUPLICATE INSTALLMENT NUMBER ADVERSARIAL CHALLENGES
  // -----------------------------------------------------------------------
  console.log("\n--- SECTION 2: Duplicate Installment Number Validation Tests ---");

  // 2.1 Duplicate installment 1 in a 2-element schedule
  await assertTest(
    "setInstallmentSchedule: rejects two items with installmentNo: 1 (TRPCError BAD_REQUEST)",
    async () => {
      harness.reset();
      let errorThrown = false;
      let errorCode = "";
      let errorMessage = "";

      try {
        await challanValidityCaller.setInstallmentSchedule({
          sessionId: "sess_2026",
          gradeId: "grade_1",
          year: 2026,
          schedule: [
            {
              installmentNo: 1,
              fromDate: new Date("2026-01-01"),
              toDate: new Date("2026-01-20"),
            },
            {
              installmentNo: 1,
              fromDate: new Date("2026-02-01"),
              toDate: new Date("2026-02-20"),
            },
          ],
        });
      } catch (err: any) {
        errorThrown = true;
        errorCode = err.code;
        errorMessage = err.message;
      }

      if (!errorThrown) {
        throw new Error("Expected setInstallmentSchedule to throw, but it succeeded!");
      }
      if (errorCode !== "BAD_REQUEST") {
        throw new Error(`Expected TRPCError code BAD_REQUEST, got '${errorCode}'`);
      }
      if (!errorMessage.includes("Duplicate installment number 1")) {
        throw new Error(`Expected message to mention duplicate installment number 1, got: '${errorMessage}'`);
      }
    }
  );

  // 2.2 Duplicate installment 2 in a 3-element schedule
  await assertTest(
    "setInstallmentSchedule: rejects duplicate installmentNo: 2 in multi-element schedule",
    async () => {
      harness.reset();
      let errorThrown = false;
      let errorCode = "";

      try {
        await challanValidityCaller.setInstallmentSchedule({
          sessionId: "sess_2026",
          gradeId: "grade_1",
          year: 2026,
          schedule: [
            {
              installmentNo: 1,
              fromDate: new Date("2026-01-01"),
              toDate: new Date("2026-01-20"),
            },
            {
              installmentNo: 2,
              fromDate: new Date("2026-02-01"),
              toDate: new Date("2026-02-20"),
            },
            {
              installmentNo: 2,
              fromDate: new Date("2026-03-01"),
              toDate: new Date("2026-03-20"),
            },
          ],
        });
      } catch (err: any) {
        errorThrown = true;
        errorCode = err.code;
      }

      if (!errorThrown) {
        throw new Error("Expected setInstallmentSchedule to throw on duplicate installment 2!");
      }
      if (errorCode !== "BAD_REQUEST") {
        throw new Error(`Expected TRPCError code BAD_REQUEST, got '${errorCode}'`);
      }
    }
  );

  // 2.3 Multiple duplicates (two 1s, two 2s)
  await assertTest(
    "setInstallmentSchedule: rejects schedule with multiple duplicate installment numbers",
    async () => {
      harness.reset();
      let errorThrown = false;

      try {
        await challanValidityCaller.setInstallmentSchedule({
          sessionId: "sess_2026",
          gradeId: "grade_1",
          year: 2026,
          schedule: [
            {
              installmentNo: 1,
              fromDate: new Date("2026-01-01"),
              toDate: new Date("2026-01-15"),
            },
            {
              installmentNo: 1,
              fromDate: new Date("2026-01-16"),
              toDate: new Date("2026-01-31"),
            },
            {
              installmentNo: 2,
              fromDate: new Date("2026-02-01"),
              toDate: new Date("2026-02-15"),
            },
            {
              installmentNo: 2,
              fromDate: new Date("2026-02-16"),
              toDate: new Date("2026-02-28"),
            },
          ],
        });
      } catch (err: any) {
        errorThrown = true;
        if (err.code !== "BAD_REQUEST") {
          throw new Error(`Expected BAD_REQUEST, got ${err.code}`);
        }
      }

      if (!errorThrown) {
        throw new Error("Expected setInstallmentSchedule to reject multiple duplicates!");
      }
    }
  );

  // 2.4 Valid schedule with unique installment numbers succeeds
  await assertTest(
    "setInstallmentSchedule: accepts valid schedule with distinct installments 1, 2, 3",
    async () => {
      harness.reset();
      const res = await challanValidityCaller.setInstallmentSchedule({
        sessionId: "sess_2026",
        gradeId: "grade_1",
        year: 2026,
        schedule: [
          {
            installmentNo: 1,
            month: 1,
            fromDate: new Date("2026-01-01"),
            toDate: new Date("2026-01-20"),
          },
          {
            installmentNo: 2,
            month: 2,
            fromDate: new Date("2026-02-01"),
            toDate: new Date("2026-02-20"),
          },
          {
            installmentNo: 3,
            month: 3,
            fromDate: new Date("2026-03-01"),
            toDate: new Date("2026-03-20"),
          },
        ],
      });

      if (!res.success) {
        throw new Error("Expected success: true");
      }
      if (res.count !== 3) {
        throw new Error(`Expected count: 3, got ${res.count}`);
      }
      if (harness.challanValidities.length !== 3) {
        throw new Error(`Expected 3 records in DB, got ${harness.challanValidities.length}`);
      }
    }
  );

  // 2.5 Inverted dates within schedule rejected
  await assertTest(
    "setInstallmentSchedule: rejects inverted dates (fromDate > toDate) within schedule item",
    async () => {
      harness.reset();
      let errorThrown = false;
      try {
        await challanValidityCaller.setInstallmentSchedule({
          sessionId: "sess_2026",
          gradeId: "grade_1",
          year: 2026,
          schedule: [
            {
              installmentNo: 1,
              fromDate: new Date("2026-01-25"),
              toDate: new Date("2026-01-10"), // Inverted!
            },
          ],
        });
      } catch (err: any) {
        errorThrown = true;
        if (err.code !== "BAD_REQUEST") {
          throw new Error(`Expected BAD_REQUEST, got ${err.code}`);
        }
      }
      if (!errorThrown) {
        throw new Error("Expected setInstallmentSchedule to reject inverted dates!");
      }
    }
  );

  // 2.6 Overlapping date windows within schedule rejected
  await assertTest(
    "setInstallmentSchedule: rejects overlapping date windows across installments",
    async () => {
      harness.reset();
      let errorThrown = false;
      try {
        await challanValidityCaller.setInstallmentSchedule({
          sessionId: "sess_2026",
          gradeId: "grade_1",
          year: 2026,
          schedule: [
            {
              installmentNo: 1,
              fromDate: new Date("2026-01-01"),
              toDate: new Date("2026-01-20"),
            },
            {
              installmentNo: 2,
              fromDate: new Date("2026-01-15"), // Overlaps with inst 1!
              toDate: new Date("2026-02-15"),
            },
          ],
        });
      } catch (err: any) {
        errorThrown = true;
        if (err.code !== "BAD_REQUEST") {
          throw new Error(`Expected BAD_REQUEST, got ${err.code}`);
        }
      }
      if (!errorThrown) {
        throw new Error("Expected setInstallmentSchedule to reject overlapping dates!");
      }
    }
  );

  // -----------------------------------------------------------------------
  // SECTION 3: MULTI-MONTH MERGE CONSOLIDATION REVENUE INTEGRITY AUDIT
  // -----------------------------------------------------------------------
  console.log("\n--- SECTION 3: Merged Voucher Net Payable Revenue Integrity ---");

  await assertTest(
    "executeMergeVouchers: master voucher correctly absorbs base fee differential and matches sum of all constituent vouchers",
    async () => {
      harness.reset();
      // Setup 3 vouchers with MonthlyFee of 4000
      // Month 1: base 4000, discount 500, late 0 -> net 3500
      // Month 2: base 4000, discount 0, late 100 -> net 4100
      // Month 3: base 4000, discount 0, late 0 -> net 4000
      // Total Expected Net Payable = 3500 + 4100 + 4000 = 11,600
      const monthlyFeeRecord = {
        type: "MonthlyFee",
        tuitionFee: 4000,
        admissionFee: 0,
        examFund: 0,
        computerLabFund: 0,
        studentIdCardFee: 0,
        infoAndCallsFee: 0,
      };

      const v1 = {
        sfcId: "v_m1",
        studentClassId: "sc_01",
        feeId: "fee_cls1",
        fees: monthlyFeeRecord,
        month: 1,
        year: 2026,
        installmentNo: 1,
        voucherNumber: "V-2026-01-001",
        voucherType: VoucherType.MONTHLY,
        issueDate: new Date("2026-01-05"),
        dueDate: new Date("2026-01-20"),
        concessionAmount: 500,
        exemptionAmount: 0,
        discount: 500,
        lateFee: 0,
        adjustmentAmount: 0,
        paymentStatus: PaymentStatus.PENDING,
        amountPaid: 0,
        isSplitLocked: false,
        mergedIntoVoucherId: null,
      };

      const v2 = {
        sfcId: "v_m2",
        studentClassId: "sc_01",
        feeId: "fee_cls1",
        fees: monthlyFeeRecord,
        month: 2,
        year: 2026,
        installmentNo: 2,
        voucherNumber: "V-2026-02-001",
        voucherType: VoucherType.MONTHLY,
        issueDate: new Date("2026-02-05"),
        dueDate: new Date("2026-02-20"),
        concessionAmount: 0,
        exemptionAmount: 0,
        discount: 0,
        lateFee: 100,
        adjustmentAmount: 0,
        paymentStatus: PaymentStatus.PENDING,
        amountPaid: 0,
        isSplitLocked: false,
        mergedIntoVoucherId: null,
      };

      const v3 = {
        sfcId: "v_m3",
        studentClassId: "sc_01",
        feeId: "fee_cls1",
        fees: monthlyFeeRecord,
        month: 3,
        year: 2026,
        installmentNo: 3,
        voucherNumber: "V-2026-03-001",
        voucherType: VoucherType.MONTHLY,
        issueDate: new Date("2026-03-05"),
        dueDate: new Date("2026-03-20"),
        concessionAmount: 0,
        exemptionAmount: 0,
        discount: 0,
        lateFee: 0,
        adjustmentAmount: 0,
        paymentStatus: PaymentStatus.PENDING,
        amountPaid: 0,
        isSplitLocked: false,
        mergedIntoVoucherId: null,
      };

      harness.feeStudentClasses = [v1, v2, v3];

      const res = await voucherCaller.mergeVouchers({
        studentClassId: "sc_01",
        voucherIds: ["v_m1", "v_m2", "v_m3"],
      });

      if (!res.success) {
        throw new Error("Expected mergeVouchers to succeed!");
      }

      // Check master voucher created
      const master = harness.feeStudentClasses.find(
        (v) => v.voucherType === VoucherType.FULL_YEAR_MERGED
      );
      if (!master) {
        throw new Error("Master FULL_YEAR_MERGED voucher was not created!");
      }

      // Base fee of master = primary voucher base fee = 4000
      // Differential = (4000 + 4000 + 4000) - 4000 = 8000
      // Master adjustmentAmount must equal 8000
      if (master.adjustmentAmount !== 8000) {
        throw new Error(
          `Master adjustmentAmount expected 8000 (differential), got ${master.adjustmentAmount}`
        );
      }

      // Evaluated Net Payable = primaryBase (4000) + lateFee (100) + adjustment (8000) - discount (500) = 11,600
      const totalEvaluatedNet =
        4000 + master.lateFee + master.adjustmentAmount - master.discount;
      const expectedConstituentSum = 3500 + 4100 + 4000; // 11600

      if (totalEvaluatedNet !== expectedConstituentSum) {
        throw new Error(
          `Master net payable mismatch: Evaluated ${totalEvaluatedNet} vs Expected sum ${expectedConstituentSum}`
        );
      }

      // Constituent vouchers must be locked
      for (const cid of ["v_m1", "v_m2", "v_m3"]) {
        const child = harness.feeStudentClasses.find((v) => v.sfcId === cid);
        if (child.paymentStatus !== PaymentStatus.LOCKED_MERGED) {
          throw new Error(`Constituent voucher ${cid} not marked as LOCKED_MERGED`);
        }
        if (child.mergedIntoVoucherId !== master.sfcId) {
          throw new Error(`Constituent voucher ${cid} not linked to master sfcId`);
        }
      }
    }
  );

  // -----------------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log("TEST SUITE EXECUTION SUMMARY");
  console.log(`TOTAL TESTS : ${totalTests}`);
  console.log(`PASSED      : ${passedTests}`);
  console.log(`FAILED      : ${failedTests}`);
  console.log("=================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((e) => {
  console.error("FATAL RUNNER ERROR:", e);
  process.exit(1);
});
