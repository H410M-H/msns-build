# MSNS LMS v2.0 — ERP Edition
## Technical Architecture & System Documentation

---

## SECTION 1: BACKEND SYSTEM FLOW & TECHNICAL ARCHITECTURE

### 1.1 Core System Architecture & Environment Realization

The MSNS Learning Management System (LMS) v2.0 Enterprise Resource Planning (ERP) Edition is constructed as a type-safe, self-contained monolithic application leveraging the T3 Stack. The application is deployed entirely within a single infrastructure project on Railway Pro.

```
+------------------------------------------------------------------------------------------------+
| RAILWAY PRO PLATFORM                                                                           |
+------------------------------------------------------------------------------------------------+
|                                                                                                |
|  +--------------------------+   tRPC Protocol   +---------------------------+                  |
|  | Next.js Application      | <===============> | Node.js LTS Runtime       |                  |
|  | (App Router Frontend)    | Type-Safe RPC     | (tRPC Enterprise Routers) |                  |
|  +--------------------------+                   +---------------------------+                  |
|            |                                               |                                   |
|   Session Extraction & Token Validations       Prisma Client ORM Execution                    |
|            v                                               v                                   |
|  +--------------------------+                   +---------------------------+                  |
|  | NextAuth.js              |                   | PostgreSQL Database        |                  |
|  | (Dual-Credentials Engine)|                   | (Managed State Store)     |                  |
|  +--------------------------+                   +---------------------------+                  |
|                                                                                                |
|                              Internal Blob Operations                                          |
|                                       v                                                        |
|                              +---------------------------+                                     |
|                              | Railway Volume Storage    |                                     |
|                              | (S3-Compatible Object)    |                                     |
|                              +---------------------------+                                     |
+------------------------------------------------------------------------------------------------+
```

#### 1.1.1 Compute and Framework Runtime

- **Runtime Environment:** Node.js LTS executed within an OCI-compliant container runtime managed automatically via Railway's Nixpacks build pipeline from the GitHub master branch.
- **Application Server:** Next.js utilizing the App Router architecture. Dynamic routes and core API endpoints utilize Server-Side Rendering (SSR) and streaming layout architectures to compress TTFB to <200ms.
- **Type-Safe API Communication Layer:** End-to-end type safety is guaranteed across the client-server boundary by a monolithic tRPC architecture. The core API routers are localized within `src/server/api/routers/erp.ts` and structured as individual domain sub-routers via tRPC procedure mergers.

#### 1.1.2 Database Engine & ORM

- **Database Engine:** Managed PostgreSQL cluster hosted natively within the Railway Pro perimeter. Connection multiplexing and scaling are managed via an internal high-performance connection pooler.
- **Data Access Layer:** Prisma Client ORM (`@prisma/client`) provides runtime type verification against the underlying database catalog. All database migrations are declared via static SQL/Prisma schema snapshots, ensuring zero application changes modify existing relational structures destructively without explicit roll-forward scripts.

#### 1.1.3 Storage & File Lifecycle Subsystem

- **Storage Infrastructure:** A production-tier, S3-compatible Railway Volume Storage bucket is provisioned within the same internal sub-network as the compute service. This design eliminates cross-region data transfer charges, providing zero-egress internal data streaming.
- **Security & Asset Delivery:** Secure documents (including Purchase Order PDFs, Direct Expense receipt scans, and Asset audit images) are completely restricted from public read access. Access is authorized exclusively using the AWS S3 SDK to generate time-bound pre-signed URLs with a maximum lifespan of 15 minutes, tightly bound to the calling user's NextAuth session token metadata.

#### 1.1.4 Parent Portal Session Isolation and Security Architecture

To maintain administrative data integrity, parent/guardian users interact with a structurally isolated environment.

```
+-----------------------------------------------------------------------------------------------+
| NEXTAUTH.JS AUTHENTICATION LAYER                                                              |
+-----------------------------------------------------------------------------------------------+
|                                                                                               |
|  +------------------------------------+     +------------------------------------+            |
|  | Core Administrative Provider       |     | Parent Portal Provider             |            |
|  | (Credentials/JWT Scope)            |     | (Isolated Token Scope)             |            |
|  +------------------------------------+     +------------------------------------+            |
|                    |                                         |                               |
|         Route Protection Layer                   Route Protection Layer                     |
|                    v                                         v                               |
|  +------------------------------------+     +------------------------------------+            |
|  | Internal System Middleware Control |     | Parent Portal Route Group Guard    |            |
|  | Path: /(dashboard)                 |     | Path: /parent                      |            |
|  +------------------------------------+     +------------------------------------+            |
|                    |                                         |                               |
|        Access Authorization                      Access Authorization                       |
|                    v                                         v                               |
|  +------------------------------------+     +------------------------------------+            |
|  | Allows Admin, Clerk, Principal,    |     | Allows ParentGuardian Roles Only;  |            |
|  | Head, & Teacher Roles              |     | Fails Administrative Traversals    |            |
|  +------------------------------------+     +------------------------------------+            |
+-----------------------------------------------------------------------------------------------+
```

