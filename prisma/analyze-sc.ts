import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allSC = await prisma.studentClass.groupBy({
    by: ['sessionId'],
    _count: {
      scId: true
    }
  });
  console.log("StudentClass assignments grouped by sessionId:");
  console.log(allSC);

  // Check how many students have NO StudentClass assignment at all
  const studentsWithSC = await prisma.studentClass.findMany({
    select: { studentId: true }
  });
  const uniqueStudentIdsWithSC = new Set(studentsWithSC.map(sc => sc.studentId));
  const totalStudents = await prisma.students.count();
  console.log(`Total students: ${totalStudents}`);
  console.log(`Students with at least one StudentClass assignment: ${uniqueStudentIdsWithSC.size}`);
  console.log(`Students with NO StudentClass assignment: ${totalStudents - uniqueStudentIdsWithSC.size}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
