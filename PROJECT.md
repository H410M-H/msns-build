# Project: MSNS LMS/ERP Enterprise Fee Management & Monthly Voucher System

## Architecture
- **Framework**: Next.js 14 (App Router) + tRPC v10 + Prisma ORM + PostgreSQL / SQLite.
- **Backend Architecture**:
  - tRPC routers under `src/server/api/routers/` mounted in `src/server/api/root.ts`.
  - Procedures secured via `protectedProcedure`, `clerkProcedure`, and `managementProcedure`.
  - Atomicity guaranteed via Prisma interactive transactions (`ctx.db.$transaction`).
  - Dual ledger integration with `FinancialLedgerEntry` for auditability.
- **Frontend Architecture**:
  - React components with Tailwind CSS and Radix UI dialog primitives.
  - Printable challans rendered in DOM with standard CSS `@media print` rules, `@page { size: A4 portrait; margin: 8mm; }`, page breaks (`break-after: page`), and client-side canvas/SVG QR codes via `qrcode.react`.
- **Security & Financial Guardrails**:
  - Allotment deletion guard: Prevents deletion of student-class associations when paid or partially paid fee records exist.
  - Mid-session grade transfer fee differential: Issues prorated `FEE_ADJUSTMENT` vouchers or credits.
  - Promotion fee clearance: Pre-flight clearance checking for outstanding arrears before allowing session promotion; preserves historical `StudentClass` records without destructive deletion.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Challan Validity Scheduling | Configures temporal validity windows with non-overlapping constraints per session and grade | M2 | ORIGINAL_REQUEST §R1 |
| 2 | Challan Bulk Sync Engine | Atomically synchronizes updated validity dates to open (PENDING/PARTIALLY_PAID) vouchers | M2 | ORIGINAL_REQUEST §R1 |
| 3 | Batch Voucher Generation | Generates monthly/installment vouchers with base fees, arrears, and policy concessions | M2 | ORIGINAL_REQUEST §R1 |
| 4 | Sub-Installment Splitting | Splits net payable amount into K child vouchers ($\lfloor P/K \rfloor$ + remainder) and locks parent voucher | M2 | ORIGINAL_REQUEST §R1 |
| 5 | Sub-Installment Revert & Lock Guard | Permits split reversion if and only if all child payments are zero; strictly blocks reversion once paid | M2 | ORIGINAL_REQUEST §R1 |
| 6 | Multi-Month Merge Consolidation | Merges consecutive unpaid vouchers into a consolidated master voucher (`FULL_YEAR_MERGED`) and locks children | M2 | ORIGINAL_REQUEST §R1 |
| 7 | Merged Voucher Settlement Cascading | Settling a merged master voucher automatically cascades payment status and receipts to all constituent child vouchers | M2 | ORIGINAL_REQUEST §R1 |
| 8 | Idempotent Payment Recording | Records full or partial payments idempotently, updates status, and appends to payment history | M2 | ORIGINAL_REQUEST §R1 |
| 9 | Voucher Cancellation | Soft-revocation of unpaid vouchers setting status to CANCELLED | M2 | ORIGINAL_REQUEST §R1 |
| 10 | Attendance Concession Auto-Evaluation | Evaluates $\ge 80\%$ attendance rule for policy concessions; suspends concession if attendance falls below threshold | M2 | ORIGINAL_REQUEST §R1 |
| 11 | Sibling Concession Detection | Auto-detects siblings by parent/guardian CNIC/phone and applies sibling discount policies | M2 | ORIGINAL_REQUEST §R1 |
| 12 | Principal Discretionary Exemption | Allows authorized management to grant one-off fee exemptions with justification and approver audit trail | M2 | ORIGINAL_REQUEST §R1 |
| 13 | Allotment Deletion Guard | Blocks destructive deletion of student-class associations with paid or partially paid fee vouchers (`PRECONDITION_FAILED`) | M2 | ORIGINAL_REQUEST §R1 |
| 14 | Prorated Fee Differential Adjustment | Computes tuition differential during mid-session class transfers and generates adjustment vouchers | M2 | ORIGINAL_REQUEST §R1 |
| 15 | Promotion Fee Clearance Pre-Flight Check | Blocks promotion of students with outstanding arrears unless authorized with a valid bypass code | M2 | ORIGINAL_REQUEST §R1 |
| 16 | Promotion Historical Record Preservation | Preserves prior session `StudentClass` records during promotion instead of destructive deletion | M2 | ORIGINAL_REQUEST §R1 |
| 17 | Two-Part Printable Challan Component | Implements `PrintableVoucher.tsx` with School Copy and Student Copy, itemized breakdown, and bank details | M3 | ORIGINAL_REQUEST §R2 |
| 18 | Scannable QR Code Payload | Generates standard compact JSON payload `{ v, reg, amt, due, type }` embedded via `qrcode.react` | M3 | ORIGINAL_REQUEST §R2 |
| 19 | Bulk Class Voucher Print Sheet | Implements `VoucherPrintSheet.tsx` for bulk-printing vouchers with clean CSS print page breaks | M3 | ORIGINAL_REQUEST §R2 |
| 20 | Monthly Voucher Hub UI | Implements `MonthlyVoucherHub.tsx` with filtering (session, grade, month, status, type) and action buttons | M4 | ORIGINAL_REQUEST §R3 |
| 21 | Interactive Voucher Dialogs | Implements Generation, Splitting, Merging, Payment, Validity Management, and Principal Exemption dialogs | M4 | ORIGINAL_REQUEST §R3 |
| 22 | Fee Dashboard & Portal Integration | Mounts voucher tabs in `feeDashboard.tsx` and adds challan download action to student/parent portal | M4 | ORIGINAL_REQUEST §R3 |
| 23 | Comprehensive Verification & QA | Runs Prisma validation, strict typecheck, production build, and passes E2E acceptance test suite | M5 | ORIGINAL_REQUEST §R4 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M2 | Backend Routers & Guardrails | Implement `challanValidity.ts`, `voucher.ts`, `concession.ts`, update `allotment.ts` and `promotion.ts`, mount in `src/server/api/root.ts` | None | DONE |
| M3 | Printable Two-Part Challan & Visuals | Install `qrcode.react`, implement `PrintableVoucher.tsx` and `VoucherPrintSheet.tsx` | M2 | DONE |
| M4 | Frontend Hub & Interactive Dialogs | Implement `MonthlyVoucherHub.tsx`, interactive dialogs, feeDashboard tabs, and student portal challan download | M2, M3 | IN_PROGRESS |
| M5 | Final Milestone: Verification & E2E Acceptance | Verify 100% pass on E2E test suite, test scripts, Prisma validation, TypeScript check, build integrity, and adversarial hardening | M2, M3, M4 | PLANNED |

