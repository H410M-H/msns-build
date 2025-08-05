-- CreateEnum
CREATE TYPE "ClassCategory" AS ENUM ('Montessori', 'Primary', 'Middle', 'SSC_I', 'SSC_II');

-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('Principal', 'Admin', 'Head', 'Clerk', 'Teacher', 'Worker');

-- CreateEnum
CREATE TYPE "FeeCategory" AS ENUM ('MonthlyFee', 'AnnualFee');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('Married', 'Unmarried', 'Widow', 'Divorced');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountType" "Designation" NOT NULL DEFAULT 'Teacher',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubject" (
    "csId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("csId")
);

-- CreateTable
CREATE TABLE "Employees" (
    "employeeId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "employeeName" VARCHAR(100) NOT NULL,
    "fatherName" VARCHAR(100) NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" TEXT NOT NULL DEFAULT 'none',
    "cnic" TEXT NOT NULL DEFAULT '0000-0000000-0',
    "maritalStatus" "MaritalStatus" NOT NULL,
    "doj" TEXT NOT NULL DEFAULT 'none',
    "designation" "Designation" NOT NULL,
    "residentialAddress" TEXT NOT NULL,
    "mobileNo" TEXT NOT NULL DEFAULT 'none',
    "additionalContact" TEXT DEFAULT 'none',
    "education" TEXT NOT NULL DEFAULT 'none',
    "isAssign" BOOLEAN NOT NULL DEFAULT false,
    "profilePic" TEXT DEFAULT '/user.jpg',
    "cv" TEXT,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("employeeId")
);

-- CreateTable
CREATE TABLE "FeeStudentClass" (
    "sfcId" TEXT NOT NULL,
    "studentClassId" TEXT NOT NULL,
    "feeId" TEXT NOT NULL,
    "tuitionPaid" BOOLEAN NOT NULL DEFAULT false,
    "examFundPaid" BOOLEAN NOT NULL DEFAULT false,
    "computerLabPaid" BOOLEAN NOT NULL DEFAULT false,
    "studentIdCardPaid" BOOLEAN NOT NULL DEFAULT false,
    "infoAndCallsPaid" BOOLEAN NOT NULL DEFAULT false,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountByPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStudentClass_pkey" PRIMARY KEY ("sfcId")
);

-- CreateTable
CREATE TABLE "Fees" (
    "feeId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "admissionFee" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "tuitionFee" DOUBLE PRECISION NOT NULL,
    "examFund" DOUBLE PRECISION NOT NULL,
    "computerLabFund" DOUBLE PRECISION,
    "studentIdCardFee" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "infoAndCallsFee" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "type" "FeeCategory" NOT NULL DEFAULT 'MonthlyFee',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fees_pkey" PRIMARY KEY ("feeId")
);

-- CreateTable
CREATE TABLE "Grades" (
    "classId" TEXT NOT NULL,
    "grade" TEXT NOT NULL DEFAULT 'none',
    "section" TEXT NOT NULL DEFAULT 'ROSE',
    "category" "ClassCategory" NOT NULL DEFAULT 'Montessori',
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Grades_pkey" PRIMARY KEY ("classId")
);

-- CreateTable
CREATE TABLE "SalaryAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "increment" DOUBLE PRECISION NOT NULL,
    "totalSalary" DOUBLE PRECISION NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "SalaryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryIncrement" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "incrementAmount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryIncrement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "sessionId" TEXT NOT NULL,
    "sessionName" TEXT NOT NULL DEFAULT 'none',
    "sessionFrom" TEXT NOT NULL DEFAULT 'none',
    "sessionTo" TEXT NOT NULL DEFAULT 'none',
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "StudentClass" (
    "scId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "StudentClass_pkey" PRIMARY KEY ("scId")
);

-- CreateTable
CREATE TABLE "Students" (
    "studentId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "studentMobile" TEXT NOT NULL DEFAULT 'none',
    "fatherMobile" TEXT NOT NULL DEFAULT 'none',
    "admissionNumber" TEXT NOT NULL,
    "studentName" TEXT NOT NULL DEFAULT 'none',
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TEXT NOT NULL DEFAULT 'none',
    "fatherName" TEXT NOT NULL DEFAULT 'none',
    "studentCNIC" TEXT NOT NULL DEFAULT '0000-0000000-0',
    "fatherCNIC" TEXT NOT NULL DEFAULT '0000-0000000-0',
    "fatherProfession" TEXT NOT NULL DEFAULT 'none',
    "bloodGroup" TEXT DEFAULT 'none',
    "guardianName" TEXT DEFAULT 'none',
    "caste" TEXT NOT NULL DEFAULT 'none',
    "currentAddress" TEXT NOT NULL DEFAULT 'none',
    "permanentAddress" TEXT NOT NULL DEFAULT 'none',
    "medicalProblem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAssign" BOOLEAN NOT NULL DEFAULT false,
    "profilePic" TEXT DEFAULT '/user.jpg',

    CONSTRAINT "Students_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "Subject" (
    "subjectId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "book" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subjectId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_registrationNumber_key" ON "Employees"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_admissionNumber_key" ON "Employees"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Students_registrationNumber_key" ON "Students"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Students_admissionNumber_key" ON "Students"("admissionNumber");

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Grades"("classId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStudentClass" ADD CONSTRAINT "FeeStudentClass_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "Fees"("feeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStudentClass" ADD CONSTRAINT "FeeStudentClass_studentClassId_fkey" FOREIGN KEY ("studentClassId") REFERENCES "StudentClass"("scId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAssignment" ADD CONSTRAINT "SalaryAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAssignment" ADD CONSTRAINT "SalaryAssignment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryIncrement" ADD CONSTRAINT "SalaryIncrement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentClass" ADD CONSTRAINT "StudentClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Grades"("classId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentClass" ADD CONSTRAINT "StudentClass_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentClass" ADD CONSTRAINT "StudentClass_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;
