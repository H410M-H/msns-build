# E2E Test Infra: MSNS Fee Voucher System

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.
- Target verification of all 23 features across backend, security guardrails, printable vouchers, and UI components.

## Feature Inventory & Test Coverage Goals
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Challan Validity Scheduling | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Challan Bulk Sync Engine | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | Batch Voucher Generation | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | Sub-Installment Splitting | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 5 | Sub-Installment Revert & Lock Guard | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 6 | Multi-Month Merge Consolidation | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 7 | Merged Voucher Settlement Cascading | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 8 | Idempotent Payment Recording | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 9 | Voucher Cancellation | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 10 | Attendance Concession Auto-Evaluation | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 11 | Sibling Concession Detection | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 12 | Principal Discretionary Exemption | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 13 | Allotment Deletion Guard | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 14 | Prorated Fee Differential Adjustment | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 15 | Promotion Fee Clearance Pre-Flight Check | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 16 | Promotion Historical Record Preservation | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 17 | Two-Part Printable Challan Component | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 18 | Scannable QR Code Payload | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 19 | Bulk Class Voucher Print Sheet | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 20 | Monthly Voucher Hub UI | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 21 | Interactive Voucher Dialogs | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 22 | Fee Dashboard & Portal Integration | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 23 | Comprehensive Verification & Build Integrity | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test Runner:
  - Acceptance tests runner: `node node_modules/tsx/dist/cli.mjs tests/fee-voucher-system-e2e.ts`
  - Integration script: `node node_modules/tsx/dist/cli.mjs scripts/test-fee-vouchers.ts`
  - TypeScript validation: `NODE_OPTIONS="--max-old-space-size=4096" node node_modules/typescript/bin/tsc --noEmit`
  - Prisma validation: `node node_modules/prisma/build/index.js validate`
  - Production build: `npm run build`
- Pass/Fail Semantics:
  - Exit code 0 indicates success.
  - Non-zero exit code or uncaught rejection indicates test failure.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Standard Monthly Billing & Cash Counter Collection | F1, F2, F3, F8, F17, F18 | Medium |
| 2 | Distressed Family Sub-Installment Split & Partial Settlement | F4, F5, F8, F21 | High |
| 3 | Annual Lump-Sum Consolidation with Settlement Cascading | F6, F7, F8, F20 | High |
| 4 | Student Mid-Session Class Transfer with Tuition Differential | F13, F14, F8 | High |
| 5 | End-of-Session Promotion with Arrears Defaulter Block & Bypass | F15, F16, F8 | High |
| 6 | Attendance-based Concession Suspension & Principal Exemption Waiver | F10, F12, F3, F8 | High |
