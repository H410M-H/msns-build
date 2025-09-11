type AccountTypeEnum = "ADMIN" | "PRINCIPAL" | "HEAD" | "CLERK" | "TEACHER" | "WORKER" | "STUDENT" | "ALL" | "NONE";

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

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"

type AccountType =
  | "STUDENT"
  | "FACULTY"
  | "ADMIN"
  | "WORKER"
  | "HEAD"
  | "PRINCIPAL"
  | "CLERK"
  | "TEACHER"
  | "NONE"
  | "ALL"

interface AttendanceRecord {
  id: string
  userId: string
  date: Date
  status: AttendanceStatus
  classId?: string
  remarks?: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    username: string
    accountId: string
    accountType: AccountType
  }
  class?: {
    id: string
    name: string
    section: string
  }
}

interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  presentPercentage: number
}

interface MonthlyAttendanceData {
  attendance: AttendanceRecord[]
  students?: Array<{
    id: string
    username: string
    accountId: string
  }>
  employees?: Array<{
    id: string
    username: string
    accountId: string
    accountType: AccountType
  }>
  daysInMonth: number
}

interface Class {
  id: string
  name: string
  section: string
  gradeLevel?: number
  academicYear?: string
}


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
  designation: "ADMIN" | "PRINCIPAL" | "HEAD" | "CLERK" | "TEACHER" | "WORKER" | "STUDENT";
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