- **Isolated Route Group Architecture:** The Parent Portal is structured inside a dedicated Next.js route group folder named `app/(parent)/parent/`. This design enforces an isolated bundle footprint and ensures no sub-routes inherit layout files or data-fetching logic from the primary administrative application space (`app/(dashboard)/`).
- **Dual Credentials Providers:** NextAuth.js is configured with two explicit, named `CredentialsProvider` modules:
  1. `administrative-provider` — Validates against the `User` model, parsing administrative roles (ADMIN, CLERK, PRINCIPAL, HEAD, TEACHER) and embedding a JWT token containing specific operational access permissions.
  2. `parent-guardian-provider` — Queries the `ParentGuardian` model directly. Upon valid verification of the hashed password, it returns a distinct parent session payload.
- **Cryptographic Token Scope Enforcement:** The JWT issued to a parent profile is tagged with an immutable `scope: "PARENT_PORTAL"` parameter. Next.js middleware performs deep inspection on every incoming request. Any token containing `scope: "PARENT_PORTAL"` trying to traverse paths under `/(dashboard)` or hit `api.erp.*` tRPC procedures is intercepted and blocked with an immediate HTTP 403 Forbidden error.

---

### 1.2 Core Transaction Workflows & Execution Topologies

#### 1.2.1 Workflow A: Exam-Based Promotion Workflow

This workflow automates the evaluation, classification, and execution of bulk student upgrades to the next grade upon exam completion.

**Execution Sequence:**

```
[Teacher / Clerk]  [tRPC API Router]  [PostgreSQL DB]  [Prisma Transaction Engine]
       |                  |                  |                      |
       |--- 1. Save All Marks ------------>  |                      |
       |           (Grid Transaction)        |--- 2. Write Records ->|
       |                                     |<-- 3. Confirmation ---|
       |                  |--- 4. Mutate Exam Status to COMPLETED -------->|
       |                  |--- 5. Evaluate PromotionEligibilityRules ------>|
       |                  |--- 6. Generate PromotionEligibilityResult Rows ->|
       |                  |<-- 7. Stream Promotion Eligibility Report -------|
[Admin User]
       |--- 8. Confirm Bulk Promotion Batch --------------------------------->|
       |              +-------------------------------+
       |              | START ISOLATED TRANSACTION    |
       |              | -- Create BulkPromotionBatch  |
       |              | -- Enforce Manual Overrides   |
       |              | -- Deactivate Current SCs     |
       |              | -- Insert Target Class SCs    |
       |              | COMMIT TRANSACTION BLOCK      |
       |              +-------------------------------+
       |<-- 9. Complete (Download PDF / Dispatch Push Alerts) --------------|
```

**Core Database Engine Mechanics:**

1. **State Gate Check** — The mutation initiates when a Teacher or Clerk submits final marks via `api.exam.saveAllMarks`. The system performs an aggregate verify operation over the `Marks` model for the target `examId` to ensure every student enrolled in the linked `classId` has a record across all subjects listed in the `ExamDatesheet`.
2. **Automated Completion Transition** — When marks validation passes, a database trigger or middleware routine shifts `Exam.status` from `ONGOING` to `COMPLETED`. This triggers automated background workers to generate `ReportCard` and `ReportCardDetail` structures for all evaluated students.
3. **Eligibility Rule Execution Engine** — The engine fetches the matching `PromotionEligibilityRule` for the exam's type. For each student, the system calculates the aggregate percentage, checks subject boundaries to determine pass/fail metrics, and writes rows to the `PromotionEligibilityResult` table, categorizing each profile as `Eligible`, `Conditional`, or `Ineligible`.
4. **The Bulk Promotion Transaction Core** — When the Admin executes the final batch promotion tool, the operation is passed to a high-isolation Prisma interactive transaction block (`tx`). The backend verifies source parameters, writes a `BulkPromotionBatch` header and `BulkPromotionBatchItem` tracking records, and generates new `StudentClass` records referencing the target parameters. Manual overrides require an `overrideJustification` text block.
5. **Reversal Circuit Breaker** — If a post-promotion audit fails within the 30-day window, the `api.promotion.reverse` endpoint initiates. It reads the `BulkPromotionBatchItem` context, deletes the target `StudentClass` record, restores the original `StudentClass` status, and logs a permanent audit entry to `PromotionHistory` with mandatory administrative justifications.

---

#### 1.2.2 Workflow B: Bulk Salary Creation & Session Carry-Forward

This workflow initializes systemic salary distributions for the entire employee registry at the boundary of a new academic session, preventing manual data re-entry errors.

**Execution Sequence:**

```
[Admin Operator]  [tRPC Bulk Payroll Router]  [Database Layer]  [Prisma Transaction Engine]
       |                    |                       |                      |
       |--- 1. Select Target Session ------------>  |                      |
       |                    |--- 2. Fetch Active Staff -------->|          |
       |                    |<-- 3. Return Base Records --------|          |
       |--- 4. Configure Carry-Forward ----------->|                       |
       |    & Global Increment Constants            |--- 5. Compile Delta Grid Calculations ->|
       |                    |         +---------------------------+
       |                    |         | START ACID TRANSACTION    |
       |                    |         | Enforce Unique Boundary   |
       |                    |         | Create SalaryBatch        |
       |                    |         | Loop Create Assignments   |
       |                    |         | COMMIT BATCH SEQUENCES    |
       |                    |         +---------------------------+
       |<-- 6. Render Output Summary Payload (Generate PDF Summaries) -----|
```

