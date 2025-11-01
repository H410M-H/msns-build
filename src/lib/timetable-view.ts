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

// Utility functions
export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
export const LECTURE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export const generateSlotId = (day: string, lectureNumber: number, classId: string) => {
  return `${day}-${lectureNumber}-${classId}`
}

export const parseSlotId = (slotId: string) => {
  const [day, lectureStr = "0", classId] = slotId.split("-")
  return {
    day,
    lectureNumber: Number.parseInt(lectureStr),
    classId,
  }
}
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { lectureNumber: 1, startTime: "08:00", endTime: "08:35" },
  { lectureNumber: 2, startTime: "08:40", endTime: "09:15" },
  { lectureNumber: 3, startTime: "09:20", endTime: "09:55" },
  { lectureNumber: 4, startTime: "10:00", endTime: "10:35" },
  { lectureNumber: 5, startTime: "10:40", endTime: "11:15" },
  { lectureNumber: 6, startTime: "11:20", endTime: "11:55" },
  { lectureNumber: 7, startTime: "12:00", endTime: "12:35" },
  { lectureNumber: 8, startTime: "12:40", endTime: "13:15" },
  { lectureNumber: 9, startTime: "13:20", endTime: "13:55" },
]   