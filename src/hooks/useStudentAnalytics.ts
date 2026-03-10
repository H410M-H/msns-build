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

  return {
    feedback: data?.feedback || [],
    strengths: data?.strengths || [],
    weaknesses: data?.weaknesses || [],
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

  return {
    upcomingExams: data?.upcomingExams || [],
    pastExams: data?.pastExams || [],
    studyTimeline: data?.studyTimeline,
    isLoading,
    error,
  };
}

export function useAchievements(studentId: string) {
  const { data, error, isLoading } = useSWR(
    studentId ? `/api/student/achievements?studentId=${studentId}` : null,
    fetcher
  );

  return {
    badges: data?.badges || [],
    certificates: data?.certificates || [],
    milestones: data?.milestones || [],
    isLoading,
    error,
  };
}

export function useGradeImprovement(studentId: string) {
  const { data, error, isLoading } = useSWR(
    studentId ? `/api/student/grade-improvement?studentId=${studentId}` : null,
    fetcher
  );

  return {
    improvementPlans: data?.improvementPlans || [],
    recommendations: data?.recommendations || [],
    resources: data?.resources || [],
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

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
  };
}
