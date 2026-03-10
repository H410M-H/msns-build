/**
 * Mock Academic Data Generator
 * Used for development and testing when real data is not available
 */

export function generateMockAnalytics(studentId: string) {
  const subjects = ["Mathematics", "English", "Science", "History", "Geography"];
  const subjectPerformance = subjects.map((subject) => ({
    subjectName: subject,
    average: Math.floor(Math.random() * 40) + 50, // 50-90%
    totalMarks: Math.floor(Math.random() * 200) + 250,
  }));

  const overallAverage =
    subjectPerformance.reduce((sum, s) => sum + s.average, 0) /
    subjectPerformance.length;

  return {
    studentId,
    overallAverage: Math.round(overallAverage * 10) / 10,
    totalExams: Math.floor(Math.random() * 15) + 5,
    passingRate: Math.floor(Math.random() * 30) + 70,
    subjectWisePerformance,
  };
}

export function generateMockPerformanceTrends(studentId: string) {
  const trends = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    trends.push({
      date: date.toISOString().split("T")[0],
      percentage: Math.floor(Math.random() * 35) + 55,
    });
  }

  return {
    trends,
    prediction: Math.floor(Math.random() * 20) + 65,
  };
}

export function generateMockComparativeAnalytics(
  studentId: string,
  classId: string
) {
  const studentAverage = Math.floor(Math.random() * 30) + 60;
  const classAverage = Math.floor(Math.random() * 30) + 55;

  return {
    studentPercentile: Math.floor(Math.random() * 60) + 30,
    classAverage,
    studentAverage,
    aboveAverage: studentAverage > classAverage,
    subjectComparison: [
      {
        subject: "Mathematics",
        studentScore: Math.floor(Math.random() * 30) + 60,
        classAverage: Math.floor(Math.random() * 30) + 55,
      },
      {
        subject: "English",
        studentScore: Math.floor(Math.random() * 30) + 60,
        classAverage: Math.floor(Math.random() * 30) + 55,
      },
      {
        subject: "Science",
        studentScore: Math.floor(Math.random() * 30) + 60,
        classAverage: Math.floor(Math.random() * 30) + 55,
      },
    ],
  };
}

export function generateMockExamSchedule(studentId: string, classId: string) {
  const now = new Date();
  const upcomingExams = [
    {
      id: "exam-1",
      subjectName: "Mathematics",
      examDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      examTime: "10:00 AM",
      duration: 3,
      type: "Mid Term",
      totalMarks: 100,
      syllabus: "Chapters 5-8",
    },
    {
      id: "exam-2",
      subjectName: "English",
      examDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      examTime: "2:00 PM",
      duration: 2.5,
      type: "Mid Term",
      totalMarks: 100,
      syllabus: "Poetry and Prose",
    },
    {
      id: "exam-3",
      subjectName: "Science",
      examDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
      examTime: "10:00 AM",
      duration: 3,
      type: "Mid Term",
      totalMarks: 100,
      syllabus: "Physics and Chemistry",
    },
  ];

  const pastExams = [
    {
      id: "past-1",
      subjectName: "Mathematics",
      examDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      marksObtained: 85,
      totalMarks: 100,
      percentage: 85,
      grade: "A",
    },
    {
      id: "past-2",
      subjectName: "English",
      examDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      marksObtained: 78,
      totalMarks: 100,
      percentage: 78,
      grade: "B+",
    },
  ];

  return {
    upcomingExams,
    pastExams,
    studyTimeline: {
      totalDaysToStudy: 14,
      recommendedHoursPerDay: 3,
      prioritySubjects: ["Mathematics", "Science"],
    },
  };
}

export function generateMockAchievements(studentId: string) {
  const badges = [
    {
      id: "badge-1",
      title: "Perfect Attendance",
      description: "Attended all classes for a month",
      icon: "excellence",
      earnedDate: new Date(),
      points: 10,
    },
    {
      id: "badge-2",
      title: "Math Master",
      description: "Scored 90%+ in mathematics",
      icon: "subject_mastery",
      earnedDate: new Date(),
      points: 25,
    },
  ];

  const certificates = [
    {
      id: "cert-1",
      title: "Outstanding Performance",
      subject: "Mathematics",
      dateEarned: new Date(),
      percentage: 92,
      downloadUrl: "/certificates/math-excellence.pdf",
    },
  ];

  const milestones = [
    {
      id: "mile-1",
      title: "Exam Mastery",
      description: "Pass 10 exams with 80%+ score",
      achieved: false,
      progress: 7,
      target: 10,
    },
    {
      id: "mile-2",
      title: "Consistency Champion",
      description: "Maintain 75%+ average for 3 months",
      achieved: false,
      progress: 1,
      target: 3,
    },
  ];

  return { badges, certificates, milestones };
}

