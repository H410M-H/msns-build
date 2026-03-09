# Subject Diary System - Quick Start Guide

## What Was Added?

A complete diary management system allowing teachers to record daily work for all subjects in a class.

## Key New Pages

| Role | Route | Purpose |
|------|-------|---------|
| Teacher | `/teacher/diaries` | Manage own diary entries |
| Head | `/head/diaries` | View department diaries |
| Principal | `/principal/diaries` | View all institution diaries |
| Admin/Clerk | `/admin/sessions/class` | Create diaries via modal |

## One-Minute Setup

### For Teachers Creating Diaries:
1. Go to class details (from sessions)
2. Click "Diaries" tab
3. Click "Add Work" button
4. Select date, add work for each subject
5. Click "Create Diaries"
✅ Done!

### For Heads/Principals Viewing:
1. Go to `/head/diaries` or `/principal/diaries`
2. View statistics and filter as needed
3. Click "View" for full details
✅ Done!

## Key Files

| File | Purpose |
|------|---------|
| `CreateDiaryDialog.tsx` | Dialog for batch diary creation |
| `ClassDiariesTab.tsx` | Enhanced to support role-based access |
| `teacher/diaries/page.tsx` | Teacher diary dashboard |
| `head/diaries/page.tsx` | Head diary review page |
| `principal/diaries/page.tsx` | Principal diary overview |
| `class.ts` router | New `getClassSubjects` endpoint |

## API Usage

### Create Diary
```typescript
api.subjectDiary.createDiary.mutate({
  classSubjectId: "cs-123",
  date: new Date(),
  content: "Chapter 5: Geometry",
  attachments: []
})
```

### Get Class Subjects (for dialog)
```typescript
const { data: subjects } = api.class.getClassSubjects.useQuery({
  classId: "class-123",
  sessionId: "session-123"
})
```

### Get Teacher Diaries
```typescript
const { data: diaries } = api.subjectDiary.getTeacherDiaries.useQuery({
  teacherId: "emp-123",
  date: new Date("2024-01-15")
})
```

## Database (No Changes Needed)

Uses existing `SubjectDiary` table:
```prisma
model SubjectDiary {
  subjectDiaryId String   @id @default(cuid())
  classSubjectId String
  teacherId      String
  date           DateTime @default(now())
  content        String   @db.Text
  attachments    String[] @default([])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  ClassSubject ClassSubject @relation(...)
  Teacher      Employees    @relation(...)
}
```

## Role Permissions

```
ADMIN, CLERK: ✓ Create ✓ Edit ✓ Delete ✓ View All
TEACHER:     ✓ Create ✓ Edit Own ✓ Delete Own ✓ View Own
HEAD:        ✗ Create ✗ Edit ✗ Delete ✓ View All (Dept)
PRINCIPAL:   ✗ Create ✗ Edit ✗ Delete ✓ View All (System)
```

## Component Usage

### In a Page
```typescript
<CreateDiaryDialog
  classId="class-123"
  sessionId="session-123"
  open={showDialog}
  onOpenChange={setShowDialog}
  onSuccess={() => refetch()}
/>
```

### In ClassDiariesTab
```typescript
<ClassDiariesTab
  classId="class-123"
  sessionId="session-123"
  userRole="TEACHER"  // or ADMIN, CLERK, HEAD, PRINCIPAL
/>
```

## Common Tasks

### Add a New Role
1. Update `ClassDiariesTab.tsx` - add role check
2. Create new page route if needed
3. Set appropriate permissions in page

### Customize Diary Dialog
1. Edit `CreateDiaryDialog.tsx`
2. Modify subject selection logic
3. Add new fields as needed

### Add Filtering
1. Update the page component state
2. Add filter UI controls
3. Filter data array based on selection

## Testing

### Test in Admin
1. Go to `/admin/sessions/class?classId=xxx&sessionId=yyy`
2. Click Diaries tab
3. Click "Add Work" button
4. See CreateDiaryDialog appear

### Test as Teacher
1. Go to `/teacher/diaries`
2. Should see your diary entries
3. Click edit/delete icons

### Test as Head
1. Go to `/head/diaries`
2. Use filters
3. Click View to see entries

## Troubleshooting

**Dialog not appearing?**
- Check user role is TEACHER/ADMIN/CLERK
- Verify classId and sessionId are provided
- Check console for errors

**Subjects not loading?**
- Verify class has subjects in ClassSubject table
- Check sessionId is current
- Ensure teacher is assigned to subject

**Can't edit diary?**
- Check if you're the teacher who created it
- Verify role is TEACHER, ADMIN, or CLERK

## What's Next?

- Add file attachments support
- Enable comments/feedback
- Create approval workflow
- Add email notifications
- Build analytics dashboard

---

**Version**: 1.0.0
**Last Updated**: 2024-01-15
**Status**: Production Ready ✓
