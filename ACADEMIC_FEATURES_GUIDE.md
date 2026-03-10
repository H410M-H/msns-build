# Academic Performance Center - Feature Guide

## Overview
The Academic Performance Center is a comprehensive dashboard system that provides students, parents, and teachers with real-time insights into academic progress, performance analytics, and personalized improvement recommendations.

## Key Features Implemented

### 1. **Analytics Dashboard** 📊
**Component**: `AnalyticsDashboard.tsx`
**API Route**: `/api/student/analytics`

Features:
- Real-time performance metrics (overall average, pass rate, trend analysis)
- Subject-wise performance breakdown
- Visual charts and graphs using Recharts
- Performance trends with historical data
- Comparative analysis with class averages

**Data Structure**:
```typescript
{
  overallAverage: number;
  totalExams: number;
  passingRate: number;
  subjectWisePerformance: Array<{
    subjectName: string;
    average: number;
    totalMarks: number;
  }>;
}
```

### 2. **Performance Trends & Predictions** 📈
**API Route**: `/api/student/performance-trends`

Features:
- Monthly performance trend visualization
- Predictive analytics for future performance
- Improvement/decline indicators
- Trend analysis over time

### 3. **Comparative Analytics** 🏆
**API Route**: `/api/student/comparative-analytics`

Features:
- Class average comparison
- Percentile ranking within class
- Subject-wise comparison with peers
- Performance benchmarking
- Identifies areas where student excels or needs help

### 4. **Exam Schedule & Calendar** 📅
**Component**: `ExamScheduleComponent.tsx`
**API Route**: `/api/student/exam-schedule`

Features:
- Upcoming exam schedule with dates and times
- Study timeline recommendations
- Past exam history and results
- Exam duration and syllabus information
- Preparation time allocation

### 5. **Teacher Feedback System** 💬
**Component**: `TeacherFeedbackDisplay.tsx`
**API Route**: `/api/teacher/feedback`

Features:
- Direct feedback from teachers
- Strengths identification
- Areas for improvement with tips
- Subject-wise feedback
- Rating system for performance

### 6. **Grade Improvement Plans** 🎯
**Component**: `GradeImprovementPlans.tsx`
**API Route**: `/api/student/grade-improvement`

Features:
- AI-generated improvement strategies
- Target-based study plans
- Resource recommendations
- Subject-specific tips
- Personalized study schedule suggestions
- Study group matching

### 7. **Achievement & Certification System** 🏅
**Component**: `AchievementBadges.tsx`
**API Route**: `/api/student/achievements`

Features:
- Digital badges for achievements
- Certificate generation
- Milestone tracking
- Points system
- Performance badges (Excellence, Subject Mastery, Consistency)
- Downloadable certificates

### 8. **Parent Portal** 👨‍👩‍👧
**Component**: `ParentPortal.tsx`
**API Route**: `/api/student/analytics` (reused)

Features:
- Real-time alerts for grade drops
- Performance notifications
- Communication channel with teachers
- Child's academic progress overview
- Attendance tracking integration
- Alert thresholds for intervention

### 9. **Notification System** 🔔
**Component**: `NotificationCenter.tsx`
**API Route**: `/api/student/notifications`

Features:
- Real-time notifications for:
  - Grade releases
  - Exam announcements
  - Performance milestones
  - Upcoming deadlines
  - Parent alerts
- Multi-channel delivery (Email, SMS, In-app)
- Customizable notification preferences
- Notification history and archives

### 10. **Analytics Summary Dashboard** 📋
**Component**: `AnalyticsSummary.tsx`

Features:
- Quick overview of key metrics
- Performance indicators
- Trend visualization
- Actionable insights
- Performance recommendations

## Data Relations & Architecture

### Student-Related Data Flow
```
Student
├── Grades/ReportCards
├── Marks (per exam/subject)
├── Exam Schedule
├── Class Enrollment
├── Teacher Feedback
├── Achievements & Badges
└── Notifications
```

### Class-Related Data Flow
```
Class
├── Subjects & Teachers
├── Exams Schedule
├── Students Enrolled
├── Subject Difficulty Analytics
└── Class Performance Metrics
```

### Subject-Related Data Flow
```
Subject
├── Teachers Assigned
├── Performance Analytics
├── Exam Schedules
└── Student Progress Tracking
```