export function generateMockTeacherFeedback(studentId: string) {
  const feedback = [
    {
      id: "fb-1",
      subjectName: "Mathematics",
      teacherName: "Mr. Kumar",
      feedback:
        "Great improvement in problem-solving. Keep practicing calculus concepts.",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      rating: 4,
    },
    {
      id: "fb-2",
      subjectName: "English",
      teacherName: "Ms. Smith",
      feedback:
        "Excellent essay writing skills. Work on grammar and punctuation for improvement.",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      rating: 3,
    },
  ];

  const strengths = [
    {
      title: "Strong Analytical Skills",
      description: "You excel at breaking down complex problems logically",
      subject: "Mathematics",
    },
    {
      title: "Excellent Written Communication",
      description: "Your essays are well-structured and clear",
      subject: "English",
    },
  ];

  const weaknesses = [
    {
      title: "Time Management",
      description: "Need to manage exam time better",
      subject: "Multiple",
      improvementTips: [
        "Practice solving papers under time constraints",
        "Allocate time wisely for each section",
        "Review easier questions first",
      ],
    },
    {
      title: "Science Practicals",
      description: "Laboratory safety and technique need improvement",
      subject: "Science",
      improvementTips: [
        "Review lab protocols before each session",
        "Pay attention to safety guidelines",
        "Practice experimental procedures",
      ],
    },
  ];

  return { feedback, strengths, weaknesses };
}

export function generateMockNotifications(studentId: string) {
  const now = new Date();

  const notifications = [
    {
      id: "notif-1",
      type: "success",
      title: "Great Performance!",
      message: "You scored 92% in your last mathematics test!",
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      icon: "award",
    },
    {
      id: "notif-2",
      type: "warning",
      title: "Upcoming Exam",
      message: "English exam scheduled in 5 days. Start your preparation.",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      icon: "calendar",
    },
    {
      id: "notif-3",
      type: "info",
      title: "Assignment Due",
      message: "Science project submission deadline is today.",
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      icon: "document",
    },
  ];

  return {
    notifications,
    unreadCount: 2,
  };
}

export function generateMockGradeImprovement(studentId: string) {
  return {
    improvementPlans: [
      {
        id: "plan-1",
        subject: "Mathematics",
        currentAverage: 75,
        targetAverage: 85,
        daysToAchieve: 30,
        strategies: [
          "Focus on geometry and algebra fundamentals",
          "Solve 10 practice problems daily",
          "Attend tutoring sessions twice a week",
        ],
      },
      {
        id: "plan-2",
        subject: "Science",
        currentAverage: 68,
        targetAverage: 80,
        daysToAchieve: 45,
        strategies: [
          "Review chemistry formulas",
          "Practice physics numericals",
          "Focus on biology diagrams",
        ],
      },
    ],
    recommendations: [
      {
        id: "rec-1",
        title: "Personalized Study Schedule",
        description: "Based on your weak areas, we recommend:",
        items: [
          "2 hours daily for mathematics",
          "1.5 hours daily for science",
          "1 hour daily for English",
        ],
      },
      {
        id: "rec-2",
        title: "Learning Resources",
        description: "Recommended study materials:",
        items: [
          "Khan Academy for concept clarity",
          "Previous year question papers",
          "Reference books from library",
        ],
      },
    ],
    resources: [
      {
        id: "res-1",
        title: "Mathematics Fundamentals",
        type: "video",
        url: "#",
        duration: "2 hours",
      },
      {
        id: "res-2",
        title: "Science Practice Problems",
        type: "pdf",
        url: "#",
        pages: 50,
      },
      {
        id: "res-3",
        title: "Study Group Directory",
        type: "link",
        url: "#",
        members: 15,
      },
    ],
  };
}
