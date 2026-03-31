-- CreateTable
CREATE TABLE "ExamDatesheet" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamDatesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectDiary" (
    "subjectDiaryId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectDiary_pkey" PRIMARY KEY ("subjectDiaryId")
);

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "studentAttendanceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'A',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("studentAttendanceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamDatesheet_examId_subjectId_key" ON "ExamDatesheet"("examId", "subjectId");

-- CreateIndex
CREATE INDEX "SubjectDiary_classSubjectId_idx" ON "SubjectDiary"("classSubjectId");

-- CreateIndex
CREATE INDEX "SubjectDiary_teacherId_idx" ON "SubjectDiary"("teacherId");

-- CreateIndex
CREATE INDEX "StudentAttendance_classId_idx" ON "StudentAttendance"("classId");

-- CreateIndex
CREATE INDEX "StudentAttendance_sessionId_idx" ON "StudentAttendance"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_studentId_classId_sessionId_date_key" ON "StudentAttendance"("studentId", "classId", "sessionId", "date");

-- AddForeignKey
ALTER TABLE "ExamDatesheet" ADD CONSTRAINT "ExamDatesheet_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("examId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamDatesheet" ADD CONSTRAINT "ExamDatesheet_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectDiary" ADD CONSTRAINT "SubjectDiary_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("csId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectDiary" ADD CONSTRAINT "SubjectDiary_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Employees"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Grades"("classId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
