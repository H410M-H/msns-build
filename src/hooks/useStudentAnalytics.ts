import useSWR from 'swr';

// Make the fetcher generic so it stops returning 'any'
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  return (await res.json()) as T;
};

// --- Interfaces ---
export interface StudentAnalytics {
  overallAverage: number;
  totalExams: number;
  passingRate: number;
  subjectWisePerformance: {
    subjectName: string;
    average: number;
    totalMarks: number;
  }[];
}

export interface PerformanceTrend {
  date: string;
  percentage: number;
}

export interface PerformanceTrendResponse {
  trends: PerformanceTrend[];
  prediction?: number;
}

export interface ComparativeAnalytics {
  studentPercentile: number;
  classAverage: number;
  studentAverage: number;
  aboveAverage: boolean;
  subjectComparison: {
    subject: string;
    studentScore: number;
    classAverage: number;
  }[];
}

export interface TeacherFeedbackResponse {
  feedback?: unknown[];
  strengths?: unknown[];
  weaknesses?: unknown[];
}

export interface ExamScheduleResponse {
  upcomingExams?: unknown[];
  pastExams?: unknown[];
  studyTimeline?: unknown;
}

export interface AchievementsResponse {
  badges?: unknown[];
  certificates?: unknown[];
  milestones?: unknown[];
}

export interface GradeImprovementResponse {
  improvementPlans?: unknown[];
  recommendations?: unknown[];
  resources?: unknown[];
}

export interface NotificationsResponse {
  notifications?: unknown[];
  totalUnread?: number;
}

// --- Hooks ---
export function useStudentAnalytics(studentId: string) {
  const { data, error, isLoading } = useSWR<StudentAnalytics>(
    studentId ? `/api/student/analytics?studentId=${studentId}` : null,
    fetcher
  );

  return {
    analytics: data,
    isLoading,
    error,
  };
}

export function usePerformanceTrends(studentId: string) {
  const { data, error, isLoading } = useSWR<PerformanceTrendResponse>(
    studentId ? `/api/student/performance-trends?studentId=${studentId}` : null,
    fetcher
  );

  return {
    trends: data?.trends ?? [],
    prediction: data?.prediction,
    isLoading,
    error,
  };
}

export function useComparativeAnalytics(studentId: string, classId: string) {
  const { data, error, isLoading } = useSWR<ComparativeAnalytics>(
    studentId && classId
      ? `/api/student/comparative-analytics?studentId=${studentId}&classId=${classId}`
      : null,
    fetcher
  );

  return {
    comparative: data,
    isLoading,
    error,
  };
}

export function useTeacherFeedback(studentId: string) {
  const { data, error, isLoading } = useSWR<TeacherFeedbackResponse>(
    studentId ? `/api/teacher/feedback?studentId=${studentId}` : null,
    fetcher
  );

  return {
    feedback: data?.feedback ?? [],
    strengths: data?.strengths ?? [],
    weaknesses: data?.weaknesses ?? [],
    isLoading,
    error,
  };
}

export function useExamSchedule(studentId: string, classId: string) {
  const { data, error, isLoading } = useSWR<ExamScheduleResponse>(
    studentId && classId
      ? `/api/student/exam-schedule?studentId=${studentId}&classId=${classId}`
      : null,
    fetcher
  );

  return {
    upcomingExams: data?.upcomingExams ?? [],
    pastExams: data?.pastExams ?? [],
    studyTimeline: data?.studyTimeline,
    isLoading,
    error,
  };
}

export function useAchievements(studentId: string) {
  const { data, error, isLoading } = useSWR<AchievementsResponse>(
    studentId ? `/api/student/achievements?studentId=${studentId}` : null,
    fetcher
  );

  return {
    badges: data?.badges ?? [],
    certificates: data?.certificates ?? [],
    milestones: data?.milestones ?? [],
    isLoading,
    error,
  };
}

export function useGradeImprovement(studentId: string) {
  const { data, error, isLoading } = useSWR<GradeImprovementResponse>(
    studentId ? `/api/student/grade-improvement?studentId=${studentId}` : null,
    fetcher
  );

  return {
    improvementPlans: data?.improvementPlans ?? [],
    recommendations: data?.recommendations ?? [],
    resources: data?.resources ?? [],
    isLoading,
    error,
  };
}

export function useNotifications(studentId: string) {
  const { data, error, isLoading } = useSWR<NotificationsResponse>(
    studentId ? `/api/student/notifications?studentId=${studentId}` : null,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.totalUnread ?? 0,
    isLoading,
    error,
  };
}