**Detailed Transactional Rules:**

1. **Identity Verification** — The procedure scans the active registry using `tx.employees.findMany`, filtering for records where status fields indicate active employment, spanning Designation options (TEACHER, CLERK, WORKER, HEAD).
2. **Previous Structure Reconstruction** — If the option `Copy from Previous Session` is active, the system queries historical configurations via `SalaryAssignment` records matching the preceding `sessionId`. If no previous compensation model is located for an individual employee, the system flags it in the UI tracking matrix for manual pricing entry.
3. **Global Formula Application Engine** — When an administrator specifies an aggregate global increment, the backend evaluates the pricing adjustments. If the increment type is `PERCENT`, the formula is applied to the employee's base pay. If the increment type is `FIXED`, a fixed-value rule is applied.
4. **Prisma Interactive Multi-Row Commit** — The computed values are passed to a strict `tx` block. The system inserts an accounting ledger entry into `BulkSalaryCreationBatch`, then iterates through the dataset to commit new records directly into the `SalaryAssignment` model.
5. **Rollback Logic and Error Formatter** — If any record fails validation criteria (e.g., negative base salary computations or broken relational keys to an employee ID), the database throws an exception, the Prisma transaction rolls back all operations, and returns a structured error payload:

```json
{
  "status": "ROLLBACK_VALIDATION_ERROR",
  "errorCount": 1,
  "failedItems": [
    {
      "employeeId": "clw09jx78000208ju8w2be89c",
      "employeeName": "Zahid Khan",
      "attemptedValue": -12500.00,
      "reason": "CRITICAL_VIOLATION: Base salary calculations cannot yield a negative monetary balance."
    }
  ]
}
```

---

#### 1.2.3 Workflow C: ERP Purchase Order & Inventory Tracking Lifecycle

This workflow manages the lifecycle of formal institutional procurement, connecting approval workflows directly with real-time stock balances.

**Execution Sequence:**

```
[Authorised Staff]  [tRPC Procurement Router]  [Database Layer]  [Ledger / Stock Automation]
       |                     |                       |                      |
       |--- 1. Raise POR --->|                       |                      |
       |       (Upload Invoices)  |--- 2. Persist PO (Draft) ---------->|  |
       |
       |=== STAGE GATE: MULTI-LAYER ROLE-BASED APPROVAL ENGINE ========================|
       |
       |--- 3. Approve PO (L1 / L2) -->|--- 4. Update Status (Approved / Ordered) -->|
       |                               |--- 5. Commit Budget Deductions ------------->|
       |
       |=== MATERIAL FREIGHT ARRIVAL AND LOGISTICAL VERIFICATIONS =====================|
       |
       |--- 6. File Goods Receipt Note -->|--- 7. Validate Line Qty ----------------->|
       |       (GRN Discrepancy Audits)   |--- 8. Increment Inventory Stocks -------->|
       |
       |=== FINAL FISCAL SETTLEMENT AND LEDGER BALANCING ==============================|
       |
       |--- 9. Execute Paid Status --->|--- 10. Seal PO Record ------------------->|
       |                               |--- 11. Trigger Double-Entry Ledger Posting >|
```

**Core Database Engine Mechanics:**

1. **Draft Initialization** — An authorized user calls `api.erp.purchaseOrder.create`, adding raw entries into `PurchaseOrder` and `PurchaseOrderLineItem` with an initial status of `Draft`. Supporting documents are saved to the internal storage volume, and their URLs are stored in the `attachmentUrls` array.
2. **Budget Commitment Guard** — When the PO transitions to `Approved` or `Ordered` status, the system calculates the `estimatedTotal` and registers it as a committed expense against the associated `CostCentre` budget framework, decreasing the available balance before any actual cash outlay occurs.
3. **Logistical Verification Engine (GRN Generation)** — When items arrive at the facility, staff log details into the `GoodsReceiptNote` and `GRNLineItem` tables. If `QuantityDiscrepancy ≠ 0`, the system forces the inclusion of descriptive text in the `discrepancyNote` field.
4. **Automatic Inventory Adjustment** — When a GRN is committed for stock-tracked assets, a system process adds rows to the `StockTransaction` model using the `StockIn` transaction type and automatically recalculates the item's `quantityOnHand` inside the `InventoryItem` register.
5. **Ledger Transition Rule** — When the PO transitions to `Paid` status, the system triggers double-entry routines to log balanced debit and credit entries to the financial ledger, reconciles the transactions, and permanently closes the PO.

---

#### 1.2.4 Workflow D: Ad-Hoc Direct Expense & Multi-Layer Approval Core

This workflow manages unexpected operational expenditures that do not use a standard Purchase Order pipeline, applying custom multi-stage approval policies.

**Core Database Engine Mechanics:**

1. **Ingress Mapping** — The endpoint `api.erp.expense.submitDirect` creates a new row in the `DirectExpense` model with the default field value `isApproved = false`. Receipts are processed using S3-compatible file storage nodes, saving the generated location strings directly into the `receiptUrl` parameter.
2. **Dynamic Policy Resolution Loop** — The engine queries the `ApprovalPolicy` architecture, filtering by the `DIRECT_EXPENSE` transaction type.
   - If the transaction's amount is ≤ the auto-approval threshold (e.g., PKR 5,000), the system automatically toggles `isApproved = true` and writes an immutable double-entry record to the ledger.
   - If the transaction's amount exceeds the threshold, the system parses the required verification steps and generates rows in the `ApprovalRecord` table.
