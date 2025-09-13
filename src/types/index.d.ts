type AccountTypeEnum =
  | "ADMIN"
  | "PRINCIPAL"
  | "HEAD"
  | "CLERK"
  | "TEACHER"
  | "WORKER"
  | "STUDENT"
  | "ALL"
  | "NONE";

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

type ClassProps = {
  sessionId?: string;
  classId: string;
  grade: string;
  section: string;
  category: "Montessori" | "Primary" | "Middle" | "SSC_I" | "SSC_II";
  fee: number;
};

type StudentProps = {
  studentId: string;
  registrationNumber: string;
  studentMobile: string;
  fatherMobile: string;
  admissionNumber: string;
  studentName: string;
  gender: "MALE" | "FEMALE" | "CUSTOM";
  dateOfBirth: string;
  fatherName: string;
  studentCNIC: string;
  fatherCNIC: string;
  fatherProfession?: string | null;
  bloodGroup?: string | null;
  guardianName?: string | null;
  caste?: string;
  currentAddress: string;
  permanentAddress: string;
  medicalProblem?: string | null;
  profilePic?: string | null;
  isAssign: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  discount: number;
  discountByPercent: number;
};

type EmployeeProps = {
  employeeId: string;
  registrationNumber: string;
  admissionNumber: string;
  employeeName: string;
  fatherName: string;
  gender: "MALE" | "FEMALE" | "CUSTOM";
  dob: string;
  cnic: string;
  maritalStatus: "Married" | "Unmarried" | "Widow" | "Divorced";
  doj: string;
  designation:
    | "ADMIN"
    | "PRINCIPAL"
    | "HEAD"
    | "CLERK"
    | "TEACHER"
    | "WORKER"
    | "STUDENT";
  residentialAddress: string;
  mobileNo: string;
  additionalContact?: string | null;
  education: string;
  profilePic?: string | null;
  cv?: string | null;
  isAssign: boolean;
  salaryAssignments?: SalaryAssignmentProps[];
  salaryIncrements?: SalaryIncrementProps[];
};

type SessionProps = {
  sessionId: string;
  sessionName: string;
  sessionFrom: string | Date;
  sessionTo: string | Date;
  isActive: boolean;
  salaryAssignments?: SalaryAssignmentProps[];
};

type FeeProps = {
  feeId?: string;
  level: string;
  admissionFee: number;
  tuitionFee: number;
  examFund: number;
  computerLabFund?: number | null;
  studentIdCardFee: number;
  infoAndCallsFee: number;
  type: "MonthlyFee" | "AnnualFee";
  createdAt?: Date;
  updatedAt?: Date;
};

type SubjectProps = {
  subjectId: string;
  subjectName: string;
  book?: string;
  description?: string;
};

type ClassSubjectProps = {
  csId: string;
  classId: string;
  subjectId: string;
  employeeId: string;
  sessionId: string;
  subject: SubjectProps;
  employee: EmployeeProps;
  class: ClassProps;
  session: SessionProps;
};

type ClassStudentProps = {
  feeId: unknown;
  scId: string;
  classId: string;
  sessionId: string;
  student: StudentProps;
  class: ClassProps;
  session: SessionProps;
};

type ClassFeeProps = {
  scId: string;
  feeId: string;
  classId: string;
  sessionId: string;
  class: ClassProps;
  fee: FeeProps;
  session: SessionProps;
};

type FeeStudentClassProps = {
  sfcId: string;
  studentClassId: string;
  feeId: string;
  discount: number;
  discountByPercent: number;
  discountDescription: string;
  createdAt: Date;
  updatedAt: Date;
  feeStudentClass: ClassStudentProps;
  fee: FeeProps;
};

type SalaryAssignmentProps = {
  id: string;
  employeeId: string;
  employee: EmployeeProps;
  baseSalary: number;
  increment: number;
  totalSalary: number;
  assignedDate: Date;
  sessionId: string;
  session: SessionProps;
};

type SalaryIncrementProps = {
  id: string;
  employeeId: string;
  employee: EmployeeProps;
  incrementAmount: number;
  reason: string;
  effectiveDate: Date;
};

type FingerprintDeviceProps = {
  id: string;
  name: string;
  open(): Promise<void>;
  close(): Promise<void>;
  capture(options?: CaptureOptions): Promise<CaptureResult>;
};

type CaptureOptionsProps = {
  timeout?: number;
  waitForFinger?: boolean;
  qualityThreshold?: number;
};

type CaptureResultProps = {
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

type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD format
  status: AttendanceStatus;
  checkIn?: string; // HH:mm format
  checkOut?: string; // HH:mm format
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

type EmployeeAttendanceProps = {
  employeeAttendanceId: string;
  morning: string;
  afternoon: string;
  employeeId: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
};
