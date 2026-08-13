---
name: implement-v2-1-mobile
description: Complete implementation workflow brief for MSNS LMS v2.1 — Mobile ERP Edition using Capacitor 8 plugin bridging over the Next.js T3 Stack codebase.
---

# MSNS LMS v2.1 — Mobile ERP Edition Implementation Workflow

This workflow automates the step-by-step implementation and verification of MSNS LMS v2.1 Mobile ERP Edition plugin bridge integrations.

## Phase 0: Exploration & Environment Audit
1. Audit Capacitor dependencies in `package.json` (`@capacitor/core`, `@capacitor/android` version 8.5.0).
2. Verify SDK targets in `android/variables.gradle` (`minSdkVersion = 24`, `targetSdkVersion = 36`).
3. Audit Prisma schema models for `DeviceRegistration` and relations.

## Phase 1: Auth, Biometrics & Token Lifecycle
1. Configure `capacitor.config.ts` with dynamic `cleartext` security and `CapacitorSQLite` `androidBiometric` prompt settings.
2. Abstract native plugin calls inside `src/lib/mobile/native-service.ts` (NFR-MOB-08 compliance).
3. Inject HTTP 401 interception link in `src/trpc/react.tsx` for silent session refresh.
4. Hook mobile state cleanup (`clearAllMobileState`) into sign out handler in `src/components/blocks/sidebar/nav-user.tsx`.

## Phase 2: Offline-First Sync Engine
1. Register Service Worker `public/sw.js` in `src/app/provider.tsx` for static asset resilience.
2. Initialize encrypted SQLite database and create local `sync_queue` table.
3. Build `src/lib/mobile/sync-engine.ts` and `src/hooks/useSyncEngine.ts` to process offline queue on network reconnect or app foregrounding.

## Phase 3: Push Notifications & Deep Links
1. Add `DeviceRegistration` schema model and `mobile.registerDevice` tRPC mutation.
2. Build `src/server/mobile/fcm.ts` helper and wire trigger calls into `attendance.ts`, `reportcard.ts`, `fee.ts`, `subjectDiary.ts`, `purchaseOrders.ts`, and `directExpense.ts`.
3. Create `src/hooks/useDeepLinks.ts` to map `msns://lms/reports/{examId}` and `msns://lms/approvals/{poId}` custom schemes to client-side router navigation.

## Phase 4: Parent Portal
1. Scaffold `src/app/parent/layout.tsx` and `src/app/parent/dashboard/page.tsx` rendering child selector, radial attendance gauge, fee challans, and report cards.
2. Create `src/app/parent/reports/[examId]/page.tsx` for report card PDF viewing.

## Phase 5: Teacher Mobile Suite
1. Build `src/app/(dashboard)/teacher/sessions/attendance/rapid/page.tsx` for one-tap attendance marking.
2. Build `src/components/blocks/dashboard/PeriodCountdownWidget.tsx` for period countdowns.
3. Add camera photo capture to `src/app/(dashboard)/teacher/sessions/diary/create/page.tsx`.

## Phase 6: Admin & Clerk Controls
1. Build emergency contact directory `src/app/(dashboard)/admin/users/directory/page.tsx`.
2. Build ML Kit asset tag barcode scanner `src/app/(dashboard)/admin/erp/assets/scan/page.tsx`.
