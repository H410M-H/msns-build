// lib/timetable-types.ts (fixed)
export interface Teacher {
  employeeId: string
  employeeName: string
  designation: string
  education?: string
}

export interface Class {
  classId: string
  grade: string
  section: string
}

export interface Subject {
  subjectId: string
  subjectName: string
}

export interface Sessions {
  sessionId: string;
  sessionName: string;
  sessionFrom?: string;
  sessionTo?: string;  
  isActive?: boolean; 
}

export interface TimeSlot {
  lectureNumber: number
  startTime: string
  endTime: string
}

export interface TimetableSlot {
  slotId: string // Unique identifier: `${day}-${lectureNumber}-${classId}`
  day: string
  lectureNumber: number
  classId: string
  teacherId: string | null
  subjectId: string | null
  startTime: string
  endTime: string
}

export interface DraggedTeacher extends Teacher {
  sourceSlot?: string
}

export type TimetableViewMode = "class" | "teacher"

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"

// Utility functions
export const DAYS_OF_WEEK: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
export const LECTURE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export const generateSlotId = (day: DayOfWeek, lectureNumber: number, classId: string) => {
  return `${day}-${lectureNumber}-${classId}`
}

export const parseSlotId = (slotId: string) => {
  const parts = slotId.split("-")
  if (parts.length !== 3) {
    throw new Error("Invalid slotId format")
  }
  const [day, lectureStr, classId] = parts
  return {
    day: day!,
    lectureNumber: Number.parseInt(lectureStr!, 10),
    classId: classId!,
  }
}

export interface TimetableEntry {
  timetableId: string
  classId: string
  employeeId: string
  subjectId: string
  sessionId: string
  dayOfWeek: DayOfWeek
  lectureNumber: number
  startTime: string
  endTime: string
  Grades: Class
  Subject: Subject
  Employees: Teacher
  Sessions: Sessions
}

export interface ClassSubjectAssignment {
  csId: string
  classId: string
  subjectId: string
  employeeId: string
  sessionId: string
  Grades: Class
  Subject: Subject
  Employees: Teacher
  Sessions: Sessions
}