3. **Approval Inbox Tracking** — Open items are routed to authorized users via the `ApprovalInbox` dashboard. Users submit decisions using the `ApprovalDecision` schema framework (`Approved`, `Rejected`, `PendingInfo`).
4. **Finalizing State Commits** — When all approval steps are completed successfully, the system flags the expense as `isApproved = true` and creates an immutable row in the `FinancialLedgerEntry` model. If any approval step results in a rejection, the system records the reason in `rejectionReason` and routes the expense back to the original creator as a draft.

---

#### 1.2.5 Workflow E: Immutable Double-Entry Ledger Posting Flow

This core ledger subsystem processes all transactional mutations throughout the application, enforcing double-entry rules and audit compliance.

**Core Database Engine Mechanics:**

1. **Polymorphic Ingress Routing** — The central posting endpoint receives transactional inputs from across the application ecosystem, specifying required attributes for the `FinancialLedgerEntry` schema.
2. **Mathematical Balancing Guard** — Every individual asset mutation requires a balanced pair of ledger writes, where the net change across the transaction balances to zero. If this condition is not met, the transaction fails immediately.
3. **Append-Only Enforcement Rules (DR-05)** — The database layer implements a strict append-only security policy on the `FinancialLedgerEntry` model. The system blocks all `UPDATE` and `DELETE` requests at the database driver level.
4. **Error Correction Procedures** — To correct historical reporting errors, an administrator must post an explicit counter-entry. This process creates a balancing row that references the source item ID inside the `counterEntryId` parameter and appends a clear explanation within the `justification` field.

---

## SECTION 2: APP PAGE ROUTING & UI/UX DESIGN ARCHITECTURE

### 2.1 Layout System & Route Access Guards

#### 2.1.1 Route Authentication Matrix

| Target Route Path Pattern | Allowed Role Enumerations | Active Token Scope Guard | Core UI Layout |
|---|---|---|---|
| `/login` | ALL | None (Public Guest Ingress) | Central Minimalist Card Frame |
| `/(dashboard)/admin/*` | ADMIN, PRINCIPAL | ADMIN_ADMINISTRATIVE_SCOPE | Sidebar navigation, administrative command view |
| `/(dashboard)/clerk/*` | CLERK, ADMIN, PRINCIPAL | ADMIN_ADMINISTRATIVE_SCOPE | Clerk data entry interface, operational tools |
| `/(dashboard)/teacher/*` | TEACHER, HEAD, ADMIN | ADMIN_ADMINISTRATIVE_SCOPE | Teacher portal, classroom and marking utilities |
| `/parent/*` | ParentGuardian | PARENT_PORTAL_SCOPE | Read-only simplified view, student tracking portal |

#### 2.1.2 Layout Composition & Loading State Architecture

- **Administrative Sidebar Layout:** The administrative layout uses a responsive design with a collapsible sidebar on the left and a global header on top. The top header displays active academic session selectors, user profile summaries, and the real-time `ApprovalInbox` widget status.
- **Streaming Layout Architecture:** Page containers wrap interactive components in React `Suspense` limits. While async data fetches run over tRPC, the application displays a pulse skeleton container that matches the layout of the oncoming data grid to reduce perceived loading lag.

---

### 2.2 Complete Routing Specifications & View Layouts

#### 2.2.1 Route Group 1: Internal Administrative Dashboard Group (`(dashboard)/*`)

**Route: `/(dashboard)/admin/exams/marking-centre`**

- **Functional Purpose:** Provides a centralized, spreadsheet-style data entry interface for managing student examination marks across all class subjects.
- **Authorized Access Roles:** ADMIN, PRINCIPAL, CLERK, TEACHER.
- **Core UI Components:**
  - Top Bar Controls: Dropdown menus for selecting active academic sessions, target class levels, and specific examination types.
  - Data Grid Component: A multi-column input grid displaying student names along the rows and active class subjects across the columns.
  - Status Indicators: Real-time counters showing rows completed and columns completed.
- **State & Action Mutators:**
  - Inline Navigation: Supports keyboard navigation (Tab/Enter keys) for fast sequential data entry across grid cells.
  - Real-Time Input Validation: Validates entered marks against maximum subject values in real time. Invalid inputs highlight cells in red and display a warning tooltip.
  - Save Controls: Includes a "Save Row" action for individual lines and a "Save All Changes" action to commit the entire grid in a single operation.
  - CSV Data Import: An upload button processes pre-formatted CSV files, matching data to student roll numbers and subject codes with a preview window.

**Route: `/(dashboard)/admin/promotions/bulk-processor`**

- **Functional Purpose:** Provides administrative tools for reviewing promotion eligibility reports and processing bulk student advancements.
- **Authorized Access Roles:** ADMIN, PRINCIPAL.
- **Core UI Components:**
  - Filter Ribbon: Options to select source academic sessions, source grades, target sessions, and target grades.
  - Eligibility Data Table: Displays student lists with automatically calculated aggregate percentages, pass/fail status flags, and calculated eligibility states (Eligible, Conditional, Ineligible).
  - Review Sidebar: A dedicated pane that highlights students in the `Conditional` state, requiring manual review and action.