---

## Interface Contracts

### 1. `challanValidityRouter` (`src/server/api/routers/challanValidity.ts`)
- `setInstallmentSchedule`: Input `{ sessionId: string, gradeId: string, year: number, schedule: Array<{ installmentNo: number, month?: number, fromDate: Date, toDate: Date }> }`. Validates $fromDate_k \le toDate_k < fromDate_{k+1}$.
- `create`: Input `{ sessionId, gradeId, installmentNo, month?, year, fromDate, toDate, isActive? }`.
- `update`: Input `{ challanValidityId, installmentNo?, month?, year?, fromDate?, toDate?, isActive? }`.
- `delete`: Input `{ challanValidityId: string }`.
- `getBySessionAndGrade` (and alias `getInstallmentSchedule`): Input `{ sessionId: string, gradeId: string }`. Returns sorted schedule.
- `bulkSync` (and alias `syncChallanValidityToVouchers`): Input `{ sessionId: string, gradeId: string, installmentNo?: number }`. Updates `issueDate` and `dueDate` of PENDING and PARTIALLY_PAID vouchers.

### 2. `voucherRouter` (`src/server/api/routers/voucher.ts`)
- `generateBatch` (and alias `generateMonthlyVouchers`): Input `{ sessionId: string, classId: string, month: number, year: number, dueDate?: Date, installmentNo?: number }`. Generates vouchers with base fee, arrears, concessions.
- `splitInstallment` (and alias `splitVoucher`): Input `{ voucherId: string, numberOfSplits: number, customDueDates?: Date[] }`. Partitions payable amount into K child vouchers with index $1 \dots K$, marks parent `isSplitLocked = true`.
- `revertSplit` (and alias `revertVoucherSplit`): Input `{ voucherId: string }`. Permitted ONLY if $\forall i, \text{child}_i.\text{amountPaid} == 0$. Deletes children and unlocks parent. Throws `BAD_REQUEST` if any child is paid.
- `mergeVouchers` (and alias `generateMergedChallan`): Input `{ studentClassId: string, voucherIds: string[] }`. Creates `FULL_YEAR_MERGED` master voucher, locks children (`LOCKED_MERGED`).
- `recordPayment`: Input `{ voucherId: string, amount: number, paymentMethod: string, transactionReference?: string, paidAt?: Date }`. Idempotent payment recording, cascades settlement to children if master voucher is settled, records ledger entry.
- `cancelVoucher`: Input `{ voucherId: string, reason: string }`. Soft-cancels unpaid voucher (`CANCELLED`).
- `getVouchers`: Input `{ sessionId?: string, classId?: string, month?: number, year?: number, paymentStatus?: PaymentStatus, voucherType?: VoucherType, page?: number, limit?: number }`.
- `getVoucherById`: Input `{ voucherId: string }`. Returns voucher with student, class, session, fee structure, bank details.
- `getVoucherPrintData`: Input `{ voucherIds: string[] }`. Returns full data formatted for printable challans.

