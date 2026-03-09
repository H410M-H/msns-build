# Subject Diary Management System

## Overview
The Subject Diary Management System allows teachers, admins, and clerks to create and manage daily work/homework records for all subjects in a class. Heads and Principals can view these diaries but cannot edit them.

## Features Implemented

### 1. **CreateDiaryDialog Component**
- Located: `src/components/dialogs/CreateDiaryDialog.tsx`
- Displays all subjects assigned to a class in a dropdown
- Allows users to add work for each subject sequentially
- Shows a summary table of all subjects with their work status
- Displays subject assignment teacher information
- Batch creates diary entries for all subjects with work

### 2. **Enhanced ClassDiariesTab**
- Located: `src/components/blocks/class/ClassDiariesTab.tsx`
- Updated to support role-based access control
- Shows "Add Work" button for teachers, admins, and clerks
- Displays existing diaries in a card-based grid layout
- Filters by date
- Read-only view for heads and principals

### 3. **Teacher Diaries Management Page**
- Located: `src/app/(dashboard)/teacher/diaries/page.tsx`
- Teachers can view all their diary entries
- Filter by date and subject
- Edit existing diary entries
- Delete diary entries
- Card-based display with quick edit/delete actions

### 4. **Head Diaries Viewing Page**
- Located: `src/app/(dashboard)/head/diaries/page.tsx`
- Head of Department can view all diaries in their institution
- Advanced filtering by date, class, and subject
- Read-only access (no edit/delete permissions)
- Summary statistics (total diaries, classes, subjects, teachers)
- Dialog view for detailed diary content

### 5. **Principal Diaries Overview Page**
- Located: `src/app/(dashboard)/principal/diaries/page.tsx`
- Principal can view all diaries system-wide
- Advanced filtering with multiple parameters (date, class, subject, teacher)
- Statistics dashboard (total entries, this week entries, classes, subjects, teachers)
- Table view for easy scanning
- Read-only access with detailed view dialog

### 6. **Class Subjects Query**
- Added to `src/server/api/routers/class.ts`
- Endpoint: `api.class.getClassSubjects`
- Fetches all subjects assigned to a class in a session
- Returns subject details and assigned teacher information
- Used by CreateDiaryDialog to populate subject selection

## API Endpoints

### Subject Diary Router (`src/server/api/routers/subjectDiary.ts`)

#### Create Diary
```typescript
api.subjectDiary.createDiary.mutate({
  classSubjectId: string,
  teacherId: string,
  date: Date,
  content: string,
  attachments?: string[]
})
```

#### Update Diary
```typescript
api.subjectDiary.updateDiary.mutate({
  subjectDiaryId: string,
  content: string,
  attachments?: string[]
})
```

#### Delete Diary
```typescript
api.subjectDiary.deleteDiary.mutate({
  subjectDiaryId: string
})
```

#### Get Teacher Diaries
```typescript
api.subjectDiary.getTeacherDiaries.useQuery({
  teacherId: string,
  date?: Date
})
```

#### Get Class Diaries
```typescript
api.subjectDiary.getClassDiaries.useQuery({
  classId: string,
  sessionId: string,
  date?: Date
})
```

### Class Router (`src/server/api/routers/class.ts`)

#### Get Class Subjects
```typescript
api.class.getClassSubjects.useQuery({
  classId: string,
  sessionId: string
})
```

## Role-Based Access Control

### ADMIN
- Can create diaries in class management interface
- Can view and manage all diaries system-wide

### CLERK
- Can create diaries in class management interface
- Limited to administrative functions

### TEACHER
- Can create diaries for their assigned subjects
- Can edit and delete their own diary entries
- Has a dedicated diaries management page
- Can view all their diaries across all classes

### HEAD (Department Head)
- Can view all diaries in the institution
- Cannot create, edit, or delete diaries
- Read-only access with filtering capabilities

### PRINCIPAL
- Can view all diaries system-wide
- Cannot create, edit, or delete diaries
- Advanced filtering and reporting features
- Dashboard with comprehensive statistics

## Integration Points

### Class Management Pages
- `src/app/(dashboard)/admin/sessions/class/page.tsx` - Updated with diaries tab
- `src/app/(dashboard)/clerk/sessions/class/page.tsx` - Updated with diaries tab

### Tabs Integration
- The `ClassDiariesTab` component is used in both admin and clerk class management pages
- Passes `userRole` prop to enable role-based UI features

## Database Schema

### SubjectDiary Model
```prisma
model SubjectDiary {
  subjectDiaryId String       @id @default(cuid())
  classSubjectId String
  teacherId      String
  date           DateTime     @default(now())
  content        String       @db.Text
  attachments    String[]     @default([])
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  ClassSubject   ClassSubject @relation(fields: [classSubjectId], references: [csId], onDelete: Cascade)
  Teacher        Employees    @relation("SubjectDiaries", fields: [teacherId], references: [employeeId], onDelete: Cascade)
  
  @@index([classSubjectId])
  @@index([teacherId])
}
```

### ClassSubject Model
```prisma
model ClassSubject {
  csId         String
  classId      String
  subjectId    String
  employeeId   String
  sessionId    String
  
  // Relations
  Grades       Grades        @relation(fields: [classId], references: [classId])
  Employees    Employees     @relation(fields: [employeeId], references: [employeeId])
  Sessions     Sessions      @relation(fields: [sessionId], references: [sessionId])
  Subject      Subject       @relation(fields: [subjectId], references: [subjectId])
  Marks        Marks[]
  SubjectDiary SubjectDiary[]
}
```

## User Flows

### Teacher Creating Diaries
1. Navigate to class through admin/clerk interface
2. Click "Diaries" tab
3. Click "Add Work" button
4. Select date for diary entry
5. Choose subject from dropdown
6. Enter work description
7. Click "Add Work for This Subject"
8. Repeat for other subjects
9. Review summary table
10. Click "Create Diaries" to save all entries

### Teacher Managing Diaries
1. Navigate to "/teacher/diaries"
2. View all diary entries
3. Filter by date or subject
4. Click edit icon to modify entry
5. Click delete icon to remove entry

### Head/Principal Viewing Diaries
1. Navigate to "/head/diaries" or "/principal/diaries"
2. View statistics dashboard
3. Apply filters (date, class, subject, teacher)
4. Click "View" to see full entry details
5. Read-only access - no modification options

## Files Created/Modified

### New Files
- `src/components/dialogs/CreateDiaryDialog.tsx`
- `src/app/(dashboard)/teacher/diaries/page.tsx`
- `src/app/(dashboard)/teacher/diaries/layout.tsx`
- `src/app/(dashboard)/head/diaries/page.tsx`
- `src/app/(dashboard)/head/diaries/layout.tsx`
- `src/app/(dashboard)/principal/diaries/page.tsx`
- `src/app/(dashboard)/principal/diaries/layout.tsx`

### Modified Files
- `src/components/blocks/class/ClassDiariesTab.tsx` - Enhanced with role-based UI and dialog integration
- `src/app/(dashboard)/admin/sessions/class/page.tsx` - Added userRole prop to ClassDiariesTab
- `src/app/(dashboard)/clerk/sessions/class/page.tsx` - Expanded with tabs and userRole prop
- `src/server/api/routers/class.ts` - Added getClassSubjects query

## Future Enhancements
1. Attachments support (documents, images)
2. Comments/feedback on diary entries
3. Approval workflow for diaries
4. Email notifications for new diaries
5. Export diaries to PDF/Excel
6. Advanced search with text indexing
7. Analytics and reporting dashboards
8. Template system for common diary entries
