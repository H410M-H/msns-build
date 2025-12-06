// Enums from Prisma Schema
type ClassCategory = "Montessori" | "Primary" | "Middle" | "SSC_I" | "SSC_II";
type Designation = "PRINCIPAL" | "ADMIN" | "HEAD" | "CLERK" | "TEACHER" | "WORKER" | "NONE" | "ALL" | "STUDENT" | "FACULTY";
type FeeCategory = "MonthlyFee" | "AnnualFee";
type ExpenseCategory = "UTILITIES" | "SUPPLIES" | "MAINTENANCE" | "SALARIES" | "TRANSPORT" | "FOOD" | "EQUIPMENT" | "OTHER" | "BISE";
type Gender = "MALE" | "FEMALE" | "CUSTOM";
type MaritalStatus = "Married" | "Unmarried" | "Widow" | "Divorced";
type EventType = "MEETING" | "WORKSHOP" | "CONFERENCE" | "TRAINING" | "WEBINAR" | "SOCIAL" | "OTHER";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type EventStatus = "CONFIRMED" | "TENTATIVE" | "CANCELLED";
type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
type AttendeeStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";
type ReminderType = "EMAIL" | "PUSH" | "SMS";
type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
type AccountTypeEnum = Designation;

// Navigation
type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

// Core Models
type User = {
  id: string;
  accountId: string;
  accountType: Designation;
  createdAt: Date;
  password: string;
  username: string;
  email: string;
  bio: string | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: boolean;
  pushNotifications: boolean;
  twoFactorAuth: boolean;
  EventAttendee: Attendee[];
  Event: Event[];
};

type Grades = {
  classId: string;
  grade: string;
  section: string;
  category: ClassCategory;
  fee: number;
  ClassSubject: ClassSubject[];
  StudentClass: StudentClass[];
  Timetable: Timetable[];
};

type Students = {
  studentId: string;
  registrationNumber: string;
  studentMobile: string;
  fatherMobile: string;
  admissionNumber: string;
  studentName: string;
  gender: Gender;
  dateOfBirth: string;
  fatherName: string;
  studentCNIC: string;
  fatherCNIC: string;
  fatherProfession: string | null;
  bloodGroup: string | null;
  guardianName: string | null;
  caste: string;
  currentAddress: string;
  permanentAddress: string;
  medicalProblem: string | null;
  profilePic: string | null;
  isAssign: boolean;
  createdAt: Date;
  updatedAt: Date;
  StudentClass: StudentClass[];
  discount?: number;
  discountByPercent?: number;
};

type Employees = {
  employeeId: string;
  registrationNumber: string;
  employeeName: string;
  fatherName: string;
  admissionNumber: string;
  gender: Gender;
  dob: string;
  cnic: string;
  maritalStatus: MaritalStatus;
  doj: string;
  designation: Designation;
  residentialAddress: string;
  mobileNo: string;
  additionalContact: string | null;
  education: string;
  profilePic: string | null;
  cv: string | null;
  isAssign: boolean;
  BioMetric?: BioMetric;
  ClassSubject: ClassSubject[];
  Timetable: Timetable[];
  SalaryAssignment: SalaryAssignment[];
  SalaryIncrement: SalaryIncrement[];
  EmployeeAttendance: EmployeeAttendance[];
};

type Sessions = {
  sessionId: string;
  sessionName: string;
  sessionFrom: string;
  sessionTo: string;
  isActive: boolean;
  ClassSubject: ClassSubject[];
  Timetable: Timetable[];
  SalaryAssignment: SalaryAssignment[];
  StudentClass: StudentClass[];
};

type Fees = {
  feeId: string;
  level: string;
  admissionFee: number;
  tuitionFee: number;
  examFund: number;
  computerLabFund: number | null;
  studentIdCardFee: number;
  infoAndCallsFee: number;
  type: FeeCategory;
  createdAt: Date;
  updatedAt: Date;
  FeeStudentClass: FeeStudentClass[];
};

type Subject = {
  subjectId: string;
  subjectName: string;
  book: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  ClassSubject: ClassSubject[];
  Timetable: Timetable[];
};

// Junction/Relationship Models
type ClassSubject = {
  csId: string;
  classId: string;
  subjectId: string;
  employeeId: string;
  sessionId: string;
  Grades: Grades;
  Employees: Employees;
  Sessions: Sessions;
  Subject: Subject;
};

type StudentClass = {
  scId: string;
  studentId: string;
  classId: string;
  sessionId: string;
  FeeStudentClass: FeeStudentClass[];
  Grades: Grades;
  Sessions: Sessions;
  Students: Students;
};

type FeeStudentClass = {
  sfcId: string;
  studentClassId: string;
  feeId: string;
  tuitionPaid: boolean;
  examFundPaid: boolean;
  computerLabPaid: boolean;
  studentIdCardPaid: boolean;
  infoAndCallsPaid: boolean;
  discount: number;
  discountByPercent: number;
  discountDescription: string;
  month: number;
  year: number;
  lateFee: number;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fees: Fees;
  StudentClass: StudentClass;
};

