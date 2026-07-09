---
name: msns-build-codebase
description: >
  Comprehensive codebase memory for the msns-build LMS/ERP project. Use this skill to recall the architecture, database schema, routing, API endpoints, component organization, and tech stack without having to scan the repository.
---

# MSNS Build (LMS/ERP) Codebase Memory

## Overview
- **Name:** `msns-lms` (v1.1.0) / MSNS LMS v2.0 — ERP Edition
- **Domain:** `lms.msns.edu.pk` / `msns.edu.pk`
- **Purpose:** Comprehensive school ERP system covering academics, HR, finance, and parent portal functionality.
- **Stack:** T3 Stack (Next.js 15 App Router, React 18, TypeScript 5.5, Node.js 20).
- **Package Manager:** npm 10.8.3, ESM (`"type": "module"`).

## Technology Stack
- **API Layer:** tRPC v11, TanStack React Query v5, SuperJSON, Zod.
- **Database:** PostgreSQL (on Railway Pro), Prisma 6.16 (with singleton client).
- **Authentication:** NextAuth.js v5 (beta.29), bcryptjs, JWT sessions.
- **File Storage:** AWS S3 SDK (via Railway Volume Storage).
- **UI & Styling:** Tailwind CSS 3.4, shadcn/ui (51 components), Framer Motion, Lucide React, Recharts, Embla Carousel, Sonner, cmdk, vaul, react-resizable-panels.
- **PDF/Export:** pdf-lib (server), jspdf + jspdf-autotable (client), html2canvas-pro, papaparse.
- **State/Forms:** Zustand v5, react-hook-form + Zod.
- **Other:** Biometric integration (`biometric-auth`, `fprint`), FingerprintJS Pro.

## Database Schema (Prisma)
- **Academic:** `User`, `Students`, `Employees`, `Grades`, `Sessions`, `Subject`, `ClassSubject`, `StudentClass`, `Timetable`, `StudentAttendance`, `EmployeeAttendance`, `BioMetric`, `SubjectDiary`.
- **Exam:** `ExamType`, `Exam`, `ExamDatesheet`, `Marks`, `ReportCard`, `ReportCardDetail`, `ExaminationMarkingSession`.
- **Finance (v1):** `Fees`, `FeeStudentClass`, `Salary`, `SalaryAssignment`, `SalaryIncrement`, `Expenses`.
- **ERP (v2.0):** 
  - Budget: `CostCentre`, `BudgetPlan`, `BudgetAllocation`, `BudgetReallocation`.
  - Procurement: `PurchaseOrder`, `PurchaseOrderLineItem`, `GoodsReceiptNote`, `GRNLineItem`.
  - Direct Expenses: `DirectExpense`, `RecurringExpenseTemplate`.
  - Inventory: `InventoryItem`, `StockTransaction`, `StockReconciliation`.
  - Assets: `Asset`, `AssetCategory`, `AssetDepreciation`, `AssetMaintenance`, `AssetTransfer`, `AssetDisposal`.
  - Petty Cash: `PettyCashRegister`, `PettyCashDisbursement`, `PettyCashReconciliation`.
  - Ledger: `FinancialLedgerEntry` (polymorphic `sourceType`/`sourceId` append-only).
  - Approvals: `ApprovalPolicy`, `ApprovalRecord`, `ApprovalDelegation`.
  - Promotions: `PromotionHistory`, `PromotionEligibilityRule`, `PromotionEligibilityResult`, `BulkPromotionBatch`, `BulkPromotionBatchItem`.
  - Bulk Salary: `BulkSalaryCreationBatch`, `BulkSalaryCreationItem`.
  - HR/Leave: `LeaveType`, `LeaveApplication`, `LeaveApproval`, `LeaveBalance`.
  - System/Other: `ParentGuardian`, `Broadcast`, `Event`, `Tag`, `EventTag`, `Attendee`, `Reminder`.
- **Key Relationships:** Students to Grades/Sessions via `StudentClass`; Employees to Subject/Grades/Sessions via `ClassSubject`; `Marks` quadruple foreign key to Exam/Student/Subject/ClassSubject.

## Routing Structure
- **Dashboard Routes `(dashboard)/`:** Role-based with isolated layouts (Cyber-grid background).
  - `/admin/`: `erp/` (assets, budget, ledger, petty-cash, purchase-orders, revenue, stock), `exams/` (marking-centre, promotion), `attendance/`, `gallery/`, `revenue/`, `sessions/`, `users/`.
  - `/teacher/`: exams, gallery, sessions.
  - `/clerk/`: attendance, gallery, sessions, users.
  - `/student/`, `/principal/`, `/head/`: corresponding scoped routes.
- **REST APIs (`/api/`):**
  - `/auth/`: NextAuth.
  - `/trpc/`: tRPC.
  - `/images/[...key]`: S3 proxy.
  - `/uploads/[...filename]`: File uploads.
  - `/gallery/`: Gallery CRUD.
  - `/google-reviews/`: Google reviews.
  - `/v1/`: Legacy/secondary REST API (student, employee, fee, class, session, etc.).

## tRPC Architecture
- **Root Router:** `user`, `profile`, `allotment`, `student`, `employee`, `fee`, `expense`, `salary`, `report`, `session`, `event`, `subject`, `class`, `finger`, `attendance`, `timetable`, `exam`, `marks`, `reportCard`, `promotion`, `subjectDiary`, `erp`, `markingCentre`, `bulkSalary`.
- **ERP Sub-routers:** `assets`, `budget`, `directExpense`, `ledger`, `pettyCash`, `purchaseOrders`, `stock`.
- **Procedures:** `publicProcedure` (timing), `protectedProcedure` (auth check). Context provides `db` (Prisma) and `session`.

## Component Organization
- **UI:** `src/components/ui/` (51 shadcn/ui components).
- **Tables:** `src/components/tables/` (16 tables e.g., PayrollTable, StudentTable).
- **Cards:** `src/components/cards/` (10 cards).
- **Blocks:** `src/components/blocks/` (10 dirs e.g., dashboard, sidebar, gallery).
- **Forms:** `src/components/forms/` (7 dirs).

## File & Asset Handling
- S3 proxy pattern: No direct public bucket access. Upload via `/api/uploads` or `/api/gallery/upload`, served via `/api/images/[...key]`.

## Utilities (`src/lib/`)
- `utils.ts`: `cn()`, `userReg()` (MSN-{type}-{year}-{number}), role/theme checks.
- `s3.ts`: CRUD for AWS S3.
- `pdf-reports.ts`: pdf-lib generation.

## Environment & Deployment
- **Deployment:** Railway Pro, Docker multi-stage (standalone output, non-root Alpine).
- **Env Vars:** `DATABASE_URL`, `AUTH_SECRET`, S3 AWS variables.

## Important Conventions
- Path alias: `~/*` maps to `./src/*`.
- Append-only ledger pattern for finances.
- Session-scoped queries (filtering by active academic session).
- `globalForPrisma` pattern to prevent connection exhaustion in dev.
