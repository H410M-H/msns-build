# Quick Reference Guide

## One-Minute Overview

You now have a complete Academic Performance Center with:
- ✅ Analytics Dashboard with real-time metrics
- ✅ Performance Trends & Predictions
- ✅ Comparative Analytics (compare with peers)
- ✅ Exam Schedule Management
- ✅ Teacher Feedback System
- ✅ Grade Improvement Plans
- ✅ Achievement & Badge System
- ✅ Parent Portal with Alerts
- ✅ Notification Center

## Key Files to Know

### Main Pages
- `src/app/(dashboard)/student/grades/page.tsx` - Main dashboard

### Components (in `src/components/dashboard/`)
- `AnalyticsDashboard.tsx` - Charts and metrics
- `ExamScheduleComponent.tsx` - Upcoming exams
- `ParentPortal.tsx` - Parent notifications
- `GradeImprovementPlans.tsx` - Study plans
- `AchievementBadges.tsx` - Badges/certificates
- `TeacherFeedbackDisplay.tsx` - Feedback
- `NotificationCenter.tsx` - Alerts
- `AnalyticsSummary.tsx` - Quick stats

### Hooks (in `src/hooks/`)
- `useStudentAnalytics.ts` - All custom hooks

### APIs (in `src/app/api/`)
- `student/analytics` - Performance data
- `student/performance-trends` - Trend analysis
- `student/comparative-analytics` - Peer comparison
- `student/exam-schedule` - Exam dates
- `student/achievements` - Badges
- `student/notifications` - Alerts
- `student/grade-improvement` - Study tips
- `teacher/feedback` - Teacher comments
- `class/subject-difficulty` - Subject stats

## Common Tasks

### Add a Component to Grades Page
```tsx
import { MyComponent } from "~/components/dashboard/MyComponent";

<TabsContent value="my-tab" className="space-y-6">
  <MyComponent studentId={studentId} classId={classId} />
</TabsContent>
```

### Fetch Data in a Component
```tsx
import { useStudentAnalytics } from "~/hooks/useStudentAnalytics";

export function MyComponent() {
  const { analytics, isLoading } = useStudentAnalytics("student-id");
  
  if (isLoading) return <div>Loading...</div>;
  return <div>{analytics.overallAverage}%</div>;
}
```

### Create a New API Route
```tsx
// src/app/api/student/my-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId');
  
  const data = await db.reportCard.findMany({
    where: { studentId }
  });
  
  return NextResponse.json(data);
}
```

### Test with Mock Data
```tsx
import { generateMockAnalytics } from "~/lib/mock-academic-data";

const mockData = generateMockAnalytics("student-123");
console.log(mockData);
```

## Component Props

### AnalyticsDashboard
```tsx
<AnalyticsDashboard 
  studentId="string"
  classId="string"
/>
```

### ExamScheduleComponent
```tsx
<ExamScheduleComponent 
  studentId="string"
  classId="string"
/>
```

### ParentPortal
```tsx
<ParentPortal 
  studentId="string"
  studentName="optional string"
/>
```

### AchievementBadges
```tsx
<AchievementBadges
  badges={Badge[]}
  certificates={Certificate[]}
  milestones={Milestone[]}
/>
```

## Available Hooks

```tsx
const { analytics, isLoading, error } = useStudentAnalytics(studentId);
const { trends, prediction, isLoading, error } = usePerformanceTrends(studentId);
const { comparative, isLoading, error } = useComparativeAnalytics(studentId, classId);
const { feedback, strengths, weaknesses, isLoading, error } = useTeacherFeedback(studentId);
const { upcomingExams, pastExams, studyTimeline, isLoading, error } = useExamSchedule(studentId, classId);
const { badges, certificates, milestones, isLoading, error } = useAchievements(studentId);
const { improvementPlans, recommendations, resources, isLoading, error } = useGradeImprovement(studentId);
const { notifications, unreadCount, isLoading, error } = useNotifications(studentId);
```

## Mock Data Generators

```tsx
import { 
  generateMockAnalytics,
  generateMockPerformanceTrends,
  generateMockComparativeAnalytics,
  generateMockExamSchedule,
  generateMockAchievements,
  generateMockTeacherFeedback,
  generateMockNotifications,
  generateMockGradeImprovement
} from "~/lib/mock-academic-data";

// Usage
const analytics = generateMockAnalytics("student-123");
const trends = generateMockPerformanceTrends("student-123");
// ... etc
```

## API Endpoints

```
GET /api/student/analytics?studentId=xxx
GET /api/student/performance-trends?studentId=xxx
GET /api/student/comparative-analytics?studentId=xxx&classId=yyy
GET /api/student/exam-schedule?studentId=xxx&classId=yyy
GET /api/student/achievements?studentId=xxx
GET /api/student/notifications?studentId=xxx
GET /api/student/grade-improvement?studentId=xxx
GET /api/teacher/feedback?studentId=xxx
GET /api/class/subject-difficulty?classId=xxx
```

## Database Queries

### Get Student Grades
```prisma
reportCard.findMany({ where: { studentId } })
```

### Get Class Average
```prisma
reportCard.groupBy({
  by: ['classId'],
  where: { classId },
  _avg: { percentage: true }
})
```

### Get Upcoming Exams
```prisma
exam.findMany({
  where: {
    classId,
    examDate: { gte: new Date() }
  },
  orderBy: { examDate: 'asc' }
})
```

### Get Teacher Feedback
```prisma
subjectDiary.findMany({
  where: { studentId },
  include: { teacher: true, subject: true }
})
```

## Documentation Files

1. **ACADEMIC_FEATURES_GUIDE.md** - Detailed feature documentation
2. **INTEGRATION_SETUP.md** - Setup and integration instructions
3. **IMPLEMENTATION_SUMMARY.md** - Complete implementation overview
4. **QUICK_REFERENCE.md** - This file

## Next Steps

1. Update `src/app/(dashboard)/layout.tsx` to provide student context
2. Connect real database using existing Prisma setup
3. Update student ID and class ID in grades page
4. Test with real data
5. Configure notifications
6. Customize thresholds for your school

## Troubleshooting

**Components not showing?**
- Check studentId and classId are passed correctly
- Verify API routes are returning data
- Check browser console for errors

**API returning errors?**
- Verify database connection
- Check Prisma queries
- Use mock data to test

**Hooks not fetching?**
- Ensure studentId is provided
- Check network tab in DevTools
- Verify API endpoint exists

**Charts not rendering?**
- Check data format matches expected structure
- Verify Recharts is imported correctly
- Use mock data to test

## Support

For detailed information, see:
- Component details → ACADEMIC_FEATURES_GUIDE.md
- Setup help → INTEGRATION_SETUP.md
- Implementation details → IMPLEMENTATION_SUMMARY.md
