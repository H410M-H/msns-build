# System Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GRADES PAGE (Main Entry)                 │
│           src/app/(dashboard)/student/grades/page.tsx       │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌──────────┐    ┌─────────────┐
   │  Hooks   │    │ Components  │
   └──────────┘    └─────────────┘
        │                 │
        │  useStudentAnalytics.ts
        │  - useStudentAnalytics()
        │  - usePerformanceTrends()
        │  - useComparativeAnalytics()
        │  - useTeacherFeedback()
        │  - useExamSchedule()
        │  - useAchievements()
        │  - useGradeImprovement()
        │  - useNotifications()
        │                 │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   SWR Cache     │
        │  (Auto-refresh) │
        └────────┬────────┘
                 │
                 ▼
        ┌──────────────────────────────────────┐
        │      API Routes                      │
        │  /api/student/*                      │
        │  /api/teacher/*                      │
        │  /api/class/*                        │
        └────────┬─────────────────────────────┘
                 │
        ┌────────┴──────────────────┬──────────────────┐
        ▼                           ▼                  ▼
   ┌─────────────┐        ┌─────────────────┐  ┌──────────┐
   │ Prisma ORM  │        │  Data Transform │  │ Filtering│
   │             │        │  & Calculation  │  │ & Sorting│
   └────────┬────┘        └────────┬────────┘  └──────────┘
            │                      │
            │              ┌───────┴────────┐
            │              │                │
            ▼              ▼                ▼
        ┌─────────────────────────────────────┐
        │    Database (Prisma)                │
        │                                     │
        │  - reportCard                       │
        │  - marks                            │
        │  - exam                             │
        │  - students                         │
        │  - class                            │
        │  - subject                          │
        │  - subjectDiary (feedback)          │
        └─────────────────────────────────────┘
```

## Component Hierarchy

```
grades/page.tsx
│
├── <Tabs> (TabsContent for each section)
│   │
│   ├── Analytics Tab
│   │   └── AnalyticsDashboard
│   │       ├── Card (Header)
│   │       ├── LineChart (Trends)
│   │       ├── BarChart (Subject Performance)
│   │       └── PieChart (Grade Distribution)
│   │
│   ├── Exam Schedule Tab
│   │   └── ExamScheduleComponent
│   │       ├── Upcoming Exams
│   │       ├── Study Timeline
│   │       └── Past Exams
│   │
│   ├── Improvement Tab
│   │   └── GradeImprovementPlans
│   │       ├── Improvement Plans
│   │       ├── Study Recommendations
│   │       └── Resources
│   │
│   ├── Parent Portal Tab
│   │   └── ParentPortal
│   │       ├── NotificationCenter
│   │       ├── Performance Alerts
│   │       └── Communication Channel
│   │
│   └── Settings Tab
│       └── (Future Implementation)
│
└── PageHeader (Top Navigation)
    └── Export Button
```

## Hook Data Flow

```
Component
│
└── useStudentAnalytics(studentId)
    │
    └── SWR Hook
        │
        ├── Check Cache
        │   └── If valid: Return cached data
        │   └── If stale: Revalidate
        │
        └── Fetch from API
            │
            └── /api/student/analytics
                │
                └── Database Query
                    │
                    └── Return Response
                        │
                        └── Update Cache
                            │
                            └── Trigger Rerender
```

## API Route Architecture

```
/api/student/analytics
│
├── Parse Query Parameters
│   └── studentId validation
│
├── Database Query
│   │
│   ├── reportCard.findMany()
│   ├── marks.findMany()
│   ├── reportCard.groupBy() [for averages]
│   └── Class relations
│
├── Data Transformation
│   │
│   ├── Calculate overall average
│   ├── Calculate pass rate
│   ├── Group by subject
│   └── Format response
│
└── Response
    │
    └── NextResponse.json({
        success: true,
        data: {...},
        timestamp: ISO string
    })
```

## Database Schema Relations

```
Students (1) ──────────────── (M) ReportCard
  │                                  │
  │                                  ├── Class (M) ──── (M) Subject
  │                                  └── Marks
  │
  ├──────────────────────────── (1) Class
  │                                  │
  │                                  ├── (M) Teachers
  │                                  ├── (M) Subjects
  │                                  └── (M) Exams
  │
  ├──────────────────────────── (M) Exams
  │                                  │
  │                                  └── (1) Subject
  │
  └──────────────────────────── (M) SubjectDiary
                                    (Teacher Feedback)
                                    │
                                    ├── (1) Teacher
                                    └── (1) Subject
```

## State Management Strategy

### Component Level State
- Local `useState` for UI state (expanded, filters, etc.)
- `useEffect` for side effects

### Application Level Data
- **SWR Hooks** for:
  - Data fetching
  - Automatic caching
  - Revalidation
  - Deduplication
  - Global access

### Context (Future)
- StudentContext for current student/class
- NotificationContext for alert system
- ThemeContext for dark mode

## Performance Optimization Layers

```
Layer 1: Component Optimization
├── Lazy loading
├── Code splitting
└── Memoization (React.memo)

Layer 2: Data Fetching
├── SWR caching
├── Deduplication
└── Background revalidation

Layer 3: Database Level
├── Indexed queries
├── Pagination
└── Lazy relations

Layer 4: Network Level
├── HTTP compression
├── Caching headers
└── CDN for static assets
```

## Error Handling Flow

```
Component
│
└── Try to Fetch Data
    │
    ├── Error Caught
    │   │
    │   ├── Network Error
    │   │   └── Show: "Connection error, retrying..."
    │   │
    │   ├── API Error
    │   │   └── Show: "Unable to load data"
    │   │
    │   └── Validation Error
    │       └── Show: "Invalid data received"
    │
    └── Success
        │
        └── Display Data
```

## Authentication & Authorization Flow

```
Session/Auth
│
├── Get Current User
│   │
│   └── Extract studentId
│
├── Validate studentId
│   │
│   ├── Pass: Allow data access
│   └── Fail: Return 401 Unauthorized
│
└── Row-Level Security
    │
    ├── Student sees: Own data only
    ├── Parent sees: Child's data only
    ├── Teacher sees: Own class data
    └── Admin sees: All data
```

## Real-Time Update Architecture (Future)

```
WebSocket Server
│
├── Grades Published
│   └── Broadcast to students & parents
│
├── Exam Schedule Updated
│   └── Broadcast to class
│
├── Teacher Feedback Added
│   └── Broadcast to student & parent
│
└── Achievement Unlocked
    └── Broadcast to student & parent
```

## Notification System Architecture

```
Event Trigger
│
├── Grade Released
├── Performance Drop
├── Exam Approaching
├── Achievement Earned
└── Assignment Due
│
▼
Notification Generator
│
├── Check User Preferences
├── Generate Message
└── Schedule Delivery
│
▼
Delivery Channels
│
├── In-App Notification
├── Email
├── SMS
└── Push Notification
│
▼
User Receives Alert
```

## Mobile Responsiveness

```
Desktop (> 1024px)
├── 4-column grid layouts
├── Full charts visibility
└── All details shown

Tablet (768px - 1024px)
├── 2-3 column grids
├── Adjusted chart sizes
└── Collapsible sections

Mobile (< 768px)
├── Single column
├── Responsive charts
├── Accordion layouts
└── Touch-friendly buttons
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API routes (can run on multiple servers)
- Database connection pooling
- Caching layer (Redis optional)

### Vertical Scaling
- Database indexing
- Query optimization
- Pagination for large datasets
- Archive old data

### Cost Optimization
- CDN for static assets
- Image optimization
- API response compression
- Database query caching

## Testing Architecture

```
Unit Tests
├── API route functions
├── Data transformation
└── Helper utilities

Integration Tests
├── Component + Hook combos
├── API endpoint testing
└── Database interaction

E2E Tests
├── Full user flows
├── Dashboard interactions
└── Multi-tab scenarios
```

## Deployment Architecture

```
Local Development
│
▼
Git Push → GitHub
│
▼
Vercel Deployment
│
├── Build Stage
│   ├── Next.js compilation
│   ├── Prisma client generation
│   └── Type checking
│
├── Deploy Stage
│   ├── Upload to CDN
│   └── Configure serverless functions
│
└── Runtime
    ├── API routes on lambdas
    ├── Static content on CDN
    └── Database connection pooling
```

## Feature Flag Architecture (Future)

```
Feature Flags
│
├── Analytics (enabled)
├── Performance Trends (enabled)
├── Comparative Analytics (enabled)
├── Exam Schedule (enabled)
├── Teacher Feedback (enabled)
├── Grade Improvement (enabled)
├── Achievements (enabled)
├── Parent Portal (enabled)
├── AI Recommendations (disabled)
└── Real-time Updates (disabled)
│
▼
Feature Gate
│
├── Check user permission
├── Check feature enabled
└── Show/Hide feature
```

## Summary

The system is built with:
- **Scalable Architecture**: Stateless API routes, efficient database queries
- **Performance-First**: SWR caching, lazy loading, optimization layers
- **Type-Safe**: Full TypeScript coverage
- **Error Resilient**: Try-catch blocks, fallback UI
- **User-Friendly**: Loading states, responsive design
- **Developer-Friendly**: Clear patterns, good documentation, mock data
