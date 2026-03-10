# Integration Setup Guide

## Quick Start

### 1. Update Your Layout to Get Student Context

The grades page needs to know the current student and class ID. Update your dashboard layout to provide this context:

```tsx
// src/app/(dashboard)/layout.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface StudentContextType {
  studentId: string;
  classId: string;
  studentName?: string;
}

// Create a React Context for student data
export const StudentContext = createContext<StudentContextType | null>(null);

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  // Get studentId from session or from route
  const studentId = session?.user?.id || "default-student";
  const classId = session?.user?.classId || "default-class";

  return (
    <StudentContext.Provider value={{ studentId, classId }}>
      {children}
    </StudentContext.Provider>
  );
}

// Hook to use student context
export function useStudentContext() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudentContext must be used within DashboardLayout");
  }
  return context;
}
```

### 2. Update the Grades Page to Use Real Student Data

```tsx
// src/app/(dashboard)/student/grades/page.tsx
"use client";

import { useStudentContext } from "../layout";

export default function GradesPage() {
  const { studentId, classId } = useStudentContext();

  return (
    <div>
      <PageHeader {...} />
      <Tabs defaultValue="dashboard">
        {/* Components now receive real studentId and classId */}
        <AnalyticsDashboard studentId={studentId} classId={classId} />
      </Tabs>
    </div>
  );
}
```

### 3. API Route Implementation Pattern

All API routes follow this pattern:

```tsx
// src/app/api/student/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    // Fetch data from database
    const data = await db.reportCard.findMany({
      where: { studentId },
      // ... include relations
    });

    return NextResponse.json(transformData(data));
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Database Query Patterns

### Get Student's Overall Performance

```tsx
const reportCards = await db.reportCard.findMany({
  where: { 
    studentId: 'student-123'
  },
  include: {
    student: true,
    class: {
      include: {
        subjects: true,
        teachers: true
      }
    }
  }
});
```

### Get Subject-wise Performance

```tsx
const subjectPerformance = await db.reportCard.groupBy({
  by: ['classId'],
  where: { studentId: 'student-123' },
  _avg: {
    percentage: true
  }
});
```

### Get Class Averages for Comparison

```tsx
const classAverages = await db.reportCard.groupBy({
  by: ['studentId'],
  where: { classId: 'class-123' },
  _avg: {
    percentage: true,
    totalMarks: true
  }
});
```

### Get Exam Schedule

```tsx
const exams = await db.exam.findMany({
  where: {
    classId: 'class-123',
    examDate: {
      gte: new Date() // Future exams only
    }
  },
  include: {
    subject: true,
    class: true
  },
  orderBy: {
    examDate: 'asc'
  }
});
```

### Get Teacher Feedback

```tsx
const feedback = await db.subjectDiary.findMany({
  where: {
    studentId: 'student-123'
  },
  include: {
    teacher: true,
    subject: true
  }
});
```

## Component Usage Examples

### Using Analytics Dashboard

```tsx
<AnalyticsDashboard 
  studentId="student-123" 
  classId="class-456" 
/>
```

The component will:
1. Fetch analytics data from `/api/student/analytics`
2. Fetch performance trends from `/api/student/performance-trends`
3. Display interactive charts
4. Show performance insights
5. Provide actionable recommendations

### Using Teacher Feedback Display

```tsx
import { useTeacherFeedback } from "~/hooks/useStudentAnalytics";
import { TeacherFeedbackDisplay } from "~/components/dashboard/TeacherFeedbackDisplay";

export function FeedbackSection() {
  const { feedback, strengths, weaknesses } = useTeacherFeedback("student-123");

  return (
    <TeacherFeedbackDisplay
      feedback={feedback}
      strengths={strengths}
      weaknesses={weaknesses}
    />
  );
}
```

### Using Achievement Badges

```tsx
import { useAchievements } from "~/hooks/useStudentAnalytics";
import { AchievementBadges } from "~/components/dashboard/AchievementBadges";

export function AchievementsSection() {
  const { badges, certificates, milestones } = useAchievements("student-123");

  return (
    <AchievementBadges
      badges={badges}
      certificates={certificates}
      milestones={milestones}
    />
  );
}
```

## Testing with Mock Data

The system includes mock data generators for testing:

```tsx
import { generateMockAnalytics } from "~/lib/mock-academic-data";

// Use in your component
const mockData = generateMockAnalytics("student-123");
console.log(mockData); // See sample structure
```

### Testing Without Real Database

```tsx
// Temporarily replace API calls in components:
const [data, setData] = useState(null);

useEffect(() => {
  // Option 1: Use mock data
  const mockData = generateMockAnalytics(studentId);
  setData(mockData);
  
  // Option 2: Fetch from API
  // fetch(`/api/student/analytics?studentId=${studentId}`)
}, [studentId]);
```

## Environment Variables

No additional environment variables are required. The system uses:
- Existing Prisma database connection
- Existing auth system (session handling)
- Existing API infrastructure

## Performance Optimization

### Enable Caching

All hooks use SWR which provides:
- Automatic caching
- Stale-while-revalidate
- Automatic revalidation

```tsx
const { analytics, isLoading } = useStudentAnalytics(studentId);
// Data is cached and revalidated automatically
```

### Lazy Load Components

```tsx
const AnalyticsDashboard = dynamic(
  () => import("~/components/dashboard/AnalyticsDashboard"),
  { loading: () => <DashboardLoadingSkeleton /> }
);
```

### Pagination for Large Datasets

```tsx
// In API routes
const pageSize = 20;
const skip = (page - 1) * pageSize;

const data = await db.reportCard.findMany({
  skip,
  take: pageSize,
  where: { studentId }
});
```

## Troubleshooting

### Issue: Components Not Receiving Data
**Solution**: Check that studentId and classId are being passed correctly

```tsx
// Debug
console.log("[v0] StudentId:", studentId);
console.log("[v0] ClassId:", classId);
```

### Issue: API Routes Returning Errors
**Solution**: Verify the database connection and Prisma schema

```tsx
// Check API response
const response = await fetch(`/api/student/analytics?studentId=${studentId}`);
const data = await response.json();
console.log("[v0] API Response:", data);
```

### Issue: SWR Not Fetching Data
**Solution**: Check network tab in browser DevTools, verify API endpoint exists

```tsx
// In browser console
fetch('/api/student/analytics?studentId=test').then(r => r.json()).then(console.log);
```

## Next Steps

1. **Connect Database**: Ensure your Prisma schema matches the expected data structure
2. **Setup Authentication**: Implement student context in your auth system
3. **Test Components**: Use mock data to test UI before connecting to real data
4. **Implement Notifications**: Set up email/SMS notifications for alerts
5. **Customize Thresholds**: Adjust performance thresholds based on school requirements
6. **Deploy**: Push to production with proper error handling