- **State & Action Mutators:**
  - Batch Selection: One-click controls to select all eligible profiles or clear current selection sets.
  - Manual Exception Overrides: Clicking individual eligibility badges opens a modal window allowing administrators to change a student's promotion status. Overriding a status requires entering an administrative justification note.
  - Batch Execution Trigger: A confirmation button prompts the user to review a final summary of changes before executing the bulk promotion routine.

**Route: `/(dashboard)/admin/salary/bulk-initializer`**

- **Functional Purpose:** Manages base salary assignments and batch compensation updates for school employees at the start of an academic session.
- **Authorized Access Roles:** ADMIN, PRINCIPAL.
- **Core UI Components:**
  - Configuration Panel: Controls to carry forward salary data from previous sessions and options to define global increment adjustments.
  - Compensation Data Grid: A multi-column view showing employee names, roles, previous base salary rates, calculated increments, and proposed new base values.
  - Validation Footer: Displays runtime validation summaries, tracking empty fields or calculation errors.
- **State & Action Mutators:**
  - Global Increment Controls: Inputs to apply percentage-based or fixed-amount salary increases across all listed employees simultaneously.
  - Direct Cell Editing: Allows users to edit individual salary cells within the data grid to apply custom compensation adjustments.
  - Batch Creation Commit: A confirmation button executes the bulk creation transaction, showing progress bars and loading indicators during processing.

**Route: `/(dashboard)/admin/erp/purchase-orders`**

- **Functional Purpose:** Manages the lifecycle of procurement documentation from initial request through multi-level approvals and final payment tracking.
- **Authorized Access Roles:** ADMIN, PRINCIPAL, HEAD, CLERK.
- **Core UI Components:**
  - Status Kanban Board: Groups purchase orders into columns by active lifecycle stage (Draft, PendingApproval, Approved, Ordered, Received, Paid).
  - Document Editor Layout: Split-screen interface featuring input forms for order details on one side and an interactive PDF preview pane on the other.
  - Logistics Tracking View: Expands to display linked Goods Receipt Notes, confirming delivered item counts and identifying any order discrepancies.

**Route: `/(dashboard)/admin/erp/budgets`**

- **Functional Purpose:** Controls institutional spending allocations across cost centers and tracks financial utilization in real time.
- **Authorized Access Roles:** ADMIN, PRINCIPAL, HEAD.
- **Core UI Components:**
  - Cost Center Grid: Visual dashboard tracking active cost centers, showing calculated utilization percentages, committed expenses, and remaining funds.
  - Real-Time Heatmap: A color-coded visualization matrix that changes color based on utilization rates, highlighting cost centers that exceed warning thresholds.
  - Adjustment Interface: Form tools for shifting budget allocations between different cost categories.

**Route: `/(dashboard)/admin/erp/inventory`**

- **Functional Purpose:** Tracks stock levels for consumable goods, logs item usage, and manages physical inventory reconciliations.
- **Authorized Access Roles:** ADMIN, CLERK.
- **Core UI Components:**
  - Stock Level Ledger: A detailed data table listing active inventory stock items, showing current on-hand quantities, storage locations, unit costs, and minimum reorder points.
  - Stock In/Out Log: A side panel detailing historical inventory transactions, showing links to related Goods Receipt Notes or item issuance records.
  - Reconciliation Grid: An interactive data input form used to log physical inventory counts alongside current system-calculated balances.

**Route: `/(dashboard)/admin/erp/assets`**

- **Functional Purpose:** Manages fixed institutional assets throughout their lifecycle, tracking maintenance schedules and computing annual depreciation values.
- **Authorized Access Roles:** ADMIN, PRINCIPAL.
- **Core UI Components:**
  - Fixed Asset Registry: A master list detailing institutional assets, showing unique identification tags, purchase prices, current functional condition, and assigned locations.
  - Depreciation Analytics Panel: Interactive chart components showing asset depreciation over time, tracking accumulated write-offs alongside net book value calculations.
  - Maintenance Schedule Board: A calendar and list interface that displays upcoming preventive maintenance dates and tracks historical service events.

**Route: `/(dashboard)/admin/erp/petty-cash`**

- **Functional Purpose:** Manages daily localized cash disbursements, tracks active cash balances, and handles account replenishment workflows.
- **Authorized Access Roles:** ADMIN, CLERK.
- **Core UI Components:**
  - Balance Tracking Dashboard: A prominent header interface showing the current opening balance, active cash totals, and defined minimum limits.
  - Disbursement Ledger: A detailed table listing daily cash expenditures, showing payment voucher references, cost centers, and recipient names.
  - Reconciliation Workspace: A split entry layout used to audit cash boxes, matching physical counts against system transaction logs.

**Route: `/(dashboard)/admin/erp/cfo-dashboard`**

