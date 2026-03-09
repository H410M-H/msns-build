# Class Diary Management System - Complete Implementation

## System Overview

This document provides a comprehensive guide to the Subject Diary Management System implemented in the MSNS-LMS platform. The system allows educators to efficiently manage and track daily work/homework for all subjects within a class.

## Implemented Components

### 1. Core Dialog Component

#### CreateDiaryDialog
**File**: `src/components/dialogs/CreateDiaryDialog.tsx`

**Purpose**: Centralized interface for creating diary entries for multiple subjects in a single class.

**Key Features**:
- Date picker for diary entry date
- Fetches all subjects assigned to the selected class
- Dropdown selection for sequential subject work entry
- Real-time work input with textarea
- Summary table showing all subjects and their work status
- Batch creation - creates entries for all subjects with work in one action
- Visual indicators for completed vs. pending subjects

**Props**:
```typescript
interface CreateDiaryDialogProps {
  classId: string;              // ID of the class
  sessionId: string;            // Current session ID
  open: boolean;                // Dialog visibility state
  onOpenChange: (open: boolean) => void; // Visibility handler
  onSuccess: () => void;        // Callback after successful creation
}
```

**Usage Example**:
```typescript
<CreateDiaryDialog
  classId="cmf2ldvi10000fzxopki1of2d"
  sessionId="cmf2holu40002jv041uwwcqpv"
  open={showDialog}
  onOpenChange={setShowDialog}
  onSuccess={() => refetch()}
/>
```

### 2. Enhanced Component

#### ClassDiariesTab
**File**: `src/components/blocks/class/ClassDiariesTab.tsx`

**Enhancements**:
- Added role-based access control
- "Add Work" button for TEACHER, ADMIN, CLERK roles
- Integration with CreateDiaryDialog
- Read-only mode for HEAD and PRINCIPAL roles
- Date filtering
- Grid-based diary card display with rich formatting

**Props**:
```typescript
interface ClassDiariesTabProps {
  classId: string;
  sessionId: string;
  userRole?: string;  // NEW: ADMIN, CLERK, TEACHER, HEAD, PRINCIPAL
  userId?: string;    // NEW: Current user ID
}
```

### 3. Teacher Dashboard Pages

#### Teacher Diaries Management
**File**: `src/app/(dashboard)/teacher/diaries/page.tsx`

**Features**:
- View all diary entries created by the teacher
- Filter by date and subject
- Edit existing diary entries
- Delete diary entries
- Card-based responsive layout
- Edit dialog with confirmation
- Delete confirmation

**Route**: `/teacher/diaries`

**Components Used**:
- PageHeader (navigation breadcrumbs)
- Input (date and search filters)
- Card, Badge, Button
- Textarea (for editing)
- Dialog (edit and deletion)

### 4. Administrative Pages

#### Head Department Diary Review
**File**: `src/app/(dashboard)/head/diaries/page.tsx`

**Features**:
- View-only access to all diaries in the institution
- Statistics dashboard (total diaries, classes, subjects, teachers)
- Advanced filtering (date, class, subject)
- Detailed diary view dialog
- Responsive table and card layouts

**Route**: `/head/diaries`

**Access Control**: Read-only, can filter and view but cannot modify

#### Principal Institution-Wide Diary Management
**File**: `src/app/(dashboard)/principal/diaries/page.tsx`

**Features**:
- System-wide diary visibility
- Comprehensive statistics dashboard
- Advanced filtering (date, class, subject, teacher)
- Table-based view with sorting capabilities
- Detailed diary information in modal dialogs
- Performance metrics (entries this week, class distribution)

**Route**: `/principal/diaries`

**Access Control**: Read-only with full filtering capabilities

### 5. API Extensions

#### ClassRouter Enhancement
**File**: `src/server/api/routers/class.ts`

**New Procedure**: `getClassSubjects`

**Endpoint**:
```typescript
api.class.getClassSubjects.useQuery({
  classId: string;    // Class identifier
  sessionId: string;  // Current session
})
```