## API Routes Summary

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/student/analytics` | GET | Fetch overall student analytics |
| `/api/student/performance-trends` | GET | Get performance trends and predictions |
| `/api/student/comparative-analytics` | GET | Compare with class averages |
| `/api/student/exam-schedule` | GET | Fetch exam schedules and timelines |
| `/api/student/achievements` | GET | Get badges, certificates, milestones |
| `/api/student/notifications` | GET | Fetch notifications |
| `/api/student/grade-improvement` | GET | Get improvement plans and recommendations |
| `/api/teacher/feedback` | GET | Fetch teacher feedback |
| `/api/class/subject-difficulty` | GET | Analyze subject difficulty for class |

## Custom Hooks

Located in `src/hooks/useStudentAnalytics.ts`:

- `useStudentAnalytics(studentId)` - Fetch analytics data
- `usePerformanceTrends(studentId)` - Get performance trends
- `useComparativeAnalytics(studentId, classId)` - Fetch comparative data
- `useTeacherFeedback(studentId)` - Get teacher feedback
- `useExamSchedule(studentId, classId)` - Get exam schedule
- `useAchievements(studentId)` - Get achievements
- `useGradeImprovement(studentId)` - Get improvement plans
- `useNotifications(studentId)` - Get notifications with auto-refresh

All hooks use SWR for automatic caching and real-time updates.

## Utility Functions

### Mock Data Generation
Located in `src/lib/mock-academic-data.ts`:

- `generateMockAnalytics()` - Generate sample analytics
- `generateMockPerformanceTrends()` - Generate sample trends
- `generateMockComparativeAnalytics()` - Generate comparison data
- `generateMockExamSchedule()` - Generate exam schedule
- `generateMockAchievements()` - Generate badges and certificates
- `generateMockTeacherFeedback()` - Generate feedback
- `generateMockNotifications()` - Generate notifications
- `generateMockGradeImprovement()` - Generate improvement plans

## Component Structure

### Dashboard Components
```
grades/page.tsx (Main Page)
├── AnalyticsDashboard
│   ├── Charts (LineChart, BarChart, PieChart)
│   └── Performance Metrics
├── ExamScheduleComponent
│   ├── Upcoming Exams
│   ├── Past Exams
│   └── Study Timeline
├── GradeImprovementPlans
│   ├── Strategies
│   ├── Resources
│   └── Study Schedule
├── ParentPortal
│   ├── Notifications
│   ├── Alerts
│   └── Performance Overview
└── Settings Tab (Future)
```

### Support Components
- `AnalyticsSummary` - Quick metrics overview
- `AchievementBadges` - Badge and certificate display
- `TeacherFeedbackDisplay` - Feedback visualization
- `NotificationCenter` - Notification management
- `DashboardLoadingSkeleton` - Loading states

## Integration Points

### Database Models Used
- `students` - Student information
- `reportCard` - Grade reports
- `marks` - Individual exam marks
- `exam` - Exam schedules
- `subjectDiary` - Teacher notes/feedback
- `class` - Class information
- `subject` - Subject details

### Relations Analyzed
1. **Student → Class**: Many-to-one relationship for class enrollment
2. **Student → Subject**: Through Class (Many-to-many)
3. **Student → Exam**: Many-to-many (exam participation)
4. **Student → ReportCard**: One-to-many (multiple report cards)
5. **Teacher → Subject**: One-to-many (teacher teaches multiple subjects)
6. **Class → Subject**: Many-to-many (class studies multiple subjects)
7. **Class → Exam**: One-to-many (class has multiple exams)

## Usage Example

```tsx
import { AnalyticsDashboard } from "~/components/dashboard/AnalyticsDashboard";
import { useStudentAnalytics } from "~/hooks/useStudentAnalytics";

export function MyGradesPage() {
  const { analytics, isLoading } = useStudentAnalytics("student-123");
  
  if (isLoading) return <DashboardLoadingSkeleton />;
  
  return (
    <AnalyticsDashboard 
      studentId="student-123" 
      classId="class-456" 
    />
  );
}
```

## Configuration & Customization

### Notification Preferences
Located in settings tab - allows students to:
- Enable/disable notification types
- Set alert thresholds
- Choose notification channels
- Configure study reminders

### Achievement Criteria
Customizable based on school requirements:
- Pass percentage thresholds
- Excellence score requirements
- Consistency metrics
- Attendance requirements

## Future Enhancements

1. **AI-Powered Recommendations** - ML-based study suggestions
2. **Real-time Collaboration** - Study group features
3. **Mobile App Integration** - Native mobile experience
4. **Advanced Reporting** - PDF and Excel export
5. **Parent-Teacher Meetings** - Scheduled consultation system
6. **Peer Comparison Analytics** - Anonymous benchmarking
7. **Career Path Recommendations** - Based on performance
8. **Learning Resource Marketplace** - Curated study materials

## Performance Considerations

- All data is cached using SWR for optimal performance
- Charts are lazy-loaded to prevent unnecessary re-renders
- Notifications refresh every 60 seconds
- Analytics data is paginated for large datasets
- Database queries use indexes on student_id and class_id

## Security & Privacy

- Student data is protected with row-level security
- Parents only see their child's data
- Teachers see only their class's data
- Admin access is restricted
- GDPR compliance for data storage and handling
