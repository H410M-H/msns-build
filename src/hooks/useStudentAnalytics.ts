import { useEffect, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

export function useStudentAnalytics(studentId: string) {
  const { data, error, isLoading } = useSWR(
    studentId ? `/api/student/analytics?studentId=${studentId}` : null,
    fetcher
  );

  return {
    analytics: data as StudentAnalytics | undefined,
    isLoading,
    error,
  };
}

export function usePerformanceTrends(studentId: string) {
  const { data, error, isLoading } = useSWR(
    studentId ? `/api/student/performance-trends?studentId=${studentId}` : null,
    fetcher
  );

  return {
    trends: data?.trends as PerformanceTrend[] | undefined,
    prediction: data?.prediction,
    isLoading,
    error,
  };
}

export function useComparativeAnalytics(studentId: string, classId: string) {
  const { data, error, isLoading } = useSWR(
    studentId && classId
      ? `/api/student/comparative-analytics?studentId=${studentId}&classId=${classId}`
      : null,
    fetcher
  );

  return {
    comparative: data as ComparativeAnalytics | undefined,
    isLoading,
    error,
  };
}

export function useTeacherFeedback(studentId: string) {
  const { data, error, isLoading } = useSWR(
    studentId ? `/api/teacher/feedback?studentId=${studentId}` : null,
    fetcher
  );

  const typedData = data as { feedback?: unknown[]; strengths?: unknown[]; weaknesses?: unknown[] } | undefined;

  return {
    feedback: typedData?.feedback ?? [],
    strengths: typedData?.strengths ?? [],
    weaknesses: typedData?.weaknesses ?? [],
    isLoading,
    error,
  };
}

export function useExamSchedule(studentId: string, classId: string) {
  const { data, error, isLoading } = useSWR(
    studentId && classId
      ? `/api/student/exam-schedule?studentId=${studentId}&classId=${classId}`
      : null,
    fetcher
  );

  const typedData = data as { upcomingExams?: unknown[]; pastExams?: unknown[]; studyTimeline?: unknown } | undefined;

  return {
    upcomingExams: typedData?.upcomingExams ?? [],
    pastExams: typedData?.pastExams ?? [],
    studyTimeline: typedData?.studyTimeline,
    isLoading,
    error,
  };
}

export function useAchievements(studentId: string) {
  const { data, error, isLoading } = useSWR(
    studentId ? `/api/student/achievements?studentId=${studentId}` : null,
    fetcher
  );

  const typedData = data as { badges?: unknown[]; certificates?: unknown[]; milestones?: unknown[] } | undefined;

  return {
    badges: typedData?.badges ?? [],
    certificates: typedData?.certificates ?? [],
    milestones: typedData?.milestones ?? [],
    isLoading,
    error,
  };
}

export function useGradeImprovement(studentId: string) {
  const { data, error, isLoading } = useSWR(
    studentId ? `/api/student/grade-improvement?studentId=${studentId}` : null,
    fetcher
  );

  const typedData = data as { improvementPlans?: unknown[]; recommendations?: unknown[]; resources?: unknown[] } | undefined;

  return {
    improvementPlans: typedData?.improvementPlans ?? [],
    recommendations: typedData?.recommendations ?? [],
    resources: typedData?.resources ?? [],
    isLoading,
    error,
  };
}

export function useNotifications(studentId: string) {
  const { data, error, isLoading } = useSWR(
    studentId ? `/api/student/notifications?studentId=${studentId}` : null,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  const typedData = data as { notifications?: unknown[]; totalUnread?: number } | undefined;

  return {
    notifications: typedData?.notifications ?? [],
    unreadCount: typedData?.totalUnread ?? 0,
    isLoading,
    error,
  };
}