// Employee Management
type SalaryAssignment = {
  id: string;
  employeeId: string;
  baseSalary: number;
  increment: number;
  totalSalary: number;
  assignedDate: Date;
  sessionId: string;
  Employees: Employees;
  Sessions: Sessions;
};

type SalaryIncrement = {
  id: string;
  employeeId: string;
  incrementAmount: number;
  reason: string;
  effectiveDate: Date;
  Employees: Employees;
};

type BioMetric = {
  fingerId: string;
  thumb: string[];
  indexFinger: string[];
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
  employee: Employees;
};

type EmployeeAttendance = {
  employeeAttendanceId: string;
  morning: string;
  afternoon: string;
  date: string;
  employeeId: string;
  employee: Employees;
  createdAt: Date;
  updatedAt: Date;
};

// Event Management
type Event = {
  id: string;
  title: string;
  description: string | null;
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;
  location: string | null;
  isOnline: boolean;
  type: EventType;
  priority: Priority;
  status: EventStatus;
  recurring: RecurrenceType;
  recurrenceEnd: Date | null;
  maxAttendees: number | null;
  isPublic: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  attendees: Attendee[];
  tags: EventTag[];
  reminders: Reminder[];
  User: User[];
};

type Tag = {
  id: string;
  name: string;
  color: string;
  events: EventTag[];
};

type EventTag = {
  eventId: string;
  tagId: string;
  event: Event;
  tag: Tag;
};

type Attendee = {
  eventId: string;
  userId: string;
  status: AttendeeStatus;
  event: Event;
  user: User;
};

type Reminder = {
  id: string;
  minutesBefore: number;
  type: ReminderType;
  eventId: string;
  event: Event;
};

// Finance
type Expenses = {
  expenseId: string;
  title: string;
  description: string | null;
  amount: number;
  category: ExpenseCategory;
  month: number;
  year: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Timetable
type Timetable = {
  timetableId: string;
  classId: string;
  subjectId: string;
  employeeId: string;
  sessionId: string;
  dayOfWeek: DayOfWeek;
  lectureNumber: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
  Grades: Grades;
  Subject: Subject;
  Employees: Employees;
  Sessions: Sessions;
};

// Additional Props (for backwards compatibility)
type ClassProps = Grades;
type StudentProps = Students;
type EmployeeProps = Employees;
type SessionProps = Sessions;
type FeeProps = Fees;
type SubjectProps = Subject;
type ClassSubjectProps = ClassSubject;
type ClassStudentProps = StudentClass & {
  student: Students;
  class: Grades;
  session: Sessions;
};
type ClassFeeProps = StudentClass & {
  class: Grades;
  fee: Fees;
  session: Sessions;
};
type FeeStudentClassProps = FeeStudentClass & {
  feeStudentClass: StudentClass;
  fee: Fees;
};
type SalaryAssignmentProps = SalaryAssignment;
type SalaryIncrementProps = SalaryIncrement;

// Attendance & Calendar
type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
};

type AttendanceStatus = "present" | "absent" | "late" | "half-day" | "holiday";

type CalendarDay = {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
};

// Fingerprint Device Types (keep existing)
type FingerprintDeviceProps = {
  id: string;
  name: string;
  open(): Promise<void>;
  close(): Promise<void>;
  capture(options?: CaptureOptions): Promise<CaptureResult>;
};

type CaptureOptions = {
  timeout?: number;
  waitForFinger?: boolean;
  qualityThreshold?: number;
};

type CaptureResult = {
  template?: Uint8Array;
  image?: Uint8Array;
  quality?: number;
};

interface SGFAWebAPI {
  Init: () => Promise<SGResult>;
  Capture: (
    quality: number,
    timeout: number,
    templateFormat: number,
    showPreview: boolean,
  ) => Promise<SGCaptureResult>;
  Match: (template1: string, template2: string) => Promise<SGMatchResult>;
  GetVersion: () => Promise<SGVersionResult>;
  GetLastError: () => Promise<SGErrorResult>;
  GetDeviceInfo: () => Promise<SGDeviceInfoResult>;
}

interface SGResult {
  ReturnCode: number;
  Message?: string;
}

interface SGCaptureResult extends SGResult {
  Data: string;
  ImageWidth?: number;
  ImageHeight?: number;
  ImageDPI?: number;
  Quality?: number;
}

interface SGMatchResult extends SGResult {
  Score: number;
  Matched: boolean;
}

interface SGVersionResult extends SGResult {
  Version: string;
}

interface SGErrorResult extends SGResult {
  ErrorCode: number;
  ErrorMessage: string;
}

interface SGDeviceInfoResult extends SGResult {
  DeviceID: string;
  DeviceType: string;
  Width: number;
  Height: number;
  DPI: number;
}

type FingerPrintResponseProps = {
  ErrorCode: number;
  Manufacturer: string;
  Model: string;
  SerialNumber: string;
  ImageWidth: number;
  ImageHeight: number;
  ImageDPI: number;
  ImageQuality: string;
  NFIQ: number;
  ImageDataBase64: string | null;
  BMPBase64: string;
  WSQImage: string;
  WSQImageSize: number;
  ISOTemplateBase64: string;
  TemplateBase64: string;
};