**Returns**:
```typescript
Array<{
  csId: string;
  subjectId: string;
  Subject: {
    subjectId: string;
    subjectName: string;
  };
  Employees: {
    employeeId: string;
    employeeName: string;
  };
}>
```

**Purpose**: Fetch all subjects assigned to a class with teacher information

## File Structure

```
src/
├── app/
│   └── (dashboard)/
│       ├── admin/
│       │   └── sessions/
│       │       └── class/
│       │           └── page.tsx (MODIFIED)
│       ├── clerk/
│       │   └── sessions/
│       │       └── class/
│       │           └── page.tsx (MODIFIED)
│       ├── teacher/
│       │   └── diaries/
│       │       ├── page.tsx (NEW)
│       │       └── layout.tsx (NEW)
│       ├── head/
│       │   └── diaries/
│       │       ├── page.tsx (NEW)
│       │       └── layout.tsx (NEW)
│       └── principal/
│           └── diaries/
│               ├── page.tsx (NEW)
│               └── layout.tsx (NEW)
├── components/
│   ├── blocks/
│   │   └── class/
│   │       └── ClassDiariesTab.tsx (MODIFIED)
│   └── dialogs/
│       └── CreateDiaryDialog.tsx (NEW)
└── server/
    └── api/
        └── routers/
            └── class.ts (MODIFIED)
```

## Database Schema Reference

### SubjectDiary Table
```sql
-- Stores individual diary entries for each subject
CREATE TABLE "SubjectDiary" (
  "subjectDiaryId" TEXT PRIMARY KEY,
  "classSubjectId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "date" TIMESTAMP DEFAULT now(),
  "content" TEXT NOT NULL,
  "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP,
  FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("csId") ON DELETE CASCADE,
  FOREIGN KEY ("teacherId") REFERENCES "Employees"("employeeId") ON DELETE CASCADE
);

CREATE INDEX idx_subjectdiary_classsubject ON "SubjectDiary"("classSubjectId");
CREATE INDEX idx_subjectdiary_teacher ON "SubjectDiary"("teacherId");
```

### ClassSubject Table
```sql
-- Links classes to subjects and assigns teachers
CREATE TABLE "ClassSubject" (
  "csId" TEXT PRIMARY KEY,
  "classId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  FOREIGN KEY ("classId") REFERENCES "Grades"("classId"),
  FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId"),
  FOREIGN KEY ("employeeId") REFERENCES "Employees"("employeeId"),
  FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId")
);
```

## Role-Based Access Matrix

| Role | Create Diary | Edit Diary | Delete Diary | View All | View Own |
|------|-------------|-----------|-------------|----------|----------|
| ADMIN | ✓ | ✓ | ✓ | ✓ | N/A |
| CLERK | ✓ | ✓ | ✓ | ✓ | N/A |
| TEACHER | ✓ | ✓ (own) | ✓ (own) | ✗ | ✓ |
| HEAD | ✗ | ✗ | ✗ | ✓ | N/A |
| PRINCIPAL | ✗ | ✗ | ✗ | ✓ | N/A |

## Integration Points

### Class Management Interface
Both admin and clerk class management pages now include a comprehensive diaries tab:

**Admin**: `/admin/sessions/class?classId=...&sessionId=...`
- Tab navigation with diaries as fifth tab
- Full CRUD capabilities with "Add Work" button

**Clerk**: `/clerk/sessions/class?classId=...&sessionId=...`
- Similar tab interface for diary management
- Create/manage diaries for record keeping

### Navigation Flow

```
Dashboard
├── Admin/Clerk
│   └── Sessions
│       └── Class Details
│           ├── Roster
│           ├── Timetable
│           ├── Attendance
│           ├── Exams
│           └── Diaries (NEW)
│               └── Add Work Dialog (NEW)
├── Teacher
│   └── Diaries (NEW) - Personal diary management
├── Head
│   └── Diaries (NEW) - Department overview
└── Principal
    └── Diaries (NEW) - Institution overview
```

## Usage Scenarios

