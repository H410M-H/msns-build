import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.sessions.findMany();
  console.log("Sessions:", sessions);

  const grades = await prisma.grades.findMany({
    orderBy: { grade: "asc" },
  });
  console.log("Grades:", grades.map((g) => ({ id: g.classId, grade: g.grade, section: g.section, category: g.category })));

  const examTypes = await prisma.examType.findMany();
  console.log("ExamTypes:", examTypes);

  const exams = await prisma.exam.findMany({
    include: {
      Grades: true,
      ExamType: true,
      ExamDatesheet: {
        include: { Subject: true },
      },
    },
  });
  console.log("Exams count:", exams.length);
  console.log("Exams:", exams.map(e => ({
    id: e.examId,
    type: e.examTypeEnum,
    class: `${e.Grades.grade} ${e.Grades.section}`,
    datesheetCount: e.ExamDatesheet.length
  })));

  const students = await prisma.students.findMany({
    take: 5,
    include: {
      StudentClass: {
        include: { Grades: true, Sessions: true }
      }
    }
  });
  console.log("Sample Students:", JSON.stringify(students, null, 2));

  const totalStudents = await prisma.students.count();
  console.log("Total students in DB:", totalStudents);

  const studentClasses = await prisma.studentClass.findMany({
    include: {
      Grades: true,
      Sessions: true,
    }
  });
  console.log("Total StudentClass assignments:", studentClasses.length);

  const subjects = await prisma.subject.findMany();
  console.log("Subjects count:", subjects.length);
  console.log("Subjects:", subjects.map(s => s.subjectName));

  const employees = await prisma.employees.findMany({
    take: 10,
    select: { employeeId: true, employeeName: true, designation: true }
  });
  console.log("Employees sample:", employees);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