- **Functional Purpose:** High-level financial analytics dashboard providing real-time visibility into profit-and-loss metrics and institutional budget trends.
- **Authorized Access Roles:** ADMIN, PRINCIPAL.
- **Core UI Components:**
  - Financial Summary Cards: Quick-reference metrics displaying total income, operational expenditures, and calculated net margins.
  - Cash Flow Trend Chart: Line and bar charts displaying multi-month financial trends, comparing monthly revenues against operational outflows.
  - Budget Utilization Heatmap: A visual grid displaying spending across institutional departments, highlighting areas with high consumption rates.

#### 2.2.2 Route Group 2: Isolated Parent/Guardian Portal (`(parent)/*`)

**Route: `/parent/dashboard`**

- **Functional Purpose:** Provides parents and guardians with a read-only overview of their student's academic and administrative status.
- **Authorized Access Roles:** ParentGuardian.
- **Core UI Components:**
  - Student Profile Selector: A simple dropdown or tab menu used to switch views when a guardian account is linked to multiple enrolled students.
  - Academic Metrics Grid: Displays current attendance rates, recent exam marks, and published teacher announcement cards.
  - Fee Status Container: Shows outstanding balance details, upcoming payment due dates, and historic receipt records.
- **State & Action Mutators:**
  - View Swapping: Changing the student selection reloads the dashboard view, updating all academic and fee components for the selected student via safe read-only queries.
  - Report Card Viewer Modal: Clicking a completed exam row opens a pop-up window displaying the full student report card, with options to download the file as a PDF.

---

### 2.3 Interactive Screen Engineering Matrices

#### 2.3.1 Component Architecture: Spreadsheet-Style Examination Marking Grid

```
+-----------------------------------------------------------------------------------------------+
| EXAMINATION MARKING CENTRE -- MAIN RECORDING WORKSPACE                                       |
+-----------------------------------------------------------------------------------------------+
| Session: 2025-2026 | Class: SSC-I Rose | Exam: Midterm 2026                                  |
+-----------------------------------------------------------------------------------------------+
| Search Student: [...................] Filter Status: [ All / Pending / Partial ]              |
+-----------------------------------------------------------------------------------------------+
| Student Roll / Name    | English (100) | Mathematics (100) | Urdu (75) | Progress             |
+-----------------------------------------------------------------------------------------------+
| 101 - Ali Ahmad        | [ 85 ]        | [ 92 ]            | [ 61 ]    | [||||||| 100%]       |
+-----------------------------------------------------------------------------------------------+
| 102 - Fatima Bibi      | [ 42 ]        | [ ERR: 105 ! ]    | [ 50 ]    | [||||| 75%]          |
|                        |               | (! Max: 100)      |           |                      |
+-----------------------------------------------------------------------------------------------+
| 103 - Usman Ghani      | [ Pending ]   | [ 78 ]            | [Pending] | [|| 33%]             |
+-----------------------------------------------------------------------------------------------+
| [ IMPORT FROM CSV ]                                [ SAVE ALL GRID CHANGES ]                 |
+-----------------------------------------------------------------------------------------------+
```

**Component TypeScript Interface:**

```typescript
interface MarkingGridProps {
  examId: string;
  classId: string;
  sessionId: string;
  onSaveSuccess?: () => void;
}

interface StudentMarkRow {
  studentId: string;
  rollNumber: string;
  studentName: string;
  marks: {
    [subjectId: string]: {
      obtainedMarks: number | null;
      totalMarks: number;
      isModified: boolean;
      isValid: boolean;
      lastModifiedBy?: string;
      timestamp?: string;
    };
  };
  rowCompletionPercentage: number;
}
```

**Interactive State Definitions & Validation Engine Rules:**

- **Cell Validation States:** Each individual cell maintains its own validation state. When a user alters a cell value, an `onChange` handler checks the entry against the maximum permissible score for that subject. If the input value exceeds the maximum threshold or falls below zero, the cell's `isValid` state flags as `false`. The component adds bright red border outlines and displays an error alert tooltip. The global state tracking array appends the cell error to an active validation queue, which disables the main "Save All Changes" button until the input error is resolved.
- **Inline Navigation Engine:** Custom `keydown` listeners manage arrow and tab navigation within the grid. Pressing the `Tab` key moves the active cursor horizontally to the adjacent subject cell, while pressing `Enter` moves the cursor vertically down to the same subject cell for the next student.
- **Row Progress Calculator:** Each row updates a completion bar layout in real time, calculating the percentage of subjects that have valid scores entered out of the total subjects assigned to the exam datesheet.

#### 2.3.2 Component Architecture: Multi-Stage Document Router & Approval Inbox Widget

```
+-----------------------------------------------------------------------------------------------+
| SYSTEM APPROVAL INBOX WIDGET -- AUTHORIZED PRIVILEGE CONSOLE                                 |
+-----------------------------------------------------------------------------------------------+
| Filter Category: [ ALL / PO / EXPENSE ]    Delegation Active: [ None ]                       |
+-----------------------------------------------------------------------------------------------+
| ID     | Type      | Requestor    | Summary Description    | Amount     | Action Controls    |
+-----------------------------------------------------------------------------------------------+
| PO-882 | PO (L2)   | Clerk Farhan | IT Lab Computers       | PKR 145,000 | [VIEW] [APP] [REJ] |
+-----------------------------------------------------------------------------------------------+
| EXP-09 | Expense   | Teacher Ali  | Office Stationery      | PKR 3,200   | [VIEW] [APP] [REJ] |
+-----------------------------------------------------------------------------------------------+
| BGT-41 | Budget    | Head Fizza   | Shift Acad -> Infra    | PKR 50,000  | [VIEW] [APP] [REJ] |
+-----------------------------------------------------------------------------------------------+
```

