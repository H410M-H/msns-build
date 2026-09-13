---
name: gender-parentage-formatting
description: Enforces D/O (Daughter of) vs S/O (Son of) prefix standards when displaying father and guardian names for students and staff.
---

# MSNS Gender & Parentage Display Standards

## 1. Parentage Formatting Invariant
Whenever rendering father name, guardian name, or parentage information for students or employees across any UI component, table, card, fee receipt, or print voucher:
- **Female subjects** (`gender === "FEMALE"` or `"F"`, case-insensitive): MUST display the `D/O` ("Daughter of") prefix.
- **Male subjects** (`gender === "MALE"` or `"M"`, or unspecified): Default to `S/O` ("Son of").

## 2. Shared Utility Function
- Always use `getParentagePrefix(gender)` from `@/lib/utils` rather than inline ternary conditions, hardcoded strings, or assuming `S/O`.
- Data queries (e.g. `getDefaultersList`, student/employee list queries) and prop contracts must always select and pass the `gender` field alongside `fatherName` so UI components can dynamically render the correct prefix.
