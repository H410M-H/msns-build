---
name: msns-build-codebase
description: >
  Comprehensive codebase memory for the msns-build LMS/ERP project. Use this skill to recall the architecture, database schema, routing, API endpoints, component organization, and tech stack without having to scan the repository.
---

# MSNS Build (LMS/ERP) Codebase Memory

## Overview
- **Name:** `msns-lms` (v1.4.5) / MSNS LMS v2.0 — Enterprise ERP Edition
- **Domain:** `lms.msns.edu.pk` / `msns.edu.pk`
- **Purpose:** Comprehensive school ERP system covering academics, HR, finance, examinations, attendance, and student/parent portal functionality.
- **Stack:** T3 Stack (Next.js 15 App Router, React 18, TypeScript 5.5, Node.js 20).
- **Package Manager:** npm 10.8.3, ESM (`"type": "module"`).

## Technology Stack
- **API Layer:** tRPC v11, TanStack React Query v5, SuperJSON, Zod.
- **Database:** External PostgreSQL, Prisma 6.16 (with singleton client).
- **Authentication:** NextAuth.js v5 (beta.29), bcryptjs, JWT sessions.
- **File Storage:** AWS S3 SDK (via External S3 Bucket & proxy API routes).
- **UI & Styling:** Tailwind CSS 3.4, shadcn/ui (51+ components), Framer Motion, Lucide React, Recharts, Embla Carousel, Sonner, cmdk, vaul, react-resizable-panels.
- **Analytics & Observability:** Vercel Web Analytics (`@vercel/analytics`), Vercel Speed Insights (`@vercel/speed-insights`), Google Analytics (`gtag.js`).
- **PDF/Export:** pdf-lib (server), jspdf + jspdf-autotable (client), html2canvas-pro, papaparse (client CSV exports).
- **State/Forms:** Zustand v5, react-hook-form + Zod.
- **Mobile/Capacitor:** Capacitor 8 (`@capacitor/android`, `@capacitor/camera`, `@capacitor/push-notifications`, `@capacitor/local-notifications`, `@capacitor-community/sqlite`).
- **Biometric/Hardware:** Biometric integration (`biometric-auth`, `fprint`), FingerprintJS Pro.

## Database Schema (Prisma)
- **Academic:** `User`, `Students`, `Employees`, `Grades`, `Sessions`, `Subject`, `ClassSubject`, `StudentClass`, `Timetable`, `StudentAttendance`, `EmployeeAttendance`, `BioMetric`, `SubjectDiary`.
- **Exam & Assessment:** `ExamType`, `Exam`, `ExamDatesheet`, `Marks`, `ReportCard`, `ReportCardDetail`, `ExaminationMarkingSession`.
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
- **Key Constraints & Patterns:** 
  - Timetable compound key: `@@unique([classId, sessionId, dayOfWeek, lectureNumber])`.
  - ClassSubject acts as the essential teacher-subject-class-session allotment entity.
  - Append-only financial ledger pattern for ERP accounting transactions.

## Routing Structure
- **Dashboard Routes `(dashboard)/`:** Role-based with isolated layouts (Cyber-grid background).
  - `/admin/`: 
    - `erp/` (assets, budget, ledger, petty-cash, purchase-orders, revenue, stock)
    - `exams/` (datesheets viewer, results analytics, marking-centre, promotion)
    - `attendance/` (student bio/manual, employee bio/monthly)
    - `sessions/` (session list, academic calendar, duration comparison, timetable)
    - `users/` (registration portal, role governance matrix)
    - `gallery/`, `revenue/`
  - `/teacher/`: exams, gallery, sessions, timetable, homework diary.
  - `/clerk/`: attendance, monthly reports, gallery, sessions, users, fee collection.
  - `/student/`, `/principal/`, `/head/`: corresponding role-scoped dashboard routes.