**Interactive Layout Interaction Rules:**

- **Split-Pane Overview Layout:** The dashboard layout uses a split-pane structure. The left pane displays a scrollable list of pending approval requests, while clicking an item displays its full details in the right pane, including request details, attached files, and historical approval steps.
- **Action Verification Modals:** Clicking the "Approve" button opens a confirmation window to add optional comments before signing the transaction. Clicking "Reject" forces the user to enter a rejection reason into a required text field.
- **Live Budget Impact Preview:** When reviewing a Purchase Order or Direct Expense, the detail view displays a real-time bar chart showing the impact on the target budget, overlaying the request amount against the cost center's remaining funds.

#### 2.3.3 Component Architecture: Real-Time Financial Ledger View

```
+-----------------------------------------------------------------------------------------------+
| ENTERPRISE GENERAL LEDGER VIEW REGISTER                                                       |
+-----------------------------------------------------------------------------------------------+
| Date Range: [ 2026-05-01 ] to [ 2026-05-30 ]  Account Type: [ Expenditure ]                 |
| Cost Centre: [ All Cost Centres ]              Source Modules: [ All Sources ]                |
+-----------------------------------------------------------------------------------------------+
| Timestamp    | Code   | Source/ID  | Description Mapping             | Debit (PKR) | Credit  |
+-----------------------------------------------------------------------------------------------+
| 17 May 14:02 | EXP-30 | PO-882     | IT Lab Procurement Settlement   | 145,000.00  | 0.00    |
+-----------------------------------------------------------------------------------------------+
| 17 May 15:30 | CHQ-12 | SAL-901    | Staff Salary Disbursement       | 620,000.00  | 0.00    |
+-----------------------------------------------------------------------------------------------+
| 19 May 11:15 | REV-02 | FEE-88301  | Monthly Tuition Ingress         | 0.00        | 8,500.00|
+-----------------------------------------------------------------------------------------------+
| TOTALS RECONCILED LEDGER SUMMARY                                      | 765,000.00  | 8,500.00|
+-----------------------------------------------------------------------------------------------+
```

**Render & Data Interaction Design Metrics:**

- **Server-Driven Pagination & Infinite Scroll:** The component handles pagination using tRPC endpoints with cursor-based parameters. The table renders an initial set of 50 records and uses intersection observers to load the next set of rows as the user scrolls.
- **Visual Typography Patterns:** Monetary values are displayed using fixed-width tabular font numerals. Debit values render in deep blue, while credit entries display in dark green.
- **Drill-Down Drawer Interfaces:** Clicking a transaction row slides out a detailed side drawer that displays item metadata, authorization logs, and links to related transaction records. The drawer includes an option to generate and download a formal PDF summary of the transaction.

---

## SECTION 3: SYSTEM METHODOLOGY & DESIGN SYNTHESIS

### 3.1 Verification and Completeness Check

#### 3.1.1 Implementation Mapping: Requirements to Technical Solutions

| SRS Requirement Group | Reference IDs | Technical Solution |
|---|---|---|
| Per-Student Subject Marking | FR-EXM-26 to 37 | Spreadsheet-Style Examination Marking Grid UI and `saveAllMarks` tRPC execution pipeline |
| Exam-Based Promotion Workflows | FR-PRM-05 to 16 | Interactive Bulk Promotion Workflow Dashboard and automatic background eligibility engines |
| Bulk Salary Creation & Carry-Forward | FR-SAL-01 to 10 | Salary Bulk Initializer Workspace UI and individual multi-row data population pipelines |
| ERP Expense Management | FR-ERP-01 to 46 | Cost Center Tracking, Multi-Stage PO Verification Pipelines, Stock Reconciliations, Asset Depreciation Schedules, Petty Cash Balancing, and Immutable Append-Only Ledger Entry Architectures |
| Strategic Proposed Features | FR-AST-01 to FR-HRM-05 | QR-Code Asset Layouts, Teacher Dashboard Effectiveness Analytics, Isolated Parent Portal Layout Guards, and Leave Application Approval Streams |

#### 3.1.2 Performance and Security Target Verification

- **NFR-PERF-05 (Grid Responsiveness):** Managed by using optimized client-side state trees and specialized keydown listeners, ensuring smooth UI performance when rendering standard marking layouts.
- **NFR-PERF-06 (Real-Time P&L Generation):** Handled by using single-pass index scans over PostgreSQL ledger tables, calculating profit-and-loss balances within 3 seconds for active sessions.
- **NFR-SEC-10 & DR-05 (Ledger Immutability):** Enforced by using strict application guards and database-level rules that block all UPDATE and DELETE requests, ensuring data changes occur only through append-only counter-entries.

---

### 3.2 Deployment and Delivery Matrix

