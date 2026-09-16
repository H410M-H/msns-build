# Prisma Query Optimization & Data Fetching Invariants

## 1. Core Invariant: Prefer `select` over `include`
All Prisma data fetching queries in tRPC routers and API endpoints must use `select: { ... }` instead of `include: { ... }`:
- **Explicit Field Selection**: Fetch ONLY the columns and relations required by the immediate procedure response or calculation.
- **Never Over-Fetch**: Avoid scalar over-fetching on large entities (`Students`, `Employees`, `User`, `Marks`, `Exam`, `FinancialLedgerEntry`). Over-fetching degrades PostgreSQL performance, increases memory allocation, and leaks unneeded fields over the network.
- **Security & Privacy**: Strict `select` prevents accidental exposure of sensitive metadata (password hashes, biometric signatures, internal audit logs).

## 2. Nested Relational Projections
When querying relations, project fields specifically:
```typescript
// ❌ Anti-pattern (over-fetches all columns of parent and child)
const exam = await ctx.db.exam.findUnique({
  where: { examId },
  include: {
    ExamDatesheet: {
      include: { Subject: true },
    },
  },
});

// ✅ Compliant pattern (fetches only required fields)
const exam = await ctx.db.exam.findUnique({
  where: { examId },
  select: {
    examId: true,
    totalMarks: true,
    passingMarks: true,
    ExamDatesheet: {
      select: {
        subjectId: true,
        Subject: { select: { subjectId: true, subjectName: true } },
      },
    },
  },
});
```

## 3. Scope & Enforcement
- Applies to all queries in `src/server/api/routers/`.
- Must be followed on all new endpoints and refactors.
