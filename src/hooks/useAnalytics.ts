/**
 * Custom hook for easy access to GA4 events
 */

'use client';

import { useCallback } from 'react';
import {
  trackPageView,
  trackAuthEvent,
  trackAttendanceEvent,
  trackAssignmentEvent,
  trackExamEvent,
  trackFeePaymentEvent,
  trackFormSubmission,
  trackDownloadEvent,
  trackEngagementTime,
  trackErrorEvent,
  setUserProperties,
} from '~/lib/analytics/ga4-events';

export const useAnalytics = () => {
  const logPageView = useCallback(
    (pagePath: string, pageTitle: string, userRole?: string) => {
      trackPageView(pagePath, pageTitle, userRole);
    },
    []
  );

  const logAuth = useCallback(
    (
      eventType: 'login' | 'logout' | 'signup',
      userRole: string,
      method?: string
    ) => {
      trackAuthEvent(eventType, userRole, method);
    },
    []
  );

  const logAttendance = useCallback(
    (
      studentId: string,
      classId: string,
      status: 'present' | 'absent' | 'late'
    ) => {
      trackAttendanceEvent(studentId, classId, status);
    },
    []
  );

  const logAssignment = useCallback(
    (assignmentId: string, classId: string, status: 'submitted' | 'viewed' | 'completed') => {
      trackAssignmentEvent(assignmentId, classId, status);
    },
    []
  );

  const logExam = useCallback(
    (examId: string, classId: string, score?: number, totalMarks?: number) => {
      trackExamEvent(examId, classId, score, totalMarks);
    },
    []
  );

  const logFeePayment = useCallback(
    (studentId: string, amount: number, currency?: string, paymentMethod?: string) => {
      trackFeePaymentEvent(studentId, amount, currency, paymentMethod);
    },
    []
  );

  const logFormSubmit = useCallback(
    (formName: string, formType: string, status: 'success' | 'error') => {
      trackFormSubmission(formName, formType, status);
    },
    []
  );

  const logDownload = useCallback(
    (fileName: string, fileType: string, category: string) => {
      trackDownloadEvent(fileName, fileType, category);
    },
    []
  );

  const logEngagement = useCallback(
    (pageName: string, timeSpentSeconds: number) => {
      trackEngagementTime(pageName, timeSpentSeconds);
    },
    []
  );

  const logError = useCallback(
    (errorType: string, errorMessage: string, context?: Record<string, any>) => {
      trackErrorEvent(errorType, errorMessage, context);
    },
    []
  );

  const setProperties = useCallback(
    (userId: string, userRole: string, className?: string, schoolYear?: string) => {
      setUserProperties(userId, userRole, className, schoolYear);
    },
    []
  );

  return {
    logPageView,
    logAuth,
    logAttendance,
    logAssignment,
    logExam,
    logFeePayment,
    logFormSubmit,
    logDownload,
    logEngagement,
    logError,
    setProperties,
  };
};
