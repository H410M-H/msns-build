/**
 * Analytics Usage Examples
 * 
 * This file demonstrates how to use the analytics tracking hooks
 * throughout your M.S. Naz High School LMS application.
 */

import { useAnalytics } from '~/hooks/useAnalytics';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Example 1: Login Component
 * Track user authentication events
 */
export function LoginExample() {
  const { logAuth, setProperties } = useAnalytics();

  const handleLogin = async (email: string, password: string) => {
    try {
      // Your login logic here
      const user = await loginUser(email, password);

      // Track successful login
      logAuth('login', user.role, 'email');
      
      // Set user properties for future tracking
      setProperties(user.id, user.role, user.className, '2025-2026');

      console.log('Login tracked successfully');
    } catch (error) {
      // Track login error
      console.error('Login failed', error);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        const email = (e.target as HTMLFormElement).email.value;
        const password = (e.target as HTMLFormElement).password.value;
        handleLogin(email, password);
      }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

/**
 * Example 2: Attendance Marking Component
 * Track when attendance is recorded
 */
export function AttendanceMarkerExample() {
  const { logAttendance, logFormSubmit } = useAnalytics();

  const handleMarkAttendance = async (
    studentId: string,
    classId: string,
    status: 'present' | 'absent' | 'late'
  ) => {
    try {
      // Your attendance marking logic here
      await markAttendance(studentId, classId, status);

      // Track attendance event
      logAttendance(studentId, classId, status);
      logFormSubmit('attendance_form', 'attendance', 'success');

      console.log('Attendance tracked');
    } catch (error) {
      logFormSubmit('attendance_form', 'attendance', 'error');
    }
  };

  return (
    <div>
      <button onClick={() => handleMarkAttendance('STU001', 'CLASS10A', 'present')}>
        Mark Present
      </button>
      <button onClick={() => handleMarkAttendance('STU001', 'CLASS10A', 'absent')}>
        Mark Absent
      </button>
      <button onClick={() => handleMarkAttendance('STU001', 'CLASS10A', 'late')}>
        Mark Late
      </button>
    </div>
  );
}

/**
 * Example 3: Assignment Submission Component
 * Track assignment interactions
 */
export function AssignmentSubmissionExample() {
  const { logAssignment } = useAnalytics();

  const handleSubmitAssignment = async (
    assignmentId: string,
    classId: string,
    file: File
  ) => {
    try {
      // Your assignment submission logic
      await submitAssignment(assignmentId, file);

      // Track assignment submission
      logAssignment(assignmentId, classId, 'submitted');

      console.log('Assignment submission tracked');
    } catch (error) {
      console.error('Submission failed', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => {
        if (e.target.files?.[0]) {
          handleSubmitAssignment('ASSIGN001', 'CLASS10A', e.target.files[0]);
        }
      }} />
    </div>
  );
}

/**
 * Example 4: Exam Completion Component
 * Track exam results and scores
 */
export function ExamCompletionExample() {
  const { logExam } = useAnalytics();

  const handleExamSubmit = async (
    examId: string,
    classId: string,
    answers: Record<string, string>
  ) => {
    try {
      // Grade the exam
      const result = await submitExam(examId, answers);

      // Track exam completion with score
      logExam(examId, classId, result.score, result.totalMarks);

      console.log('Exam tracked with score:', result.score);
    } catch (error) {
      console.error('Exam submission failed', error);
    }
  };

  return (
    <div>
      {/* Your exam component here */}
    </div>
  );
}

/**
 * Example 5: Fee Payment Component
 * Track payments as conversions in GA4
 */
export function FeePaymentExample() {
  const { logFeePayment, logFormSubmit } = useAnalytics();

  const handleFeePayment = async (
    studentId: string,
    amount: number,
    paymentMethod: 'credit_card' | 'bank_transfer' | 'cash'
  ) => {
    try {
      // Process payment
      await processPayment(studentId, amount, paymentMethod);

      // Track as a purchase conversion
      logFeePayment(studentId, amount, 'PKR', paymentMethod);
      logFormSubmit('fee_payment_form', 'fee_payment', 'success');

      console.log('Fee payment tracked as conversion');
    } catch (error) {
      logFormSubmit('fee_payment_form', 'fee_payment', 'error');
    }
  };

  return (
    <div>
      <button onClick={() => handleFeePayment('STU001', 50000, 'credit_card')}>
        Pay 50,000 PKR via Card
      </button>
      <button onClick={() => handleFeePayment('STU001', 50000, 'bank_transfer')}>
        Pay 50,000 PKR via Bank
      </button>
    </div>
  );
}

/**
 * Example 6: Page View and Engagement Tracking
 * Track user engagement time on specific pages
 */
export function PageEngagementExample() {
  const { logPageView, logEngagement } = useAnalytics();
  const router = useRouter();

  useEffect(() => {
    // Track page view on mount
    const pathname = router.pathname || '/dashboard';
    logPageView(pathname, 'Dashboard', 'student');

    // Track engagement time
    let startTime = Date.now();
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      logEngagement('Dashboard', timeSpent);
    };
  }, [router.pathname]);

  return (
    <div>
      {/* Your page content here */}
    </div>
  );
}

/**
 * Example 7: File Download Tracking
 * Track when students download resources
 */
export function ResourceDownloadExample() {
  const { logDownload } = useAnalytics();

  const handleDownloadResource = async (
    fileName: string,
    fileType: 'pdf' | 'doc' | 'video' | 'other',
    category: 'syllabus' | 'notes' | 'exam_paper' | 'solution'
  ) => {
    try {
      // Your download logic
      await downloadFile(fileName);

      // Track download
      logDownload(fileName, fileType, category);

      console.log('Download tracked:', fileName);
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <div>
      <button onClick={() => handleDownloadResource('Class10_Syllabus.pdf', 'pdf', 'syllabus')}>
        Download Syllabus
      </button>
      <button onClick={() => handleDownloadResource('Chapter1_Notes.pdf', 'pdf', 'notes')}>
        Download Notes
      </button>
      <button onClick={() => handleDownloadResource('Midterm_2025.pdf', 'pdf', 'exam_paper')}>
        Download Exam Paper
      </button>
    </div>
  );
}

/**
 * Example 8: Error Tracking
 * Track errors for debugging and monitoring
 */
export function ErrorTrackingExample() {
  const { logError } = useAnalytics();

  const handleApiCall = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Track error in analytics
      logError('API_CALL_ERROR', errorMessage, {
        endpoint: '/api/students',
        status: 500,
      });

      console.error('Error tracked:', errorMessage);
    }
  };

  return (
    <div>
      <button onClick={handleApiCall}>Call API</button>
    </div>
  );
}

/**
 * Example 9: Custom Event Hook
 * Create custom hooks for specific features
 */
export function useClassroomAnalytics() {
  const { logPageView, logAssignment, logExam } = useAnalytics();

  const trackClassVisit = (classId: string, className: string) => {
    logPageView(`/class/${classId}`, `Class: ${className}`, 'student');
  };

  const trackAssignmentView = (assignmentId: string, classId: string) => {
    logAssignment(assignmentId, classId, 'viewed');
  };

  const trackExamStart = (examId: string, classId: string) => {
    logPageView(`/exam/${examId}`, 'Exam Started', 'student');
  };

  return {
    trackClassVisit,
    trackAssignmentView,
    trackExamStart,
  };
}

/**
 * Example 10: Logout Tracking
 */
export function LogoutExample() {
  const { logAuth } = useAnalytics();

  const handleLogout = async (userRole: string) => {
    try {
      // Your logout logic
      await logoutUser();

      // Track logout
      logAuth('logout', userRole);

      console.log('Logout tracked');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <button onClick={() => handleLogout('student')}>
      Logout
    </button>
  );
}

// Mock functions for examples
async function loginUser(email: string, password: string) {
  return { id: 'USER123', role: 'student', className: 'Class 10-A' };
}

async function markAttendance(studentId: string, classId: string, status: string) {
  return { success: true };
}

async function submitAssignment(assignmentId: string, file: File) {
  return { success: true };
}

async function submitExam(examId: string, answers: Record<string, string>) {
  return { score: 85, totalMarks: 100 };
}

async function processPayment(studentId: string, amount: number, method: string) {
  return { success: true, transactionId: 'TXN123' };
}

async function downloadFile(fileName: string) {
  return { success: true };
}

async function logoutUser() {
  return { success: true };
}
