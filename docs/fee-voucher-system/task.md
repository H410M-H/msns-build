# Enterprise Fee Management & Monthly Voucher System — Tasks

## Phase 1: Database Schema & Migration
- [x] Add new enums to `prisma/schema.prisma` (`VoucherType`, `PaymentStatus`, `ConcessionCategory`, `ConcessionScope`, `FineNature`)
- [x] Add `ChallanValidity` model (non-overlapping installment windows per session/grade)
- [x] Upgrade `FeeStudentClass` model with voucher core (types, validity, concession vs exemption, sub-installment hierarchy, merged vouchers, payment audit)
- [x] Add `SchoolBankDetails` model
- [x] Add relation fields to `Sessions`, `Grades`, `StudentClass`
- [x] Run `npx prisma validate` and `npx prisma generate` in `msns-build`

## Phase 2: Core Routers & Security Guardrails
- [ ] Create `src/server/api/routers/challanValidity.ts` (scheduling, non-overlapping validation, bulk-sync engine)
- [ ] Create `src/server/api/routers/voucher.ts` (batch generation, sub-installment splitting, multi-month merge, idempotent payment recording, cancellations)
- [ ] Create `src/server/api/routers/concession.ts` (Principal exemption approval, >=80% attendance auto-continuation evaluator, sibling detection)
- [ ] Safeguard `src/server/api/routers/allotment.ts` (block destructive deletion of paid records, add prorated fee differential adjustment)
- [ ] Safeguard `src/server/api/routers/promotion.ts` (add pre-flight session fee clearance check, preserve prior session records)
- [ ] Mount routers in `src/server/api/root.ts`

## Phase 3: Printable Two-Part Challan & Visuals
- [ ] Install `qrcode.react` (and types if needed)
- [ ] Create `PrintableVoucher.tsx` (Two-part layout: School Copy & Student Copy, itemized breakdown, bank details, QR code payload)
- [ ] Create `VoucherPrintSheet.tsx` for bulk-printing class vouchers with CSS page breaks

## Phase 4: Frontend Hub & Workflows
- [ ] Create `MonthlyVoucherHub.tsx` (table view, filters by session/grade/month/status/type, quick actions)
- [ ] Create `GenerateVouchersDialog.tsx` (session/grade selection, ChallanValidity preview, arrears toggle)
- [ ] Create `SplitVoucherDialog.tsx` (sub-installment wizard, sequence locking)
- [ ] Create `MergeVouchersDialog.tsx` (multi-month consolidated challan creator)
- [ ] Create `RecordPaymentDialog.tsx` (bank/cash counter selector, receipt capture, partial payment allocation)
- [ ] Create `ChallanValidityManager.tsx` (installment schedule configurator and bulk sync button)
- [ ] Create `PrincipalExemptionDialog.tsx` (management-restricted waiver form)
- [ ] Integrate tabs into `feeDashboard.tsx` (Vouchers, Challan Validity, Concessions)
- [ ] Add "Download Fee Challan" button to Parent/Student Portal

## Phase 5: Verification & Quality Assurance
- [x] Run `npx prisma validate`
- [ ] Run `tsc --noEmit` to verify type safety across the entire repository
- [ ] Verify non-overlapping check on `ChallanValidity`
- [ ] Verify sub-installment splitting and revert locking
- [ ] Verify multi-month merge and payment cascade
- [ ] Verify `allotment.ts` and `promotion.ts` clearance protection
- [ ] Run `npm run build`