### 3. `concessionRouter` (`src/server/api/routers/concession.ts`)
- `evaluateAttendanceConcessions`: Input `{ sessionId: string, classId?: string, month: number, year: number }`. Checks $\ge 80\%$ attendance rule. Suspends concession if $<80\%$.
- `detectSiblingConcessions`: Input `{ sessionId: string }`. Groups students by father/guardian CNIC/phone, returns sibling groups for concession eligibility.
- `applyPrincipalExemption`: Input `{ voucherId: string, exemptionAmount: number, reason: string }`. Sets `exemptionAmount`, `exemptionApprovedBy`, `exemptionReason`, updates `discount = concessionAmount + exemptionAmount`.
- `revokePrincipalExemption`: Input `{ voucherId: string }`. Clears exemption and restores base discount.
- `getStudentConcessionSummary`: Input `{ studentId: string, sessionId: string }`.

### 4. Router Safeguards
- `allotment.ts`:
  - Before deleting student class associations in `removeStudentFromClass` / `removeAllotments`, query for fee vouchers where `paymentStatus IN ['PAID', 'PARTIALLY_PAID']`. If found, throw `TRPCError` with code `PRECONDITION_FAILED`.
  - Add `transferStudentWithAdjustment`: Input `{ studentClassId: string, newClassId: string, sessionId: string }`. Calculates prorated tuition difference and generates `FEE_ADJUSTMENT` voucher or credit.
- `promotion.ts`:
  - Add `verifyPromotionFeeClearance`: Input `{ studentId: string, fromSessionId: string, clearanceBypassCode?: string }`. Checks for unpaid arrears; blocks promotion if arrears exist and no valid bypass code is provided.
  - In `promoteStudent`, `batchPromoteStudents`, and `executeBulkPromotion`: REMOVE destructive `studentClass.deleteMany` statements to preserve historical academic and financial records.

---

## Code Layout
- Backend Routers: `src/server/api/routers/`
  - `challanValidity.ts` (new)
  - `voucher.ts` (new)
  - `concession.ts` (new)
  - `allotment.ts` (modified: deletion guard & transfer adjustment)
  - `promotion.ts` (modified: clearance pre-flight check & record preservation)
  - `root.ts` (modified: mount routers)
- Frontend Components: `src/components/forms/fee/`
  - `PrintableVoucher.tsx` (new)
  - `VoucherPrintSheet.tsx` (new)
  - `MonthlyVoucherHub.tsx` (new)
  - `dialogs/GenerateVouchersDialog.tsx` (new)
  - `dialogs/SplitVoucherDialog.tsx` (new)
  - `dialogs/MergeVouchersDialog.tsx` (new)
  - `dialogs/RecordPaymentDialog.tsx` (new)
  - `dialogs/ChallanValidityManager.tsx` (new)
  - `dialogs/PrincipalExemptionDialog.tsx` (new)
  - `feeDashboard.tsx` (modified: integrate new tabs)
- Student Portal View: `src/app/(dashboard)/student/fees/page.tsx` (modified: add download challan action)
