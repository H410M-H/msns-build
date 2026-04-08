/**
 * GA4 Custom Events for M.S. Naz High School
 * Tracks school-specific user actions for analytics
 */

// Type definitions for GA4 events
interface WindowWithDataLayer extends Window {
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}

const w = typeof window !== "undefined" ? (window as WindowWithDataLayer) : null;

/**
 * Track page views with custom properties
 */
export const trackPageView = (
  pagePath: string,
  pageTitle: string,
  userRole?: string
) => {
  if (!w?.gtag) return;

  w.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle,
    user_role: userRole || "guest",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track user login/logout
 */
export const trackAuthEvent = (
  eventType: "login" | "logout" | "signup",
  userRole: string,
  method?: string
) => {
  if (!w?.gtag) return;

  const eventName =
    eventType === "login"
      ? "user_login"
      : eventType === "logout"
        ? "user_logout"
        : "user_signup";

  w.gtag("event", eventName, {
    method: method || "email",
    user_role: userRole,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track student attendance
 */
export const trackAttendanceEvent = (
  studentId: string,
  classId: string,
  attendanceStatus: "present" | "absent" | "late"
) => {
  if (!w?.gtag) return;

  w.gtag("event", "attendance_marked", {
    student_id: studentId,
    class_id: classId,
    attendance_status: attendanceStatus,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track assignment submission
 */
export const trackAssignmentEvent = (
  assignmentId: string,
  classId: string,
  status: "submitted" | "viewed" | "completed"
) => {
  if (!w?.gtag) return;

  w.gtag("event", "assignment_interaction", {
    assignment_id: assignmentId,
    class_id: classId,
    action: status,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track exam/test event
 */
export const trackExamEvent = (
  examId: string,
  classId: string,
  score?: number,
  totalMarks?: number
) => {
  if (!w?.gtag) return;

  w.gtag("event", "exam_completed", {
    exam_id: examId,
    class_id: classId,
    score: score || 0,
    total_marks: totalMarks || 100,
    percentage: score && totalMarks ? (score / totalMarks) * 100 : 0,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track fee payment (conversion)
 */
export const trackFeePaymentEvent = (
  studentId: string,
  amount: number,
  currency: string = "PKR",
  paymentMethod?: string
) => {
  if (!w?.gtag) return;

  w.gtag("event", "purchase", {
    value: amount,
    currency: currency,
    transaction_id: `fee_${studentId}_${Date.now()}`,
    item_category: "school_fee",
    payment_method: paymentMethod || "online",
    student_id: studentId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track form submission
 */
export const trackFormSubmission = (
  formName: string,
  formType: string,
  status: "success" | "error"
) => {
  if (!w?.gtag) return;

  w.gtag("event", "form_submit", {
    form_name: formName,
    form_type: formType,
    status: status,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track resource download
 */
export const trackDownloadEvent = (
  fileName: string,
  fileType: string,
  category: string
) => {
  if (!w?.gtag) return;

  w.gtag("event", "file_download", {
    file_name: fileName,
    file_type: fileType,
    category: category, // e.g., "syllabus", "notes", "exam_paper"
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track user engagement time on page
 */
export const trackEngagementTime = (
  pageName: string,
  timeSpentSeconds: number
) => {
  if (!w?.gtag) return;

  w.gtag("event", "page_engagement", {
    page_name: pageName,
    engagement_time_seconds: timeSpentSeconds,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track error events
 */
export const trackErrorEvent = (
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
) => {
  if (!w?.gtag) return;

  w.gtag("event", "exception", {
    description: `${errorType}: ${errorMessage}`,
    fatal: false,
    ...context,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Set user properties for tracking
 */
export const setUserProperties = (
  userId: string,
  userRole: string,
  className?: string,
  schoolYear?: string
) => {
  if (!w?.gtag) return;

  w.gtag("config", "G-K3FXJTBQKM", {
    user_id: userId,
    user_role: userRole,
    class_name: className,
    school_year: schoolYear,
  });
};
