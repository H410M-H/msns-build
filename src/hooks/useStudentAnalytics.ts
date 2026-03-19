import useSWR, { type SWRResponse } from 'swr';

// Type-safe fetcher that parses through `unknown` to satisfy ESLint's strict rules
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  const json = (await res.json()) as unknown;
  return json as T;
}

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
  const { data, error, isLoading }: SWRResponse<StudentAnalytics, Error> = useSWR(
    studentId ? `/api/student/analytics?studentId=${studentId}` : null,
    (url: string) => fetcher<StudentAnalytics>(url)
  );

  return {
    analytics: data,
    isLoading,
    error,
  };
}

export function usePerformanceTrends(studentId: string) {
  const { data, error, isLoading }: SWRResponse<PerformanceTrendResponse, Error> = useSWR(
    studentId ? `/api/student/performance-trends?studentId=${studentId}` : null,
    (url: string) => fetcher<PerformanceTrendResponse>(url)
  );

  return {
    trends: data?.trends ?? [],
    prediction: data?.prediction,
    isLoading,
    error,
  };
}

export function useComparativeAnalytics(studentId: string, classId: string) {
  const { data, error, isLoading }: SWRResponse<ComparativeAnalytics, Error> = useSWR(
    studentId && classId
      ? `/api/student/comparative-analytics?studentId=${studentId}&classId=${classId}`
      : null,
    (url: string) => fetcher<ComparativeAnalytics>(url)
  );

  return {
    comparative: data,
    isLoading,
    error,
  };
}

export function useTeacherFeedback(studentId: string) {
  const { data, error, isLoading }: SWRResponse<TeacherFeedbackResponse, Error> = useSWR(
    studentId ? `/api/teacher/feedback?studentId=${studentId}` : null,
    (url: string) => fetcher<TeacherFeedbackResponse>(url)
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
  const { data, error, isLoading }: SWRResponse<ExamScheduleResponse, Error> = useSWR(
    studentId && classId
      ? `/api/student/exam-schedule?studentId=${studentId}&classId=${classId}`
      : null,
    (url: string) => fetcher<ExamScheduleResponse>(url)
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
  const { data, error, isLoading }: SWRResponse<AchievementsResponse, Error> = useSWR(
    studentId ? `/api/student/achievements?studentId=${studentId}` : null,
    (url: string) => fetcher<AchievementsResponse>(url)
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
  const { data, error, isLoading }: SWRResponse<GradeImprovementResponse, Error> = useSWR(
    studentId ? `/api/student/grade-improvement?studentId=${studentId}` : null,
    (url: string) => fetcher<GradeImprovementResponse>(url)
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
  const { data, error, isLoading }: SWRResponse<NotificationsResponse, Error> = useSWR(
    studentId ? `/api/student/notifications?studentId=${studentId}` : null,
    (url: string) => fetcher<NotificationsResponse>(url),
    { refreshInterval: 60000 }
  );

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.totalUnread ?? 0,
    isLoading,
    error,
  };
}