```
+---------------------------------------------------------------------------------------------------+
| DEPLOYMENT STRATEGY & TESTING MILESTONES                                                          |
+---------------------------------------------------------------------------------------------------+
| SPRINT TIER 1: RELATIONAL STATE BUILD                                                             |
| - Run migration schemas (20260517_v2_erp.prisma) to establish tables.                            |
| - Implement append-only rules (DR-05) on ledger models.                                           |
|                                                                                                   |
| SPRINT TIER 2: TRPC ENDPOINT ROUTING BUILD                                                        |
| - Build out core routers under src/server/api/routers/erp/                                        |
| - Implement spreadsheet inputs, salary calculations, and approval flows.                           |
|                                                                                                   |
| SPRINT TIER 3: USER INTERFACE INTEGRATION BUILD                                                   |
| - Build out components for the marking grid and budget heatmap.                                    |
| - Connect frontend elements to tRPC API hooks for live data interaction.                           |
|                                                                                                   |
| SPRINT TIER 4: ISOLATION INTEGRATION BUILD                                                        |
| - Enforce isolated token parameters on parent portal route groups.                                 |
| - Configure pre-signed document delivery links with 15-minute validity.                            |
+---------------------------------------------------------------------------------------------------+
```

#### 3.2.1 Operational Environment Deployment Plan

- **Database Migration Step:** Run schema updates using the file `20260517_v2_erp.prisma` to build out the required tables, keys, and indexes without disrupting existing database fields.
- **Environment Variables Update:** Remove any legacy Google Cloud Storage configuration entries from the project, replacing them with active parameters for the S3-compatible internal volume storage system.
- **Automatic Pipeline Launch:** Commit all changes to the GitHub master branch. The continuous integration pipeline automatically processes the codebase, builds the application using Node.js LTS, and deploys the updated system container to Railway Pro.

---

### 3.3 Unified Verification Test Cases

#### Test Suite 1: Academic Promotion Pipeline & Rollback Validation

- **Test Objective:** Verify that student promotion records are evaluated correctly based on exam data and that rollback tools function within the specified 30-day window.
- **Execution Input Vectors:**
  - Target a test group of 10 students within class level SSC-I Rose.
  - Set 8 student profiles with exam marks above 75%, and configure 2 profiles with scores below 35% in mandatory subjects.
- **Expected Behavior Outcomes:**
  - The background worker correctly categorizes the 8 passing profiles as `Eligible` and flags the 2 remaining profiles as `Ineligible`.
  - Executing the bulk promotion tool successfully upgrades the 8 eligible students to SSC-II and sets their old records to inactive within a single transaction.
  - Triggering a manual override for an ineligible student requires entering a justification note before the change is accepted.
  - Running the promotion reversal tool deletes the new enrollment, restores the student's previous enrollment status, and appends an audit entry to the tracking logs.

#### Test Suite 2: ERP Procurement Threshold and Ledger Mutation Guard

- **Test Objective:** Verify that procurement workflows execute correct multi-stage routing based on financial thresholds and ensure that the ledger balances properly.
- **Execution Input Vectors:**
  - Submit a Purchase Order request totaling PKR 4,500, then file a second request totaling PKR 25,000.
  - Approve both items through the procurement pipeline, change their status to `Paid`, and then try to run a SQL modification query on the resulting ledger rows.
- **Expected Behavior Outcomes:**
  - The PKR 4,500 request bypasses high-tier approvals and triggers low-level workflow validation rules.
  - The PKR 25,000 request requires a second-level approval, routing the item through both Head and Principal authorization queues.
  - Setting an item to `Paid` status automatically creates a balanced pair of ledger entries, ensuring that debits match credits exactly.
  - The system blocks direct modification or deletion queries on ledger rows at the driver level, forcing users to post explicit counter-entries to make financial adjustments.

#### Test Suite 3: Parent Portal Boundary Isolation Guard

- **Test Objective:** Verify that parent portal route groups are isolated from administrative views, blocking unauthorized cross-portal access.
- **Execution Input Vectors:**
  - Authenticate an active user session within the parent portal dashboard environment.
  - Directly send an HTTP request to an internal administrative route path or attempt to trigger a tRPC procedure under `api.erp.*`.
- **Expected Behavior Outcomes:**
  - The middleware intercepts the parent session token and identifies the unauthorized traversal attempt.
  - The security system blocks the request, prevents data exposure, and returns an immediate HTTP 403 Forbidden response.

#### Test Suite 4: Bulk Salary Formula Calculations & Rollback Safeguards

- **Test Objective:** Verify that bulk compensation modules generate precise salary calculations across employee records and roll back cleanly if errors occur.
- **Execution Input Vectors:**
  - Select 15 active teacher records, setting 14 profiles with standard base compensation structures and 1 profile with missing or corrupted payment metrics.
  - Apply a global percentage increment of 10% across the selected employee list.
- **Expected Behavior Outcomes:**
  - The calculation engine processes the 14 standard profiles correctly, applying the percentage formula to update proposed base compensation amounts.
  - The system identifies the corrupted profile, halts processing before making any permanent database writes, and cancels the current bulk initialization task.
  - The transaction rolls back all pending changes cleanly, leaving historical records unchanged, and displays an informative validation summary identifying the failed row.

---

*Document generated for MSNS LMS v2.0 — ERP Edition | lms.msns.edu.pk | BISE Gujranwala Affiliated*