### Scenario 1: Teacher Adding Daily Work
1. Teacher navigates to admin/clerk class details page
2. Clicks "Diaries" tab
3. Clicks "Add Work" button
4. Selects today's date
5. Chooses Mathematics from subject dropdown
6. Enters "Chapter 5: Geometry - Pages 45-50"
7. Clicks "Add Work for This Subject"
8. Selects Science subject
9. Enters "Experiment: Water Cycle Observation"
10. Clicks "Add Work for This Subject"
11. Reviews summary table showing both subjects
12. Clicks "Create Diaries (2)" to save both entries

### Scenario 2: Head Reviewing Class Work
1. Head navigates to `/head/diaries`
2. Filters by:
   - Date: 2024-01-15
   - Class: Class 5 - A
   - Subject: Mathematics
3. Views filtered results showing only Math diaries for that class
4. Clicks "View" on an entry to see full content
5. Reviews teacher's work entries for quality assurance

### Scenario 3: Principal Analyzing Instruction Trends
1. Principal goes to `/principal/diaries`
2. Reviews statistics:
   - 245 total diary entries this month
   - 18 entries this week
   - 6 classes covered
   - 12 subjects documented
   - 8 teachers actively updating
3. Filters by teacher to see their teaching patterns
4. Reviews subject-wise distribution to ensure balanced teaching
5. Identifies any subjects with low diary entries

## Features & Benefits

### For Teachers
- Quick batch entry for all subjects
- Easy editing and deletion
- Centralized diary management dashboard
- Subject and date-based filtering
- Organized record keeping

### For Heads
- Department-wide oversight
- Quality monitoring of instruction
- Identification of teaching trends
- Subject coverage verification
- No accidental modifications

### For Principals
- Institution-wide visibility
- Teaching pattern analysis
- Subject distribution monitoring
- Performance metrics tracking
- Data-driven decision making

### For Admins/Clerks
- Class-level diary management
- Support for data entry
- Administrative oversight
- Backup and record maintenance

## Technical Specifications

### Dependencies
- React 18+
- Next.js 14+ (App Router)
- Framer Motion (animations)
- Date-fns (date handling)
- Shadcn/ui components
- TRPC (API calls)
- Prisma (database)

### Performance Considerations
- Lazy loading of diaries on scroll
- Efficient database queries with indexes
- Memoized components for role checks
- Optimized date filtering
- Pagination ready (can be added)

### Security
- Role-based access control enforced at UI level
- Protected procedures on backend
- Teacher can only edit own diaries
- Cascade delete prevents orphaned records
- Input validation on diary content

## Deployment Notes

1. No database schema changes required (SubjectDiary table already exists)
2. All new components are self-contained
3. Backward compatible with existing code
4. No breaking changes to existing APIs
5. Ready for immediate deployment

## Future Enhancements

1. **File Attachments**: Support for uploading documents/images
2. **Comments**: Allow comments/feedback on diary entries
3. **Email Notifications**: Notify admins of new diaries
4. **Approval Workflow**: Add diary approval process
5. **Templates**: Pre-built diary entry templates
6. **Analytics Dashboard**: Advanced reporting and insights
7. **Export Functions**: PDF/Excel export of diaries
8. **Search**: Full-text search across diary content

## Troubleshooting

### Dialog Not Appearing
- Check if user role is TEACHER, ADMIN, or CLERK
- Verify classId and sessionId are being passed correctly
- Check browser console for React errors

### Subjects Not Loading in Dropdown
- Verify class has subjects assigned in ClassSubject table
- Check sessionId matches current session
- Ensure teacher is assigned to the subjects

### Diaries Not Appearing
- Check if diaries were created for the correct classSubjectId
- Verify date filtering isn't filtering out recent entries
- Check user permissions for viewing

## Support & Contact

For issues or questions regarding the diary system:
1. Check the implementation code in respective files
2. Review Prisma schema for data relationships
3. Verify API endpoint responses in browser DevTools
4. Check server logs for backend errors

---

**Last Updated**: 2024-01-15
**Implementation Status**: Complete ✓
