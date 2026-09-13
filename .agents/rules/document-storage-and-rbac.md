# MSNS Document Storage & Role-Based Access Control (RBAC) Rules

## 1. Cloud Storage Architecture
- All institutional documents, admission forms, academic calendars, examination guidelines, policies, and matric textbooks are centrally stored in the Cloudflare R2 bucket (`msns`) under the prefix `documents/`.
- No sensitive or institutional documents should be stored on ephemeral local containers or unprotected third-party file hosts.
- Files are served via `/api/documents/[filename]` with streamed chunked/byte-range responses and immutable edge caching (`Cache-Control: public, max-age=86400, stale-while-revalidate=604800`).

## 2. Role-Based Access Control (RBAC) Policies
- **Viewing & Downloading**:
  - **Permitted Roles**: `ALL` users (Students, Parents, Workers, Teachers, Clerks, Heads, Principals, Administrators, and verified guests).
  - Everyone can search, filter by category (`Official`, `Academic`, `Examination`, `Policy`, `Admissions`, `General`), preview in browser, and download documents.
- **Uploading New Documents**:
  - **Permitted Roles**: `ADMIN`, `PRINCIPAL`, `HEAD`, `CLERK`, and `TEACHER` only.
  - Any request from unauthorized roles (`STUDENT`, `PARENT`, `WORKER`, unauthenticated) must be rejected with HTTP `403 Forbidden` at the server API layer (`/api/documents` POST).
  - The client UI (`DocumentsManager.tsx`) must only render the upload interface for authorized roles.
- **Deleting Documents**:
  - **Permitted Roles**: `ADMIN`, `PRINCIPAL`, `HEAD`, and `CLERK` only.
  - Any deletion attempt by `TEACHER`, `STUDENT`, `PARENT`, or `WORKER` must be rejected with HTTP `403 Forbidden` at `/api/documents` DELETE.

## 3. Institutional Administration & ERP Modules RBAC
- **Administrative Tier (`ADMIN`, `PRINCIPAL`, `HEAD`, `CLERK`)**:
  - Full access to institutional ERP modules (Revenue, Fee Management, Salary, Bulk Salary, Expenses, Budget & Cost Centres, Purchase Orders, Inventory & Stock, Asset Management, Petty Cash, Financial Ledger).
  - Full access to Examinations (Datesheets, Results Analytics, Promotions, Marking Centre), Sessions & Timetable, Student & Employee Attendance, and Document Management.
  - All administrative tRPC procedures (`adminProcedure`, `managementProcedure`, `teacherProcedure`) and corresponding mobile navigation elements must provide full access to all four roles.

## 4. Metadata & Key Formatting
- New uploads must generate a structured key:
  `documents/${timestamp}__${category}__${sanitizedTitle}__${sanitizedFilename}`
- Standard S3 object metadata headers (`title`, `category`, `uploadedby`, `uploadedat`) must accompany every PutObject command.
- File size limit is capped at 50MB per document. Supported MIME types include PDF, Office documents (DOCX, XLSX, PPTX), CSV/text, and images.