- **REST APIs (`/api/`):**
  - `/auth/`: NextAuth session endpoints.
  - `/trpc/`: tRPC edge handlers.
  - `/images/[...key]`: S3 streaming proxy.
  - `/uploads/[...filename]`: Secured file uploads.
  - `/gallery/`: Gallery CRUD endpoints.
  - `/google-reviews/`: School reviews aggregator.
  - `/v1/`: Legacy REST endpoints for mobile/third-party integrations.

## Core Modules & Improvised Features

### 1. Timetable Engine
- **Master Daily Routine Mode (Default):** Classes follow the same period schedule across all 6 working days (Mon–Sat). Period allocations ($L1 \dots L9$) automatically propagate across all days.
- **1-Click Multi-Day Sync:** "Apply Mon to All Days" button replicates Monday's routine to Tuesday–Saturday.
- **Advanced Tools:** "Copy Day Schedule to...", "Clone Timetable from Class...", and safe bulk clear modals.
- **Bulk tRPC Mutations:** `assignTeacherBulk`, `removeTeacherBulk`, `copyDayToDays`, `copyClassTimetable`, `clearDay`, `clearClassTimetable`.

### 2. Examination Datesheets & Results Analytics
- **Datesheets Viewer (`DatesheetsViewerTab`):** Session/class filtering, paper schedules (Subject, Date, Time, Marks), and printable layout.
- **Results Analytics (`ExamResultsAnalyticsTab`):** Recharts subject average score charts, grade distributions ($A+\dots F$), top scorers leaderboard, and pass-rate progress indicators.
- **tRPC Procedures:** `getAllDatesheets`, `getResultsAnalytics`, `getExamWithSubjects`.

### 3. Academic Calendar & Milestones
- **Calendar View (`AcademicCalendarTab`):** Interactive monthly grid, category filtering (Sessions, School Events), day agenda drawer, and active sessions timeline.

### 4. Role Governance & Access Control
- **Role Management (`RoleManagementTab`):** 8 system roles (`ADMIN`, `PRINCIPAL`, `HEAD`, `CLERK`, `TEACHER`, `STUDENT`, `PARENT`, `WORKER`), modular permissions matrix (User Governance, Academics, Attendance, Exams, Finance, System Settings), and live searchable user directory.

### 5. Student Dashboard
- **Enrolled Courses (`student.tsx`):** Course cards with gradient accents, core course tags, enrollment verification, and direct timetable routing.

### 6. Staff Attendance Reporting
- **Monthly Export (`MonthlyReportTab.tsx` / `clerk/monthly/page.tsx`):** Real-time CSV export of monthly staff attendance with day-by-day status breakdown.

### 7. Mobile Architecture & Edge-to-Edge Experience
- **Full Screen Edge-to-Edge Layout:** Next.js `viewportFit: "cover"`, Capacitor `StatusBar.overlaysWebView`, Android `shortEdges` display cutout mode, and safe area inset utilities (`pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, `h-[100dvh]`).
- **Offline Caching (`src/lib/mobile/offline-cache.ts`):** Dual-tier offline persistence (Capacitor SQLite + LocalStorage fallback) for timetables, subject diaries, and exam datesheets.
- **Notification Engine (`src/lib/mobile/notification-service.ts`):** Integrated Capacitor LocalNotifications and PushNotifications for exam datesheet publishes, fee due reminders, and attendance alerts.

## Utilities (`src/lib/`)
- `utils.ts`: `cn()`, `userReg()` (`MSN-{type}-{year}-{number}`), role/theme checks.
- `s3.ts`: CRUD operations for AWS S3.
- `pdf-reports.ts`: pdf-lib generation.
- `timetable-types.ts`: Timetable definitions, `DAYS_OF_WEEK`, `LECTURE_NUMBERS`.

## Important Conventions
- Path alias: `~/*` maps to `./src/*`.
- Append-only ledger pattern for all financial movements.
- Session-scoped queries (filtering by active academic session).
- `globalForPrisma` pattern to prevent connection exhaustion.
